---
name: qa-test
description: 테스트 계획서 기반으로 단위/통합/E2E 테스트를 qa-tester 에이전트로 실행·집계한다. 페이즈 분할 구조와 레거시 단일 파일 모두 지원. 사용자가 "qa-test", "테스트 실행", "TC 실행", "테스트 돌려줘", "페이즈 테스트", "회귀 확인" 등을 언급하면 이 스킬을 사용한다.
argument-hint: "{과업번호 | 테스트 계획서 경로} [phase-{N}] [unit|integration|e2e]"
---

# /qa-test {과업번호 | 테스트 계획서 경로}

Generates and runs unit/integration/E2E tests based on the test plan and aggregates the results. Supports both the phase-split structure (`{{config.outputDir}}/plans/{N}/` + `phases/`) and the legacy single file (`{{config.outputDir}}/plans/{N}_test_plan.md`).

Arguments: $ARGUMENTS

> **Resolve paths first.** At start, read `.claude/config/project.yaml`'s `outputDir`, resolve it into a **워크스페이스 루트 기준 절대경로** (an absolute path from the workspace root), and substitute that value for every `{{config.outputDir}}` notation below. The value differs per project, so putting the notation into a path as-is will find no files at all.

---

## Invocation format

```
/qa-test {과업번호}                              # 전체 실행 (모든 페이즈)
/qa-test {과업번호} phase-{N}                    # 특정 페이즈만
/qa-test {과업번호} phase-{N}-{slug}             # 특정 페이즈(slug 명시)
/qa-test {과업번호} {유형}                       # 유형 필터: unit | integration | e2e
/qa-test {과업번호} phase-{N} {유형}             # 페이즈 + 유형 조합
/qa-test {테스트 계획서 파일 경로}                 # 레거시 직접 경로 지정
/qa-test {테스트 계획서 파일 경로} e2e            # 레거시 + e2e
```

**Invocation examples:**
```
/qa-test 055                              # 055 과업 전체 TC 실행
/qa-test 055 phase-2                      # 055의 phase-2 TC만
/qa-test 055 phase-2-auth                 # 055의 phase-2-auth TC만
/qa-test 055 unit                         # 055의 Unit TC만
/qa-test 055 phase-2 integration          # 055의 phase-2 Integration TC만
/qa-test {{config.outputDir}}/plans/057_test_plan.md    # 레거시 단일 계획서
```

---

## Option handling

Extract the following values from `$ARGUMENTS`:

| Token pattern | Interpretation | Variable |
|----------|------|------|
| Pure number (e.g. `055`) | Task number | `TASK_NUMBER` |
| `phase-{N}` or `phase-{N}-{slug}` | Phase filter | `PHASE_FILTER` |
| `unit` / `integration` / `e2e` | Type filter | `TYPE_FILTER` |
| `.md` extension or path containing `/` | File path | `TEST_PLAN_FILE` |

**Parsing rules:**
1. If the arguments contain the word `autopilot-orchestrated`, strip that token and set `{orchestrated} = true` (see 「Orchestrator mode」).
2. If the first token is a number → treat it as `TASK_NUMBER`, extract `PHASE_FILTER`/`TYPE_FILTER` from the remaining tokens
3. If the first token is `.md` or a path → treat it as `TEST_PLAN_FILE` (legacy mode), extract `TYPE_FILTER` from the remaining tokens (only `e2e` is kept)
4. If neither pattern matches, error

If `$ARGUMENTS` is empty, print the error message and stop:

```
❌ 인수를 입력해 주세요.

사용법:
  /qa-test {과업번호} [phase-{N}] [유형]          # 페이즈 분할 구조
  /qa-test {테스트 계획서 파일 경로} [e2e]         # 레거시 경로

예시:
  /qa-test 055
  /qa-test 055 phase-2
  /qa-test 055 phase-2 integration
  /qa-test {{config.outputDir}}/plans/057_test_plan.md
```

---

## Phase 0: Scope collection

Collect the scope information set by the `/develop` skill.

### Scope collection procedure

1. **Check whether `/develop` has run** — confirm whether the `/develop` skill has run in the current session and a scope is set.
2. **If not set**:
   - If a root test plan was found in the phase-split structure (`{{config.outputDir}}/plans/{N}/`), attempt automatic scope inference from the `대상 프로젝트` field of the **root §1 meta**
   - If still unclear, inform the user:
   ```
   스코프가 설정되지 않았습니다.
   먼저 /develop {프로젝트명} 을 실행하여 개발 스코프를 설정해 주세요.
   ```
3. **If set** — collect the scope object:

```json
{
  "scope": {
    "project": "프로젝트명",
    "module": "모듈명 또는 null",
    "project_root": "프로젝트 루트 절대경로",
    "project_type": "프로젝트 유형",
    "project_claude_md": "프로젝트 CLAUDE.md 절대경로",
    "guideline_paths": ["가이드라인 파일 경로"],
    "base_package": "베이스 패키지"
  }
}
```

---

## Phase 1: Test plan discovery (new structure first)

### 1-1. Task-number mode (`TASK_NUMBER` set)

**Search priority:**

| # | Path | Structure | Note |
|:-:|------|------|------|
| 1 | `{{config.outputDir}}/plans/{TASK_NUMBER}/{TASK_NUMBER}_test_plan.md` | Phase-split (new) | **Official location** |
| 2 | `{{config.outputDir}}/plans/{TASK_NUMBER}_test_plan.md` | Single file (legacy) | Fallback |
| 3 | `{workspaceRoot}/**/{TASK_NUMBER}_test_plan.md` | Full filename search | Last resort |

> #3 searches by filename only — hard-coding an output directory name into the glob makes that name permanently miss in other projects. If multiple hits come back, show the list and let the user pick.

**When found at #1** (phase-split structure):
- Root file path → `ROOT_TEST_PLAN`
- Glob the phase file list: `{{config.outputDir}}/plans/{TASK_NUMBER}/phases/phase-*-test.md` → the `PHASE_TEST_PLANS` array

**Applying filters:**
- When `PHASE_FILTER` is given → select only the matching phase files
  - `phase-2` → matches `phases/phase-2-*.test.md` (slug-agnostic)
  - `phase-2-auth` → matches exactly `phases/phase-2-auth-test.md`
- When `TYPE_FILTER` is given → qa-tester filters by the TC `Type` field at execution time

**When found at #2** (legacy single):
- Single file path → `TEST_PLAN_FILE`
- Ignore the phase filter, keep only the type filter

**When nothing is found:**
```
❌ 테스트 계획서를 찾을 수 없습니다: 과업번호 {TASK_NUMBER}

탐색 경로:
  1. {{config.outputDir}}/plans/{TASK_NUMBER}/{TASK_NUMBER}_test_plan.md  (페이즈 분할)
  2. {{config.outputDir}}/plans/{TASK_NUMBER}_test_plan.md               (단일 레거시)
  3. **/{TASK_NUMBER}_test_plan.md                         (전체 검색)

테스트 계획서가 없습니다:
  → /dev-plan {TASK_NUMBER} 실행 (개발계획 생성 + qa-planner 자동 트리거)
```

### 1-2. File-path mode (`TEST_PLAN_FILE` set)

Resolve the `TEST_PLAN_FILE` path in this order:

1. **Absolute path** — use as-is
2. **Relative path** (contains `.` or `/`) — resolve from the workspace root
3. **Filename only** — prepend the resolved `outputDir`, searching from narrow to wide, then widen to a full filename search if not found:
   - `{해석된 outputDir}/plans/{TASK_NUMBER}/{TEST_PLAN_FILE}`
   - `{해석된 outputDir}/plans/{TEST_PLAN_FILE}`
   - `{workspaceRoot}/**/{TEST_PLAN_FILE}`
   - If multiple files are found, print the list and ask the user to choose
   - If not found, print an error and stop

If the file does not exist, print the error message and stop.

### 1-3. Automatic discovery of related files (legacy compatibility)

If the following files exist in the same directory as the test plan, collect them as well:
- `*test-cases*`, `*테스트*케이스*`
- `*regression*`, `*회귀*`

Pass these files to the agent as `test_case_paths`.

---

## Phase 2: Run the qa-tester agent

### 2-1. New structure (phase-split) execution

Run `subagent_type=qa-tester` with the Agent tool. In the phase-split structure, include **both the root document and the filtered phase documents' contents** in the prompt:

```
아래 입력 정보로 테스트를 생성, 실행, 결과를 집계해 주세요.

## 입력

- scope: {scope 객체 JSON}
- test_plan_structure: "phased"  ← 페이즈 분할 구조 신호
- root_test_plan_path: {루트 테스트 계획서 절대경로}
- phase_test_plan_paths: {페이즈 테스트 계획서 경로 배열 (필터 적용 후)}
- phase_filter: {PHASE_FILTER 또는 null}
- type_filter: {TYPE_FILTER 또는 null — unit/integration/e2e}
- options: { "e2e": {type_filter가 'e2e'이거나 페이즈에 E2E TC 포함 시 true} }
- orchestrated: {orchestrated — true/false}

## 루트 테스트 계획서 내용

{ROOT_TEST_PLAN 파일 내용 전체}

## 페이즈 테스트 계획서 내용 (필터 적용 후 N개)

### Phase 2 (phase-2-auth-test.md)
{페이즈 파일 내용}

### Phase 3 (phase-3-admin-test.md)
{페이즈 파일 내용}
...
```

### 2-2. Legacy single-file execution

Keep the existing approach:

```
아래 입력 정보로 테스트를 생성, 실행, 결과를 집계해 주세요.

## 입력

- scope: {scope 객체 JSON}
- test_plan_structure: "flat"   ← 레거시 단일 구조 신호
- test_plan_path: {테스트 계획서 절대경로}
- test_case_paths: {테스트 케이스 파일 경로 배열}
- type_filter: {TYPE_FILTER 또는 null}
- options: { "e2e": {true/false} }

## 테스트 계획서 내용

{테스트 계획서 파일 내용 전체}

## 테스트 케이스 내용 (있는 경우)

{테스트 케이스 파일 내용 전체}
```

> qa-tester recognizes `test_plan_structure` directly, records TC ID → phase provenance, and **returns even the per-phase tallies**. **This skill does not recalculate or re-aggregate** — it prints the agent's return as-is.
>
> This skill's input arguments and returned report implement the QA verdict contract in [`../develop/references/qa-verdict-contract.md`](../develop/references/qa-verdict-contract.md) — the convergence-loop owner (human · orchestrator) consumes that contract (status line · failure list · characterization distinction) mechanically, so changing the presentation of those elements breaks the convergence decision's ability to read the report.

---

## Phase 3: Result output

Print the agent's return value as the final report. The per-phase tally table is also included in the agent's return — **the only thing this skill produces is the header (task number · filter info).** 3-1/3-2 below are examples of the expected shape of the agent's return; the owner of the format is qa-tester (`<Output_Format>`).

### 3-1. New structure (phase-split) result

```
## 테스트 실행 결과 — 과업 {TASK_NUMBER}

> **프로젝트**: {project} / **모듈**: {module}
> **필터**: {PHASE_FILTER or "전체"} / {TYPE_FILTER or "전체"}

---

### 페이즈별 집계

| Phase | 페이즈명 | Unit | Integration | E2E | 성공 | 실패 | 상태 |
|:--:|---------|:----:|:-----------:|:---:|:----:|:----:|:----:|
| 1 | 인프라 & 공통 | 8/8 | 4/4 | 0/0 | 12 | 0 | ✅ |
| 2 | Auth & Account | 10/10 | 5/5 | 3/3 | 18 | 0 | ✅ |
| ... |

### 종합

| 구분 | 수량 |
|------|------|
| 총 테스트 | N개 |
| 성공 | N개 |
| 실패 | N개 |
| 커버리지 | NN% |

**상태: GREEN/완료 또는 RED/확인 필요**
```

### 3-2. Legacy result (existing format kept)

```
## 테스트 실행 결과

> **프로젝트**: {project} / **모듈**: {module}
> **테스트 계획서**: {test_plan_path}

---

### 종합

| 구분 | 수량 |
|------|------|
| 총 테스트 | N개 |
| 성공 | N개 |
| 실패 | N개 |

**상태: GREEN/완료 또는 RED/확인 필요**
```

### Status determination

| Condition | Status |
|------|------|
| 0 failures | **GREEN/완료** |
| 1 or more failures | **RED/확인 필요** |

### Additional output on failure

```
### 실패 목록

| # | Phase | TC ID | 테스트 | 유형 | 실패 원인 |
|---|:-----:|------|--------|:----:|----------|
| 1 | 2 | TC-WV-CTRL-003 | AuthControllerTest#otpInvalid | Integration | AssertionError: expected 400 but was 500 |
```

---

## Orchestrator mode (`autopilot-orchestrated`)

This is an execution with no human present (`dev-autopilot` invokes it once per task, right before review, after all phases are machine-GREEN). The meaning of the QA verdict is the same; **where questions go and what gets produced change.**

- **No `AskUserQuestion` calls.** If the scope cannot be determined by automatic inference (root §1 meta) or multiple plans are found, **do not ask — return failure together with the candidate list**; the decision belongs to the caller.
- **Do not run E2E TCs.** They are procedures that get server URLs · logins · test data from a human, so they cannot run unattended. Do not pretend to run them — **tally them as skipped**. A skip is not a failure, but it is not a pass either.
- **Compact return, produced by the agent.** Pass `orchestrated: true` in the qa-tester input. The agent writes its full report under `target/test-reports/` and returns only its `<Output_Format>` 「Orchestrated return」 block (report path · status line · tallies · per-phase tallies · failures with phase/TC/test/type/characterization/expected/actual/difference · preconditions · skipped E2E with `required`) — trimming after the return would save nothing. **Build the receipt from those fields**, never by re-reading markdown, and return only the receipt path plus contract elements 1·3·4·5·6·7 of [`qa-verdict-contract.md`](../develop/references/qa-verdict-contract.md). Do not print the full report.
- **Write one verdict receipt**: `{{config.tempDir}}/qa-verdict-{TASK_NUMBER}.json`. This is this skill's only mode-specific exception to writing no files on the human path, and the caller records this file as step proof. **반환값에 이 영수증 경로를 실어 준다** — 호출자가 경로를 자기 문서에 복사해 두면 이 파일 위치가 바뀌는 순간 그 복사본이 거짓이 된다. 경로의 출처는 이 문서와 반환값이다:

```json
{
  "pass": true,
  "status": "PASS | PASS_WITH_SKIPS | INCOMPLETE | RED",
  "taskNumber": "{N}",
  "report": "{qa-tester 가 저장한 리포트 경로}",
  "tc": { "passed": 18, "failed": 0, "skipped": 0, "skippedE2E": 2 },
  "skippedE2E": [ { "id": "TC-XX-E2E-001", "reason": "무인 실행 — 서버·계정 필요" } ],
  "generatedAt": "{ISO-8601}"
}
```

- **status determination rules** (fixed here so the receipt does not reinterpret the report):
  | status | Condition | pass |
  |---|---|---|
  | `PASS` | All executed TCs passed, 0 skips | `true` |
  | `PASS_WITH_SKIPS` | All executed TCs passed + only **non-required** E2E skipped | `true` |
  | `INCOMPLETE` | An E2E TC the plan marked `[required]` was skipped | `false` |
  | `RED` | Failures exist among executed TCs | `false` |
- An LLM judgment is not itself machine evidence — the receipt is a structured record of "what was looked at and what conclusion was drawn"; the machine evidence of test execution is handled separately by the caller's qa-collect rounds.
- The caller must put the skipped E2E TC list into the MR description, so do not leave the receipt's `skippedE2E` empty.

---

## Transition-period compatibility notes

- **After the qa-planner redesign**: the phase-split structure (`{{config.outputDir}}/plans/{N}/`) is the **official path**
- **Remnants from before the qa-planner redesign**: the `{{config.outputDir}}/plans/{N}_test_plan.md` (single) file is still recognized — resolved by fallbacks #2·#3 of Phase 1-1
- **qa-tester**: the TC ID regex stays identical → only the file locations changed; no parsing-logic changes needed

---

## Security policy

The `/secrets-guard` policy is active while this skill runs (blocks opening production yml/properties · ENC decryption · SELECTs on real data).
Single source for blocking rules · exception handling · bypass guidance: [`.claude/skills/secrets-guard/SKILL.md`](../secrets-guard/SKILL.md).
Single source for the principle (WHY): [`.claude/rules/base-rule.md §1`](../../rules/base-rule.md).
