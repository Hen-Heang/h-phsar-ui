// 문서의 `파일:라인` 인용을 실제 소스와 대조한다.
//
// 왜 스크립트인가: 이 워크스페이스의 브리프·계획·리포트·리뷰는 모두 근거를 `파일:라인` 으로 단다.
// 그 좌표가 틀리면 (a) 읽는 사람이 없는 근거를 믿고 (b) 검증하는 쪽이 판단 대신 좌표 검산에
// 예산을 쓴다. 실측: 한 과업의 전문가 리포트 22건 중 4건이 좌표·심볼 오류 지적이었고, 그 4건은
// 전부 브리프 저자(오케스트레이터)의 실수였다 — `BatchRunner.java:65` 로 적은 `getBean` 은 :61,
// `SumUseStatsDayNewJobMapper.xml:29-30` 은 다른 테이블의 다른 컬럼, `DateUtil` 의 "일자 가감"
// 메서드는 존재하지 않았다. 전부 기계가 1초에 잡는 종류다.
//
// 잡지 못하는 것: 인용이 **유효한데 추론이 틀린** 경우. 같은 리포트의 BLOCKER 하나가 정확히
// 그것이었고(유효한 코드에서 잘못된 결론), 그건 사람·전문가 몫이다. 이 스크립트는 좌표만 본다.
import fs from 'node:fs';
import path from 'node:path';

class ValidationError extends Error {}
process.on('uncaughtException', error => {
  console.error(`evidence-lint: ${error.message}`);
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
if (command !== 'check') throw new ValidationError('usage: evidence-lint.mjs check --file <doc.md> [--search-root <path>]');
if (!args.file) throw new ValidationError('--file is required');

const docFile = path.resolve(args.file);
if (!fs.existsSync(docFile)) throw new ValidationError(`document not found: ${docFile}`);
const searchRoot = path.resolve(args['search-root'] ?? process.cwd());
const drift = Number(args['max-line-drift'] ?? 3);
// 문맥 프로젝트(들). 문서가 다루는 프로젝트를 주면 파일명만 적은 인용의 모호성이 사라진다.
const preferred = (args.prefer ?? '').split(',').map(entry => entry.trim()).filter(Boolean)
  .map(entry => path.resolve(searchRoot, entry));
const failOn = (args['fail-on'] ?? 'ERROR').toUpperCase();
const skipDirs = new Set(['node_modules', 'target', '.git', '.autopilot', 'dist', 'build', '.idea']);

// 파일 인덱스는 한 번만 만든다. basename → 경로 목록. 경로가 명시된 인용은 인덱스를 안 타지만,
// 파일명만 적은 인용(`DateUtil.java`)은 여기서 해석하고 후보가 2개 이상이면 AMBIGUOUS 로 남긴다.
const index = new Map();
// Java 패키지 트리는 깊다 — `dino-batch/src/main/java/com/bizplay/dino/platform/batch/jobs/merc/
// mercProvideInfoJob/service/X.java` 가 14단이다. 한도가 12였을 때 존재하는 파일이 FILE_MISSING
// 으로 나왔다(실측). 한도는 무한 루프 방지용이고 실제 컷은 skipDirs 가 한다.
const walk = (dir, depth) => {
  if (depth > 24) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.claude') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(full, depth + 1);
    } else {
      const list = index.get(entry.name) ?? [];
      list.push(full);
      index.set(entry.name, list);
    }
  }
};
walk(searchRoot, 0);

const readLines = file => fs.readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
const cache = new Map();
const linesOf = file => {
  if (!cache.has(file)) cache.set(file, readLines(file));
  return cache.get(file);
};

// 인용 형태 3종 — 이 워크스페이스 문서에 실제로 나타나는 것만 본다.
//   path/File.java:123 · path/File.java:12-45 · File.xml:26,39
// `txt` 가 목록에 있는 이유: 사라진 브랜치의 리뷰 diff(`…/tmp/cr_diff.txt:NNN`)가 설계 근거로
// 인용된 실측이 있다. 확장자가 목록 밖이면 그 인용은 애초에 검사 대상이 아니어서 조용히 통과한다.
const CITATION = /((?:[\w.@-]+[\\/])*[\w.@-]+\.(?:java|xml|ts|tsx|js|mjs|json|md|ps1|sql|yml|yaml|properties|html|css|kt|py|sh|tsv|txt)):(\d+(?:-\d+)?(?:,\d+)*)/g;
// 스니펫 후보: 백틱 리터럴 중 코드처럼 보이는 것. 한글 설명이나 경로는 후보에서 뺀다.
const codeish = value => {
  if (value.length < 4) return false;
  if (/[\\/]/.test(value) && !/[(){};=]/.test(value)) return false;   // 경로
  if (/[가-힣]/.test(value)) return false;                            // 설명문
  return /[(){};=<>.$_]/.test(value) || value.length >= 8;
};

const docLines = readLines(docFile);
const findings = [];
let checked = 0;

for (let lineNo = 0; lineNo < docLines.length; lineNo += 1) {
  const text = docLines[lineNo];
  // 인용 자체(`File.java:12`)는 스니펫 후보가 아니다 — 문서가 좌표를 백틱으로 감싸는 게 관행이라
  // 이걸 안 빼면 인용 문자열이 "소스에 없는 리터럴" 로 잡힌다.
  const literals = [...text.matchAll(/`([^`]+)`/g)].map(hit => hit[1])
    .filter(value => !new RegExp(`^${CITATION.source}$`).test(value))
    .filter(codeish);
  for (const hit of [...text.matchAll(CITATION)]) {
    const [, rawPath, rawLines] = hit;
    checked += 1;
    const at = { doc: docFile, docLine: lineNo + 1, citation: `${rawPath}:${rawLines}` };

    // --- 경로 해석 ---
    let resolved = null;
    let ambiguous = null;
    const candidates = [path.resolve(searchRoot, rawPath), path.resolve(rawPath)];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) { resolved = candidate; break; }
    }
    if (!resolved) {
      const byName = index.get(path.basename(rawPath)) ?? [];
      const narrowed = byName.filter(file => file.replace(/\\/g, '/').endsWith(rawPath.replace(/\\/g, '/')));
      let pool = narrowed.length ? narrowed : byName;
      // 문맥 프로젝트를 주면 그 안의 후보를 우선한다. `pom.xml:1601` 같은 인용은 저장소가 20개인
      // 워크스페이스에서 형식상 모호하지만, 문서가 한 프로젝트를 다룬다면 읽는 사람에게는 모호하지
      // 않다. 우선 범위 안에서도 2개 이상이면 여전히 AMBIGUOUS 다.
      if (pool.length > 1 && preferred.length) {
        const inPreferred = pool.filter(file => preferred.some(dir => file.startsWith(dir + path.sep) || file.startsWith(dir)));
        if (inPreferred.length) pool = inPreferred;
      }
      if (pool.length === 1) resolved = pool[0];
      else if (pool.length > 1) ambiguous = pool.slice(0, 5);
    }
    if (!resolved) {
      findings.push({
        ...at,
        severity: ambiguous ? 'WARN' : 'ERROR',
        code: ambiguous ? 'AMBIGUOUS' : 'FILE_MISSING',
        detail: ambiguous ? `${ambiguous.length}+ files share this name` : 'no file matched this path',
        candidates: ambiguous ?? undefined
      });
      continue;
    }

    // --- 출처 적절성 ---
    // 좌표는 유효한데 출처가 부적절한 인용이 있다. 실측: 선행 런이 `target/tmp` 에 남긴 draft 와
    // `.claude.bak-*/tmp/cr_diff.txt`(사라진 브랜치의 리뷰 diff)가 설계 근거로 인용됐고, 파일이
    // 실존하므로 린터가 통과시켰다. 그 두 경로는 런 사이에 정리되거나 사라지는 자리여서, 다음
    // 세션이 같은 좌표를 열면 다른 내용이거나 아무것도 없다 — 재현되지 않는 근거는 근거가 아니다.
    // 판단이 필요한 경우도 있으므로(백업을 의도적으로 대조할 수 있다) 차단이 아니라 WARN 이다.
    const transient = resolved.split(path.sep).find(segment =>
      segment === 'tmp' || segment === 'node_modules' || segment.endsWith('.bak') || segment.startsWith('.claude.bak')
    );
    if (transient) {
      findings.push({
        ...at, file: resolved, severity: 'WARN', code: 'TRANSIENT_SOURCE',
        detail: `cited path passes through "${transient}" — temporary, backup, and dependency trees are not reproducible evidence`
      });
    }

    // --- 라인 범위 ---
    const numbers = rawLines.split(',').flatMap(part => {
      const [from, to] = part.split('-').map(Number);
      return to ? [from, to] : [from];
    });
    const body = linesOf(resolved);
    const outOfRange = numbers.filter(number => number < 1 || number > body.length);
    if (outOfRange.length) {
      findings.push({ ...at, file: resolved, severity: 'ERROR', code: 'LINE_OUT_OF_RANGE', detail: `file has ${body.length} lines, cited ${outOfRange.join(',')}` });
      continue;
    }

    // --- 스니펫 대조 ---
    if (literals.length) {
      const from = Math.max(1, Math.min(...numbers) - drift);
      const to = Math.min(body.length, Math.max(...numbers) + drift);
      const window = body.slice(from - 1, to).join('\n');
      const whole = body.join('\n');
      const inWindow = literals.filter(literal => window.includes(literal));
      if (inWindow.length === 0) {
        // 여기서부터는 **경고**다. 마크다운 한 줄에 리터럴 N개와 인용 M개가 섞이고 그 둘이 1:1로
        // 짝지어지지 않는다 — 표 한 행이 "주장 + 내 코드 + 근거 인용" 을 함께 담는 게 정상이라
        // "같은 줄의 리터럴은 그 인용을 뒷받침한다" 는 가정이 성립하지 않는다. 실측: 실제 브리프
        // 50개 인용에서 이 가정으로 32건이 오탐이었다. 오탐 많은 린터는 없는 편이 낫다.
        // 그래서 ERROR 는 오탐이 구조적으로 불가능한 두 개(파일 부재·라인 범위)만 남기고,
        // 좌표가 실제로 어긋난 신호(리터럴이 같은 파일 다른 줄에 있음)만 경고로 낸다.
        // 부재가 어긋남보다 강한 신호다 — 존재하지 않는 메서드를 인용한 것을 "라인만 틀렸다" 로
        // 보고하면 약하게 읽힌다. 단 메서드 호출 형태(`plusBusinessDays()`)만 본다. `USER_INFO.GNDR`·
        // `PART_CNCL_AMT` 같은 테이블·컬럼·설정 키는 문서가 개념을 가리키는 표기이므로 제외한다.
        const missingCall = literals.find(literal => /^[a-z][\w.]*\(\)$/.test(literal) && !whole.includes(literal.replace(/\(\)$/, '')));
        if (missingCall) {
          findings.push({
            ...at, file: resolved, severity: 'WARN', code: 'SYMBOL_MISSING',
            detail: 'quoted method does not exist in the cited file', literal: missingCall
          });
          continue;
        }
        const elsewhere = literals
          .map(literal => ({ literal, at: body.findIndex(line => line.includes(literal)) + 1 }))
          .filter(entry => entry.at > 0);
        if (elsewhere.length) {
          findings.push({
            ...at, file: resolved, severity: 'WARN', code: 'SNIPPET_MISMATCH',
            detail: 'cited line does not contain the quoted literal; suggestedLine is its first occurrence',
            literal: elsewhere[0].literal, suggestedLine: elsewhere[0].at
          });
          continue;
        }
        if (args['strict-literals'] === 'true') {
          const absent = literals.filter(literal => !whole.includes(literal));
          if (absent.length) {
            findings.push({ ...at, file: resolved, severity: 'WARN', code: 'SNIPPET_NOT_FOUND', detail: 'quoted literal appears nowhere in the cited file', literal: absent[0] });
          }
        }
      }
    }
  }
}

// ERROR 만 기본 차단 사유다 — 파일 부재·라인 범위 초과는 오탐이 구조적으로 불가능하다.
// WARN(좌표 어긋남·심볼 부재·모호)은 보고하고 넘긴다. `--fail-on WARN|AMBIGUOUS` 로 올릴 수 있다.
const errors = findings.filter(finding => finding.severity === 'ERROR');
const warnings = findings.filter(finding => finding.severity === 'WARN' && finding.code !== 'AMBIGUOUS');
const ambiguous = findings.filter(finding => finding.code === 'AMBIGUOUS');
const failed = errors.length > 0
  || (failOn === 'WARN' && warnings.length > 0)
  || (failOn === 'AMBIGUOUS' && (warnings.length > 0 || ambiguous.length > 0));
// 기본은 compact 한 줄이다 — 다른 dev-autopilot 스크립트와 같은 형태여야 파이프로 읽는 쪽이 스크립트마다
// 다른 파싱을 하지 않는다. 사람이 읽을 때만 --pretty true.
console.log(JSON.stringify({
  status: failed ? 'failed' : 'ok',
  document: docFile,
  checked,
  clean: checked - findings.length,
  errors: errors.length,
  warnings: warnings.length,
  ambiguous: ambiguous.length,
  findings
}, null, args.pretty === 'true' ? 2 : undefined));

if (failed) process.exit(1);
