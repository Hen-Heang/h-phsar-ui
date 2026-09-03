---
name: playbook-phases
description: 페이즈 자동 분할 휴리스틱 규칙 R1~R10 + R9 화면 단위 적용 가이드 + R10 BE/FE 영역 분리 가이드 + 4.5단계 사용자 검토 게이트 포맷. dev-planner 4단계 진입 시 Read.
---

# Playbook — Phase Partitioning Heuristics (R1~R10)

> Single source for dev-planner steps 4 ~ 4.5 (phase partitioning + user review gate).

---

## Step 4: automatic phase partitioning (applying heuristics)

**Regroup** the brief §11 implementation order (typically 10~20 steps) **into phases**. The count range follows rule R7 below. **However, R-P (the project boundary) comes before everything, and R0 (the scale gate) comes next** — a phase never spans two projects, and inside one project a small task is not partitioned at all. **For full-stack projects, R10 is the primary partition axis** (BE/FE area separation); R9 applies only as the FE phase-partition axis. Non-full-stack projects apply R1~R8 only.

**The execution owner decides the count policy (decide this before judging R7):**

| Execution | What a phase means | Count policy |
|---|---|---|
| A person deploying incrementally | **배포 단위** (deployment unit) — each phase is deployed and reviewed separately | R7 recommends 4~7 |
| Non-interactive orchestrator (`/dev-autopilot` etc.) | **QA 게이트 단위** (QA gate unit) — delivered at once with 1 commit · 1 MR | The **최소 개수** (minimum count) that satisfies R6 (1~3d per phase) |

In an orchestrator run, a phase boundary is 배포 단위가 아니라 **구현 에이전트를 다시 띄우는 지점** — not a deployment unit but the point where an implementation agent is re-spawned. At every boundary, scope interpretation, guideline loading, module-structure caching, and the implementation agent's context rebuild all happen again from scratch, and that fixed cost is proportional to the phase count regardless of the amount of work. In a run with a single deployment, 4~7 phases pay that fixed cost 4~7 times and gain nothing — the measured case in the R0 rationale cell (78 production lines split into 3 phases taking 86 minutes) is the same phenomenon.

Record the judgment result and its rationale (which policy was applied) in root §5-2.

**Heuristic rules (in priority order):**

| Rule | Rule | Rationale |
|:--:|------|------|
| **R-P**| **Project boundary (judged before R0 — applies to every project type)**: a phase belongs to exactly one project — `project.yaml projects[].name`, the value `scope.yaml project:` references. Split first by the Primary project and every root §3-2 Related project whose 변경 유무 = 변경, then apply R0 and R1~R10 **inside each project**. Every phase declares its `project` in the root frontmatter (one string, never a list). **Never infer the project from relative paths** — phase §3 paths and scope `allowedPaths` are both project-root-relative, so two repositories with the same layout cannot be told apart by path.| The runtime binds a phase to one project permanently (`goal-start`) and one `/develop` invocation writes in one scope, so a two-project phase cannot be dispatched at all. Measured: the defect surfaced only at DEVELOP entry and forced a full re-plan (~840k subagent tokens)|
| **R0**| **Scale gate (judged per project, after R-P, before all other rules)**: if all three conditions below are met, **fix the plan at 1 phase** and do not apply R1~R10 partitioning. ① Estimated production delta (new + modified lines, tests excluded) **≤ 200 lines** ② **Single module** (scope `allowedPaths` count 1 + a small sharedModule change allowed) ③ **Single flow** (the change converges on one entry point and one user scenario). Always record the judgment basis (estimated line count, module, flow) in root §5-2.| Phase-boundary cost (implementation-agent re-spin-up, guideline/plan context rebuild, inter-phase handoff-comment drift) exceeds the benefit of partitioning. Measured: a 78-production-line task split into 3 phases took 86 minutes, and a handoff comment described unimplemented behavior as fact, causing a review WARNING|
| R1| **Scaffolding + common infrastructure + security modules** → bundle into Phase 1| Tightly coupled, cannot deploy independently|
| R2| **v1/v2 version split even within the same domain** → separate phases| Incremental deployment, independent verification|
| R3| **New domain (features marked '신규' in brief §3-4)** → independent phase| Risk isolation|
| R4| **Atomic units with estimated duration < 0.5 business day** → absorb into the preceding/following phase| Prevents phase-count inflation|
| R5| **Side tasks + Deprecate** → consolidate into the last phase. **Tests, verification, regression, coverage, and pass criteria are all owned by qa-plan**. A dev-plan phase writes §9 완료의 정의(DoD 종료 판정표) but does not create a §검증 방법(테스트 파일·커버리지) section (§9 DoD is the convergence loop's (caller-owned) end-verdict table / implementer-local signals = BE tests GREEN, FE sub-agent code-generation completion report).| Area separation: dev-plan (implementation spec + end-verdict table) vs qa-plan (test plan)|
| R6| **Recommended duration per phase: 1~3 business days**| A scale that allows incremental deployment|
| R7| **Human execution: recommended 4~7 phases, allowed 1~10 phases.** **Orchestrator execution: the minimum count satisfying R6** (recommended range not applied — see the table above). Common: **when R0 holds, 1 phase is the answer** — R0 outranks the lower bound of 2. For tiny tasks whose brief §11 has 3 steps or fewer, 2 phases is also allowed. Above 8 phases, re-examine for a likely R6 violation. With R10 applied, BE 1~2 phases + FE N screen phases makes N+1~N+2 natural| Manageable range. The rationale for the recommended 4~7 is **incremental deployment**, so it does not hold for a run with a single delivery — in that run the phase-boundary cost repeats with no gain|
| R8| **Phase naming: `phase-{N}-{kebab-slug}`**. Slug convention — single BE: `be` / multi-stage BE: **layer axis recommended**: `be-{레이어}` (`be-infra`, `be-service`, `be-api`) / **domain axis discouraged** (only for the exceptional case where ≥ 2 domains arrive bundled in one work item — first consider splitting the work item): `be-infra` + `be-{도메인}` (`be-payment`, `be-merchant`) / single FE: `fe` / per-screen FE: `fe-{화면-slug}` (`fe-login`, `fe-farmer-apply`) / non-full-stack (R10 not applied): existing slugs (`infra`, `auth`, `entry-v1`)| File/branch naming consistency + area/domain identification|
| **R9**| **Screen-centric projects apply the single principle "1 screen = 1 phase"** (web-fullstack only). Cross-cutting infrastructure keeps R1 priority. Projects without screens state R9 as not applied and partition with R1~R8 only. **When R10 is adopted, R9 applies only as the FE phase-partition axis** (bundling BE+FE into one phase is forbidden). Bundling patterns such as screen grouping or per-wizard-step splitting are not applied — a screen = the review unit.| Aligns the user review unit with the phase unit|
| **R10**| **Full-stack projects apply BE/FE area separation as the primary axis** (web-fullstack only). BE is a work-flow bundle (single phase or multi-stage — **layer axis** (infra/service/API) **recommended**. The **domain axis** (infra + per-domain) is **discouraged** — only for the exceptional case where ≥ 2 domains arrive bundled in one work item. Operationally, per-domain work items are normally separated, so for the ≥ 2 domain case **first consider splitting the work item**), FE is per-screen phases. BE finished → FE screen work = the natural development flow. Mixing BE+FE in one phase is forbidden.| Blocks API-change risk + incremental FE work flow + avoids context switching|

**Step output:** phase list table (recorded as-is in root §5):

```
| N| 페이즈명| slug| 포함 브리프 §11 단계| 예상 기간| 의존 페이즈| 독립 배포 가능|
|---|---------|------|------------------|----------|-----------|---------------|
| 1| 인프라 & 공통| infra| 1, 2, 3| 3d| —| Y|
| 2| Auth & Account| auth| 4, 5| 2d| 1| Y|
| ...
```

Record the partition rationale (which rule was used for which decision) in 1~2 lines each in the root §5 annotation table.

---

### R9 application guide (screen-centric projects)

> **Relation to R10**: for full-stack projects (web-fullstack), **R10 is the primary partition axis** and R9 is used **only as the FE phase-partition axis**. Bundling BE+FE into one phase violates R10. For non-full-stack projects (there is no R10-not-applied full-stack case — R10 is a full-stack-only rule), R9 applies alone. In practice the R9 targets = the R10 targets, but the viewpoint differs — R9 is "user value (screens)", R10 is "development work flow (BE/FE)".

**Applicable project types:**
- web-fullstack (full-stack web — server rendering with screens) — applied together with R10 (R9 for FE phase partitioning only)
- web-api (REST API microservice)
- batch / daemon
- proxy / router
- library
- single service

**How to judge:** the brief §2 `프로젝트 유형` field + whether brief §7 (screen map) exists.
- Project type is web-fullstack + a screen tree exists in §7 → **apply R9 + R10 together** (R9 as the FE phase-partition axis, R10 as the BE/FE area-separation axis)
- Otherwise → **apply neither R9 nor R10** (state "R9·R10 미적용 — 비풀스택 프로젝트" in the §5-2 partition rationale. Use R1~R8 only)

**Screen partitioning principles (when R9 applies):**

- The single principle **1 screen = 1 phase**. Do not bundle screens.
- **Only one cross-cutting-screen exception** — cross-cutting auth screens such as login, OTP, and session expiry are absorbed into R1 (infra) or a separate auth phase (`be-auth` / `fe-login`).
- **New domains take R3 first** — new-domain screens get an independent phase per domain. Even for R9 targets, R3 outranks R9.

> **Why**: phase = user review unit. The screen is the review unit, so bundling breaks review separation. If a single screen seems too big (over 3d) and needs splitting, that is a signal **the screen itself should be defined more finely**, not a phase-partitioning option (UI flow splitting is outside dev-plan's area).

**Adding the screen column (step-4 output + step-4.5 review gate):**

R9-applied projects add a **포함 화면** column to the phase list table:

```
| N| 페이즈명| slug| 포함 §11 단계| 포함 화면| 예상 기간| 의존 페이즈| 독립 배포|
|---|---------|------|------------|---------|----------|-----------|---------|
| 1| 인프라 & 공통 & 보안| infra| 1,2,3| (없음 — 횡단)| 3d| —| Y|
| 2| 로그인| auth| 4,5| login.html, otp-modal| 1.5d| 1| Y|
| 3| 도메인 A 관리| domain-a| 6,10| domain-a/list, domain-a/detail| 2d| 1| Y|
| 4| 도메인 B v1| domain-b-v1| 7,11| domain-b/v1/step1~3| 2.5d| 2| Y|
| 5| 도메인 B v2| domain-b-v2| 8| domain-b/v2/step1~3| 2d| 4| Y|
| 6| 외부 시스템 연계| external-link| 9| external/link| 1.5d| 2| Y|
| 7| 도메인 C (신규) + 마무리| domain-c| 12,13,14,15| domain-c/*| 3d| 3,5,6| Y|
```

R9-not-applied projects omit the **포함 화면** column or use a single row `해당 없음 — 화면 없는 프로젝트`.

> The table above is **the deliverable for the step-4.5 user review**. Once review is done, record the same content in the root document's
> **frontmatter `phases[]`** (포함 화면 → the `screens: [...]` array). Do not repeat this table in the root document body.

**Use at the step-4.5 user review gate:**

When R9 applies, the review-gate text is printed centered on the screen-unit phase-partition result (for the concrete format, see the step-4.5 body):
- Show the "포함 화면" column in the phase table

---

### R10 application guide (BE/FE area separation — full-stack projects)

> **Core viewpoint**: the natural development flow is BE finished → FE screen work. Mixing BE+FE in one phase causes context-switching inefficiency + FE rework risk on API changes + the phase unit becoming ambiguous between the BE work flow and the FE screen unit. R10 partitions phases by **development work-flow unit**, aligning with the natural flow.

**Applicable project types (same as R9 — full-stack only):**
- web-fullstack (full-stack web — server rendering with screens)
- web-api — BE only, R10 meaningless
- batch / daemon — no screens, R10 meaningless
- proxy / router — no screens, R10 meaningless
- library — no screens, R10 meaningless
- single service — no screens, R10 meaningless

**How to judge:** brief §2 `프로젝트 유형` + §7 (screen map). Same judgment as R9.
- Full-stack project → **apply R10 (BE/FE area separation)**
- Otherwise → **R10 not applied** (state "R10 미적용 — 비풀스택" in the §5-2 partition rationale)

**BE/FE partition patterns:**

| Pattern | Structure | Slug |
|-----|-----|------|
| **Single BE + single FE**| Phase 1: `be` (BE consolidated) → Phase 2: `fe` (FE screen)| `be` / `fe`|
| **Single BE + per-screen FE** (≥ 2 screens)| Phase 1: `be` (BE consolidated) → Phase 2~N: `fe-{화면}` per-screen FE| `be` / `fe-login` / `fe-apply` ...|
| **Multi-stage BE (layer axis) + per-screen FE** **recommended** (BE > 3d, large infra share + 1 domain)| Phase 1~M: `be-{레이어}` (infra → Service → API) → Phase M+1~N: `fe-{화면}` per-screen FE| `be-infra` / `be-service` / `be-api` / `fe-{화면}` ...|
| **Multi-stage BE (domain axis) + per-screen FE** ️ **discouraged — exceptional case only** (when ≥ 2 domains arrive bundled in one work item and cannot be separated. The standard is splitting the work item.)| Phase 1: `be-infra` → Phase 2~M: `be-{도메인}` (self-contained per domain) → Phase M+1~N: `fe-{화면}` per-screen FE| `be-infra` / `be-payment` / `be-merchant` / `fe-{화면}` ...|
| **BE-only change (no FE impact)**| Phase 1~M: `be-{레이어}` (recommended) or `be-infra` + `be-{도메인}` (discouraged — exceptional case only)| `be-infra` / `be-service` ... or `be-infra` / `be-payment` ...|
| **FE-only change (no BE impact)**| Phase 1~N: `fe-{화면}` per screen. No BE phase| `fe-{화면}` ...|

**Multi-stage BE partition criterion (1) — duration:**
- Estimated single-BE-phase duration ≤ 3d → **single BE phase** (`be`)
- 3d < BE ≤ 6d → consider a **2-stage BE split**
- BE > 6d → **3+ stage BE split** recommended
- Split rationale: satisfying R6 (1~3d per phase) + clarifying dependencies

**Multi-stage BE partition criterion (2) — axis selection (layer axis vs domain axis):**

> **Operational policy (preliminary check)**: if ≥ 2 domains arrived bundled in one work item, **first consider splitting the work item**. Operationally, separating work items per domain is the standard — if separable, split, and then each work item has 1 domain = handled naturally by the layer axis or a single BE. The domain axis is **only for the exceptional case where separation is impossible** (an operationally rare scenario).

| Situation | Recommended axis | Reason |
|-----|--------|------|
| **≥ 2 domains arrived bundled (preliminary)**| **First consider splitting the work item** → after splitting, 1 domain each| Operational standard. If separable, the domain axis is avoided altogether|
| Infra (common config, migrations, ServiceCore generalization, etc.) ≥ 1d + 1 domain| **Layer axis** recommended (`be-infra` / `be-service` / `be-api`)| Infra takes a large share, so separating by layer is natural|
| ≥ 2 domains + inseparable (exceptional case)| **Domain axis** ️ discouraged (`be-infra` + `be-{도메인}` × N)| The phase review unit = that domain's API works OK (self-contained). **Apply only after the preliminary check judges separation impossible**|
| Large infra + several domains + inseparable (exceptional case)| **Domain axis first** ️ discouraged (`be-infra` + `be-{도메인}` × N) — intra-domain layer serialization arises naturally as Tasks within the phase| Review-unit clarity first. **Apply only after the preliminary check**|
| Small infra (< 0.5d) + 1 domain| **Single BE** (`be`, absorbed via R4)| Split cost > benefit|

> **Review-unit viewpoint**: with the layer axis, reviewing `be-service` gives unit tests only / true behavior is confirmed only at `be-api`. With the domain axis, phase review = that domain's API works OK = self-contained. By review-unit clarity alone the domain axis aligns naturally, but **because per-domain work items are operationally separated as standard, applying the domain axis is itself discouraged**. It is kept only as a safety net for the exceptional case where ≥ 2 domains are bundled in one work item and cannot be separated.

> **No mixing**: a work item's multi-stage BE split is unified on one axis (either the layer axis or the domain axis). Mixing (e.g. Phase 2 = `be-service`, Phase 3 = `be-payment`) breaks consistency. However, `be-infra` is the common entry point of both axes — the `be-infra` + `be-{도메인}` × N combination on the domain axis is normal.

**FE screen partitioning (R9 applied):**
- When R10 applies, R9 applies **only as the FE phase-partition axis** — **N FE screens means exactly N phases** (the 1:1 single-screen principle, no grouping)
- If there is only 1 screen, a single FE phase (`fe` or `fe-{단일 화면 slug}`)

**Dependency patterns:**
```
BE 단일 + FE 단일:
 Phase 1 (be) → Phase 2 (fe)

BE 단일 + FE 화면별 (화면 3개):
 Phase 1 (be) → Phase 2 (fe-login)
 ↘ Phase 3 (fe-apply)
 ↘ Phase 4 (fe-history)

BE 다단계 (레이어 축) + FE 화면별:
 Phase 1 (be-infra) → Phase 2 (be-service) → Phase 3 (be-api)
 → Phase 4 (fe-login)
 → Phase 5 (fe-apply)

BE 다단계 (도메인 축) + FE 화면별: ️ 비권장 — 예외 케이스 한정 (도메인 ≥ 2개 묶여 분리 불가 시)
 Phase 1 (be-infra) → Phase 2 (be-payment) → Phase 4 (fe-payment)
 → Phase 3 (be-merchant) → Phase 5 (fe-merchant)
```

**Use in the step-4 output + step-4.5 review gate:**

R10-applied projects add an **영역(BE/FE)** column to the phase list table:

```
| N| 페이즈명| 영역| slug| 포함 §11 단계| 포함 화면| 예상 기간| 의존 페이즈| 독립 배포|
|---|---------|------|------|------------|---------|----------|-----------|---------|
| 1| BE 인프라 & API & 공통| BE| be| 1,2,3,4,5,8,9,10| (없음 — BE 영역)| 2d| —| (가능하나 화면 없어 사용자 가치 없음)|
| 2| FE 단일 화면| FE| fe-{화면}| 6,7,13,14| {화면}.html| 1.5d| 1| Y|
```

R10-not-applied projects omit the **영역** column (keep the R9-guide table format as-is).

---

## Step 4.5: phase-partition review (user gate)

**Present the phase list partitioned in step 4 to the user as text and get confirmation.** This step validates the partition itself before entering step-5 code exploration. Phase partitioning is the biggest decision that develop and qa-test are bound to, so this blocks a bad partition from wasting all of steps 5~7.

**Preliminary check — ≥ 2 domains bundled case (mandatory):**

If ≥ 2 domains are bundled in one work item per the brief §3-4 affected domains or the §11 step distribution, and the multi-stage-BE candidate is heading toward the domain axis, first confirm with the user **whether the work item can be split**, right before printing the phase table.

```
️ 선결 검토: 도메인 ≥ 2개 묶임 감지

이 과업에는 도메인 N개가 묶여 있습니다: {도메인 A}, {도메인 B}, ...
운영 표준은 **도메인별 과업 분리**입니다 — 분리 가능하면 각 과업당 도메인 1개로 처리하는 것이 표준 흐름입니다.

선택:
- "분리 가능" — 과업을 도메인별로 분리하시겠습니까? (dev-interview 재요청 권유)
- "분리 불가" — 도메인 축 (`be-infra` + `be-{도메인}` × N) 으로 분할 진행 (예외 케이스 안전망)
- 사유 없이 "진행" — 사용자 의사 확인 1회 더 요청
```

**User response branches:**
- "분리 가능" / "분리하겠다" → recommend ending dev-planner + guide a dev-interview re-request. The user splits and re-invokes dev-plan for the new work items.
- "분리 불가" / "묶어서 진행" → proceed with the domain-axis split + print the phase table (the R9+R10 format below)
- If there is 1 domain, or the BE resolves naturally to a single BE / the layer axis → auto-skip the preliminary check and go to the phase table

**The presentation format branches on whether R9·R10 apply.**

**Presentation format (R9 + R10 applied case — web-fullstack full-stack):**

```
## 페이즈 분할 결과 (BE/FE 영역 분리 + 화면 단위 — R9·R10 동시 적용)

| N| 페이즈명| 영역| slug| 포함 §11| 포함 화면| 예상 기간| 의존 페이즈| 독립 배포|
|---|---------|------|------|---------|---------|----------|-----------|---------|
| 1| BE 인프라 & API & 공통| BE| be| 1,2,3,4,5,8,9,10| (없음 — BE 영역)| 2d| —| (가능하나 화면 없음)|
| 2| FE 도메인 A 화면| FE| fe-domain-a| 6,7| domain-a/edit.html| 1.5d| 1| Y|
| 3| FE 도메인 B 화면| FE| fe-domain-b| 11,12,13,14| domain-b/list, domain-b/detail| 1d| 1| Y|
| ...

**분할 근거 (R 규칙 적용 내역):**
- R10 (BE/FE 영역 분리): Phase 1은 BE 통합, Phase 2~N은 FE 화면별
- R1 (스캐폴딩+공통+보안 통합): §11 1,2,3,4,5,8,9,10 → Phase 1 (BE)
- R9 (화면 단위 우선 — FE만): Phase 2~N을 FE 화면 흐름 중심
- R5 (테스트 영역 분리): 페이즈 §9 완료의 정의(DoD 종료 판정표)는 작성, §검증 방법(테스트 파일·커버리지)은 미생성 — qa-plan 전담. §9 DoD 는 수렴 루프(호출자 소유) 종료 판정표 / implementer-local 신호 = BE 테스트 GREEN, FE sub-agent 코드 생성 완료 보고
- R8 슬러그 컨벤션: 단일 BE = `be`, FE 화면별 = `fe-{화면}`
- ...

**총계:**
- 페이즈 수: N개 (R7 범위, BE 1~2 + FE 화면 N개 자연)
- 예상 기간: Nd (브리프 §1 제안 개발 기간 대비 ±M%)
- 독립 배포 가능: BE 페이즈는 통합 배포 권장, FE 페이즈는

---

이 분할로 상세 문서를 생성할까요?
- "OK" / "진행" / "저장" — 5단계 진입
- 분할 수정 (예: "BE를 be-infra/be-service 2단계로", "fe-domain-a/fe-domain-b 합치기") → 재분할
```

**Presentation format (R9·R10 not applied case — REST API / Batch / Daemon / Proxy / Library / single service):**

```
## 페이즈 분할 결과 (R9·R10 미적용 — 비풀스택 프로젝트)

| N| 페이즈명| slug| 포함 §11| 예상 기간| 의존 페이즈| 독립 배포|
|---|---------|------|---------|----------|-----------|---------|
| 1| DTO·Mapper·Service| core| 1,2| 1d| —| Y|
| 2| Controller + API| api| 3| 0.5d| 1| Y|
| 3| 배포 준비| release| 4| 0.5d| 2| Y|

**R9·R10 미적용 사유**: REST API 마이크로서비스 — 화면 없음, 풀스택 아님. R1·R4·R5(테스트 페이즈 폐지)만 적용.

**분할 근거 (R 규칙 적용 내역):**
- R1 (공통 인프라 통합): DTO·Mapper·Service → Phase 1
- R4 (0.5d 흡수 검토): Controller는 0.5d지만 API 스펙 결정 책임 있어 별도 페이즈 유지
- R5 (테스트 영역 분리): 페이즈 §9 완료의 정의(DoD 종료 판정표)는 작성, §검증 방법(테스트 파일·커버리지)은 미생성 — qa-plan 전담. §9 DoD 는 수렴 루프(호출자 소유) 종료 판정표 / implementer-local 신호 = BE 테스트 GREEN, FE sub-agent 코드 생성 완료 보고

**총계:**
- 페이즈 수: N개 (R7 권장 4~7 범위)
- 예상 기간: Nd
- 독립 배포 가능: N개

---

이 분할로 진행할까요?
- "OK" / "진행" / "저장" — 5단계 진입
- 수정 사항 알려주시면 재분할 후 다시 제시
```

**Handling user responses:**
- "OK" / "진행" / "저장" → enter step 5
- Modification request (e.g. "Phase 4와 5를 합쳐줘", "도메인 C를 Phase 6으로 옮겨줘") → recalculate the partition, then present step 4.5 again
- On reaching 3 modification rounds → propose "수정 라운드가 누적되고 있습니다. 현재 분할로 진행 후 페이즈 문서 단계에서 세부 조정하시겠습니까?"

**Skip conditions:**
- **Non-interactive orchestrator run → step 4.5 passes automatically** (print the partition rationale, but do not wait for a user response). Waiting at this gate in a run with nobody to answer stalls the run. Do not skip the preliminary check (verifying partition-rule violations).
- **R0 (scale gate) holds → skip step 4.5** (there is no partition decision, so there is nothing to review). State "R0 적용 — 1페이즈 확정({추정 라인}줄/{모듈}/단일 플로우), 분할 검토 게이트 생략" in the step-9 result return.
- Tiny task with brief §11 of **3 steps or fewer** + an obvious 2~3 phase result after applying R7 → skip step 4.5 and enter step 5 directly (but state "분할 자명 — 검토 게이트 생략" in the step-9 result return)
- Borderline cases where §11 has 4~5 steps go through the gate even with 2~3 phases (outside the explicitly allowed R7 range, so user confirmation is recommended)
