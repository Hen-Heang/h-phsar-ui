import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

class ValidationError extends Error {}
process.on('uncaughtException', error => {
  console.error(`state: ${error.message}`);
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
if (!command || !args['run-root']) {
  throw new ValidationError('usage: state.mjs <command> --run-root <path>');
}

const root = path.resolve(args['run-root']);
const mapFile = path.join(root, 'autopilot-map.json');
const eventsFile = path.join(root, 'events.jsonl');
const lockFile = path.join(root, '.state.lock');
const now = () => new Date().toISOString();
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const bool = value => {
  if (!['true', 'false'].includes(value)) throw new ValidationError('boolean value must be true or false');
  return value === 'true';
};
const existingFile = (value, label) => {
  if (!value) throw new ValidationError(`--${label} is required`);
  const file = path.resolve(value);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new ValidationError(`${label} not found: ${file}`);
  }
  return file;
};
const read = () => JSON.parse(fs.readFileSync(mapFile, 'utf8').replace(/^\uFEFF/, ''));
const save = map => {
  aggregate(map);
  map.updatedAt = now();
  const temporary = `${mapFile}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, JSON.stringify(map, null, 2));
  fs.renameSync(temporary, mapFile);
};
const event = (map, type, data) => {
  fs.appendFileSync(eventsFile, `${JSON.stringify({ at: now(), type, runId: map.runId, data })}\n`);
};
const blockAndThrow = (map, task, reason, message) => {
  task.status = 'BLOCKED';
  task.nextAction = 'STOP_AND_REPORT';
  task.blockedReason = reason;
  save(map);
  event(map, 'TASK_BLOCKED', { task: args.task, reason, validationFailure: message });
  throw new ValidationError(message);
};
// task 키는 파일 경로 조각으로도 쓰인다(아래 review 디렉토리·스냅샷 경로, 위성 스크립트의 tasks/{task}).
// 소비 시점엔 위험한 형태만 거부한다 — `.`·`..`(경로 이동), 구분자 양쪽(`/`·`\` — map 은 OS 를 건너
// 재개될 수 있어 현재 path.sep 만 보면 안 된다), `:`(Windows NTFS 대체 데이터 스트림으로 해석된다).
// 신규 생성(add-task)은 더 엄격한 계약을 걸지만, 소비까지 같은 걸 요구하면 점 포함 legacy task 가
// 재개 불가가 된다 — 호환성 파괴는 여기서 일어난다.
const assertSafeTaskKey = value => {
  if (value === '.' || value === '..' || /[\\/:]/.test(value)) {
    throw new ValidationError(`unsafe task id: ${value}`);
  }
};
const getTask = map => {
  if (!args.task || !map.tasks[args.task]) throw new ValidationError(`task not found: ${args.task}`);
  assertSafeTaskKey(args.task);
  return map.tasks[args.task];
};
// 단계별 호출 계약. 어느 스킬을 어떤 모드 어휘로 부르는지만 담는다 — 어느 스테이지에서
// 요구되는지는 아래 transition 게이트가 갖는다(스테이지 기계는 이 스크립트 소유).
// 계약이 없거나 깨졌으면 exit 2 다: 게이트의 근거가 사라진 상태로 런을 진행시키면 안 된다.
const workflowFile = fileURLToPath(new URL('../references/autopilot-workflow.json', import.meta.url));
const workflow = (() => {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(workflowFile, 'utf8').replace(/^﻿/, ''));
  } catch (error) {
    throw new Error(`workflow contract unreadable: ${workflowFile} (${error.message})`);
  }
  if (!Array.isArray(parsed.steps) || !parsed.steps.length) {
    throw new Error(`workflow contract declares no steps: ${workflowFile}`);
  }
  return parsed;
})();
const workflowStep = id => workflow.steps.find(step => step.id === id) ?? null;
// 증거 파일은 셸이 만들어 준다 — 리다이렉션 인코딩은 셸·버전마다 다르다(Windows PowerShell 의
// `>` 는 환경에 따라 UTF-16LE 로도 쓴다). BOM 으로 판별해 디코드한다. 이걸 안 하면 파싱이
// 실패하고, 실패를 관대하게 넘기면 FAIL 판정 증거가 통과한다 — 실측으로 확인된 경로다.
const decodeTextFile = file => {
  const raw = fs.readFileSync(file);
  if (raw[0] === 0xff && raw[1] === 0xfe) return raw.subarray(2).toString('utf16le');
  if (raw[0] === 0xfe && raw[1] === 0xff) return Buffer.from(raw.subarray(2)).swap16().toString('utf16le');
  return raw.toString('utf8').replace(/^﻿/, '');
};
// 게이트가 요구하는 step 이 계약에서 사라졌으면 검증 실패가 아니라 설치 오류다(exit 2).
// 계약 파일은 편집 가능한 표면이라, 행 하나가 지워졌을 때 원인이 바로 보이는 메시지여야 한다.
const requireStep = id => {
  const step = workflowStep(id);
  if (!step) throw new Error(`workflow contract is missing the "${id}" step this stage requires: ${workflowFile}`);
  return step;
};
// 이 step 은 페이즈마다 하나씩 기록한다. `--phase` 유무로 추론하면 인수를 빠뜨린 기록 1건이
// 전 페이즈를 통과시킨다 — 계획 페이즈 전부를 요구하는 CODE_REVIEW 게이트가 그대로 뚫린다.
const PHASE_STEPS = new Set(workflow.steps.filter(step => step.perPhase).map(step => step.id));
// 자기 출력을 이미 내는 명령들. 나머지는 스위치 뒤 공통 emitter 가 요약 한 줄을 낸다.
const PRINTS_OWN_OUTPUT = new Set(['init', 'goal-start', 'verify', 'next', 'timeline', 'unlock']);
const stepDemand = step => {
  const mode = step.mode ? ` ${step.mode}` : '';
  return `/${step.skill}${mode}`;
};
const assertStep = (task, id) => {
  const step = requireStep(id);
  if (!task.steps?.[id]) {
    throw new ValidationError(`workflow step not recorded: ${id} — invoke ${stepDemand(step)} and record it with: state.mjs step --id ${id}`);
  }
};
// 런 루트 정규화는 지연 계산한다 — 루트 디렉토리는 아래 mkdirSync 뒤에야 존재가 보장된다. resolve 만으로는
// Windows 대소문자·8.3 표기가 정규화되지 않아, realpath 된 하위 경로와의 격리 비교가 접두사 불일치로 어긋난다.
let canonicalRootCache = null;
const canonicalRoot = () => (canonicalRootCache ??= fs.realpathSync(root));
const insideRunRoot = candidate => {
  const relative = path.relative(canonicalRoot(), candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
};
const resolveSnapshotPath = value => {
  if (!value || path.isAbsolute(value)) throw new ValidationError(`snapshot path must be relative to the run root: ${value}`);
  const snapshot = path.resolve(canonicalRoot(), value);
  if (!insideRunRoot(snapshot)) throw new ValidationError(`snapshot path escapes run root: ${value}`);
  return snapshot;
};
// 승인 바이트를 런 루트 안 {sha256}{ext} 불변 경로로 남긴다. 원본(documentPath)은 작업 산출물 디렉토리
// 소유라 런보다 먼저 정리될 수 있고, 그러면 게이트 재검증이 원본 부재로 죽어 재개가 막힌다(실측:
// works 정리 후 `brief gate document missing`). 해시 이름이라 재승인이 이전 승인 바이트를 덮을 수 없고,
// 중간에 죽어도 고아 파일 하나가 남을 뿐 기존 증거는 그대로다 — 재시도는 동일 해시 목적지를 rename 으로
// 교체하며 수렴한다. 안전장치 셋: ① mkdir **전** 최근접 기존 부모 realpath 검사 — junction 은 일반 권한으로
// 만들어지고 mkdirSync recursive 가 그걸 따라가 루트 밖에 디렉토리를 먼저 만든다(실측). ② tmp 는
// UUID+COPYFILE_EXCL — 예측 가능한 tmp 이름은 미리 심어둔 하드링크로 외부 파일을 덮게 된다. ③ rename 은
// 디렉토리 엔트리를 교체하므로 목적지에 심어둔 하드링크·심링크도 끊는다. 검사와 쓰기 사이 TOCTOU 는 Node
// 경로 API 로 못 없앤다 — 동시 악성 프로세스는 신뢰 범위 밖이다(runtime-contract 참조).
const snapshotDocument = (sourceFile, relativeDir) => {
  const sourceHash = sha256(sourceFile);
  const directory = path.resolve(canonicalRoot(), relativeDir);
  if (!insideRunRoot(directory)) throw new ValidationError(`snapshot directory escapes run root: ${directory}`);
  let existing = directory;
  while (!fs.existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) throw new ValidationError('cannot resolve snapshot directory parent');
    existing = parent;
  }
  if (!insideRunRoot(fs.realpathSync(existing))) throw new ValidationError(`snapshot directory parent escapes run root: ${existing}`);
  fs.mkdirSync(directory, { recursive: true });
  if (!insideRunRoot(fs.realpathSync(directory))) throw new ValidationError(`snapshot directory escapes run root after creation: ${directory}`);
  const destination = path.join(directory, `${sourceHash}${path.extname(sourceFile)}`);
  const temporary = path.join(directory, `.tmp-${process.pid}-${crypto.randomUUID()}`);
  try {
    fs.copyFileSync(sourceFile, temporary, fs.constants.COPYFILE_EXCL);
    if (sha256(temporary) !== sourceHash) throw new ValidationError(`source changed while snapshotting: ${sourceFile}`);
    if (fs.existsSync(destination) && sha256(destination) !== sourceHash) {
      throw new ValidationError(`snapshot store conflict: ${destination}`);
    }
    // 여기 도달 = 목적지가 없거나 동일 해시. 다른 해시 증거는 위에서 이미 거부됐다.
    fs.renameSync(temporary, destination);
    return { documentHash: sourceHash, snapshotPath: path.relative(canonicalRoot(), destination).split(path.sep).join('/') };
  } finally {
    fs.rmSync(temporary, { force: true });
  }
};
// 이중 경로 검증. snapshotPath 가 있으면 스냅샷이 필수 증거다: 반드시 존재하고 승인 해시와 일치해야 한다.
// 원본은 남아 있으면 여전히 drift 를 잡고(기존 계약 그대로), 없으면 통과시키되 관측을 반환한다 — 관측은
// 마커와 무관하게 **항상** 반환한다. 이벤트 중복 억제는 영속화(persistObservations)의 일이지 검증의 일이
// 아니다: 여기서 마커를 보고 삼키면 두 번째 verify 부터 누락이 사라진 것처럼 보고된다.
// snapshotPath 없는 legacy 레코드는 종전 그대로 원본 존재+일치를 요구한다.
const assertHash = (record, label) => {
  if (!record?.documentPath || !record.documentHash) throw new ValidationError(`${label} is not recorded`);
  if (record.snapshotPath) {
    const snapshot = resolveSnapshotPath(record.snapshotPath);
    if (!fs.existsSync(snapshot)) throw new ValidationError(`${label} snapshot missing: ${snapshot}`);
    if (sha256(snapshot) !== record.documentHash) throw new ValidationError(`${label} snapshot hash drift`);
    if (fs.existsSync(record.documentPath)) {
      if (sha256(record.documentPath) !== record.documentHash) throw new ValidationError(`${label} hash drift`);
      return null;
    }
    return { record, documentPath: record.documentPath, documentHash: record.documentHash };
  }
  if (!fs.existsSync(record.documentPath)) throw new ValidationError(`${label} document missing: ${record.documentPath}`);
  if (sha256(record.documentPath) !== record.documentHash) throw new ValidationError(`${label} hash drift`);
  return null;
};
const gitHead = worktree => {
  const result = spawnSync('git', ['-C', worktree, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  if (result.status !== 0) throw new ValidationError(`cannot read worktree HEAD: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
};
const gitBranch = worktree => {
  const result = spawnSync('git', ['-C', worktree, 'branch', '--show-current'], { encoding: 'utf8' });
  if (result.status !== 0) throw new ValidationError(`cannot read worktree branch: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
};
const assertCleanCheckout = (worktree, purpose) => {
  const result = spawnSync('git', ['-C', worktree, 'status', '--porcelain'], { encoding: 'utf8' });
  if (result.status !== 0) throw new ValidationError(`cannot inspect checkout status: ${(result.stderr || result.stdout).trim()}`);
  if (result.stdout.trim()) throw new ValidationError(`${purpose} requires a clean checkout: ${worktree}`);
};
const gitRevParse = (worktree, ref) => {
  const result = spawnSync('git', ['-C', worktree, 'rev-parse', '--verify', ref], { encoding: 'utf8' });
  if (result.status !== 0) throw new ValidationError(`cannot resolve ${ref} in ${worktree}`);
  return result.stdout.trim();
};
// 워크트리 HEAD 는 앞으로만 간다. 구현 중 커밋은 정상 진행이고, 되돌림(reset·rebase·브랜치 교체)만 사고다.
// 기록값과 완전히 같기를 요구하면 첫 커밋 직후부터 verify·next·reassign·commit-result 가 전부 막힌다.
// 관측한 HEAD 는 그때마다 기록에 반영한다(래칫). 이게 없으면 "커밋 → 관측 → 되돌림" 이 통과해
// 증거는 GREEN 인데 트리에는 그 구현이 없는 상태를 만들 수 있다 — 이 검사가 막으려던 바로 그 일이다.
const advanceHead = worktree => {
  const branch = gitBranch(worktree.path);
  if (worktree.branch && branch !== worktree.branch) {
    throw new ValidationError(`worktree branch changed: ${worktree.path} (${worktree.branch} -> ${branch || 'detached'})`);
  }
  const head = gitHead(worktree.path);
  if (head === worktree.head) return false;
  const ancestor = spawnSync('git', ['-C', worktree.path, 'merge-base', '--is-ancestor', worktree.head, head]);
  if (ancestor.status !== 0) throw new ValidationError(`worktree HEAD moved off the recorded commit: ${worktree.path}`);
  worktree.head = head;
  return true;
};
const gitTopLevel = directory => {
  const result = spawnSync('git', ['-C', directory, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (result.status !== 0) return null;
  return path.resolve(result.stdout.trim());
};
// 워크스페이스 루트는 프로젝트 저장소들을 담는 디렉토리다. 그 자체가 저장소인 경우(단일 저장소
// 프로젝트)와 아닌 경우(저장소 여러 개를 나란히 둔 워크스페이스) 둘 다 정상이다. 막아야 하는 건
// 저장소 **하위 디렉토리**뿐 — 그러면 런타임 상태가 남의 작업 트리 안에 파묻히고, 과업이 여러
// 저장소를 건드릴 때 A 저장소 안에 B 저장소의 워크트리가 들어앉는다.
const assertWorkspaceRoot = workspaceRoot => {
  const top = gitTopLevel(workspaceRoot);
  if (top !== null && top !== workspaceRoot) {
    throw new ValidationError(`--workspace-root must be a repository top level or a directory outside any repository: ${workspaceRoot} (inside ${top})`);
  }
  return top;
};
// 워크스페이스 루트가 저장소이면 런 루트가 그 작업 트리 안에 생긴다. 로컬 exclude 에 넣어 두지
// 않으면 런타임 상태가 `git status` 에 계속 뜨고, 리뷰 재사용의 clean 검사까지 막는다. 공유
// `.gitignore` 는 건드리지 않는다 — 런타임 디렉토리는 그 저장소를 쓰는 다른 사람의 관심사가 아니다.
const excludeRunRoot = workspaceRoot => {
  const raw = spawnSync('git', ['-C', workspaceRoot, 'rev-parse', '--git-path', 'info/exclude'], { encoding: 'utf8' });
  if (raw.status !== 0) return;
  const excludeFile = path.isAbsolute(raw.stdout.trim())
    ? raw.stdout.trim()
    : path.resolve(workspaceRoot, raw.stdout.trim());
  fs.mkdirSync(path.dirname(excludeFile), { recursive: true });
  const pattern = '/.autopilot/';
  const existing = fs.existsSync(excludeFile) ? fs.readFileSync(excludeFile, 'utf8') : '';
  if (existing.split(/\r?\n/).map(line => line.trim()).includes(pattern)) return;
  const separator = existing.length && !existing.endsWith('\n') ? '\n' : '';
  fs.appendFileSync(excludeFile, `${separator}${pattern}\n`);
};
// Autopilot 은 체크아웃을 만들지 않는다 — 워크스페이스에 이미 있는 것을 등록해서 쓴다. 그래서 일반
// 체크아웃(`.git` 디렉토리)이든 다른 곳에서 만들어 둔 linked worktree(`.git` 파일)든 똑같이 받는다.
// 요구하는 건 하나뿐이다: 그 경로가 작업 트리의 top level 이어야 한다. 하위 디렉토리를 등록하면
// 커밋·HEAD 판정이 저장소 전체를 보면서 경로만 일부를 가리켜 어긋난다.
const assertGitWorkTree = directory => {
  const inside = spawnSync('git', ['-C', directory, 'rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' });
  if (inside.status !== 0 || inside.stdout.trim() !== 'true') {
    throw new ValidationError(`not a git work tree: ${directory}`);
  }
  const top = gitTopLevel(directory);
  if (top !== path.resolve(directory)) {
    throw new ValidationError(`must be the work tree top level: ${directory} (top level is ${top})`);
  }
};
// 반환값 = 관측 묶음: 전진한 워크트리 HEAD 목록 + 스냅샷은 무결하지만 원본이 사라진 문서 목록.
// missingSources 는 **현재 상태**라 검증마다 다시 계산된다 — 마커는 이벤트 중복만 막지 상태를 숨기지 않는다.
// authorization 은 런 수준 증거이므로 task 라벨이 항상 null 이다 — 어느 과업 경유로 관측되든 같은 사실이다.
const missingSourceEntry = (observation, kind, taskKey, gate) =>
  observation && { kind, task: taskKey, gate, documentPath: observation.documentPath, documentHash: observation.documentHash, record: observation.record };
const verifyTask = (map, taskKey, task) => {
  const missingSources = [];
  const note = entry => entry && missingSources.push(entry);
  note(missingSourceEntry(assertHash(map.authorization, 'authorization'), 'authorization', null, null));
  for (const [gate, record] of Object.entries(task.gates)) {
    if (record.status === 'APPROVED') note(missingSourceEntry(assertHash(record, `${gate} gate`), 'gate', taskKey, gate));
  }
  if (task.expertGapReport) note(missingSourceEntry(assertHash(task.expertGapReport, 'expert gap report'), 'expert-gap', taskKey, null));
  const advanced = [];
  for (const [project, worktree] of Object.entries(task.projects)) {
    if (!fs.existsSync(worktree.path)) throw new ValidationError(`worktree missing: ${worktree.path}`);
    assertGitWorkTree(worktree.path);
    if (advanceHead(worktree)) advanced.push({ project, head: worktree.head });
  }
  return { advanced, missingSources };
};
// 관측 결과를 그 자리에서 굳힌다. 읽기 명령이라도 전진했으면 저장한다 — 관측하고 버리면 래칫이 아니다.
// 상태를 바꾸는 명령들은 자기 save() 로 같은 변경을 함께 남긴다.
// 원본 누락은 (documentPath, documentHash) 마커로 최초 1회만 이벤트를 낸다 — 재승인이 해시를 바꾸면 구
// 마커가 자동 실효된다. save → event 사이에 죽으면 이벤트가 영영 빠질 수 있다: map 이 진실 원본이고
// 이벤트는 at-most-once 감사 보조 기록이다(runtime-contract 참조).
const persistObservations = (map, taskKey, observations) => {
  const { advanced, missingSources } = observations;
  const fresh = missingSources.filter(item => {
    const marker = item.record.sourceMissingObservation;
    return !(marker && marker.documentPath === item.documentPath && marker.documentHash === item.documentHash);
  });
  if (!advanced.length && !fresh.length) return;
  for (const item of fresh) {
    item.record.sourceMissingObservation = { documentPath: item.documentPath, documentHash: item.documentHash, observedAt: now() };
  }
  save(map);
  for (const item of advanced) {
    event(map, 'WORKTREE_HEAD_OBSERVED', { task: taskKey, project: item.project, head: item.head });
  }
  for (const item of fresh) {
    event(map, 'SOURCE_MISSING', { task: item.task, kind: item.kind, gate: item.gate, documentPath: item.documentPath, documentHash: item.documentHash });
  }
};
const refreshDeliveryStatus = task => {
  const deliveries = Object.values(task.projects).map(project => project.delivery);
  if (!deliveries.length) {
    task.mr.status = 'NOT_CREATED';
    return;
  }
  const statuses = deliveries.map(delivery => delivery?.status ?? 'NOT_STARTED');
  if (statuses.every(status => status === 'CREATED')) task.mr.status = 'CREATED';
  else if (statuses.every(status => status === 'FAILED')) task.mr.status = 'FAILED';
  else if (statuses.every(status => ['CREATED', 'FAILED'].includes(status))) task.mr.status = 'PARTIAL';
  else if (statuses.some(status => status === 'PUSHED')) task.mr.status = 'PUSHED';
  else task.mr.status = 'NOT_CREATED';
  // 프로젝트가 하나면 그 배달값을 최상위로 올린다. 상태만 집계하고 URL 을 비워 두면 요약 보고를
  // 최상위에서 읽는 쪽이 "MR 없음" 으로 오독한다(실측, 두 런 연속). 프로젝트가 여럿이면 올릴
  // 단일 값이 없으므로 null 을 유지한다 — 하나를 대표로 고르면 나머지 배달이 보고에서 사라진다.
  const single = deliveries.length === 1 ? deliveries[0] : null;
  task.mr.url = single?.url ?? null;
  task.mr.remoteSha = single?.remoteSha ?? null;
};
function aggregate(map) {
  const tasks = Object.values(map.tasks);
  if (!tasks.length) {
    map.status = 'RUNNING';
    map.currentStage = 'INPUT';
    map.nextAction = 'BUILD_BRIEF';
    return;
  }
  const terminal = new Set(['COMPLETED', 'BLOCKED', 'FAILED', 'CANCELLED']);
  if (tasks.every(task => task.status === 'COMPLETED')) map.status = 'COMPLETED';
  else if (tasks.some(task => task.status === 'BLOCKED')) map.status = 'BLOCKED';
  else if (tasks.some(task => task.status === 'FAILED')) map.status = 'FAILED';
  else if (tasks.every(task => terminal.has(task.status))) map.status = 'CANCELLED';
  else map.status = 'RUNNING';
  const active = tasks.find(task => !terminal.has(task.status)) ?? tasks.find(task => task.status !== 'COMPLETED') ?? tasks[0];
  map.currentStage = active.currentStage;
  map.nextAction = active.nextAction;
}

if (command === 'init') {
  if (!args['run-id']) throw new ValidationError('--run-id is required');
  if (!args['workspace-root']) throw new ValidationError('--workspace-root is required');
  const workspaceRoot = fs.realpathSync(path.resolve(args['workspace-root']));
  const workspaceIsRepository = assertWorkspaceRoot(workspaceRoot) !== null;
  const expectedRunRoot = path.join(workspaceRoot, '.autopilot', args['run-id']);
  if (root !== expectedRunRoot) {
    throw new ValidationError(`--run-root must be ${expectedRunRoot}`);
  }
  if (workspaceIsRepository) excludeRunRoot(workspaceRoot);
}
fs.mkdirSync(root, { recursive: true });
if (command === 'unlock') {
  if (!fs.existsSync(lockFile)) throw new ValidationError(`state lock does not exist: ${lockFile}`);
  let record;
  try {
    record = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
  } catch {
    throw new ValidationError('state lock is unreadable; do not remove it automatically');
  }
  if (!Number.isInteger(record.pid)) throw new ValidationError('state lock has no valid pid');
  if (args['expected-pid'] && Number(args['expected-pid']) !== record.pid) {
    throw new ValidationError(`state lock pid differs: ${record.pid}`);
  }
  try {
    process.kill(record.pid, 0);
    throw new ValidationError(`state lock owner is still alive: ${record.pid}`);
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    if (error.code !== 'ESRCH') throw new ValidationError(`cannot verify state lock owner: ${error.message}`);
  }
  fs.rmSync(lockFile);
  console.log(JSON.stringify({ status: 'unlocked', pid: record.pid }));
  process.exit(0);
}
let lock;
try {
  try {
    lock = fs.openSync(lockFile, 'wx');
    fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, createdAt: now() }));
  } catch (error) {
    if (error.code === 'EEXIST') throw new ValidationError(`state lock exists: ${lockFile}`);
    throw error;
  }

  if (command === 'init') {
    if (fs.existsSync(mapFile)) throw new ValidationError(`run already initialized: ${root}`);
    const workspaceRoot = fs.realpathSync(path.resolve(args['workspace-root']));
    const authorizationPath = existingFile(args['authorization-document'], 'authorization-document');
    // 승인 문서는 기록과 동시에 런 루트로 스냅샷 — 원본은 산출물 디렉토리 소유라 런보다 먼저 정리될 수 있다.
    const authorizationSnapshot = snapshotDocument(authorizationPath, 'authorization');
    const remoteAuthorized = bool(args['remote-authorized'] ?? 'false');
    const map = {
      schemaVersion: 5,
      runId: args['run-id'],
      // 런 디렉토리 이름은 세션 id 를 8자로 줄여 쓴다(모든 명령이 이 경로를 전부 적는다).
      // 잘리지 않은 값은 여기 남긴다 — 런을 만든 세션 기록과 대조하려면 전체가 필요하다.
      sessionId: args['session-id'] ?? null,
      status: 'RUNNING',
      currentStage: 'INPUT',
      nextAction: 'BUILD_BRIEF',
      workspaceRoot,
      authorization: {
        documentPath: authorizationPath,
        documentHash: authorizationSnapshot.documentHash,
        snapshotPath: authorizationSnapshot.snapshotPath,
        remoteAuthorized,
        recordedAt: now()
      },
      decisions: [],
      createdAt: now(),
      updatedAt: now(),
      tasks: {}
    };
    save(map);
    event(map, 'RUN_INITIALIZED', { stage: 'INPUT', remoteAuthorized });
    // 성공에도 stdout 한 줄을 낸다. 빈 출력을 파이프로 파싱하면 `Unexpected end of JSON input` 이
    // 나서 성공이 실패로 읽힌다(실측) — 계약이 "모든 스크립트는 stdout 에 JSON 한 줄" 이다.
    console.log(JSON.stringify({ status: 'initialized', runId: map.runId, sessionId: map.sessionId, currentStage: map.currentStage, nextAction: map.nextAction }));
  } else {
    if (!fs.existsSync(mapFile)) throw new ValidationError(`run is not initialized: ${root}`);
    const map = read();
    if (map.schemaVersion !== 5) {
      throw new ValidationError(`unsupported dev-autopilot map schema: ${map.schemaVersion ?? 'missing'}; start a new run`);
    }
    const expectedRunRoot = path.join(map.workspaceRoot, '.autopilot', map.runId);
    if (root !== expectedRunRoot) throw new ValidationError(`run root differs from recorded path: ${expectedRunRoot}`);
    const task = args.task && command !== 'add-task' ? getTask(map) : null;
    // BLOCKED 는 권고가 아니라 상태다. 여기서 막지 않으면 goal-start·transition 이 status 를 RUNNING 으로
    // 덮어써 차단이 조용히 풀리고(blockedReason 은 남은 채, TASK_UNBLOCKED 없이), 두 번째 block 은
    // 사유를 덮어쓴다 — 둘 다 실측. 읽기 명령과 unblock 만 통과한다: 복구는 감사 기록을 남기는 그 경로 하나다.
    if (task?.status === 'BLOCKED' && !['unblock', 'next', 'verify', 'timeline'].includes(command)) {
      throw new ValidationError(`task is BLOCKED (${task.blockedReason}) — recover with unblock or start a new run`);
    }

    switch (command) {
      case 'add-task': {
        if (!args.task) throw new ValidationError('--task is required');
        // 신규 task 계약: 영숫자로 시작, 영숫자·`_`·`-` 만. task 키는 tasks/{task} 파일 경로 조각이 된다.
        // legacy map 의 점 포함 키는 소비 시점 blocklist(assertSafeTaskKey)로만 거른다 — 생성만 엄격하다.
        if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(args.task)) {
          throw new ValidationError(`--task must start alphanumeric and use only [A-Za-z0-9_-]: ${args.task}`);
        }
        if (map.tasks[args.task]) throw new ValidationError(`task already exists: ${args.task}`);
        map.tasks[args.task] = {
          status: 'PENDING',
          currentStage: 'INPUT',
          nextAction: 'BUILD_BRIEF',
          blockedReason: null,
          unblocks: [],
          gates: {
            brief: { status: 'PENDING', documentPath: null, documentHash: null, actor: null, approvedAt: null },
            mr: { status: 'PENDING', documentPath: null, documentHash: null, actor: null, approvedAt: null }
          },
           expertGapReport: null,
          steps: {},
          plan: { rootDocument: null, manifest: null, phaseIds: [], phaseProjects: {}, revision: 1 },
          sourceBranch: null,
          projects: {},
          phases: {},
          review: { status: 'NOT_RUN', attempts: 0, fingerprints: [] },
          commit: { status: 'NOT_STARTED', shas: {} },
          mr: { status: 'NOT_CREATED', url: null, remoteSha: null }
        };
        save(map);
        event(map, 'TASK_ADDED', { task: args.task });
        break;
      }
      case 'decision': {
        for (const required of ['kind', 'value', 'evidence']) {
          if (!args[required]) throw new ValidationError(`--${required} is required`);
        }
        const allowed = ['PROJECT_SCOPE', 'BASE_REF', 'SOURCE_BRANCH', 'PHASE_ROUTING'];
        if (!allowed.includes(args.kind)) throw new ValidationError(`unknown decision kind: ${args.kind}`);
        map.decisions.push({ task: args.task ?? null, kind: args.kind, value: args.value, evidence: args.evidence, decidedAt: now() });
        save(map);
        event(map, 'DECISION_RECORDED', { task: args.task ?? null, kind: args.kind, value: args.value });
        break;
      }
      case 'approve': {
        if (!['brief', 'mr'].includes(args.gate)) throw new ValidationError('--gate must be brief or mr');
        if (!args.actor) throw new ValidationError('--actor is required');
        const approvalStage = args.gate === 'brief' ? 'BRIEF_APPROVAL' : 'MR_APPROVAL';
        if (task.currentStage !== approvalStage) {
          throw new ValidationError(`${args.gate} approval requires ${approvalStage} stage`);
        }
        if (task.gates[args.gate].status === 'APPROVED') {
          throw new ValidationError(`${args.gate} gate is already approved; use reapprove`);
        }
        const documentPath = existingFile(args.document, 'document');
        const documentSnapshot = snapshotDocument(documentPath, path.join('tasks', args.task, 'gates', args.gate));
        if (args.gate === 'brief') {
          const expertReport = existingFile(args['expert-report'], 'expert-report');
          const expertSnapshot = snapshotDocument(expertReport, path.join('tasks', args.task, 'gates', 'expert-gap'));
          task.expertGapReport = { documentPath: expertReport, documentHash: expertSnapshot.documentHash, snapshotPath: expertSnapshot.snapshotPath, recordedAt: now() };
        }
        task.gates[args.gate] = {
          status: 'APPROVED',
          documentPath,
          documentHash: documentSnapshot.documentHash,
          snapshotPath: documentSnapshot.snapshotPath,
          actor: args.actor,
          approvedAt: now()
        };
        save(map);
        event(map, 'GATE_APPROVED', { task: args.task, gate: args.gate, actor: args.actor, documentHash: task.gates[args.gate].documentHash });
        break;
      }
      case 'reapprove': {
        if (!['brief', 'mr'].includes(args.gate)) throw new ValidationError('--gate must be brief or mr');
        if (!args.actor || !args.reason) throw new ValidationError('--actor and --reason are required');
        const approvalStage = args.gate === 'brief' ? 'BRIEF_APPROVAL' : 'MR_APPROVAL';
        if (task.currentStage !== approvalStage) {
          throw new ValidationError(`${args.gate} reapproval requires ${approvalStage} stage`);
        }
        const previous = task.gates[args.gate];
        if (previous.status !== 'APPROVED' || !previous.documentHash) {
          throw new ValidationError(`${args.gate} gate must already be approved`);
        }
        const documentPath = existingFile(args.document, 'document');
        const previousDocumentHash = previous.documentHash;
        const documentHash = sha256(documentPath);
        if (documentHash === previousDocumentHash) throw new ValidationError('reapproval requires a changed document hash');
        const documentSnapshot = snapshotDocument(documentPath, path.join('tasks', args.task, 'gates', args.gate));
        if (args.gate === 'brief') {
          const expertReport = existingFile(args['expert-report'], 'expert-report');
          const expertSnapshot = snapshotDocument(expertReport, path.join('tasks', args.task, 'gates', 'expert-gap'));
          task.expertGapReport = { documentPath: expertReport, documentHash: expertSnapshot.documentHash, snapshotPath: expertSnapshot.snapshotPath, recordedAt: now() };
        }
        const reapprovals = previous.reapprovals ?? [];
        reapprovals.push({
          previousDocumentHash,
          documentHash,
          reason: args.reason,
          actor: args.actor,
          reapprovedAt: now()
        });
        // spread 가 이전 승인의 원본 누락 마커를 새 승인으로 상속시키면 새 승인의 누락 이벤트가 억제된다.
        // dedup 이 해시 기준이라 실효되긴 하지만, 이전 승인의 관측이 현 레코드에 남는 것 자체를 지운다.
        const { sourceMissingObservation: _stale, ...cleanPrevious } = previous;
        task.gates[args.gate] = {
          ...cleanPrevious,
          documentPath,
          documentHash,
          snapshotPath: documentSnapshot.snapshotPath,
          actor: args.actor,
          approvedAt: now(),
          reapprovals
        };
        save(map);
        event(map, 'GATE_REAPPROVED', {
          task: args.task,
          gate: args.gate,
          previousDocumentHash,
          documentHash,
          reason: args.reason,
          actor: args.actor
        });
        break;
      }
      case 'register-plan': {
        if (task.gates.brief.status !== 'APPROVED') throw new ValidationError('brief gate required');
        assertHash(task.gates.brief, 'brief gate');
        const rootDocument = existingFile(args['root-document'], 'root-document');
        const manifest = existingFile(args.manifest, 'manifest');
        let parsedManifest;
        try {
          parsedManifest = JSON.parse(fs.readFileSync(manifest, 'utf8').replace(/^\uFEFF/, ''));
        } catch {
          throw new ValidationError('plan manifest must be valid JSON');
        }
        // schema 2 부터 페이즈마다 project 가 있다. goal-start 는 페이즈를 프로젝트 하나에 영구 바인딩하므로
        // 두 프로젝트에 걸친 페이즈는 dispatch 자체가 불가능한데, 이전엔 그 사실이 DEVELOP 직전에야
        // 드러났다(실측: 계획 전체 재작성). 구형 manifest 는 다시 build 해서 가져온다 — 여기서 추측하지 않는다.
        if (parsedManifest.schemaVersion !== 2) {
          throw new ValidationError(`plan manifest schema 2 required (found ${parsedManifest.schemaVersion ?? 'none'}) — rebuild with plan-manifest.mjs build`);
        }
        if (!Array.isArray(parsedManifest.phases) || parsedManifest.phases.length === 0) {
          throw new ValidationError('plan manifest must declare at least one phase');
        }
        const phaseIds = parsedManifest.phases.map(phase => String(phase.id ?? ''));
        if (phaseIds.some(id => !id)) throw new ValidationError('every plan phase requires an id');
        if (new Set(phaseIds).size !== phaseIds.length) throw new ValidationError('plan phase ids must be unique');
        const phaseProjects = {};
        for (const phase of parsedManifest.phases) {
          if (typeof phase.project !== 'string' || !/^[A-Za-z0-9._-]+$/.test(phase.project)) {
            throw new ValidationError(`phase ${phase.id}: project must be a single safe identifier (project.yaml projects[].name)`);
          }
          phaseProjects[String(phase.id)] = phase.project;
        }
        task.plan = {
          rootDocument: { path: rootDocument, sha256: sha256(rootDocument) },
          manifest: { path: manifest, sha256: sha256(manifest) },
          phaseIds,
          phaseProjects,
          revision: task.plan.revision ?? 1
        };
        save(map);
        event(map, 'PLAN_REGISTERED', { task: args.task });
        break;
      }
      case 'register-project': {
        if (!args.project) throw new ValidationError('--project is required');
        if (!task.plan.manifest) throw new ValidationError('plan must be registered before projects');
        if (task.currentStage !== 'PROJECTS') {
          throw new ValidationError(`register-project requires PROJECTS stage, current stage is ${task.currentStage}`);
        }
        if (!/^[A-Za-z0-9._-]+$/.test(args.project)) {
          throw new ValidationError('--project must be a single safe path segment');
        }
        // 기본 위치는 워크스페이스 루트 아래 프로젝트 디렉토리다. --path 는 워크스페이스 안의
        // 다른 체크아웃(밖에서 만들어 둔 worktree 등)을 가리킬 때만 쓴다 — 밖은 받지 않는다.
        const projectPath = path.resolve(args.path ?? path.join(map.workspaceRoot, args.project));
        const workspaceRoot = path.resolve(map.workspaceRoot);
        if (projectPath !== workspaceRoot && !projectPath.startsWith(`${workspaceRoot}${path.sep}`)) {
          throw new ValidationError(`project path must be inside the workspace root: ${projectPath}`);
        }
        if (!args.branch) throw new ValidationError('--branch is required');
        if (task.sourceBranch && task.sourceBranch !== args.branch) {
          throw new ValidationError(`all task projects must use source branch ${task.sourceBranch}`);
        }
        if (!fs.existsSync(projectPath)) throw new ValidationError(`project checkout missing: ${projectPath}`);
        assertGitWorkTree(projectPath);
        const duplicate = Object.entries(task.projects).find(([id, item]) => id !== args.project && item.path === projectPath);
        if (duplicate) throw new ValidationError(`path already registered for project ${duplicate[0]}: ${projectPath}`);
        // 작업 브랜치는 Autopilot 이 만든다. 갈아타기 전에 트리가 깨끗해야 한다 — 남아 있던 수정이
        // 새 브랜치로 따라 올라가면 그 커밋이 이 과업의 것인지 아닌지 아무도 구분할 수 없다.
        assertCleanCheckout(projectPath, 'creating the working branch');
        const baseRef = args['base-ref'] ?? 'HEAD';
        const baseCommit = gitRevParse(projectPath, baseRef);
        // 같은 이름이 이미 있으면 멈춘다. 남의 브랜치(또는 지난 런의 브랜치)에 올라타면 그 이력이
        // 이 과업의 증거로 섞여 들어간다. 브랜치명 충돌은 결정으로 풀 일이지 덮어쓸 일이 아니다.
        const exists = spawnSync('git', ['-C', projectPath, 'rev-parse', '--verify', '--quiet', `refs/heads/${args.branch}`], { encoding: 'utf8' });
        if (exists.status === 0) throw new ValidationError(`branch already exists: ${args.branch} in ${projectPath}`);
        const created = spawnSync('git', ['-C', projectPath, 'switch', '-c', args.branch, baseCommit], { encoding: 'utf8' });
        if (created.status !== 0) throw new ValidationError(`cannot create branch ${args.branch}: ${(created.stderr || created.stdout).trim()}`);
        const branch = gitBranch(projectPath);
        const head = gitHead(projectPath);
        task.projects[args.project] = {
          path: projectPath,
          branch,
          baseRef,
          baseCommit,
          head,
          registeredAt: now(),
          delivery: {
            status: 'NOT_STARTED',
            remoteSha: null,
            url: null,
            failure: null,
            recordedAt: null
          }
        };
        task.sourceBranch ??= branch;
        save(map);
        event(map, 'PROJECT_REGISTERED', { task: args.task, project: args.project, path: projectPath, branch, head });
        break;
      }
      // 어느 스킬을 실제로 불렀나를 기록한다. 이게 없으면 게이트는 "브리프 파일이 있나·리뷰
      // 결과가 있나" 만 보므로, 스킬 대신 그 스킬의 서브에이전트를 직접 dispatch 해도 전부
      // 통과한다 — 스킬이 들고 있던 가드(형식 게이트·가이드라인 로드·수렴 루프)가 조용히 빠진다.
      // 호출 문자열에 `/{skill}` 리터럴을 요구하는 것이 그 대체를 잡는 방법이다: 에이전트
      // dispatch 에는 슬래시가 없다(`code-reviewer` 는 `/code-review` 를 포함하지 않는다).
      case 'step': {
        const step = workflowStep(args.id);
        if (!step) {
          throw new ValidationError(`unknown workflow step: ${args.id ?? '(missing --id)'} — declared steps: ${workflow.steps.map(item => item.id).join(', ')}`);
        }
        // 호출 문자열은 **계약에서 조립한다.** 오케스트레이터가 `/{skill} …` 을 인수로 넘기면 POSIX 흉내
        // 셸(Windows Git Bash)의 경로 변환이 선행 슬래시를 셸 설치 경로로 확장해
        // `C:/Program Files/Git/dev-interview …` 를 기록한다 — 실측된 훼손이고, 부분 문자열 검사는
        // 그걸 통과시켰다. skill·mode 는 이미 autopilot-workflow.json 에 있으므로 오케스트레이터에게
        // 남은 정보는 인수뿐이다. 인수만 받고 선행 슬래시는 거부하면 셸이 손댈 표면이 사라진다.
        const stepArgs = (args.args ?? '').trim();
        if (stepArgs.startsWith('/')) {
          throw new ValidationError(`--args must carry only the arguments, not the call itself — drop the leading "/${step.skill}": ${stepArgs}`);
        }
        const invocation = [`/${step.skill}`, stepArgs, step.mode].filter(Boolean).join(' ');
        let phaseId = null;
        if (PHASE_STEPS.has(step.id)) {
          phaseId = String(args.phase || '');
          if (!phaseId) throw new ValidationError(`--phase is required for the ${step.id} step`);
          if (!(task.plan.phaseIds ?? []).includes(phaseId)) {
            throw new ValidationError(`phase is not declared by the registered plan: ${phaseId}`);
          }
        }
        // 증거 파일이 있는 단계는 그 파일로 판정한다. 계약의 proof 3종(형식 검증기 출력·플랜
        // manifest·QA 라운드)은 전부 JSON 이므로 **읽을 수 없으면 거부한다** — 파싱 실패를
        // 관대하게 넘기면 `pass:false` 리포트가 "파일이 있으니 통과" 로 뒤집힌다(실측).
        // 판정을 못 읽은 것과 판정이 통과인 것은 같은 값이 될 수 없다.
        let proof = null;
        if (step.proof === 'file' || step.proof === 'verdict') {
          const proofFile = existingFile(args['proof-file'], 'proof-file');
          let parsed;
          try {
            parsed = JSON.parse(decodeTextFile(proofFile));
          } catch {
            throw new ValidationError(`proof must be readable JSON: ${proofFile}`);
          }
          // proof 두 종류를 구분한다. `verdict` 는 판정 영수증이라 `pass: true` 가 아니면 거부한다 —
          // 영수증을 **검사 대상 스킬이 직접 쓰는** 구조에서 키 없는 `{}` 를 통과시키면 판정이 없는
          // 파일이 판정으로 기록된다. `file` 은 산출물 자체(플랜 manifest·QA 라운드)로 판정 필드가
          // 없는 게 정상이고, RED 라운드도 기록돼야 하므로 존재·파싱만 본다(있는데 false 면 거부).
          const verdict = parsed && typeof parsed === 'object' ? parsed.pass : undefined;
          if (verdict === false) throw new ValidationError(`proof reports pass:false — ${proofFile}`);
          if (step.proof === 'verdict' && verdict !== true) {
            throw new ValidationError(`verdict proof must report pass:true — ${proofFile} (pass: ${JSON.stringify(verdict) ?? 'absent'})`);
          }
          proof = { path: proofFile, sha256: sha256(proofFile), pass: verdict === true ? true : null };
        } else if (!args.actor) {
          throw new ValidationError(`--actor is required for the ${step.id} step (no machine proof exists)`);
        }
        const record = {
          skill: step.skill,
          mode: step.mode ?? null,
          invocation,
          proof,
          actor: args.actor ?? null,
          recordedAt: now()
        };
        task.steps ??= {};
        if (phaseId) {
          task.steps[step.id] = { ...(task.steps[step.id] ?? {}), [phaseId]: record };
        } else {
          task.steps[step.id] = record;
        }
        save(map);
        event(map, 'STEP_RECORDED', { task: args.task, step: step.id, phase: phaseId, skill: step.skill, invocation });
        break;
      }
      case 'transition': {
        const allowed = {
          INPUT: ['BRIEF'],
          BRIEF: ['BRIEF_APPROVAL'],
          BRIEF_APPROVAL: ['PLAN'],
          PLAN: ['PROJECTS'],
          PROJECTS: ['DEVELOP'],
          DEVELOP: ['QA', 'CODE_REVIEW'],
          QA: ['DEVELOP', 'CODE_REVIEW'],
          CODE_REVIEW: ['DEVELOP', 'COMMIT'],
          COMMIT: ['MR_APPROVAL'],
          MR_APPROVAL: ['MR_CREATE'],
          MR_CREATE: ['DONE'],
          DONE: []
        };
        const target = args.stage;
        if (!target || !args['next-action']) throw new ValidationError('--stage and --next-action are required');
        if (!allowed[task.currentStage]?.includes(target)) {
          throw new ValidationError(`invalid stage transition: ${task.currentStage} -> ${target}`);
        }
        // step 게이트는 goal·문서 게이트와 다른 것을 본다. goal 은 "끝났나", 문서는 "결과가
        // 있나", step 은 "무엇으로 했나" 다. 브리프 파일은 손으로도 쓸 수 있으므로 마지막 질문에
        // 답하는 건 step 기록뿐이다.
        //
        // 어느 스테이지가 어떤 step 을 요구하는지는 **계약이 선언한다**(`requiredFor`). 이 루프는
        // 그 선언을 집행만 한다 — 게이트가 JS 편집을 요구하면 계약에 줄만 들어가고 아무도 요구하지
        // 않는 step 이 조용히 만들어진다(등록됐는데 게이트가 없는 상태). 순서는 계약의 배열 순서다:
        // CODE_REVIEW 에서 페이즈 완결성이 QA 최신성보다 먼저 걸려야 원인이 바로 보인다.
        for (const declared of workflow.steps.filter(item => (item.requiredFor ?? []).includes(target))) {
          // 리뷰 재사용(accept-existing-review)은 문서화된 예외다 — 그 경로는 이 런에서 리뷰를
          // 돌리지 않는 것이 정상이고, 원본 리뷰 해시·대상 커밋·수락자·사유를 대신 기록한다.
          // 여기서 step 을 요구하면 부르지 않은 호출을 기록하게 만든다 — 증거를 거짓으로 만드는 게이트다.
          if (declared.exemptWhen === 'reviewAcceptedExisting' && task.review.acceptedExisting) continue;
          if (declared.perPhase) {
            const planned = task.plan.phaseIds ?? [];
            if (!planned.length) throw new ValidationError('registered plan phases are required');
            const missing = planned.filter(id => task.phases[id]?.goalStatus !== 'COMPLETED');
            if (missing.length) throw new ValidationError(`all planned phase goals must be completed: ${missing.join(', ')}`);
            const unrecorded = planned.filter(id => !task.steps?.[declared.id]?.[id]);
            if (unrecorded.length) {
              throw new ValidationError(`workflow step not recorded for phases: ${unrecorded.join(', ')} — each phase runs through ${stepDemand(declared)} and is recorded with: state.mjs step --id ${declared.id} --phase {id}`);
            }
            continue;
          }
          assertStep(task, declared.id);
          // 최신성(`freshnessAfter`). 존재만 보면 낡은 판정이 보정 뒤에도 게이트를 통과한다 —
          // 마지막 구현 기록보다 오래된 판정은 검증하지 않은 코드의 증거다. 재기록 이력은
          // events.jsonl 의 STEP_RECORDED 가 append-only 로 보존한다.
          if (declared.freshnessAfter) {
            const judgedAt = task.steps[declared.id].recordedAt;
            const staleAgainst = Object.entries(task.steps?.[declared.freshnessAfter] ?? {})
              .filter(([, record]) => record.recordedAt > judgedAt)
              .map(([phase]) => phase);
            if (staleAgainst.length) {
              throw new ValidationError(`${declared.id} verdict is stale — implementation was recorded after it for phases: ${staleAgainst.join(', ')} — re-run ${stepDemand(declared)} and record it again`);
            }
          }
        }
        // 사전 준비는 계획 앞에 있어야 의미가 있다(계약이 `prepare` 를 PLAN 에서 요구한다). 사람만
        // 할 수 있는 일(운영 DB 반영·설정·권한)이 계획서 안으로 들어가면 구현이 그 자리에서 멈춘다.
        if (target === 'PLAN') {
          assertHash(task.gates.brief, 'brief gate');
          assertHash(task.expertGapReport, 'expert gap report');
        }
        if (target === 'PROJECTS' && !task.plan.manifest) throw new ValidationError('registered plan required');
        if (target === 'DEVELOP') {
          if (!Object.keys(task.projects).length) throw new ValidationError('registered project required');
          // 계획이 선언한 프로젝트 집합 == 등록된 집합. register-project 는 PROJECTS 에서만 되고 DEVELOP 은
          // 되돌아오지 않으므로 빠진 프로젝트는 영영 등록 못 하고, 남는 프로젝트는 COMMIT 을 PARTIAL 로 묶는다.
          // phaseProjects 가 없는 구형 맵은 재개를 위해 건너뛴다.
          const phaseProjects = task.plan.phaseProjects ?? {};
          if (Object.keys(phaseProjects).length) {
            const planned = [...new Set(Object.values(phaseProjects))].sort();
            const registered = Object.keys(task.projects).sort();
            if (planned.join(',') !== registered.join(',')) {
              throw new ValidationError(`plan declares projects [${planned.join(', ')}] but registered projects are [${registered.join(', ')}] — register every planned project before DEVELOP`);
            }
          }
        }
        if (target === 'COMMIT' && task.review.status !== 'PASSED') throw new ValidationError('passed review required');
        if (target === 'MR_APPROVAL' && task.commit.status !== 'COMMITTED') throw new ValidationError('recorded commit required');
        if (target === 'MR_CREATE') {
          assertHash(map.authorization, 'authorization');
          assertHash(task.gates.mr, 'mr gate');
          const missingPushOutcome = Object.entries(task.projects)
            .filter(([, project]) => !['PUSHED', 'FAILED'].includes(project.delivery?.status))
            .map(([project]) => project);
          if (missingPushOutcome.length) {
            throw new ValidationError(`push outcome required for every project: ${missingPushOutcome.join(', ')}`);
          }
        }
        // 커밋·push·MR 은 전부 흐름의 일부다 — 건너뛸 수도, 실패한 채 닫을 수도 없다.
        // DONE 은 모든 프로젝트가 실제로 CREATED 일 때만 열린다. FAILED 를 여기서 통과시키면
        // "구현·커밋은 됐는데 아무 데도 안 올라간" 런이 완료로 보고된다 — 배달 실패는
        // mr-result 가 이미 BLOCKED 로 잡으므로, 이 게이트는 그 우회로를 막는 역할이다.
        if (target === 'DONE') {
          const incomplete = Object.entries(task.projects)
            .filter(([, project]) => project.delivery?.status !== 'CREATED')
            .map(([project]) => project);
          if (incomplete.length) {
            throw new ValidationError(`created MR required for every project: ${incomplete.join(', ')}`);
          }
        }
        const from = task.currentStage;
        task.currentStage = target;
        task.nextAction = args['next-action'];
        task.status = target === 'DONE' ? 'COMPLETED' : 'RUNNING';
        save(map);
        event(map, 'STAGE_TRANSITION', { task: args.task, from, to: target, nextAction: task.nextAction });
        break;
      }
      case 'goal-start': {
        const phaseId = String(args.phase || '');
        const sessionId = args['session-id'];
        const project = args.project;
        if (!phaseId || !sessionId || !project) throw new ValidationError('--phase, --session-id and --project are required');
        if (!['PROJECTS', 'DEVELOP', 'QA', 'CODE_REVIEW'].includes(task.currentStage)) {
          throw new ValidationError(`goal cannot start from stage ${task.currentStage}`);
        }
        if (!task.plan.manifest || !task.projects[project]) throw new ValidationError(`registered project required: ${project}`);
        if (!(task.plan.phaseIds ?? []).includes(phaseId)) {
          throw new ValidationError(`phase is not declared by the registered plan: ${phaseId}`);
        }
        // 계획이 정한 프로젝트와 다르면 거부한다 — 바인딩은 영구라서 잘못 묶이면 되돌릴 명령이 없다.
        const plannedProject = task.plan.phaseProjects?.[phaseId];
        if (plannedProject && plannedProject !== project) {
          throw new ValidationError(`phase ${phaseId} is planned for project ${plannedProject}, not ${project}`);
        }
        const goalKind = args['goal-kind'] || 'INITIAL_IMPLEMENTATION';
        if (!['INITIAL_IMPLEMENTATION', 'REVIEW_REMEDIATION'].includes(goalKind)) throw new ValidationError('invalid goal kind');
        if (goalKind === 'REVIEW_REMEDIATION' && task.review.attempts !== 1) {
          throw new ValidationError('review remediation requires exactly one failed review');
        }
        const existing = task.phases[phaseId];
        if (existing && existing.project !== project) throw new ValidationError(`phase ${phaseId} is already bound to project ${existing.project}`);
        if (existing?.executions.some(execution => execution.status === 'RUNNING')) {
          throw new ValidationError(`phase ${phaseId} already has a running execution`);
        }
        const phase = existing ?? {
          status: 'RUNNING',
          logicalGoalId: `task-${args.task}-phase-${phaseId}`,
          project,
          workingDirectory: task.projects[project].path,
          goalKind,
          goalStatus: 'RUNNING',
          activeSessionId: sessionId,
          executions: [],
          convergence: { maxRounds: 3, roundBase: 0, currentRound: 0, status: 'RUNNING', rounds: [], fingerprints: [] }
        };
        // 보정 목표는 초기 구현이 쓴 QA 예산을 물려받지 않는다. 3라운드 걸려 GREEN 된 페이즈가
        // 보정 결과를 아예 기록할 수 없게 되는(= 완주 불가) 상태를 막는다. 라운드 번호는 계속
        // 증가시켜 증거 파일(round-{N}.json)이 초기 라운드와 겹치지 않게 한다.
        if (existing && existing.goalKind !== goalKind) {
          phase.convergence.roundBase = phase.convergence.currentRound;
          phase.convergence.status = 'RUNNING';
        }
        phase.status = 'RUNNING';
        phase.goalStatus = 'RUNNING';
        phase.goalKind = goalKind;
        phase.activeSessionId = sessionId;
        phase.executions.push({ sessionId, status: 'RUNNING', startedAt: now(), endedAt: null });
        task.phases[phaseId] = phase;
        task.currentStage = 'DEVELOP';
        task.nextAction = 'WAIT_DEVELOP_GOAL';
        task.status = 'RUNNING';
        save(map);
        event(map, 'GOAL_STARTED', {
          task: args.task,
          phase: Number(phaseId),
          project,
          workingDirectory: phase.workingDirectory,
          sessionId,
          kind: goalKind
        });
        // stdout 한 줄 — 빈 출력은 파싱하는 호출자에게 실패처럼 보인다(`init` 과 같은 이유).
        console.log(JSON.stringify({
          status: 'started',
          phase: phaseId,
          logicalGoalId: phase.logicalGoalId,
          project,
          workingDirectory: phase.workingDirectory,
          goalKind,
          nextAction: task.nextAction
        }));
        break;
      }
      case 'reassign': {
        verifyTask(map, args.task, task);
        const phase = task.phases[String(args.phase || '')];
        if (!phase || !args['session-id']) throw new ValidationError('valid --phase and --session-id are required');
        const active = phase.executions.find(execution => execution.sessionId === phase.activeSessionId && execution.status === 'RUNNING');
        if (!active) throw new ValidationError('no running execution to reassign');
        active.status = 'INTERRUPTED';
        active.endedAt = now();
        phase.activeSessionId = args['session-id'];
        phase.executions.push({ sessionId: args['session-id'], status: 'RUNNING', startedAt: now(), endedAt: null });
        save(map);
        event(map, 'GOAL_REASSIGNED', { task: args.task, phase: Number(args.phase), sessionId: args['session-id'] });
        break;
      }
      case 'phase-result': {
        const phase = task.phases[String(args.phase || '')];
        const round = Number(args.round);
        const qaStatus = args['qa-status'];
        if (!phase || !Number.isInteger(round) || round < 1 || !['GREEN', 'RED'].includes(qaStatus)) {
          throw new ValidationError('valid --phase, --round and --qa-status are required');
        }
        const roundBase = phase.convergence.roundBase ?? 0;
        if (round !== phase.convergence.currentRound + 1) throw new ValidationError('QA rounds must be sequential and unique');
        if (round - roundBase > phase.convergence.maxRounds) {
          blockAndThrow(map, task, 'QA_ROUND_LIMIT', `QA round limit exceeded: ${round - roundBase}`);
        }
        const evidencePath = existingFile(args.evidence, 'evidence');
        for (const flag of ['tests-reduced', 'assertions-reduced', 'skips-increased']) {
          if (bool(args[flag] ?? 'false')) {
            blockAndThrow(map, task, 'WEAKENED_QA_EVIDENCE', `weakened QA evidence: ${flag}`);
          }
        }
        const fingerprint = args.fingerprint ?? null;
        if (qaStatus === 'RED' && fingerprint && phase.convergence.fingerprints.includes(fingerprint)) {
          blockAndThrow(map, task, 'REPEATED_QA_FAILURE', `repeated QA failure fingerprint: ${fingerprint}`);
        }
        if (fingerprint) phase.convergence.fingerprints.push(fingerprint);
        phase.convergence.currentRound = round;
        phase.convergence.rounds.push({
          round,
          qaStatus,
          evidencePath,
          evidenceHash: sha256(evidencePath),
          fingerprint,
          recordedAt: now()
        });
        const execution = [...phase.executions].reverse().find(item => item.sessionId === phase.activeSessionId && item.status === 'RUNNING');
        task.currentStage = 'QA';
        if (qaStatus === 'GREEN') {
          phase.status = phase.goalStatus = phase.convergence.status = 'COMPLETED';
          if (execution) {
            execution.status = 'COMPLETED';
            execution.endedAt = now();
          }
          // 계획이 선언한 페이즈 전부가 완료 goal 을 가질 때만 리뷰가 열린다. 런타임 맵에 들어온
          // 페이즈만 세면 **아직 시작하지 않은 페이즈가 "없으니 완료" 로 읽혀**, `next` 를 믿는
          // 오케스트레이터가 남은 페이즈를 건너뛰고 리뷰로 가려 시도한다(실측). CODE_REVIEW 전이는
          // 같은 집합을 이미 대조하므로 우회는 막히지만, 그 거부는 시도한 뒤에야 보인다.
          const planned = task.plan.phaseIds ?? [];
          task.nextAction = planned.length && planned.every(id => task.phases[id]?.goalStatus === 'COMPLETED')
            ? 'RUN_CODE_REVIEW'
            : 'WAIT_DEVELOP_GOAL';
        } else if (round - roundBase >= phase.convergence.maxRounds) {
          phase.status = phase.goalStatus = phase.convergence.status = 'BLOCKED';
          if (execution) {
            execution.status = 'BLOCKED';
            execution.endedAt = now();
          }
          task.status = 'BLOCKED';
          task.nextAction = 'STOP_AND_REPORT';
          task.blockedReason = 'QA_ROUND_LIMIT';
        } else {
          phase.convergence.status = 'RUNNING';
          task.nextAction = 'WAIT_DEVELOP_GOAL';
        }
        save(map);
        event(map, 'PHASE_RESULT', { task: args.task, phase: Number(args.phase), round, qaStatus, fingerprint });
        break;
      }
      case 'review-result': {
        if (task.currentStage !== 'CODE_REVIEW') {
          throw new ValidationError(`review-result requires CODE_REVIEW stage, current stage is ${task.currentStage}`);
        }
        const result = args.status;
        if (!['PASSED', 'FAILED'].includes(result)) throw new ValidationError('--status must be PASSED or FAILED');
        if (task.review.attempts >= 2) throw new ValidationError('review attempt limit exceeded');
        const evidencePath = existingFile(args.evidence, 'evidence');
        const fingerprints = (args.fingerprints ?? '').split(',').map(value => value.trim()).filter(Boolean);
        if (fingerprints.some(value => task.review.fingerprints.includes(value))) {
          blockAndThrow(map, task, 'REPEATED_REVIEW_FINDING', 'repeated review fingerprint');
        }
        task.review.attempts += 1;
        task.review.status = result;
        task.review.fingerprints.push(...fingerprints);
        task.review.evidence = { path: evidencePath, sha256: sha256(evidencePath), mode: 'GENERATED' };
        task.review.acceptedExisting = null;
        // 시도별 요약을 그 자리에서 파일로 남긴다. `mr-request` 는 이 디렉토리를 읽어 리뷰 attempt 표를
        // 파생하는데, 여기서 쓰지 않으면 **쓰는 쪽이 아무도 없어** 표가 헤더만 남는다 — 그러면
        // 오케스트레이터가 손으로 채우게 되고, 그건 SKILL.md 가 금지한 바로 그 행위다(두 런 실측).
        // 등급 수치는 리뷰 마크다운에서 오케스트레이터가 도출하므로 선택 인수로 받고, 없으면 null 이다.
        const count = key => (args[key] === undefined ? null : Number(args[key]));
        const reviewDir = path.join(root, 'tasks', args.task, 'review');
        fs.mkdirSync(reviewDir, { recursive: true });
        fs.writeFileSync(path.join(reviewDir, `attempt-${task.review.attempts}.json`), `${JSON.stringify({
          attempt: task.review.attempts,
          verdict: result,
          critical: count('critical'),
          warning: count('warning'),
          info: count('info'),
          fingerprints,
          reviewDocument: evidencePath,
          recordedAt: now()
        }, null, 2)}\n`);
        if (result === 'FAILED' && task.review.attempts >= 2) {
          task.status = 'BLOCKED';
          task.nextAction = 'STOP_AND_REPORT';
          task.blockedReason = 'REVIEW_ATTEMPT_LIMIT';
        } else {
          task.nextAction = result === 'PASSED' ? 'CREATE_COMMIT' : 'CREATE_REVIEW_REMEDIATION_GOAL';
        }
        save(map);
        event(map, 'REVIEW_RESULT', { task: args.task, status: result, attempt: task.review.attempts, fingerprints });
        break;
      }
      case 'accept-existing-review': {
        if (task.currentStage !== 'CODE_REVIEW') {
          throw new ValidationError(`accept-existing-review requires CODE_REVIEW stage, current stage is ${task.currentStage}`);
        }
        if (task.review.attempts >= 2) throw new ValidationError('review attempt limit exceeded');
        if (!args.actor || !args.reason) throw new ValidationError('--actor and --reason are required');
        if (!args.project || !task.projects[args.project]) throw new ValidationError('registered --project is required');
        if (!args['target-sha'] || !/^[a-f0-9]{7,64}$/i.test(args['target-sha'])) {
          throw new ValidationError('valid --target-sha is required');
        }
        const targetCommitSha = gitHead(task.projects[args.project].path);
        if (targetCommitSha !== args['target-sha']) {
          throw new ValidationError('target commit does not match worktree HEAD');
        }
        assertCleanCheckout(task.projects[args.project].path, 'reusing an existing review');
        const evidencePath = existingFile(args.evidence, 'evidence');
        const sourceReviewSha256 = sha256(evidencePath);
        task.projects[args.project].head = targetCommitSha;
        task.review.attempts += 1;
        task.review.status = 'PASSED';
        task.review.evidence = { path: evidencePath, sha256: sourceReviewSha256, mode: 'ACCEPTED_EXISTING' };
        task.review.acceptedExisting = {
          sourceReviewSha256,
          targetCommitSha,
          project: args.project,
          reason: args.reason,
          actor: args.actor,
          acceptedAt: now()
        };
        task.nextAction = 'CREATE_COMMIT';
        save(map);
        event(map, 'EXISTING_REVIEW_ACCEPTED', {
          task: args.task,
          project: args.project,
          sourceReviewSha256,
          targetCommitSha,
          reason: args.reason,
          actor: args.actor,
          attempt: task.review.attempts
        });
        break;
      }
      case 'commit-result': {
        verifyTask(map, args.task, task);
        if (!args.sha || !/^[a-f0-9]{7,64}$/i.test(args.sha)) throw new ValidationError('valid --sha is required');
        if (task.review.status !== 'PASSED') throw new ValidationError('passed review required');
        if (!args.project || !task.projects[args.project]) throw new ValidationError('registered --project is required');
        const currentHead = gitHead(task.projects[args.project].path);
        if (currentHead !== args.sha) throw new ValidationError('recorded commit does not match worktree HEAD');
        task.projects[args.project].head = currentHead;
        task.commit.shas[args.project] = args.sha;
        task.commit.status = Object.keys(task.commit.shas).length === Object.keys(task.projects).length ? 'COMMITTED' : 'PARTIAL';
        task.nextAction = task.commit.status === 'COMMITTED' ? 'BUILD_MR_REQUEST' : 'CREATE_COMMIT';
        save(map);
        event(map, 'COMMIT_RECORDED', { task: args.task, project: args.project, sha: args.sha, status: task.commit.status });
        break;
      }
      case 'mr-result': {
        verifyTask(map, args.task, task);
        if (!['PUSHED', 'CREATED', 'FAILED'].includes(args.status)) throw new ValidationError('invalid MR status');
        assertHash(map.authorization, 'authorization');
        if (!args.project || !task.projects[args.project]) throw new ValidationError('registered --project is required');
        const project = task.projects[args.project];
        if (args.status === 'PUSHED') {
          if (task.currentStage !== 'MR_APPROVAL') {
            throw new ValidationError(`PUSHED result requires MR_APPROVAL stage, current stage is ${task.currentStage}`);
          }
          if (project.delivery.status !== 'NOT_STARTED') {
            throw new ValidationError(`project delivery already has status ${project.delivery.status}`);
          }
          if (!args['remote-sha']) throw new ValidationError('--remote-sha is required');
          if (task.commit.shas[args.project] !== args['remote-sha']) {
            throw new ValidationError('remote SHA must equal the recorded project commit');
          }
          project.delivery = {
            status: 'PUSHED',
            remoteSha: args['remote-sha'],
            url: null,
            failure: null,
            recordedAt: now()
          };
          task.nextAction = 'CREATE_MR';
        } else if (args.status === 'CREATED') {
          if (task.currentStage !== 'MR_CREATE') {
            throw new ValidationError(`CREATED result requires MR_CREATE stage, current stage is ${task.currentStage}`);
          }
          if (project.delivery.status !== 'PUSHED') {
            throw new ValidationError('CREATED result requires a recorded PUSHED result for the project');
          }
          if (!args.url) throw new ValidationError('--url is required');
          project.delivery = {
            ...project.delivery,
            status: 'CREATED',
            url: args.url,
            failure: null,
            recordedAt: now()
          };
          task.nextAction = 'FINALIZE';
        } else {
          // 배달은 흐름의 필수 구간이다 — push·MR 이 실제로 나야 런이 끝난 것이다. 그래서 실패는
          // 기록하고 넘어갈 결과가 아니라 차단 사유다. 기록만 하고 DONE 으로 닫으면 "구현은 됐는데
          // 아무 데도 안 올라간" 런이 완료로 보고돼, 사람이 알아채기 전까지 아무도 안 가져간다.
          // 단 실패 stage(PUSH / MR_CREATE)는 그대로 남긴다 — 재개할 때 push 를 다시 할지
          // MR 생성만 재시도할지 가르는 유일한 근거다.
          if (!args.reason) throw new ValidationError('--reason is required for a failed delivery');
          if (!['MR_APPROVAL', 'MR_CREATE'].includes(task.currentStage)) {
            throw new ValidationError(`FAILED result requires a delivery stage, current stage is ${task.currentStage}`);
          }
          if (task.currentStage === 'MR_CREATE' && project.delivery.status !== 'PUSHED') {
            throw new ValidationError('MR creation failure requires a recorded PUSHED result for the project');
          }
          if (task.currentStage === 'MR_APPROVAL' && project.delivery.status !== 'NOT_STARTED') {
            throw new ValidationError(`project delivery already has status ${project.delivery.status}`);
          }
          project.delivery = {
            ...project.delivery,
            status: 'FAILED',
            failure: {
              stage: task.currentStage === 'MR_CREATE' ? 'MR_CREATE' : 'PUSH',
              reason: args.reason,
              recordedAt: now()
            },
            recordedAt: now()
          };
          task.status = 'BLOCKED';
          task.blockedReason = `REMOTE_DELIVERY_FAILED: ${args.project} — ${args.reason}`;
          task.nextAction = 'REPORT_BLOCKER';
        }
        refreshDeliveryStatus(task);
        save(map);
        event(map, 'MR_RESULT', { task: args.task, project: args.project, status: args.status, url: args.url ?? null });
        break;
      }
      case 'verify': {
        // missingSources 는 현재 상태라 매 verify 전량 보고한다(마커는 이벤트만 억제). 과업 0개여도
        // authorization 관측은 별도로 영속화한다 — 과업 루프에만 실으면 빈 런에서 관측이 통째로 증발한다.
        const missing = [];
        if (task) {
          const result = verifyTask(map, args.task, task);
          persistObservations(map, args.task, result);
          missing.push(...result.missingSources);
        } else {
          const authorizationOnly = {
            advanced: [],
            missingSources: [missingSourceEntry(assertHash(map.authorization, 'authorization'), 'authorization', null, null)].filter(Boolean)
          };
          persistObservations(map, null, authorizationOnly);
          missing.push(...authorizationOnly.missingSources);
          for (const [key, item] of Object.entries(map.tasks)) {
            const result = verifyTask(map, key, item);
            persistObservations(map, key, result);
            missing.push(...result.missingSources);
          }
        }
        const seen = new Set();
        const missingSources = missing.filter(item => {
          const id = `${item.kind}:${item.task ?? ''}:${item.gate ?? ''}:${item.documentPath}`;
          return seen.has(id) ? false : seen.add(id);
        }).map(({ kind, task: taskKey, gate, documentPath }) => ({ kind, task: taskKey, gate, documentPath }));
        // valid = 기록된 승인 증거의 무결성. 작업 문서 전부가 남아 다음 단계가 실행 가능하다는 뜻이 아니다 —
        // plan·phase 문서는 이 검증의 범위 밖이므로 READY 는 주장하지 않는다(UNKNOWN/DEGRADED 만).
        console.log(JSON.stringify({
          status: 'valid',
          runId: map.runId,
          task: args.task ?? null,
          missingSources,
          resumeReadiness: missingSources.length ? 'DEGRADED' : 'UNKNOWN'
        }));
        break;
      }
      case 'block': {
        if (!args.reason) throw new ValidationError('--reason is required');
        task.status = 'BLOCKED';
        task.nextAction = 'STOP_AND_REPORT';
        task.blockedReason = args.reason;
        save(map);
        event(map, 'TASK_BLOCKED', { task: args.task, reason: args.reason });
        break;
      }
      case 'unblock': {
        if (task.status !== 'BLOCKED' || !task.blockedReason) {
          throw new ValidationError('task is not blocked');
        }
        for (const required of ['expected-reason', 'reason', 'actor', 'resolution-evidence']) {
          if (!args[required]) throw new ValidationError(`--${required} is required`);
        }
        if (args['expected-reason'] !== task.blockedReason) {
          throw new ValidationError(`blocked reason differs: ${task.blockedReason}`);
        }
        const recoverable = {
          WEAKENED_QA_EVIDENCE: { stage: 'DEVELOP', nextAction: 'WAIT_DEVELOP_GOAL' },
          REPEATED_QA_FAILURE: { stage: 'DEVELOP', nextAction: 'WAIT_DEVELOP_GOAL' },
          REPEATED_REVIEW_FINDING: { stage: 'CODE_REVIEW', nextAction: 'RUN_CODE_REVIEW' }
        };
        // 배달 차단은 복구 가능해야 한다. 배달이 필수가 되면서 실패가 런을 막는데, 그때 이미
        // 커밋·(경우에 따라)push 가 끝나 있다. 새 런으로 다시 하라고 하면 register-project 가
        // "브랜치가 이미 있다" 로 거절해 빠져나갈 길이 없어진다 — 토큰 권한만 고치면 될 일에
        // 런 전체를 버리게 된다. 사유 문자열에 프로젝트·원인이 붙으므로 접두사로 알아본다.
        let recovery = recoverable[task.blockedReason];
        let rewind = null;
        if (!recovery && task.blockedReason.startsWith('REMOTE_DELIVERY_FAILED')) {
          // 되돌릴 지점은 기록된 실패 stage 가 정한다. PUSH 실패면 원격에 아무것도 안 갔으니
          // push 부터, MR_CREATE 실패면 브랜치는 이미 올라갔으니 생성만 다시 한다.
          rewind = Object.entries(task.projects)
            .filter(([, p]) => p.delivery?.status === 'FAILED')
            .map(([id, p]) => [id, p.delivery.failure?.stage === 'PUSH' ? 'NOT_STARTED' : 'PUSHED']);
          const anyPushMissing = rewind.some(([, to]) => to === 'NOT_STARTED');
          recovery = anyPushMissing
            ? { stage: 'MR_APPROVAL', nextAction: 'BUILD_MR_REQUEST' }
            : { stage: 'MR_CREATE', nextAction: 'CREATE_MR' };
        }
        // 계획 결함(PLAN_*)은 구현이 시작되기 전에만 같은 런에서 고친다. 실행·커밋·배달이 하나라도 있으면
        // 그 증거는 옛 계획의 것이라 새 계획과 섞인다 — 그때는 새 런이다. 브랜치는 이미 있어서 새 런의
        // register-project 가 거절하므로(실측), 등록 프로젝트는 보존하고 옛 계획과 그 step 기록만 무효화한다.
        // 리비전을 올려 새 계획 산출물이 다른 artifact id·경로로 등록되게 한다(레지스트리는 재사용을 거부한다).
        let planReset = null;
        if (!recovery && task.blockedReason.startsWith('PLAN_')) {
          const started = Object.values(task.phases).some(phase => phase.executions?.length)
            || task.commit.status !== 'NOT_STARTED'
            || Object.values(task.projects).some(project => (project.delivery?.status ?? 'NOT_STARTED') !== 'NOT_STARTED');
          if (started) {
            throw new ValidationError(`plan rework is only recoverable before implementation started: ${task.blockedReason}`);
          }
          recovery = { stage: 'PLAN', nextAction: 'CREATE_PLAN' };
          planReset = { previousPlan: { ...task.plan }, revision: (task.plan.revision ?? 1) + 1 };
        }
        if (!recovery) throw new ValidationError(`blocked reason is not recoverable: ${task.blockedReason}`);
        // 실패 기록을 지우고 재시도 가능한 상태로 되돌린다. PUSHED 로 되돌릴 때 remoteSha 는
        // 보존한다 — 그게 "이미 올라가 있으니 다시 push 하지 말라" 는 유일한 증거다.
        for (const [id, to] of rewind ?? []) {
          const delivery = task.projects[id].delivery;
          task.projects[id].delivery = to === 'NOT_STARTED'
            ? { status: 'NOT_STARTED', remoteSha: null, url: null, failure: null, recordedAt: now() }
            : { ...delivery, status: 'PUSHED', url: null, failure: null, recordedAt: now() };
        }
        const evidencePath = existingFile(args['resolution-evidence'], 'resolution-evidence');
        const record = {
          previousBlockedReason: task.blockedReason,
          reason: args.reason,
          actor: args.actor,
          resolutionEvidence: { path: evidencePath, sha256: sha256(evidencePath) },
          restoredStage: recovery.stage,
          restoredNextAction: recovery.nextAction,
          unblockedAt: now()
        };
        if (planReset) {
          record.previousPlan = planReset.previousPlan;
          task.plan = { rootDocument: null, manifest: null, phaseIds: [], phaseProjects: {}, revision: planReset.revision };
          if (task.steps) delete task.steps.plan;
        }
        task.unblocks ??= [];
        task.unblocks.push(record);
        task.status = 'RUNNING';
        task.currentStage = recovery.stage;
        task.nextAction = recovery.nextAction;
        task.blockedReason = null;
        // 배달 상태를 되돌렸으면 집계값(task.mr.status)도 다시 계산해야 한다 — 안 하면
        // 프로젝트별로는 재시도 가능한데 요약만 FAILED 로 남아 맵이 자기모순에 빠진다.
        refreshDeliveryStatus(task);
        save(map);
        event(map, 'TASK_UNBLOCKED', { task: args.task, ...record });
        break;
      }
      case 'next':
        persistObservations(map, args.task, verifyTask(map, args.task, task));
        console.log(JSON.stringify(task, null, 2));
        break;
      // 런이 자기 소요 시간을 스스로 보고한다. 이벤트 로그는 이미 모든 항목에 `at` 을 갖고 있어서
      // 새 이벤트도 새 파일도 필요 없다 — 읽는 쪽이 없었을 뿐이다. 손으로 재던 구간 표가 사라진다.
      case 'timeline': {
        const lines = fs.existsSync(eventsFile)
          ? fs.readFileSync(eventsFile, 'utf8').split('\n').filter(line => line.trim())
          : [];
        // 과업이 지정되면 그 과업 이벤트 + 과업이 없는 런 수준 이벤트(RUN_INITIALIZED 등)만 본다.
        const events = lines
          .map(line => JSON.parse(line))
          .filter(item => !args.task || item.data?.task === undefined || item.data.task === args.task);
        const seconds = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 1000);
        // 구간 경계는 스테이지 전이와 단계 기록이다. 그 둘이 오케스트레이터가 "다음 일로 넘어갔다" 고
        // 선언한 지점이고, 그 사이 시간이 곧 그 일에 쓴 wall clock 이다.
        const marks = events.filter(item => ['RUN_INITIALIZED', 'STAGE_TRANSITION', 'STEP_RECORDED'].includes(item.type));
        const label = item => {
          if (item.type === 'RUN_INITIALIZED') return 'init';
          if (item.type === 'STAGE_TRANSITION') return `stage:${item.data?.to ?? '?'}`;
          return `step:${item.data?.step ?? '?'}${item.data?.phase ? `/${item.data.phase}` : ''}`;
        };
        const spans = marks.slice(0, -1).map((item, index) => ({
          from: label(item),
          to: label(marks[index + 1]),
          startedAt: item.at,
          seconds: seconds(item.at, marks[index + 1].at)
        }));
        const first = events[0]?.at ?? null;
        const last = events[events.length - 1]?.at ?? null;
        console.log(JSON.stringify({
          runId: map.runId,
          task: args.task ?? null,
          events: events.length,
          startedAt: first,
          endedAt: last,
          totalSeconds: first && last ? seconds(first, last) : 0,
          spans
        }, null, 2));
        break;
      }
      default:
        throw new ValidationError(`unknown command: ${command}`);
    }
    // 계약: 모든 명령은 stdout 에 JSON 한 줄을 낸다. **조용한 성공은 결함이다** — 빈 출력을
    // 파싱하면 `Unexpected end of JSON input` 이 나서 성공이 실패로 읽히고, 그걸 피하려는
    // 호출자는 상태를 바꿀 때마다 autopilot-map.json 을 다시 파싱한다(실측: 매 mutation 마다).
    // 명령마다 print 를 손으로 붙이는 대신 여기서 한 번 낸다 — 새 서브커맨드도 자동으로 따른다.
    if (!PRINTS_OWN_OUTPUT.has(command)) {
      const changed = args.task ? map.tasks[args.task] : null;
      console.log(JSON.stringify({
        status: 'ok',
        command,
        task: args.task ?? null,
        taskStatus: changed?.status ?? null,
        currentStage: changed?.currentStage ?? null,
        nextAction: changed?.nextAction ?? null,
        blockedReason: changed?.blockedReason ?? null
      }));
    }
  }
} finally {
  if (lock !== undefined) {
    fs.closeSync(lock);
    fs.rmSync(lockFile, { force: true });
  }
}
