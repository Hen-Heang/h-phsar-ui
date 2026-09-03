---
name: dev-plan
description: 11섹션 개발 브리프를 입력으로 dev-planner 서브에이전트가 페이즈 분할 개발 계획서(루트+페이즈 문서)를 생성하고, 완료 후 qa-planner 를 백그라운드 디스패치한다. 사용자가 "dev-plan", "개발 계획서 작성", "계획서 만들어줘", "브리프로 계획 세워줘", "{과업번호} 계획" 등을 언급하면 이 스킬을 사용한다.
argument-hint: "{과업번호 | 브리프 파일명}"
---

# /dev-plan {과업번호 | 브리프 파일명}

Takes the 11-section development brief produced by dev-interview (`{{config.outputDir}}/{과업번호}_dev_brief.md`) as input and auto-generates a phase-split development plan. Uses the dev-planner sub-agent to autonomously write the root document + per-phase detail documents.

> Use the argument passed at skill invocation as `{inputArg}` (a task number or a brief filename).

---

## Path basis

> First read `outputDir` from `.claude/config/project.yaml` and resolve it into an absolute path from the workspace root.
> The brief lives at `{{config.outputDir}}/{taskNumber}_dev_brief.md`, and plans go under
> `{{config.outputDir}}/plans/{taskNumber}/`. Even if a scope has been set via `/develop`,
> do not move them under the project.

---

## Input format

```
/dev-plan {과업번호 또는 브리프 파일명}
```

**Examples:**

```
/dev-plan 055
/dev-plan 055_dev_brief.md
/dev-plan 123_dev_brief.md
```

> **No separate scope input needed.** The previous version used the `/dev-plan {scope} {workFile}` form, but the project decision is already contained in §2·§3 of the brief produced by dev-interview, so **only the brief** is taken as the argument. dev-planner reverse-matches against `.claude/config/scope.yaml` to determine the scope automatically.

---

## Execution procedure

### Step 1: Parse arguments and pin down the brief path

From the passed argument (`{inputArg}`), determine the following values:

| Variable       | Description             | Example                   |
| -------------- | ----------------------- | ------------------------- |
| `{inputArg}`   | Raw invocation argument | `055`, `055_dev_brief.md` |
| `{taskNumber}` | Task number             | `055`                     |
| `{briefFile}`  | Brief filename          | `055_dev_brief.md`        |

**Parsing rules:**

- If the argument matches the `{숫자}` (number) pattern → `{briefFile} = {입력}_dev_brief.md`, `{taskNumber} = {입력}`
- If the argument matches the `{숫자}_dev_brief.md` pattern → `{briefFile} = {입력}`, `{taskNumber} = {선행 숫자}` (the leading number)
- If the arguments contain the word `autopilot-orchestrated`, strip that token and parse the rest by the rules above, but set `{orchestrated} = true` (a non-interactive directive is added to the step 3 prompt).
- If the argument is empty or anything else → print the error message and stop:

```
❌ 유효하지 않은 인수: '{입력값}'

입력 형식:
  /dev-plan {과업번호}              (예: /dev-plan 055)
  /dev-plan {과업번호}_dev_brief.md (예: /dev-plan 055_dev_brief.md)
```

---

### Step 2: Confirm the brief exists

**Search priority:**

1. `{{config.outputDir}}/{briefFile}` ← **default location**
2. `{briefFile}` relative to the workspace root
3. Search with Glob `**/{briefFile}`

If the brief cannot be found, print the error message and stop:

```
❌ 개발 브리프를 찾을 수 없습니다: {briefFile}

탐색 경로:
  1. {{config.outputDir}}/{briefFile}
  2. {워크스페이스 루트}/{briefFile}
  3. **/{briefFile} (전체 검색)

개발 브리프는 dev-interview 스킬이 생성합니다:
  → `/dev-interview {기획서 경로 또는 주제}` 먼저 실행해 주세요.
```

Once the brief path is pinned down, store the absolute path in the `{briefPath}` variable.

---

### Step 2.5: Look for a preparation proposal (use it as a premise if present)

Check whether `{{config.outputDir}}/{taskNumber}_dev_prepare.md` exists.

- **If absent, do nothing and proceed to step 3.** Preparation is not enforced on this path (projects/tasks that never ran `/dev-prepare` still work as-is).
- If present, store the absolute path in `{preparePath}` and pass it into the step 3 prompt. This skill does not interpret its content — the party that reads and judges it is dev-planner.

> This document is a proposal (`/dev-prepare`) that consolidates "work a human already finished (§2)" and "decisions to reduce development (§3)" into **§4 planning premises**. If the plan turns a premise back into a development Task, running that stage was pointless.

---

### Step 3: Run the dev-planner sub-agent

Run the `dev-planner` sub-agent with the Agent tool. **Do not pass a scope** — dev-planner auto reverse-matches it from the brief's §2·§3.

> **One agent writes the root + all phase documents.** Splitting agents per phase and running them in parallel was tried and reverted — in measurements it was **slower** (root 13 min + 2 phases in parallel 16 min = 29 min) than a single agent (root + 3 phases in 23 min). The cause: each phase agent re-read the same brief and root plan. Volume is controlled by the prompt below and the 「재서술 금지」 (no-restatement) table in `phase-doc-schema.md` — controlled not by line count but by **removing the six things other documents own**.

**Prompt to pass:**

```
아래 정보를 기반으로 페이즈 분할 구조의 개발 계획서를 작성해 주세요.

dev_brief:
  file_path: {briefPath 절대경로}
  task_number: {taskNumber}

workspace_root: {워크스페이스 루트 절대경로}

주의:
- 스코프는 브리프 §2·§3 + .claude/config/scope.yaml 에서 자동 역매칭해 주세요 (사용자가 별도 전달하지 않음).
- 브리프 §11 구현 순서를 휴리스틱 규칙(R0~R10)에 따라 페이즈로 재그룹해 주세요.
- 루트 문서 + 페이즈 문서(N개) + 메타 JSON을 모두 생성해 주세요.
- **분량은 재서술을 빼서 지킵니다 — 행수를 맞추려 본론을 줄이지 마세요.**
  빼는 대상은 phase-doc-schema.md 「재서술 금지」 표 6행뿐입니다(브리프·루트 재서술, 다른 페이즈,
  메서드/SQL 본문, TC 시나리오, 같은 표 두 번). 6행은 다른 문서가 소유하므로 지워도 정보가 남습니다.
  §4 시그니처·의존, §5 DB 명세, §7 Task, §9 DoD 는 소유자가 페이즈 문서라 지우면 정보가 사라집니다.
  6행을 다 지켰는데도 700행을 넘으면 페이즈가 큰 것이므로 루트에 재분할을 신고해 주세요.
- 메타 JSON은 이중 키 전략(dev_brief + work_request 별칭)으로 저장해 주세요.
- 코드 탐색 전에 도메인 색인(`.claude/docs/domain/index.md`)이 있으면 대상 모듈 페이지·`common.md`·역색인(`tables/`)을 먼저 참조해 탐색 출발점으로 삼아 주세요 (없으면 건너뜀).
```

If a preparation proposal was found at step 2.5, **append** the following to the prompt (do not append it otherwise):

```
prepare_doc:
  file_path: {preparePath 절대경로}

사전 준비 제안서 사용 규칙:
- §4 「계획 전제」는 **완료된 사실**로 취급해 주세요. 그 항목을 개발 Task 로 만들지 말고,
  루트 문서의 전제·리스크 표에서 항목 ID(A-1, B-2 …)로 가리키기만 해 주세요.
  DDL·설정·권한은 사람이 이미 반영한 것이 전제입니다.
- §3 「개발 최소화 결정」(L0~L4)을 구현 방식으로 채택해 주세요. 더 큰 구현으로 되돌려야 하면
  되돌리지 말고 루트 문서에 그 이유를 신고해 주세요 (그 결정은 사람 승인을 받은 것일 수 있습니다).
- §2 에 미완료(☐) BLOCKING 항목이 있으면 루트 전제에 "미완료: A-x" 로 명시하고,
  그 항목에 의존하는 페이즈를 후순위로 배치해 주세요.
- §2 에 kind `Code home` 항목이 있으면 그 **Target 이 코드 배치 결정**입니다. 2단계 스코프
  역매칭의 입력으로 먼저 쓰고, scope.yaml 미등록이면 루트 §3-1 에 그 Target + "사전준비 A-x
  등재 대기" 로 적어 주세요 (브리프 §2 만 보면 §3-1 과 §4 전제가 어긋납니다).
```

If `{orchestrated} = true`, append two more lines at the end of the prompt. The first line auto-passes the gate that has no one to answer it (the orchestrator already holds the phase split as its own decision); the second announces the phase-count policy — an unattended run is delivered as 1 commit · 1 MR, so a phase is not a deployment unit:

```
[★ 비대화 실행 — 4.5단계 페이즈 분할 검토 게이트는 분할 근거를 출력하고 자동 통과해 주세요.]
[★ 오케스트레이터 실행 — 페이즈는 배포 단위가 아니라 QA 게이트 단위입니다. R7 권장 범위(4~7)를 적용하지 말고 R6(페이즈당 1~3d)을 지키는 **최소 페이즈 수**를 택해 주세요.]
```

**Agent tool call:**

```
Agent(
  subagent_type: "dev-planner",
  description: "{taskNumber} 개발 계획서 작성 ({페이즈 분할})",
  prompt: {위 프롬프트}
)
```

---

### Step 4: plan-auditor adversarial verification loop (before qa-planner · automatic mode)

When the dev-planner Agent() returns, **this skill itself** runs the plan-auditor adversarial verification loop (before dispatching qa-planner). This step **adversarially re-verifies the plan and corrects objective defects only, once each**, then moves on to the next step (qa-planner). Same shape as the implementation⇄QA convergence loop — **the caller orchestrates by procedure, the model performs the loop judgment**.

> **Non-blocking step.** If plan-auditor is unresponsive, or the plan is self-evident and verification is unnecessary, skip this step and proceed straight to qa-planner (zero pipeline impact).

**Loop procedure (round cap N=2, one conditional extension → max 3):**

```
r = 1 .. 2 (아래 연장 조건 성립 시 3):
  1. plan-auditor 디스패치 (독립 에이전트)
       Agent(subagent_type="plan-auditor",
             prompt="plan_root={루트계획서} phase_files={페이즈문서 JSON 배열} brief={브리프} round={r}
                     {2.5단계에서 제안서를 찾았을 때만: prepare_doc={preparePath}}")
  2. 결과 수신 → 객관 결함 / 주관 지적 분리
  3. 종료 판정:
       - "객관 결함: 0건 / 주관 지적: 0건" → 즉시 종료 (clean)
       - "새 지적: 없음"(직전 라운드와 동일 결함 집합, {코드}@{대상} 기준 dedup) → 종료
       - r == 상한 → 종료 (상한 도달)
       - 그 외 → 4번
  4. 객관 결함(PA-COVER·PA-THIN·PA-DOD·PA-SCOPE)만 보정:
       dev-planner 재호출 — 각 결함의 "보정 방향" 을 보정 지시로 전달.
       보정 대상 문서만 경로로 준다(전 계획서를 다시 쓰게 하지 않는다).
       Agent(subagent_type="dev-planner",
             prompt="아래 plan-auditor 지적의 *객관 결함*만 반영해 계획서를 보정해 주세요.
                     원 브리프: {브리프}
                     보정 대상: {결함이 가리키는 문서 경로만 — 루트 또는 특정 페이즈}
                     보정할 객관 결함:
                     {PA-COVER/PA-THIN/PA-DOD/PA-SCOPE 항목 + 보정 방향 목록}
                     주의: 주관 지적(PA-CLASS/PA-PHASE/PA-RISK/PA-PRESERVE)은 건드리지 마세요.
                           PA-SCOPE 는 프로젝트 경계(R-P)로 재분할해 고칩니다 — 상대경로로 프로젝트를 추론하지 않습니다.
                           지적된 부분만 고치고 문서를 다시 쓰지 마세요.")
       · 주관 지적은 이번 라운드에 손대지 않는다(다음 라운드 재감사 입력으로만 남음).
  5. 보정된 계획서로 r+1 재감사.

루프 종료 후:
  6. 미해결 **주관 지적 전부를 사용자에게 surface** (심각도 우선순위). 차단하지 않는다.
  7. 다음 단계(5단계: qa-planner)로 진행 — qa-planner 는 보정 완료된 최신 계획서를 읽는다.
```

**Surface output format (after the loop ends):**

```
🔎 plan-auditor 검증 완료 (라운드 {최종 r})
  · 자동보정된 객관 결함: {n}건 (계획서 반영됨)
  · 사람 확인 필요 — 주관 지적 {m}건:
    - [PA-CLASS] (High) {지적} @ {대상}
    - [PA-RISK]  (Med)  {지적} @ {대상}
  ※ 주관 지적은 자동수정하지 않았습니다. 계획서를 확인 후 필요 시 /dev-plan 을 다시 실행하세요.
```

**Cap rules (strict):**

| Item | Cap |
|---|---|
| Audit rounds | Default **2**. **3** when the extension condition below holds. Never more |
| Correction dispatches | **1 per round** (multiple phases go in parallel within that one). Cumulative max **2** |

**Extension condition (this and only this)**: round 2 produced a **new objective defect** (not in round 1's defect set, and not a derivative created by round 1's correction), and that defect is an **undecided point that actually forks the implementation** — i.e. if merely surfaced, the implementer would have to pick arbitrarily. Only then spend round 3 + one more correction. Record the rationale in the surface output.

If the extension condition does not hold, **hand the remaining objective defects over to surface as well.** Continuing corrections past the cap is the main way time leaks — measured: the audit grew from 4 minutes to 31, of which 18 minutes were 3 corrections. The audit is the stage that **judges** the plan, and a plan whose judgment never finishes is not finished by running more rounds.

**Safety lines:**
- If plan-auditor dies or returns empty output, **skip** the loop, note "plan-auditor 검증 생략(에이전트 무응답)", and proceed normally to qa-planner — do not block the planning pipeline.
- Objective defects remaining after the cap is reached are also converted to surface (printed together with the subjective findings).
- Give plan-auditor a **finding cap** in its prompt: objective defects in full, subjective findings at most 12 by severity + the count trimmed. Reporting everything shifts its own triage cost onto the caller as serial work.

---

### Step 5: Print the dev-plan result + run qa-planner in the background ★ time savings (qa in background)

When the plan-auditor loop finishes, **this skill itself** Reads `.claude/tmp/dev-plan-meta.json` and uses it as qa-planner input (no SubagentStop hook — the skill handles meta-JSON consumption, dispatch, and cleanup itself).

> **`{orchestrated} = true`**: 5-2 only — skip the 5-1 / 5-3 / 5-4 blocks (no human reads them); the 「Machine routing manifest」 return is the whole output.

**5-1. Print the development-plan result immediately** (the user can start reviewing right away — do not wait for qa to finish):

```
📋 개발 계획서 생성 완료

루트 문서: {{config.outputDir}}/plans/{taskNumber}/{taskNumber}_dev_plan.md
페이즈 문서: {N}개
  - phases/phase-1-{slug}.md  ({예상기간})
  - phases/phase-2-{slug}.md  ({예상기간})
  - ...

총 예상 기간: {Nd}
총 Task 수: {N개}
독립 배포 가능 페이즈: {N개}
미결 가정 수: {N건}
```

**5-2. Read the meta JSON directly and dispatch qa-planner in the background** (the test plan is generated behind the scenes while the user reads the development plan):

This skill Reads the meta JSON and dispatches `qa-planner` with its content as input. Delete the meta JSON after dispatch (the skill owns the lifecycle — no hook dependency).

- **Primary**: Read `.claude/tmp/dev-plan-meta.json` → pass its content as qa-planner input.
- **Fallback** (meta JSON absent — dev-planner wrote the path only in its response text and skipped the actual Write): reconstruct the input from `{taskNumber}` without the meta.
  - `dev_brief.file_path` = `{{config.outputDir}}/{taskNumber}_dev_brief.md`
  - `dev_plan.root_file` = `{{config.outputDir}}/plans/{taskNumber}/{taskNumber}_dev_plan.md`
  - `dev_plan.phase_files` = `phases[].file` from `plan-manifest.json` (the plan is the single source)

    ```
    node .claude/skills/plan-loader/scripts/plan-manifest.mjs build --plan-root {{config.outputDir}}/plans/{taskNumber}
    ```

    > Do not Glob the disk. Glob silently passes even when it picks up files not in the plan or an order different from the plan,
    > so a list out of sync with the plan gets handed to qa-planner. If validation fails, stop rather than reconstruct.
  - `workspace_root` = absolute path of `.claude/`'s parent

qa-planner runs in the background via frontmatter `background: true` and also auto-passes its own step 6.5 gate. **However, do not rely on the frontmatter — the caller also explicitly passes `run_in_background: true`** (the verified path — prevents the "review while generating" design from breaking into foreground blocking if frontmatter alone does not guarantee background execution).

```
Agent(
  subagent_type: "qa-planner",
  description: "{taskNumber} 테스트 계획서 작성 (백그라운드)",
  run_in_background: true,
  prompt: "아래 정보를 기반으로 테스트 계획서를 작성해 주세요.\n\n[★ 백그라운드 비대화 실행 — 6.5단계 TC 분배 검토 게이트는 자동 통과해 주세요.]\n\n{메타 JSON 내용 (또는 Fallback 재구성 입력)}"
)
```

> **Note (transition-period)**: the meta JSON includes the `work_request` legacy alias, so qa-planner mostly works even reading the brief as if it were a work request. After qa-planner's full redesign, it consumes `dev_brief` + the `dev_plan.phase_files` array directly.

**5-3. Print the review guidance immediately** (do not wait for the qa background run to finish):

```
📋 개발 계획서가 준비되었습니다 — 지금 검토를 시작하세요.
🧪 테스트 계획서는 백그라운드에서 생성 중입니다 (약 5~7분). 완료되면 최종 요약을 알려드립니다.

먼저 확인할 것:
  1. 루트 §5 페이즈 목록
  2. 첫 페이즈 착수: /develop {scope} → phases/phase-1-{slug}.md
```

**5-4. When qa-planner finishes in the background — final deliverable summary:**

On receiving the background qa-planner completion notification, print the final guidance:

```
📋 개발 계획서 (루트): {{config.outputDir}}/plans/{taskNumber}/{taskNumber}_dev_plan.md
📁 페이즈 개발 문서: {{config.outputDir}}/plans/{taskNumber}/phases/phase-*.md ({N}개)
🧪 테스트 계획서 (루트): {{config.outputDir}}/plans/{taskNumber}/{taskNumber}_test_plan.md
📁 페이즈 테스트 문서: {{config.outputDir}}/plans/{taskNumber}/phases/phase-*-test.md ({N}개)

다음 단계:
  1. 루트 개발계획서 §5 페이즈 목록 확인
  2. 첫 페이즈 개발 착수:
     /develop {scope}                           ← 스코프 설정
     → phases/phase-1-{slug}.md 기반 구현 시작
  3. 페이즈 완료 시 테스트 실행:
     /qa-test {taskNumber} phase-1              ← phase-1 TC만 실행
  4. 다음 페이즈로 이동:
     → phases/phase-2-{slug}.md
  5. 전체 검증 (모든 페이즈 완료 후):
     /qa-test {taskNumber}                      ← 전체 TC 실행
```

---

## Automatic execution flow

```
/dev-plan {taskNumber|briefFile}
    |
    +- 1~2단계: 인수 파싱 + 브리프 탐색
    |
    +- 2.5단계: 사전 준비 제안서({taskNumber}_dev_prepare.md) 탐색 — 있으면 프롬프트에 전달, 없으면 그대로 진행
    |
    +- 3단계: dev-planner sub-agent 실행
    |         - 브리프 11섹션 파싱
    |         - scope-registry 역매칭
    |         - 가이드라인 로드
    |         - 페이즈 자동 분할 (R0 우선 / 오케스트레이터는 최소 개수) + 4.5단계 사용자 게이트
    |         - 코드 탐색 (글로벌 + 페이즈별)
    |         - 루트 문서 생성 -> {{config.outputDir}}/plans/{taskNumber}/{taskNumber}_dev_plan.md
    |         - 페이즈 문서 생성 -> phases/phase-N-{slug}.md (재서술 금지 6행 제외, 700행 초과 시 재분할 신고)
    |         - 메타 JSON 생성 -> .claude/tmp/dev-plan-meta.json (이중 키)
    |
    +- 4단계: plan-auditor 적대 검증 루프 (N=2, 조건부 3) — dev-planner 반환 직후 스킬이 직접 수행
    |         - 객관 결함(PA-COVER·PA-THIN·PA-DOD·PA-SCOPE) → 대상 문서만 재호출 1회 보정 → 재감사
    |         - 보정 dispatch 라운드당 1회 / 누적 2회 상한
    |         - 주관 지적 → surface (차단 안 함)
    |         - skip 후방호환(무응답 시 바로 qa-planner)
    |
    +- 5단계: 개발계획 결과 즉시 출력 + qa-planner 백그라운드 실행  ★ qa 백그라운드
    |         - 5-1/5-3: 개발계획서 검토 안내 즉시 출력 (qa 완료 대기 안 함)
    |         - 5-2: 스킬이 메타 JSON 직접 Read (부재 시 taskNumber 로 재구성)
    |               -> qa-planner run_in_background:true 디스패치 (6.5 게이트 자동 통과)
    |               -> 디스패치 후 메타 JSON 삭제
    |               -> 테스트 계획서 루트 + 페이즈별 문서 생성
    |                  {{config.outputDir}}/plans/{taskNumber}/{taskNumber}_test_plan.md
    |                  {{config.outputDir}}/plans/{taskNumber}/phases/phase-N-{slug}-test.md (N개)
    |
    +- 5-4: qa 백그라운드 완료 알림 시 최종 산출물 요약 출력
```

---

## Deliverable structure

```
{{config.outputDir}}/plans/
└── {taskNumber}/
    ├── {taskNumber}_dev_plan.md              ← 개발계획 루트 (엔트리 포인트)
    ├── {taskNumber}_test_plan.md             ← 테스트계획 루트 (qa-planner 산출물)
    └── phases/
        ├── phase-1-{slug}.md                 ← 페이즈 1 개발문서
        ├── phase-1-{slug}-test.md            ← 페이즈 1 테스트문서
        ├── phase-2-{slug}.md                 ← 페이즈 2 개발문서
        ├── phase-2-{slug}-test.md            ← 페이즈 2 테스트문서
        └── ...
```

**Transition-period legacy compatibility**: `{{config.outputDir}}/plans/{taskNumber}_test_plan.md` (the single flat path) is still recognized by the `/qa-test` command, so the pipeline works even if qa-planner generates the old version.

---

## Security policy

The `/secrets-guard` policy is active while this skill runs (blocks opening production config files · ENC decryption · SELECTs on real data).
Single source for blocking rules · exception handling · bypass guidance: [`.claude/skills/secrets-guard/SKILL.md`](../secrets-guard/SKILL.md).
Single source for the principle (WHY): [`.claude/rules/base-rule.md §1`](../../rules/base-rule.md).
---

## Machine routing manifest

After the root and phase Markdown documents pass plan-auditor, invoke:

```shell
node .claude/skills/plan-loader/scripts/plan-manifest.mjs build --plan-root "{{config.outputDir}}/plans/{taskNumber}" --task-number "{taskNumber}"
```

Markdown remains the development-design source of truth. `plan-manifest.json` contains only deterministic routing metadata: phase IDs, area, dependencies, document paths, screens, anchors, Task IDs, and DoD IDs. Validate it before dispatching qa-planner. If Autopilot is not installed, keep the existing Markdown-only flow.

`{orchestrated} = true` 면 **반환값에 경로를 실어 준다** — 그것이 반환값의 전부다: 계획 루트 · 루트 문서 · `plan-manifest.json` 경로 + 검증 결과 · 테스트 계획 루트의 **예상** 경로(`{{config.outputDir}}/plans/{taskNumber}/{taskNumber}_test_plan.md` — qa-planner 가 백그라운드라 존재는 QA 단계가 확인한다). 호출자가 경로를 자기 문서에 복사해 두면 이 스킬이 산출 위치를 바꾸는 순간 그 복사본이 거짓이 되고, 검증을 호출자가 한 번 더 돌리면 이 스킬이 이미 판정한 바이트를 다시 판정한다. 경로의 출처는 이 문서와 반환값이다.
