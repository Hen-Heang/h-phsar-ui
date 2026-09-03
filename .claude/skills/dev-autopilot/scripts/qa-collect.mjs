// QA 증거를 기계가 수집한다 — 빌드를 돌리고 리포트를 파싱해 round-N.json 을 만든다.
//
// 왜 스크립트인가: 지금까지 QA 증거는 **구현 에이전트의 자기 보고**였고, 약화 판정
// (`--tests-reduced` 등)은 그걸 읽은 사람의 판단이었다. 증거 사슬의 마지막 고리가 신뢰였다.
// 구현 주체와 증거 생성 주체를 분리하면 그 고리가 사라진다.
//
// 두 번째 이유는 vacuous GREEN 이다. 프로젝트가 필수 빌드 인자를 요구하는데 인자 없이 돌리면
// 변경 코드가 실행 대상에서 빠진 채 테스트가 "통과" 할 수 있다. 그래서 필수 인자 누락은
// 경고가 아니라 exit 1 이다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

class ValidationError extends Error {}
process.on('uncaughtException', error => {
  console.error(`qa-collect: ${error.message}`);
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
if (command !== 'collect') {
  throw new ValidationError('usage: qa-collect.mjs collect --run-root <path> --task <task> --phase <id> --round <n> --project <id> --command "<build command>"');
}
for (const required of ['run-root', 'task', 'phase', 'round', 'project', 'command']) {
  if (!args[required]) throw new ValidationError(`--${required} is required`);
}
const round = Number(args.round);
if (!Number.isInteger(round) || round < 1) throw new ValidationError('--round must be a positive integer');

const root = path.resolve(args['run-root']);
const map = JSON.parse(fs.readFileSync(path.join(root, 'autopilot-map.json'), 'utf8').replace(/^﻿/, ''));
const task = map.tasks?.[args.task];
if (!task) throw new ValidationError(`task not found: ${args.task}`);
// task 는 아래 tasks/{task} 경로 조각이다. legacy map 에 위험 키가 남아 있어도 경로로 쓰기 전에 거른다
// (`:` 는 Windows 에서 NTFS 대체 데이터 스트림, `/`·`\` 는 map 이 OS 를 건너 재개될 수 있어 둘 다 차단).
if (args.task === '.' || args.task === '..' || /[\\/:]/.test(args.task)) {
  throw new ValidationError(`unsafe task id: ${args.task}`);
}
const project = task.projects?.[args.project];
if (!project) throw new ValidationError(`project not registered: ${args.project}`);
const claudeRoot = path.resolve(args['claude-root'] ?? '.claude');
const phase = task.phases?.[String(args.phase)];
if (!phase) throw new ValidationError(`phase not registered: ${args.phase}`);
if (args['no-record'] !== 'true' && round !== Number(phase.convergence?.currentRound ?? 0) + 1) {
  throw new ValidationError('QA rounds must be sequential and unique');
}

const phaseDir = path.join(root, 'tasks', args.task, `phase-${args.phase}`);
const evidenceFile = path.join(phaseDir, `round-${round}.json`);
const logFile = path.join(phaseDir, `round-${round}.log`);
if (fs.existsSync(evidenceFile) || fs.existsSync(logFile)) {
  throw new ValidationError(`QA round ${round} already has evidence — existing evidence is immutable`);
}

// --- 프로젝트 빌드 인자 계약 -------------------------------------------------
// project.yaml 의 projects[] 에서 이 프로젝트 블록만 얕게 읽는다. YAML 파서를 들이지 않는 이유는
// 다른 dev-autopilot 스크립트와 같다 — 필요한 건 두 키뿐이고, 의존성이 붙으면 이 스크립트가 무거워진다.
// **fail closed.** 이 얕은 읽기가 실패했을 때 조용히 "계약 없음" 으로 넘어가면, 이 스크립트가
// 막으려던 vacuous GREEN 경로가 그대로 열린다 — 가드가 사라진 걸 아무도 모른다. 그래서 설정
// 파일·프로젝트 항목을 못 찾으면 계약 위반(exit 1)이고, 항목은 찾았는데 buildArgs 키가 없는
// 경우만 "이 프로젝트는 필수 인자가 없다" 로 인정한다. 계약이 정말 없는 프로젝트는
// --no-build-contract true 로 명시한다 — 선언이 기본값보다 안전하다.
const projectConfig = () => {
  if (args['no-build-contract'] === 'true') return { declared: false };
  const file = path.resolve(args['project-config'] ?? path.join(claudeRoot, 'config', 'project.yaml'));
  if (!fs.existsSync(file)) {
    throw new ValidationError(`project config not found: ${file} — pass --project-config or --no-build-contract true`);
  }
  const lines = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
  // 리스트 항목 단위로 모은 뒤 그 안에서 name 을 찾는다 — YAML 매핑은 순서가 없어서 `name` 이
  // 첫 키라는 보장이 없다. `- path: ...` 다음 줄에 `name:` 이 오는 정상 설정을 "프로젝트 없음"
  // 으로 판정하면, fail-closed 가 정당한 설정을 막는 쪽으로 작동한다.
  const projectsAt = lines.findIndex(line => /^projects:\s*(?:#.*)?$/.test(line));
  if (projectsAt < 0) throw new ValidationError(`no projects: block in ${file} — the build-argument contract cannot be verified`);
  const scalar = value => value.replace(/\s+#.*$/, '').trim().replace(/^['"]|['"]$/g, '');
  // 들여쓰기를 세어 항목 경계와 키 깊이를 정한다. 깊이를 무시하면 (a) `guideline.frontend` 아래의
  // 중첩 리스트가 항목을 쪼개 그 뒤의 buildArgs 를 잃고 (b) 중첩된 `name:` 이 다른 항목을 이 프로젝트로
  // 오인하게 만든다. 둘 다 결과가 같다 — 필수 빌드 인자가 조용히 사라지고 vacuous GREEN 이 다시 열린다.
  // (YAML 은 들여쓰기에 탭을 금지하므로 공백만 센다.)
  const items = [];
  let itemIndent = null;
  for (let index = projectsAt + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '') continue;
    const indent = line.match(/^ */)[0].length;
    if (indent === 0) break;                                  // 다음 top-level 키
    const dash = /^ *-\s/.test(line);
    if (dash && itemIndent === null) itemIndent = indent;
    if (dash && indent === itemIndent) {
      items.push({ keyIndent: indent + 2, lines: [line.replace(/^ *-\s/, ' '.repeat(indent + 2))] });
      continue;
    }
    if (items.length) items[items.length - 1].lines.push(line);
  }
  const keyOf = (item, key) => {
    const pattern = new RegExp(`^ {${item.keyIndent}}${key}:\\s*(\\S.*)?$`);
    const hit = item.lines.find(line => pattern.test(line));
    return hit ? scalar(hit.slice(hit.indexOf(':') + 1)) : undefined;
  };
  const item = items.find(entry => keyOf(entry, 'name') === args.project);
  if (!item) {
    throw new ValidationError(`project ${args.project} not found in ${file} — the build-argument contract cannot be verified`);
  }
  const out = { declared: true };
  for (const key of ['buildArgs', 'buildArgsRequired']) {
    const value = keyOf(item, key);
    if (value !== undefined) out[key] = value;
  }
  return out;
};
const config = projectConfig();
const buildArgsRequired = config.buildArgsRequired === 'true';

const provided = {};
for (const pair of (args['build-arg'] ?? '').split(',').map(entry => entry.trim()).filter(Boolean)) {
  const [key, ...value] = pair.split('=');
  provided[key.trim()] = value.join('=').trim();
}
let resolvedArgs = config.buildArgs ?? '';
const unresolved = [];
resolvedArgs = resolvedArgs.replace(/\{(\w+)\}/g, (whole, key) => {
  if (provided[key] === undefined || provided[key] === '') { unresolved.push(key); return whole; }
  return provided[key];
});
if (buildArgsRequired) {
  if (!config.buildArgs) throw new ValidationError(`${args.project} declares buildArgsRequired but has no buildArgs template`);
  if (unresolved.length) {
    throw new ValidationError(`missing --build-arg values for ${unresolved.join(', ')} — running without them measures the wrong tree (vacuous GREEN)`);
  }
}
// 항목은 있는데 `buildArgs` 키만 없으면 "필수 인자 없음" 으로 인정된다. 그때 호출자가 같은 인자를
// `--command` 에 직접 박으면 가드가 겨냥한 vacuous GREEN 이 그대로 가능해진다 — 두 런 연속 실측된
// 우회다. 인자가 필요하다는 사실이 명령줄에 이미 적혀 있으므로, 계약이 비어 있는 것은 **미선언**이지
// 무인자가 아니다. 정말 인자가 없는 프로젝트는 `--no-build-contract true` 로 그렇게 선언한다.
// ponytail: 판정은 값 대입(`-Dkey=value`·`--key=value`)만 본다. 값 없는 플래그(`-B`·`-o`·`--batch-mode`)는
// 프로젝트 고유 정보를 담지 않아 오탐이 된다. 공백으로 분리된 선택자(`--tests com.Foo`)를 잡으려면
// 빌드 도구별 인자 표가 필요한데, 그건 언어팩이 가질 지식이지 이 스크립트가 가질 것이 아니다.
if (config.declared && !config.buildArgs && /(^|\s)(-D\S+=|--[\w.-]+=)/.test(args.command ?? '')) {
  throw new ValidationError(`--command carries build arguments but ${args.project} declares no buildArgs — declare them in the project contract, or pass --no-build-contract true when the project genuinely needs none`);
}
const finalCommand = [args.command, resolvedArgs].filter(Boolean).join(' ').trim();
if (!args['reports-dir']) throw new ValidationError('--reports-dir is required (xUnit XML directory)');
let assertionExtensions = null;
let assertionPattern = null;
if (args['assertion-scope']) {
  if (!args['assertion-extensions'] || !args['assertion-pattern']) {
    throw new ValidationError('--assertion-scope requires --assertion-extensions and --assertion-pattern');
  }
  assertionExtensions = new Set(args['assertion-extensions'].split(',').map(value => value.trim().toLowerCase()).filter(Boolean).map(value => value.startsWith('.') ? value : `.${value}`));
  try {
    const supplied = new RegExp(args['assertion-pattern']);
    assertionPattern = new RegExp(supplied.source, supplied.flags.includes('g') ? supplied.flags : `${supplied.flags}g`);
  } catch (error) {
    throw new ValidationError(`invalid --assertion-pattern: ${error.message}`);
  }
}

// --- 빌드 실행 ---------------------------------------------------------------
const startedAt = Date.now();
const executed = spawnSync(finalCommand, { cwd: project.path, encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 });
if (executed.error) throw new Error(`build command could not be started: ${executed.error.message}`);
const output = `${executed.stdout ?? ''}${executed.stderr ?? ''}`;
const exitCode = executed.status ?? 2;

const tail = output.split(/\r?\n/);

// --- 리포트 파싱 -------------------------------------------------------------
// xUnit XML 의 testsuite 속성이 진실이다. 텍스트 요약은 도구·로케일에 따라 바뀌지만 XML 계약은
// 호출자가 명시한 하나의 중간 형식으로 고정된다.
const reportsDir = path.resolve(project.path, args['reports-dir']);
const classPattern = args['test-class-pattern'] ? new RegExp(args['test-class-pattern']) : null;
const suites = [];
let staleReports = 0;
if (fs.existsSync(reportsDir)) {
  for (const name of fs.readdirSync(reportsDir).filter(entry => entry.endsWith('.xml'))) {
    const file = path.join(reportsDir, name);
    // clean 없는 명령으로 돌렸을 때 직전 실행 리포트를 이번 결과로 착각하지 않는다.
    if (fs.statSync(file).mtimeMs < startedAt) { staleReports += 1; continue; }
    const xml = fs.readFileSync(file, 'utf8');
    const head = xml.match(/<testsuite\b[^>]*>/)?.[0] ?? '';
    if (!head) throw new Error(`test report could not be parsed: ${file} has no testsuite element`);
    const rawTests = head.match(/\btests="(\d+)"/)?.[1];
    if (rawTests === undefined) throw new Error(`test report could not be parsed: ${file} has no numeric tests attribute`);
    const attribute = key => Number(head.match(new RegExp(`\\b${key}="(\\d+)"`))?.[1] ?? 0);
    const suiteName = head.match(/\bname="([^"]+)"/)?.[1] ?? name;
    if (classPattern && !classPattern.test(suiteName)) continue;
    suites.push({
      suite: suiteName,
      file,
      tests: attribute('tests'),
      failures: attribute('failures'),
      errors: attribute('errors'),
      skipped: attribute('skipped'),
      testNames: [...xml.matchAll(/<testcase\b[^>]*\bname="([^"]+)"/g)].map(hit => hit[1]),
      failedNames: [...xml.matchAll(/<testcase\b[^>]*\bname="([^"]+)"[^>]*>\s*<(?:failure|error)\b/g)].map(hit => hit[1])
    });
  }
}
const total = key => suites.reduce((sum, suite) => sum + suite[key], 0);
const tests = total('tests');
const failures = total('failures');
const errors = total('errors');
const skips = total('skipped');

// 단정 수는 xUnit XML 이 주지 않는다. 호출자가 확장자와 호출 패턴을 명시했을 때만 정적으로 세며,
// 절대 지표가 아니라 **감소 탐지 전용**이다.
let assertions = null;
if (args['assertion-scope']) {
  const scope = path.resolve(project.path, args['assertion-scope']);
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
  const files = fs.existsSync(scope) ? (fs.statSync(scope).isDirectory() ? walk(scope) : [scope]) : [];
  assertions = files
    .filter(file => assertionExtensions.has(path.extname(file).toLowerCase()))
    .reduce((sum, file) => sum + (fs.readFileSync(file, 'utf8').match(assertionPattern) ?? []).length, 0);
}

// --- 판정 -------------------------------------------------------------------
const reasons = [];
if (exitCode !== 0) reasons.push(`build exited ${exitCode}`);
if (failures + errors > 0) reasons.push(`${failures} failure(s), ${errors} error(s)`);
if (suites.length === 0 && classPattern) reasons.push(`no report matched ${classPattern} — the build likely excluded the code under test`);
if (tests === 0 && args['allow-no-tests'] !== 'true') {
  reasons.push('no tests ran — pass --allow-no-tests true to record a phase that intentionally has none');
}
const qaStatus = reasons.length === 0 ? 'GREEN' : 'RED';
const fingerprint = qaStatus === 'GREEN'
  ? null
  : `qa:${args.phase}:${suites.flatMap(suite => suite.failedNames)[0] ?? `build-exit-${exitCode}`}`;

// 약화 판정은 직전 라운드와의 비교로 **계산**한다 — 사람이 플래그를 입력하지 않는다.
const previousFile = path.join(phaseDir, `round-${round - 1}.json`);
let previous = null;
if (round > 1 && fs.existsSync(previousFile)) {
  try { previous = JSON.parse(fs.readFileSync(previousFile, 'utf8').replace(/^﻿/, '')); } catch { previous = null; }
}
const notes = [];
const testsReduced = previous ? tests < (previous.tests ?? 0) : false;
const skipsIncreased = previous ? skips > (previous.skips ?? 0) : false;
let assertionsReduced = false;
if (previous && typeof previous.assertions === 'number' && typeof assertions === 'number') {
  assertionsReduced = assertions < previous.assertions;
} else if (previous) {
  notes.push('assertions comparison skipped — one side is unmeasured (pass --assertion-scope to measure)');
}
if (staleReports > 0) notes.push(`${staleReports} report file(s) older than this run were ignored`);
if (assertions === null) notes.push('assertions unmeasured — xUnit XML does not report them; pass assertion scope, extensions, and pattern for a static count');

const evidence = {
  phase: String(args.phase),
  round,
  goalKind: args['goal-kind'] ?? 'INITIAL_IMPLEMENTATION',
  qaStatus,
  collectedBy: 'qa-collect.mjs',
  collectedAt: new Date().toISOString(),
  commands: [{ cmd: finalCommand, exitCode, summary: (output.match(/^\[INFO\] BUILD (?:SUCCESS|FAILURE)$/m)?.[0] ?? `exit ${exitCode}`) }],
  tests,
  assertions,
  skips,
  failures,
  errors,
  suites: suites.map(suite => ({ suite: suite.suite, tests: suite.tests, failures: suite.failures, errors: suite.errors, skipped: suite.skipped })),
  testNames: suites.flatMap(suite => suite.testNames),
  failedNames: suites.flatMap(suite => suite.failedNames),
  reportFiles: suites.map(suite => suite.file),
  filesChanged: (spawnSync('git', ['-C', project.path, 'diff', '--name-only', 'HEAD'], { encoding: 'utf8' }).stdout ?? '')
    .split(/\r?\n/).filter(Boolean),
  failureFingerprint: fingerprint,
  weakening: { testsReduced, assertionsReduced, skipsIncreased },
  reasons,
  notes: notes.join(' | ')
};
fs.mkdirSync(phaseDir, { recursive: true });
fs.writeFileSync(logFile, [`$ ${finalCommand}`, `# cwd: ${project.path}`, `# exit: ${exitCode}`, '', ...tail.slice(-Number(args['log-lines'] ?? 60))].join('\n'), { flag: 'wx' });
fs.writeFileSync(evidenceFile, `${JSON.stringify(evidence, null, 2)}\n`, { flag: 'wx' });

let recorded = false;
if (args['no-record'] !== 'true') {
  const argv = [
    'phase-result', '--run-root', root, '--task', args.task, '--phase', String(args.phase),
    '--round', String(round), '--qa-status', qaStatus, '--evidence', evidenceFile,
    '--tests-reduced', String(testsReduced), '--assertions-reduced', String(assertionsReduced),
    '--skips-increased', String(skipsIncreased),
    ...(fingerprint ? ['--fingerprint', fingerprint] : [])
  ];
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const result = spawnSync(process.execPath, [path.join(scriptDir, 'state.mjs'), ...argv], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`state.mjs phase-result failed: ${(result.stderr || result.stdout).trim().split(/\r?\n/)[0]}`);
  }
  recorded = true;
}

console.log(JSON.stringify({
  status: qaStatus === 'GREEN' ? 'ok' : 'failed',
  qaStatus,
  evidence: evidenceFile,
  log: logFile,
  command: finalCommand,
  exitCode,
  tests,
  failures,
  errors,
  skips,
  assertions,
  weakening: evidence.weakening,
  fingerprint,
  reasons,
  recorded
}));

// RED 은 증거가 남았어도 성공이 아니다. exit 0 으로 끝내면 `qa-collect && 다음단계` 같은 흔한
// 연결에서 실패한 QA 가 그대로 통과한다 — stdout 을 파싱하지 않는 호출자에게는 구별할 방법이
// 없다. 실행 자체의 오류(빌드를 시작조차 못 함·리포트 파싱 불가)만 2 로 남긴다.
if (qaStatus !== 'GREEN') process.exitCode = 1;
