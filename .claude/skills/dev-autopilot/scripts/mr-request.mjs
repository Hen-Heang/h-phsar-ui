// MR 요청 문서를 런 증거에서 조립한다.
//
// 왜 스크립트인가: mr-request.json 의 모든 필드와 설명 문서의 표·수치는 이미 런 안에 있다 —
// autopilot-map.json(브랜치·커밋·리뷰·배달), round-*.json(QA 수치), review-summary*.json(리뷰 등급),
// git(변경 파일), system.yaml(포지 프로젝트 id), 브리프 §9(미결). 이걸 매번 손으로 옮기면
// 옮기는 사이에 값이 틀어지고, 틀어진 값이 MR 본문에 남아 리뷰어가 그걸 근거로 판단한다.
// 판단(왜 이렇게 만들었나)만 사람이 쓰고 나머지는 파생시킨다.
//
// 설명 문서는 이미 있으면 덮지 않는다(--force 로만). 사람이 쓴 산문을 스크립트가 지우면
// 그 손실은 조용하다.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

class ValidationError extends Error {}
process.on('uncaughtException', error => {
  console.error(`mr-request: ${error.message}`);
  process.exit(error instanceof ValidationError ? 1 : 2);
});

const [command, ...rest] = process.argv.slice(2);
const args = {};
for (let index = 0; index < rest.length; index += 2) {
  const key = rest[index];
  if (!key?.startsWith('--') || rest[index + 1] === undefined) {
    throw new ValidationError('arguments must use --kebab-case value pairs');
  }
  args[key.slice(2)] = rest[index + 1];
}
if (command !== 'build') throw new ValidationError('usage: mr-request.mjs build --run-root <path> --task <task>');
if (!args['run-root'] || !args.task) throw new ValidationError('--run-root and --task are required');

const root = path.resolve(args['run-root']);
const map = JSON.parse(fs.readFileSync(path.join(root, 'autopilot-map.json'), 'utf8').replace(/^﻿/, ''));
const task = map.tasks?.[args.task];
if (!task) throw new ValidationError(`task not found: ${args.task}`);
// task 는 아래 tasks/{task} 경로 조각이다. legacy map 에 위험 키가 남아 있어도 경로로 쓰기 전에 거른다.
if (args.task === '.' || args.task === '..' || /[\\/:]/.test(args.task)) {
  throw new ValidationError(`unsafe task id: ${args.task}`);
}
if (!task.sourceBranch) throw new ValidationError('task has no source branch — register a project first');

const taskDir = path.join(root, 'tasks', args.task);
const claudeRoot = path.resolve(args['claude-root'] ?? '.claude');
const git = (cwd, ...rest2) => {
  const result = spawnSync('git', ['-C', cwd, ...rest2], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
};

// 포지 프로젝트 id — system.yaml gitlab.projects 의 얕은 읽기. YAML 파서를 들이면 이 스크립트가
// 의존성을 갖게 되고, 필요한 건 "이름 → 숫자" 한 겹뿐이다. 토큰은 여기서 읽지 않는다(배달 담당).
// 정규식으로 블록을 오려내지 않는다 — JS 에는 `\Z`(입력 끝)가 없어서 그 관용구가 조용히
// 문자 'Z' 매칭으로 떨어진다(실측: 이 스크립트 첫 판이 프로젝트 id 를 전부 null 로 냈다).
// 들여쓰기를 줄 단위로 걷는 편이 짧고 틀리지 않는다.
const blockLines = (raw, key) => {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex(line => line.startsWith(`${key}:`));
  if (start < 0) return [];
  const out = [];
  for (let index = start + 1; index < lines.length && !/^\S/.test(lines[index]); index += 1) out.push(lines[index]);
  return out;
};
const forgeIds = () => {
  const systemPath = path.resolve(args['system-config'] ?? path.join(claudeRoot, 'config', 'system.yaml'));
  if (!fs.existsSync(systemPath)) return {};
  const gitlab = blockLines(fs.readFileSync(systemPath, 'utf8').replace(/^﻿/, ''), 'gitlab');
  const start = gitlab.findIndex(line => /^\s{2}projects:/.test(line));
  if (start < 0) return {};
  const out = {};
  for (let index = start + 1; index < gitlab.length; index += 1) {
    if (/^\s{0,2}\S/.test(gitlab[index])) break;
    const hit = gitlab[index].match(/^\s+([A-Za-z0-9._-]+):\s*(\d+)\s*$/);
    if (hit) out[hit[1]] = Number(hit[2]);
  }
  return out;
};

const artifactByKind = kind => {
  const file = path.join(root, 'artifacts.json');
  if (!fs.existsSync(file)) return null;
  const registry = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  const entries = Object.values(registry.artifacts ?? {});
  const hit = entries.find(entry => entry.kind === kind && entry.taskNumber === args.task);
  if (!hit) return null;
  const snapshot = path.isAbsolute(hit.snapshotPath) ? hit.snapshotPath : path.join(root, hit.snapshotPath);
  return fs.existsSync(snapshot) ? snapshot : null;
};

// QA 증거 — phase-*/round-*.json 을 라운드 번호 순으로 모은다. 에이전트가 쓴 파일이라
// 필드가 빠져 있을 수 있으므로 없는 값은 null 로 남기고 조용히 0 으로 채우지 않는다.
const qaRounds = () => {
  const out = [];
  if (!fs.existsSync(taskDir)) return out;
  for (const entry of fs.readdirSync(taskDir).filter(name => name.startsWith('phase-')).sort()) {
    const dir = path.join(taskDir, entry);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir).filter(name => /^round-\d+\.json$/.test(name)).sort()) {
      try {
        const json = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8').replace(/^﻿/, ''));
        out.push({
          phase: String(json.phase ?? entry.replace('phase-', '')),
          round: json.round ?? Number(file.match(/\d+/)[0]),
          goalKind: json.goalKind ?? 'INITIAL_IMPLEMENTATION',
          qaStatus: json.qaStatus ?? null,
          tests: json.tests ?? null,
          assertions: json.assertions ?? null,
          skips: json.skips ?? null,
          commands: (json.commands ?? []).map(entry2 => ({ cmd: entry2.cmd, exitCode: entry2.exitCode })),
          evidence: path.join(dir, file)
        });
      } catch {
        out.push({ phase: entry, round: null, qaStatus: 'UNPARSEABLE', evidence: path.join(dir, file) });
      }
    }
  }
  return out.sort((left, right) => (left.phase + String(left.round)).localeCompare(right.phase + String(right.round)));
};

const reviewAttempts = () => {
  const dir = path.join(taskDir, 'review');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => name.endsWith('.json')).sort().map(name => {
    try {
      const json = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8').replace(/^﻿/, ''));
      return {
        attempt: json.attempt ?? null,
        verdict: json.verdict ?? null,
        critical: json.critical ?? null,
        warning: json.warning ?? null,
        info: json.info ?? null,
        evidence: path.join(dir, name)
      };
    } catch {
      return { attempt: null, verdict: 'UNPARSEABLE', evidence: path.join(dir, name) };
    }
  }).sort((left, right) => (left.attempt ?? 0) - (right.attempt ?? 0));
};

// 브리프 §9 미결사항의 항목 머리글만 뽑는다. 본문 전체를 옮기면 MR 본문이 브리프 사본이 된다.
const openQuestions = () => {
  const brief = artifactByKind('brief');
  if (!brief) return [];
  const body = fs.readFileSync(brief, 'utf8').replace(/^﻿/, '');
  const section = body.match(/^## 9\.[^\n]*\n([\s\S]*?)(?=^## 10\.)/m)?.[1] ?? '';
  return section.split(/\r?\n/)
    .map(line => line.match(/^\s*\d+\.\s+(.*)$/)?.[1]?.trim())
    .filter(Boolean)
    .map(line => {
      const flat = line.replace(/\s+/g, ' ');
      return flat.length > 160 ? `${flat.slice(0, 158)}…` : flat;
    });
};

const ids = forgeIds();
const projectIds = Object.keys(args.project ? { [args.project]: 1 } : task.projects);
if (args.project && !task.projects[args.project]) throw new ValidationError(`project not registered: ${args.project}`);
if (args['desc-out'] && projectIds.length !== 1) {
  throw new ValidationError('--desc-out is only valid when building one project; multi-project runs use mr-desc-{project}.md');
}
const descriptionPathFor = id => path.resolve(
  args['desc-out'] ?? path.join(taskDir, `mr-desc-${id}.md`)
);

const projects = projectIds.map(id => {
  const project = task.projects[id];
  const sha = task.commit?.shas?.[id] ?? null;
  if (!sha) throw new ValidationError(`project ${id} has no recorded commit — run commit-result first`);
  const subject = git(project.path, 'log', '-1', '--format=%s', sha);
  // 브랜치 태그 `(#branch)` 는 커밋 컨벤션 산물이다. MR 제목에는 브랜치가 이미 메타로 붙으므로 뗀다.
  const title = subject.replace(/\s*\(#[^)]*\)\s*$/, '').trim() || `${args.task} delivery`;
  const target = (args['target-branch'] ?? project.baseRef ?? 'develop').replace(/^origin\//, '');
  const nameStatus = git(project.path, 'diff', '--name-status', `${project.baseCommit}..${sha}`);
  const shortstat = git(project.path, 'diff', '--shortstat', `${project.baseCommit}..${sha}`);
  return {
    project: id,
    forgeProjectId: ids[id] ?? null,
    commitSha: sha,
    remoteSha: project.delivery?.remoteSha ?? null,
    deliveryStatus: project.delivery?.status ?? 'NOT_STARTED',
    sourceBranch: task.sourceBranch,
    targetBranch: target,
    targetBranchRationale: args['target-branch']
      ? 'caller supplied --target-branch'
      : `derived from recorded baseRef ${project.baseRef}`,
    title,
    descriptionPath: descriptionPathFor(id),
    files: nameStatus.split(/\r?\n/).filter(Boolean).map(line => {
      const [status, ...pathParts] = line.split(/\t/);
      return { status, path: pathParts.join('\t') };
    }),
    diffStat: shortstat,
    removeSourceBranch: false,
    squash: false
  };
});

const qa = qaRounds();
const reviews = reviewAttempts();
const request = {
  taskNumber: args.task,
  sourceBranch: task.sourceBranch,
  generatedAt: new Date().toISOString(),
  generatedBy: 'mr-request.mjs',
  projects,
  evidence: {
    plan: task.plan?.rootDocument?.path ?? null,
    manifest: task.plan?.manifest?.path ?? null,
    brief: artifactByKind('brief'),
    expertReport: task.expertGapReport?.documentPath ?? null,
    qa: qa.map(round => round.evidence),
    review: reviews.map(attempt => attempt.evidence)
  },
  summary: {
    qa: qa.map(round => ({ phase: round.phase, round: round.round, qaStatus: round.qaStatus, tests: round.tests })),
    review: reviews.map(attempt => ({ attempt: attempt.attempt, verdict: attempt.verdict, warning: attempt.warning })),
    reviewStatus: task.review?.status ?? null,
    reviewAttempts: task.review?.attempts ?? null
  }
};

// fail-closed 검증을 파일 쓰기보다 먼저 끝낸다. 실패한 build 가 완성된 요청처럼 보이는 부분
// 산출물을 남기면 다음 단계가 잘못된 문서를 승인할 수 있다.
const missingForgeId = projects.filter(entry => entry.forgeProjectId === null).map(entry => entry.project);
if (missingForgeId.length && args['allow-missing-forge-id'] !== 'true') {
  throw new ValidationError(`no forge project id for ${missingForgeId.join(', ')} — check gitlab.projects, or pass --allow-missing-forge-id true to build the document anyway`);
}

const requestOut = path.resolve(args.out ?? path.join(taskDir, 'mr-request.json'));
fs.mkdirSync(path.dirname(requestOut), { recursive: true });
fs.writeFileSync(requestOut, `${JSON.stringify(request, null, 2)}\n`);

// 설명 골격 — 프로젝트마다 변경 파일이 다르므로 각각 만들고, 표·수치만 파생한다.
//
// 섹션 순서가 곧 읽는 순서다. MR 을 여는 사람의 첫 질문은 "검증됐나 / 무엇을 봐야 하나" 이고
// 마지막이 "어떤 파일이 바뀌었나" 다 — 그건 MR 의 Changes 탭에 이미 있다. 그래서 판정을 한 줄로
// 맨 위에 올리고, 사람이 쓴 판단(개요·설계 결정·확인 요청)을 그 바로 아래 붙이고, 리뷰어가 눈으로
// 훑지 않는 파생물(변경 파일 목록·런 내부 경로)은 접는다. 20파일이면 그 표 하나가 22행이라
// 예전 순서에서는 파일 목록이 설계 결정을 화면 밖으로 밀어냈다.
const force = args.force === 'true';
const descriptions = [];
// 표는 헤더까지 같이 받는다 — 기록이 없을 때 헤더만 남은 빈 표가 "채우다 만 문서" 로 보인다.
const table = (header, rows) => (rows.length ? [...header, ...rows] : ['_기록 없음_']).join('\n');
// `GREEN`/`RED` 는 qa-collect·state.mjs 가 쓰는 어휘다(state.mjs 가 그 둘만 받는다).
// 파싱 실패는 `UNPARSEABLE` 로 들어오는데, 그것도 GREEN 이 아니므로 여기서 미통과로 잡힌다.
const qaFailed = qa.filter(round => round.qaStatus !== 'GREEN');
const lastReview = reviews[reviews.length - 1] ?? null;
for (const current of projects) {
  const descOut = current.descriptionPath;
  const descExists = fs.existsSync(descOut);
  descriptions.push({ project: current.project, path: descOut, kept: descExists && !force });
  if (descExists && !force) continue;
  fs.mkdirSync(path.dirname(descOut), { recursive: true });
  const added = current.diffStat.match(/(\d+) insertion/)?.[1] ?? '0';
  const deleted = current.diffStat.match(/(\d+) deletion/)?.[1] ?? '0';
  // 판정은 아래 표와 같은 출처에서 파생한다. QA 가 한 라운드도 없거나 리뷰 Critical 이 0 이
  // 아니면 ⚠️ — 판정을 모르는 상태를 통과처럼 보이게 하지 않는다.
  const verified = qa.length > 0 && qaFailed.length === 0 && lastReview?.critical === 0;
  const lines = [
    `<!-- dev-autopilot:mr-desc — mr-request.mjs 생성. 표·수치는 런 증거에서 파생됐다. <<< >>> 구간만 채운다. -->`,
    '',
    `> ${verified ? '✅' : '⚠️'} ${[
      qa.length
        ? (qaFailed.length ? `QA ${qa.length}라운드 중 ${qaFailed.length}건 미통과` : `QA ${qa.length}라운드 전부 통과`)
        : 'QA 기록 없음',
      reviews.length
        ? `코드리뷰 ${reviews.length}회차 · Critical ${lastReview?.critical ?? '?'} / Warning ${lastReview?.warning ?? '?'}`
        : '코드리뷰 기록 없음',
      `${current.files.length}파일 (+${added}/-${deleted})`
    ].join(' · ')}`,
    '',
    '## 개요',
    '',
    `<<< 무엇을 왜 만들었는지 2~4줄. 과업: ${args.task} >>>`,
    '',
    '## 주요 설계 결정',
    '',
    '| 결정 | 근거 |',
    '|---|---|',
    '<<< 결정 · 근거 (파일:라인 인용). 재해석 금지 항목은 여기에 못 박는다 >>>',
    '',
    '## 리뷰어 확인 요청',
    '',
    '<<< 배포 선행 조건 체크리스트. 없으면 "없음" 이라고 쓴다 >>>',
    '',
    '## 미결사항',
    ''
  ];
  const open = openQuestions();
  lines.push(open.length ? open.map(item => `- ${item}`).join('\n') : '<<< 브리프 §9 에서 자동 추출 실패 — 직접 기재 >>>');
  lines.push(
    '',
    '## 검증',
    '',
    // `목표`(goalKind) 는 내부 상수라 리뷰어에게 뜻이 없고, tests/assertions 는 한 칸에 붙여야
    // 7컬럼이 MR 화면에서 줄바꿈되지 않는다. skip 은 남긴다 — 숨은 미검증이라 봐야 한다.
    table(['| 페이즈 | 라운드 | QA | 테스트 | skip |', '|---|---|---|---|---|'],
      qa.map(round => `| ${round.phase} | ${round.round} | ${round.qaStatus} | ${round.tests ?? '-'} / ${round.assertions ?? '-'} asserts | ${round.skips ?? '-'} |`)),
    '',
    // 이모지 헤더(🔴🟡🔵)는 헤더만 보고 무엇인지 모른다 — 글자로 적는다.
    table(['| 코드리뷰 | 결과 | Critical | Warning | Suggestion |', '|---|---|---|---|---|'],
      reviews.map(attempt => `| ${attempt.attempt ?? '-'}회차 | ${attempt.verdict ?? '-'} | ${attempt.critical ?? '-'} | ${attempt.warning ?? '-'} | ${attempt.info ?? '-'} |`)),
    ''
  );
  // 변경 파일 목록은 Changes 탭과 중복이고 파일 수만큼 길어진다. 근거로만 남기고 접는다.
  lines.push('<details>', `<summary>변경 파일 ${current.files.length}개 (+${added}/-${deleted})</summary>`, '', '| 상태 | 경로 |', '|---|---|');
  lines.push(...current.files.map(file => `| ${file.status} | \`${file.path}\` |`));
  lines.push('', '</details>', '');
  // 런 내부 경로는 리뷰어 머신에 없다 — 감사 추적용이므로 접어 둔다.
  lines.push('<details>', '<summary>런 산출물·증거</summary>', '');
  for (const [label, value] of Object.entries(request.evidence)) {
    if (typeof value === 'string' && value) lines.push(`- ${label}: \`${value}\``);
  }
  lines.push(`- dev-autopilot run: \`${root}\``, '', '</details>', '');
  fs.writeFileSync(descOut, lines.join('\n'));
}

console.log(JSON.stringify({
  status: 'ok',
  request: requestOut,
  descriptions,
  projects: projects.map(project => ({
    project: project.project,
    forgeProjectId: project.forgeProjectId,
    title: project.title,
    targetBranch: project.targetBranch,
    files: project.files.length,
    commitSha: project.commitSha
  })),
  qaRounds: qa.length,
  reviewAttempts: reviews.length,
  missingForgeId
}));
