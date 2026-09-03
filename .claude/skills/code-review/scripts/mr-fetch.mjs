// GitLab MR 정보·변경사항 조회 — mr-reviewer 가 MR 에 닿는 유일한 경로.
//
//   node .claude/skills/code-review/scripts/mr-fetch.mjs <project_name|project_id> <mr_iid>
//
// 왜 스크립트인가: access_token 이 LLM 컨텍스트·명령줄에 오르지 않아야 한다. token 은 이
// 프로세스 안에서만 존재하고 stdout 에도 나오지 않는다. (system.yaml 은 settings.json
// permissions.deny 로 LLM Read 가 차단돼 있고, 스크립트는 OS 프로세스라 그 검사를 지나지 않는다.)
//
// 산출(.claude/tmp/):
//   mr-{project_id}-{mr_iid}-info.json     MR 메타(title/description/author/branches/state)
//   mr-{project_id}-{mr_iid}-changes.json  changes 응답 전체
//   mr-review-meta.json                    {project_name, project_id, mr_iid} — SubagentStop hook 입력
//   mr_diff.txt                            unified diff (severity-scan.ps1 입력)
// 종료: 0 성공 / 1 실패(사유는 stderr, secret 미포함)
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const die = msg => {
	process.stderr.write(`[mr-fetch] ${msg}\n`);
	process.exit(1);
};

const [projectRefRaw, mrIidRaw] = process.argv.slice(2);
const projectRef = (projectRefRaw ?? '').trim();
const mrIid = (mrIidRaw ?? '').trim();
if (!projectRef || !mrIid) die('usage: mr-fetch.mjs <project_name|project_id> <mr_iid>');
if (!/^\d+$/.test(mrIid)) die(`mr_iid 는 숫자여야 한다: "${mrIid}"`);

// 스크립트는 .claude/skills/code-review/scripts/ 에 있다 → 4단계 상위가 워크스페이스 루트.
const ws = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const configPath = path.join(ws, '.claude', 'config', 'system.yaml');
if (!fs.existsSync(configPath)) die(`system.yaml 없음: ${configPath} — gitlab.url/token 을 채워야 MR 조회가 된다`);

// system.yaml 의 gitlab 블록만 얕게 읽는다(YAML 파서 의존 없음 — 다른 MR 스크립트와 같은 방식).
let inGitlab = false;
let inProjects = false;
let url = '';
let token = '';
const projects = new Map();
// 값에서 인라인 주석(` # ...`)·따옴표 제거 — 설정 템플릿의 url/token 줄에 주석이 달려
// 있어 그대로 쓰면 헤더에 주석이 붙어 401 이 난다(post-comment.sh 와 동일 규칙).
const clean = v => v.split('#')[0].trim().replace(/^["']|["']$/g, '');
for (const line of fs.readFileSync(configPath, 'utf8').split(/\r?\n/)) {
	if (/^gitlab:\s*$/.test(line)) { inGitlab = true; continue; }
	if (inGitlab && /^\S/.test(line)) break;            // 다음 최상위 키 → gitlab 블록 종료
	if (!inGitlab || !line.trim() || /^\s*#/.test(line)) continue;
	const urlM = /^\s{1,3}url:\s*(.+?)\s*$/.exec(line);
	const tokM = /^\s{1,3}token:\s*(.+?)\s*$/.exec(line);
	if (urlM) { url = clean(urlM[1]); inProjects = false; continue; }
	if (tokM) { token = clean(tokM[1]); inProjects = false; continue; }
	if (/^\s{1,3}projects:\s*(#.*)?$/.test(line)) { inProjects = true; continue; }
	if (inProjects) {
		const m = /^\s{3,}["']?([^"':#]+)["']?:\s*(\d+)\s*(?:#.*)?$/.exec(line);
		if (m) projects.set(m[1].trim(), m[2]);
	}
}

url = url.replace(/\/+$/, '');
if (!url) die('system.yaml 에 gitlab.url 이 없다');
if (!token || /REPLACE_ME|<.*>/.test(token)) die('system.yaml 의 gitlab.token 이 채워지지 않았다');

let projectId = '';
let projectName = projectRef;
if (/^\d+$/.test(projectRef)) {
	projectId = projectRef;
	for (const [name, id] of projects) if (id === projectRef) projectName = name;
} else {
	projectId = projects.get(projectRef) ?? '';
	if (!projectId) {
		const known = [...projects.keys()];
		die(`gitlab.projects 에 "${projectRef}" 없음. 등록된 이름: ${known.length ? known.join(', ') : '(없음)'}`);
	}
}
if (projectId === '0') die(`"${projectName}" 의 project_id 가 0 이다 — system.yaml gitlab.projects 를 채워야 한다`);

const get = apiPath => {
	const target = `${url}/api/v4/projects/${projectId}/merge_requests/${mrIid}${apiPath}`;
	const mod = target.startsWith('https:') ? https : http;
	return new Promise((resolve, reject) => {
		const req = mod.request(target, { headers: { 'PRIVATE-TOKEN': token }, timeout: 20000 }, res => {
			let body = '';
			res.setEncoding('utf8');
			res.on('data', chunk => { body += chunk; });
			res.on('end', () => resolve({ status: res.statusCode ?? 0, body }));
		});
		req.on('timeout', () => req.destroy(new Error('timeout (20s)')));
		req.on('error', reject);
		req.end();
	});
};

// 실패 메시지에는 응답 앞 300자만 싣는다(토큰 미포함 — 원인 파악용).
const parseOrDie = (res, what) => {
	if (res.status < 200 || res.status >= 300) {
		die(`${what} 조회 실패 (HTTP ${res.status}) project_id=${projectId} mr_iid=${mrIid}: ${res.body.slice(0, 300)}`);
	}
	try {
		return JSON.parse(res.body);
	} catch {
		die(`${what} 응답이 JSON 이 아니다 (HTTP ${res.status}): ${res.body.slice(0, 300)}`);
	}
};

// changes[] → unified diff. GitLab 의 diff 는 이미 hunk 본문이라 파일 헤더만 붙인다.
const toUnifiedDiff = changes => {
	const out = [];
	for (const c of changes) {
		if (!c || typeof c.diff !== 'string' || !c.diff) continue;
		const oldPath = c.old_path || c.new_path || 'dev/null';
		const newPath = c.new_path || c.old_path || 'dev/null';
		out.push(`diff --git a/${oldPath} b/${newPath}`);
		out.push(`--- ${c.new_file ? '/dev/null' : `a/${oldPath}`}`);
		out.push(`+++ ${c.deleted_file ? '/dev/null' : `b/${newPath}`}`);
		out.push(c.diff.replace(/\r?\n$/, ''));
	}
	return out.join('\n') + (out.length ? '\n' : '');
};

const info = parseOrDie(await get(''), 'MR 정보');
const changesRes = parseOrDie(await get('/changes'), 'MR 변경사항');
const changes = Array.isArray(changesRes.changes) ? changesRes.changes : [];

const tmpDir = path.join(ws, '.claude', 'tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const base = `mr-${projectId}-${mrIid}`;
const infoPath = path.join(tmpDir, `${base}-info.json`);
const changesPath = path.join(tmpDir, `${base}-changes.json`);
const metaPath = path.join(tmpDir, 'mr-review-meta.json');
const diffPath = path.join(tmpDir, 'mr_diff.txt');

fs.writeFileSync(infoPath, JSON.stringify({
	title: info.title ?? '',
	description: info.description ?? '',
	author: info.author?.username ?? '',
	source_branch: info.source_branch ?? '',
	target_branch: info.target_branch ?? '',
	state: info.state ?? '',
	web_url: info.web_url ?? '',
}, null, 2) + '\n');
fs.writeFileSync(changesPath, JSON.stringify(changes, null, 2) + '\n');
fs.writeFileSync(metaPath, JSON.stringify({
	project_name: projectName,
	project_id: Number(projectId),
	mr_iid: Number(mrIid),
}) + '\n');
fs.writeFileSync(diffPath, toUnifiedDiff(changes));

const rel = p => path.relative(ws, p).replace(/\\/g, '/');
process.stdout.write(
	`MR 조회 완료 — project=${projectName}(${projectId}) mr_iid=${mrIid} files=${changes.length}\n` +
	`  info    : ${rel(infoPath)}\n` +
	`  changes : ${rel(changesPath)}\n` +
	`  meta    : ${rel(metaPath)}\n` +
	`  diff    : ${rel(diffPath)}\n`,
);
