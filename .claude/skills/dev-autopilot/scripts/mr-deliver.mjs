// 원격 배달(push / MR 생성)을 결정론으로 수행하고 결과를 state.mjs 에 기록한다.
//
// 왜 스크립트인가 — 세 가지가 매번 사람 손에서 틀어졌다.
//  1) 인코딩: 한글 제목을 셸 인수로 넘기면 Windows Git Bash 가 argv 의 UTF-8 을 훼손하고
//     GitLab 은 JSON 도 아닌 plain `Bad Request`(400)를 돌려준다. 여기서는 fetch 의
//     URLSearchParams 로 본문을 만들어 argv 를 아예 거치지 않는다 — 구조적으로 재발 불가.
//  2) 진단: 400/403 을 자격증명 문제로 오인해 배달 실패로 기록하면 런이 차단된다. 실제 원인은
//     브랜치 부재·중복 MR·payload 거부일 수 있다. 아래 사다리는 전부 읽기 전용 호출이다.
//  3) 멱등성: 같은 source→target MR 이 이미 열려 있으면 그것을 결과로 채택한다. 재개한 런이
//     MR 을 두 개 만드는 것보다 기존 것을 찾아 기록하는 편이 항상 맞다.
//
// 토큰은 어떤 경로로도 출력하지 않는다. 출력 직전 모든 문자열에서 토큰 값을 지운다.
//
// 종료 코드는 process.exitCode 로만 정한다 — fetch 소켓이 살아있는 동안 process.exit() 를 부르면
// Windows libuv 가 `UV_HANDLE_CLOSING` assert 로 죽어 exit 127 을 낸다(실측). 성공 출력을 낸 뒤
// 127 로 끝나면 호출자는 실패로 읽는다. 그래서 요청에 Connection: close 를 붙이고 타이머를 직접
// 해제해 이벤트 루프가 자연히 비게 만든다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

class ValidationError extends Error {}

const [command, ...rest] = process.argv.slice(2);
const args = {};
for (let index = 0; index < rest.length; index += 2) {
  const key = rest[index];
  if (!key?.startsWith('--') || rest[index + 1] === undefined) {
    throw new ValidationError('arguments must use --kebab-case value pairs');
  }
  args[key.slice(2)] = rest[index + 1];
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
let secret = null;
const clean = value => {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? null);
  return secret ? text.split(secret).join('***') : text;
};
const emit = payload => console.log(clean(JSON.stringify(payload)));

const blockLines = (raw, key) => {
  // 정규식으로 블록을 오려내지 않는다 — JS 에는 `\Z`(입력 끝)가 없어 그 관용구가 조용히 문자 'Z'
  // 매칭으로 떨어진다. 여기서 틀리면 토큰을 못 읽어 자격증명 문제로 오진한다.
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex(line => line.startsWith(`${key}:`));
  if (start < 0) return [];
  const out = [];
  for (let index = start + 1; index < lines.length && !/^\S/.test(lines[index]); index += 1) out.push(lines[index]);
  return out;
};

async function main() {
  if (!['push', 'create'].includes(command)) {
    throw new ValidationError('usage: mr-deliver.mjs <push|create> --run-root <path> --task <task> --project <id>');
  }
  for (const required of ['run-root', 'task', 'project']) {
    if (!args[required]) throw new ValidationError(`--${required} is required`);
  }

  const root = path.resolve(args['run-root']);
  const map = JSON.parse(fs.readFileSync(path.join(root, 'autopilot-map.json'), 'utf8').replace(/^﻿/, ''));
  const task = map.tasks?.[args.task];
  if (!task) throw new ValidationError(`task not found: ${args.task}`);
  // task 는 tasks/{task} 아래 request·description 경로 조각이다 — 범위 밖 파일을 읽어 배달하지 않도록 거른다.
  if (args.task === '.' || args.task === '..' || /[\\/:]/.test(args.task)) {
    throw new ValidationError(`unsafe task id: ${args.task}`);
  }
  const project = task.projects?.[args.project];
  if (!project) throw new ValidationError(`project not registered: ${args.project}`);
  const sha = task.commit?.shas?.[args.project];
  if (!sha) throw new ValidationError(`project ${args.project} has no recorded commit`);
  const remote = args.remote ?? 'origin';
  const record = args['no-record'] !== 'true';
  const dryRun = args['dry-run'] === 'true';
  const claudeRoot = path.resolve(args['claude-root'] ?? '.claude');

  const forge = () => {
    const systemPath = path.resolve(args['system-config'] ?? path.join(claudeRoot, 'config', 'system.yaml'));
    if (!fs.existsSync(systemPath)) throw new ValidationError(`forge config not found: ${systemPath}`);
    const gitlab = blockLines(fs.readFileSync(systemPath, 'utf8').replace(/^﻿/, ''), 'gitlab');
    const url = gitlab.find(line => /^\s{2}url:/.test(line))?.match(/:\s*(\S+)/)?.[1]?.replace(/\/+$/, '');
    const token = gitlab.find(line => /^\s{2}token:/.test(line))?.match(/:\s*(\S+)/)?.[1]?.replace(/^['"]|['"]$/g, '');
    const ids = {};
    const start = gitlab.findIndex(line => /^\s{2}projects:/.test(line));
    if (start >= 0) {
      for (let index = start + 1; index < gitlab.length; index += 1) {
        if (/^\s{0,2}\S/.test(gitlab[index])) break;
        const hit = gitlab[index].match(/^\s+([A-Za-z0-9._-]+):\s*(\d+)\s*$/);
        if (hit) ids[hit[1]] = Number(hit[2]);
      }
    }
    if (!url || /<.*>/.test(url)) throw new ValidationError('gitlab.url is not configured');
    if (!token || /REPLACE_ME|<.*>/.test(token)) throw new ValidationError('gitlab.token is not configured');
    secret = token;
    return { url, token, id: ids[args.project] ?? null };
  };

  const git = (...rest2) => spawnSync('git', ['-C', project.path, ...rest2], { encoding: 'utf8' });
  const recordResult = extra => {
    if (!record) return { recorded: false };
    const argv = ['mr-result', '--run-root', root, '--task', args.task, '--project', args.project, ...extra];
    const result = spawnSync(process.execPath, [path.join(scriptDir, 'state.mjs'), ...argv], { encoding: 'utf8' });
    if (result.status !== 0) {
      // 기록 실패는 삼키지 않는다 — 원격 상태와 맵이 어긋난 채로 진행하면 다음 세션이 그 차이를
      // 발견하는 순간 신뢰할 근거가 사라진다.
      throw new Error(`state.mjs mr-result failed: ${(result.stderr || result.stdout).trim().split(/\r?\n/)[0]}`);
    }
    return { recorded: true };
  };

  const api = async (method, urlPath, body) => {
    const { url, token } = forge();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(args.timeout ?? 20000));
    try {
      const response = await fetch(`${url}/api/v4${urlPath}`, {
        method,
        headers: {
          'PRIVATE-TOKEN': token,
          Connection: 'close',
          ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
        },
        body,
        signal: controller.signal
      });
      const text = await response.text();
      let json = null;
      try { json = JSON.parse(text); } catch { /* 포지가 JSON 아닌 본문을 줄 수 있다 — 원문을 남긴다 */ }
      return { status: response.status, ok: response.ok, json, text };
    } finally {
      clearTimeout(timer);
    }
  };

  if (command === 'push') {
    const headResult = git('rev-parse', 'HEAD');
    const head = headResult.status === 0 ? headResult.stdout?.trim() : '';
    if (head !== sha) {
      throw new ValidationError(`HEAD ${head} does not equal the recorded commit ${sha} — record the commit you are pushing`);
    }
    const branchResult = git('branch', '--show-current');
    const currentBranch = branchResult.status === 0 ? branchResult.stdout?.trim() : '';
    if (currentBranch !== project.branch) {
      throw new ValidationError(`current branch ${currentBranch || '(detached)'} does not equal the registered branch ${project.branch}`);
    }
    const localRefResult = git('rev-parse', `refs/heads/${project.branch}`);
    const localRefSha = localRefResult.status === 0 ? localRefResult.stdout?.trim() : '';
    if (localRefSha !== sha) {
      throw new ValidationError(`local branch ${project.branch} points to ${localRefSha || 'missing'}, not the recorded commit ${sha}`);
    }
    if (['PUSHED', 'CREATED'].includes(project.delivery?.status)) {
      emit({ status: 'ok', action: 'push', skipped: true, reason: `delivery already ${project.delivery.status}`, remoteSha: project.delivery.remoteSha });
      return 0;
    }
    if (dryRun) {
      emit({ status: 'ok', action: 'push', dryRun: true, remote, branch: project.branch, sha });
      return 0;
    }
    const pushed = git('push', '-u', remote, `refs/heads/${project.branch}:refs/heads/${project.branch}`);
    const output = `${pushed.stdout ?? ''}${pushed.stderr ?? ''}`.trim();
    if (pushed.status !== 0) {
      const reason = `PUSH_FAILED: ${output.split(/\r?\n/).filter(Boolean).pop() ?? 'git push failed'}`.slice(0, 400);
      recordResult(['--status', 'FAILED', '--reason', reason]);
      console.error(clean(`mr-deliver: ${reason}`));
      return 2;
    }
    const remoteSha = git('rev-parse', `${remote}/${project.branch}`).stdout?.trim();
    if (remoteSha !== sha) {
      const reason = `PUSH_VERIFY_FAILED: remote ${remoteSha || 'missing'} != commit ${sha}`;
      recordResult(['--status', 'FAILED', '--reason', reason]);
      console.error(clean(`mr-deliver: ${reason}`));
      return 2;
    }
    const recorded = recordResult(['--status', 'PUSHED', '--remote-sha', remoteSha]);
    emit({ status: 'ok', action: 'push', remote, branch: project.branch, remoteSha, ...recorded });
    return 0;
  }

  // ---- create ---------------------------------------------------------------
  const { id } = forge();
  if (id === null) throw new ValidationError(`gitlab.projects has no id for ${args.project}`);
  if (project.delivery?.status === 'CREATED') {
    emit({ status: 'ok', action: 'create', skipped: true, reason: 'delivery already CREATED', url: project.delivery.url });
    return 0;
  }
  if (project.delivery?.status !== 'PUSHED') {
    throw new ValidationError(`create requires a recorded PUSHED delivery, current status is ${project.delivery?.status}`);
  }

  const requestFile = path.resolve(args.request ?? path.join(root, 'tasks', args.task, 'mr-request.json'));
  let entry = null;
  if (fs.existsSync(requestFile)) {
    const request = JSON.parse(fs.readFileSync(requestFile, 'utf8').replace(/^﻿/, ''));
    entry = (request.projects ?? []).find(candidate => candidate.project === args.project) ?? null;
  }
  const title = args.title ?? entry?.title;
  const targetBranch = args['target-branch'] ?? entry?.targetBranch ?? (project.baseRef ?? '').replace(/^origin\//, '');
  if (!title) throw new ValidationError('--title or a mr-request.json entry with title is required');
  if (!targetBranch) throw new ValidationError('--target-branch or a recorded baseRef is required');

  const recordedDescription = entry?.descriptionPath;
  const descFile = path.resolve(args.description ?? recordedDescription ?? path.join(root, 'tasks', args.task, `mr-desc-${args.project}.md`));
  const description = fs.existsSync(descFile) ? fs.readFileSync(descFile, 'utf8').replace(/^﻿/, '') : '';
  // 골격의 `<<< >>>` 가 남아 있으면 사람이 안 채운 자리가 그대로 MR 로 나간다 — 막지는 않고 센다.
  // HTML 주석은 먼저 뺀다. 골격 안내문 자체가 `<<< >>>` 를 리터럴로 담고 있어서, 본문을 전부
  // 채웠는데도 미기입 1건으로 거부됐다 — 두 런 모두 오케스트레이터가 그 안내문을 지워서 통과시켰다
  // (= 안내문 소실). 주석은 MR 에 렌더되지 않으니 미기입 자리로 셀 이유가 없다.
  const unfilled = (description.replace(/<!--[\s\S]*?-->/g, '').match(/<<<[\s\S]*?>>>/g) ?? []).length;

  if (dryRun) {
    emit({
      status: 'ok', action: 'create', dryRun: true, forgeProjectId: id,
      sourceBranch: project.branch, targetBranch, title,
      titleChars: title.length, descriptionChars: description.length, unfilledPlaceholders: unfilled
    });
    return 0;
  }
  if (!description.trim()) throw new ValidationError(`MR description is missing or empty: ${descFile}`);
  if (unfilled > 0) throw new ValidationError(`MR description has ${unfilled} unfilled <<< >>> placeholder(s): ${descFile}`);

  const existing = await api('GET',
    `/projects/${id}/merge_requests?state=opened&source_branch=${encodeURIComponent(project.branch)}&target_branch=${encodeURIComponent(targetBranch)}`);
  // 조회가 성공하지 못했으면 **생성하지 않는다.** 500·401·타임아웃 상태에서 그대로 POST 하면
  // 이미 열린 MR 이 있어도 중복을 만들 수 있고, POST 가 성공한 중복은 사후 재조회로 되돌릴 수
  // 없다 — 멱등 보장이 하필 의존성이 흔들릴 때 깨진다. 원격을 건드리지 않은 채 실패로 남긴다.
  if (!existing.ok || !Array.isArray(existing.json)) {
    const detail = (existing.json?.message ?? existing.json?.error ?? existing.text ?? '').toString().replace(/\s+/g, ' ').slice(0, 200);
    const reason = `MR_CREATE_FAILED(${existing.status}) LOOKUP_FAILED: cannot confirm whether an open MR already exists — ${detail}`.slice(0, 500);
    recordResult(['--status', 'FAILED', '--reason', reason]);
    console.error(clean(`mr-deliver: ${reason}`));
    return 2;
  }
  if (existing.json.length > 0) {
    const reused = existing.json[0];
    const recorded = recordResult(['--status', 'CREATED', '--url', reused.web_url]);
    emit({ status: 'ok', action: 'create', reused: true, iid: reused.iid, url: reused.web_url, unfilledPlaceholders: unfilled, ...recorded });
    return 0;
  }

  const body = new URLSearchParams({
    source_branch: project.branch,
    target_branch: targetBranch,
    title,
    ...(description ? { description } : {}),
    remove_source_branch: String(entry?.removeSourceBranch === true),
    squash: String(entry?.squash === true)
  });
  const created = await api('POST', `/projects/${id}/merge_requests`, body);
  if (created.ok && created.json?.web_url) {
    const recorded = recordResult(['--status', 'CREATED', '--url', created.json.web_url]);
    emit({
      status: 'ok', action: 'create', iid: created.json.iid, url: created.json.web_url,
      targetBranch, titleChars: title.length, descriptionChars: description.length,
      unfilledPlaceholders: unfilled, ...recorded
    });
    return 0;
  }

  // 생성이 실패했으면 **먼저 다시 조회한다.** 조회와 생성 사이에 다른 프로세스가(재개된 런,
  // 사람의 수동 생성) 같은 source→target MR 을 만들었을 수 있다. 그 경우 배달은 실제로 완료된
  // 것이므로 FAILED 로 기록하면 런을 잘못 차단하고 맵과 원격이 어긋난다. 409 만 보고 판단하지
  // 않는 이유는 포지가 중복을 409·400·422 중 무엇으로 답하는지 버전마다 다르기 때문이다.
  const recheck = await api('GET',
    `/projects/${id}/merge_requests?state=opened&source_branch=${encodeURIComponent(project.branch)}&target_branch=${encodeURIComponent(targetBranch)}`);
  if (recheck.ok && Array.isArray(recheck.json) && recheck.json.length > 0) {
    const raced = recheck.json[0];
    const recorded = recordResult(['--status', 'CREATED', '--url', raced.web_url]);
    emit({
      status: 'ok', action: 'create', reused: true, racedWith: created.status,
      iid: raced.iid, url: raced.web_url, unfilledPlaceholders: unfilled, ...recorded
    });
    return 0;
  }

  // 실패 진단 사다리 — 전부 읽기 전용. 원인을 좁히지 않고 FAILED 로 기록하면 런이 차단되는데,
  // 실제 원인이 자격증명이 아니라 브랜치 부재였던 사례가 있다.
  const probes = {};
  const projectProbe = await api('GET', `/projects/${id}`);
  probes.project = projectProbe.status;
  let cause;
  if (projectProbe.status === 401) cause = 'TOKEN_INVALID';
  else if (projectProbe.status === 403) cause = 'NO_PROJECT_ACCESS';
  else if (projectProbe.status === 404) cause = 'PROJECT_NOT_FOUND';
  else {
    const source = await api('GET', `/projects/${id}/repository/branches/${encodeURIComponent(project.branch)}`);
    const target = await api('GET', `/projects/${id}/repository/branches/${encodeURIComponent(targetBranch)}`);
    probes.sourceBranch = source.status;
    probes.targetBranch = target.status;
    if (!source.ok) cause = 'SOURCE_BRANCH_MISSING_ON_REMOTE';
    else if (!target.ok) cause = 'TARGET_BRANCH_MISSING_ON_REMOTE';
    else if (created.status === 409) cause = 'MERGE_REQUEST_CONFLICT';
    else cause = created.json ? 'FORGE_REJECTED' : 'PAYLOAD_REJECTED_NON_JSON';
  }
  const detail = (created.json?.message ?? created.json?.error ?? created.text ?? '').toString().replace(/\s+/g, ' ').slice(0, 300);
  const reason = `MR_CREATE_FAILED(${created.status}) ${cause}: ${detail}`.slice(0, 500);
  recordResult(['--status', 'FAILED', '--reason', reason]);
  console.error(clean(`mr-deliver: ${reason} probes=${JSON.stringify(probes)}`));
  return 2;
}

main().then(code => { process.exitCode = code; }).catch(error => {
  console.error(clean(`mr-deliver: ${error.message}`));
  process.exitCode = error instanceof ValidationError ? 1 : 2;
});
