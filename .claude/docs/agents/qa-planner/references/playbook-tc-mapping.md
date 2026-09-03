---
name: playbook-tc-mapping
description: Task↔TC 1:N 매핑 알고리즘, 자동 측정 항목 식별, 유형·우선순위 분배, R9 화면 1:1 + R10 BE 두 축(레이어/도메인) 정합 규칙, FE §5-2 기능 검증 체크리스트 도출 휴리스틱. qa-planner 6단계 진입 시 Read.
---

# playbook — Task↔TC mapping and distribution algorithm

> Single source for all of qa-planner step 6 (TC derivation and distribution). The agent body delegates to this file.

---

## 6-1. Task → TC 1:N mapping (per phase)

Iterate over each phase's §7 Tasks and generate at least 1 TC per Task:

| Task example | Derived TC examples |
|-----------|-------------|
| P2-T01 로그인 페이지 렌더링| TC-WV-CTRL-001 페이지 정상 로딩 (Integration)|
| P2-T02 OTP 발송 엔드포인트| TC-WV-CTRL-002 정상 요청 (Integration) + TC-WV-SVC-001 Service 로직 (Unit) + TC-WV-CTRL-003 잘못된 전화번호 (Integration, 예외)|
| P2-T03 OTP 검증 + 세션 생성| TC-WV-CTRL-004 정상 검증 + TC-WV-CTRL-005 만료 OTP (예외) + TC-WV-SVC-002 Service 검증 로직|

---

## 6-2. Identifying automatically measurable quality items (no TC generated)

> The dev-plan phase §9 DoD is the develop convergence loop's end-verdict table, not a TC mapping axis, so do not write a *DoD → TC mapping*. Instead, identify **자동 측정 가능 품질 항목** (automatically measurable quality items — coverage, config security, conventions, etc.) and classify them into the *"품질 게이트 자동 측정"* section (root §6 global DoD).

| Auto-measured item | Measurement method |
|--------------|----------|
| Test coverage | Language-pack build tool (e.g. a coverage-measurement command)|
| Code-convention compliance | Language-pack linter/static analysis|
| No hard-coded config | grep patterns|

For per-language auto-measured items, consult the language pack's `docs/agents/qa-planner/references/test-schema-lang.md` (if present).

> Among the brief §8 special requirements, items that **cannot be measured automatically** (e.g. SecureKeypad plaintext not exposed in the DOM, Redis session persistence) are derived as §5 TC-body items (absorbed within the Task ↔ TC mapping).

---

## 6-2.5. TC total cap (proportional to change size) — compute before distributing

The TC count is proportional to the **change size**, not to the requirement count. Fix the cap first, then fill in the 6-3 type distribution and 6-4 priorities within it.

**Input**: the **production delta line count** estimated from the plan (root §3 implementation-target files + phase §3/§7) (test code excluded; new + modified combined).

| Item | Formula | Note |
|------|------|------|
| **Functional TC cap**| `clamp(ceil(프로덕션 델타 라인 / 6), 4, 40)`| 1 TC per 6 changed lines. Floor 4, cap 40|
| **Regression TCs (counted separately, outside the cap)**| As many as the **existing paths** the change actually touches| Other callers of shared functions/shared queries, existing exception paths, null/empty paths. Never trim this item|
| **Task coverage floor**| Every Task ≥ 1 TC| If this conflicts with the cap, do not merge Tasks — **merge TCs** so one TC covers several Tasks|

**Removal order when over the cap** (from the top):

1. **Framework/library-guaranteed territory** — accessors/builders produced by code-generation libraries, annotation/decorator existence, serialization-library default behavior, ORM mapping itself. *These TCs verify someone else's code, not ours.* The per-language concrete list follows the language pack's `docs/agents/qa-planner/references/test-schema-lang.md`.
2. P3 (UI verification/convenience) → P2 (exceptions/boundary values) where **another TC already passes the same branch**
3. TCs repeating the same input class with only different values (merge into 1 via parameterization)

**Never trim**: regression TCs, P0 (auth, permissions, security, core changed operations), 특성화 tests (pre-change behavior snapshots).

**Recording duty**: leave the formula and the actual values in the root test plan §4 as `프로덕션 델타 {N}줄 → 기능 TC 상한 {M}개 + 회귀 TC {K}개 = 총 {M+K}개`. If you exceeded the cap, record the reason too.

> **Why**: in a measured case, a 78-line production delta produced 38 TCs (1663 lines of test code, 21× the production code). Of those, 285 lines of contract tests verified behavior a library already guarantees, such as a code-generation library's builders and serialization annotations. Applying this formula gives functional 13 + regression 6 = 19 — half, while keeping the regression safety net.

---

## 6-3. Test-type distribution (per-phase target)

| Type | Target | Ratio goal |
|------|------|---------|
| Unit| Service, Util, DTO/VO| 60%|
| Integration| Controller(MockMvc), Mapper(DB)| 30%|
| E2E| User flows (Web projects only)| 10%|

---

## 6-4. Priority classification

| P| Criterion |
|:-:|------|
| P0| Auth, permissions, security, core changed operations (Critical)|
| P1| Main-feature happy paths (High)|
| P2| Exceptions, boundary values, error handling (Medium)|
| P3| UI verification, convenience features (Low)|

---

## 6-5. E2E generation limits

- **Included**: web-fullstack (full-stack web — projects with screens)
- **Excluded**: web-api, batch, daemon, proxy, library, single service

---

## 6-6. R9·R10 alignment rules — FE screen 1:1 + BE two-axis TC distribution

Following dev-planner's R9 (screen 1:1) and R10 (BE/FE separation; multi-stage BE is **layer axis recommended / domain axis discouraged — only for the exceptional case where ≥ 2 domains arrive bundled in one work item and cannot be separated**), enforce that per-phase TCs align with the review units.

### 6-6-1. FE phases — R9 screen 1:1

An FE phase's (slug `fe-*`) E2E TCs cover **only that phase's screen**.

| Phase slug pattern | Phase = | E2E TC distribution principle |
|---|---|---|
| `fe-{화면-slug}` (single screen)| 1 screen| That screen's golden path 1 + key NEGATIVE 1~2 = E2E 1~3|
| `be` (single BE)| Consolidated BE work flow| 0 E2E (Integration·Unit only). E2E comes after entering the FE phases|
| `be-{레이어}` (multi-stage BE — layer axis: `be-infra`/`be-service`/`be-api`) recommended| One BE layer| 0 E2E. **For Unit·Integration distribution see the 6-6-2 BE two-axis alignment rules**|
| `be-infra` + `be-{도메인}` (multi-stage BE — domain axis ️ **discouraged — exceptional case only**: `be-infra`/`be-payment`/`be-merchant`)| One BE domain, self-contained| 0 E2E. **For Unit·Integration distribution see the 6-6-2 BE two-axis alignment rules** (a domain-axis dev-plan bypasses the operational standard *work-item separation* → at step 6.5, tell the user to check *whether a work-item split was considered*)|
| `phase-N-{slug}` (R10-not-applied full-stack single phase)| 1 screen + 1 BE unit| That screen's E2E 1~3|

**Forbidden:**
- Bundling several screens' E2E into one FE phase (R9 violation — breaks screen review-unit separation)
- Splitting one FE phase into N per-wizard-step E2Es (R9 violation — scatters single-screen review)
- Creating E2E TCs in a BE phase (the browser entry point is the FE phase)

**Alternative (project types where R9 does not apply):**
- REST API / Batch / Daemon / Library / Proxy / single service = R9 not applied. 0 E2E. Integration TCs verify the user entry points.
- Full-stack but R10 not applied (single phase), a small work item = screen 1:1 means the phase itself = only that screen gets E2E coverage.

Auto-detect from dev-planner's phase slugs whether R9/R10 apply + the BE split axis:
- Slugs separated into `fe-*` and `be` / `be-*` → R10 applied = apply the R9 alignment rules
- All slugs in `phase-N-*` form with no BE/FE separation → R10 not applied = if the phase is a single screen, only that screen gets E2E coverage

**Auto-detecting the BE split axis (R10 applied + multi-stage BE):**
- The BE phase slug set is a subset of `{be-infra, be-service, be-api}` → **layer axis**
- The BE phase slug set is `be-infra` + other domain names (`be-payment`, `be-merchant`, etc.) → **domain axis**
- When detecting the domain axis, cross-check the "도메인 축" keyword in the dev-plan root §5-2 partition rationale
- Single BE phase (slug `be`) → axis irrelevant (self-contained)

### 6-6-2. BE phases — two-axis TC distribution alignment rules

With a multi-stage BE split, the per-phase review unit differs by axis, so the Unit/Integration TC distribution must match.

> **Operational policy (as recognized in qa-planner's area)**: dev-planner's operational standard is **layer axis or single BE recommended**. The domain axis is a **discouraged safety net — only for the exceptional case where ≥ 2 domains arrive bundled in one work item and cannot be separated**. If qa-planner receives a domain-axis dev-plan, treat it as the result of the *work-item splittability preliminary check* at dev-planner step 4.5 and distribute aligned TCs. However, include one guidance line in the step-6.5 review-gate output: *"BE 도메인 축 적용 — dev-planner 4.5에서 과업 분리 불가 판정 후 적용된 예외 케이스. 분리 검토 필요 시 dev-planner 재호출 권장"*.

| BE split axis | Phase = review unit | Unit TC distribution | Integration TC distribution |
|---|---|---|---|
| **Layer axis** recommended (`be-infra` / `be-service` / `be-api`)| Passing one layer| `be-infra`: infra code (common modules, config) units / `be-service`: many Service units (Mock Mapper) / `be-api`: Controller-verification support| `be-infra`: migration dry-run / `be-service`: 0~few (Service ↔ Mapper only) / `be-api`: **many MockMvc integrations** (API-spec verification)|
| **Domain axis** ️ discouraged — exceptional case only (`be-infra` + `be-{도메인}`)| One domain, self-contained (Service+Controller+Mapper)| `be-infra`: infra units / `be-{도메인}`: that domain's Service units + Controller support units| `be-infra`: migration dry-run / `be-{도메인}`: **that domain's Unit + Integration both** (self-contained within the phase up to API-spec verification)|
| **Single BE** (`be`)| Consolidated BE work flow| Infra + Service + Controller support units all| Many MockMvc integrations (API-spec verification)|

**Principles:**
- A domain-axis BE phase **must not be missing Integration TCs** — the phase's review unit = that domain's API works OK, so the `be-{도메인}` phase itself needs Integration to be self-contained.
- The layer axis is serial — `be-service` does Unit with a Mock Mapper; Integration is deferred to `be-api`. Do not put MockMvc Integration in `be-service`.
- Both axes have 0 E2E (common to BE phases). User-entry-point verification goes to the FE phases.

**Forbidden (BE axes):**
- A domain-axis `be-{도메인}` phase with Unit only and no Integration → breaks the phase review unit (cannot verify that domain's API behavior)
- MockMvc Integration in a layer-axis `be-service` phase → area intrusion (it belongs in the `be-api` phase)
- The two axes mixed in one work item (`be-service` + `be-payment`) → a dev-planner alignment-break signal; recommend a step-4.5 re-partition

---

## 6-7. Deriving the 기능 검증 체크리스트 (FE phases only — the 기능 검증 공식 게이트)

The human-review territory automatic TCs cannot cover. It maps to the R9 essence that a phase = one screen's review unit, and **in `/develop` automatic mode (시나리오 C) it is the *official gate* where, at the one feature-verification point after all phases end, the reviewer takes this checklist and verifies directly in the browser**. In default mode it can be used for per-phase self-checks.

**Derivation inputs:**
1. Brief §7 screen map (the screen's interaction list)
2. Brief §8 special requirements (security/UI/accessibility etc.)
3. dev-plan phase §3·§4 (FE file implementation spec)

**Derivation principles:**
- **7 universal items** (레이아웃·포커스·에러 메시지·로딩·전환·빈 상태·핵심 인터랙션) — common to every FE phase
- **Phase-specific items** — extracted per screen from brief §8 or dev-plan §4 (even if duplicated with automatic TCs, a person looks once too)
- Territory automatic TCs can cover (response codes, DB persistence) does not go in §5-2 — handle it in §5-1

**Not written for:**
- BE phases, REST API/Batch/Daemon/Library/Proxy/single service = the §5-2 section itself is not written

---

## Phase-partitioning example collection (TC distribution pattern demos)

### Example 1 — large full-stack work item (R9 + R10 applied, BE layer axis, 7 phases, domain-neutral template)

**Matches dev-planner example 1 — a large full-stack real case. Other projects borrow only the 7-phase BE/FE separation pattern:**

The same 7-phase structure as dev-planner example 1 (multi-stage BE 3 + per-screen FE 4) → per-phase TC distribution:

| Phase| 페이즈명| slug| 화면| Unit| Int| E2E| 합계|
|:-:|---------|------|------|:---:|:---:|:---:|:---:|
| 1| BE 인프라 & 공통 & 보안| be-infra| (없음)| 6| 3| 0| 9|
| 2| BE 도메인 Service & Mapper| be-service| (없음)| 12| 4| 0| 16|
| 3| BE Controller & API| be-api| (없음)| 8| 6| 0| 14|
| 4| FE 로그인| fe-login| login.html| 4| 3| 2| 9|
| 5| FE 등록 v1/v2 + 외부 SSO| fe-entry| entry/v1, entry/v2, external-link| 8| 6| 4| 18|
| 6| FE 관리자| fe-admin| admin/list, admin/stat| 6| 3| 2| 11|
| 7| FE 부가 도메인| fe-addon| addon/*| 7| 4| 3| 14|
| **합계**| —| —| —| **51**| **29**| **11**| **91**|

**Points to note:**
- Phases 1~3 (BE) E2E 0 — no browser scenario can be built from infra/domain/API alone. Controller/Mapper Integration verifies the user entry points.
- Phase 4 (FE login) E2E 2 — login requires at minimum the golden path + a SecureKeypad-not-exposed NEGATIVE pair.
- Phase 5 (FE registration v1/v2 + external SSO) E2E 4 — 3 screens × 1~2 each. Aligned per screen (R9 alignment).
- Phase 7 (FE add-on domain) E2E weighted — new domain (R3) + final full integration regression.
- **R9 alignment**: each FE phase's E2E TCs cover only that phase's screen (Phase 4's 2 E2Es = login.html only. No bundling of other screens' E2E).
- Overall ratio: Unit 56% / Integration 32% / E2E 12% (close to the 60/30/10 goal).

---

### Example 2 — large full-stack work item ️ discouraged scenario (operationally rare — safety net only for the exceptional case where ≥ 2 domains arrive bundled and cannot be separated)

A TC-distribution pattern demo matching dev-planner example 2 (domain axis applied after the inseparable verdict). The operational standard is per-domain work-item separation, so apply this pattern only when received as the result of the *work-item splittability preliminary check* at dev-planner step 4.5:

> **Step-6.5 output guidance duty**: when qa-planner receives a domain-axis dev-plan, print one guidance line at the 6.5 review gate: *"BE 도메인 축 적용 — dev-planner 4.5에서 과업 분리 불가 판정 후 적용된 예외 케이스 안전망. 분리 검토가 누락된 것이 의심되면 dev-planner 재호출 권장"*.

The same 6-phase structure as dev-planner example 2 (after the inseparable verdict) (multi-stage BE 3 = infra + 2 domains, per-screen FE 3) → per-phase TC distribution:

| Phase| 페이즈명| slug| 화면| Unit| Int| E2E| 합계|
|:-:|---------|------|------|:---:|:---:|:---:|:---:|
| 1| BE 인프라 & 공통| be-infra| (없음)| 5| 2| 0| 7|
| 2| BE 주문 도메인| be-order| (없음)| 10| 5| 0| 15|
| 3| BE 재고 도메인| be-inventory| (없음)| 10| 5| 0| 15|
| 4| FE 주문 화면| fe-order| order/edit.html| 4| 3| 2| 9|
| 5| FE 재고 목록| fe-inventory-list| inventory/list.html| 3| 2| 1| 6|
| 6| FE 재고 상세 + 내역| fe-inventory-detail| inventory/detail.html| 5| 3| 2| 10|
| **합계**| —| —| —| **37**| **20**| **5**| **62**|

**Points to note:**
- Phase 1 (be-infra) Integration 2 = migration dry-run + common-module verification.
- Phase 2 (be-order) Unit 10 + Integration 5 — **domain-axis alignment**: order Service Unit + order Controller Integration **together**, self-contained within the phase. Not deferred to a `be-api` phase (the domain axis has no `be-api`).
- Phase 3 (be-inventory) same pattern — the inventory domain self-contained.
- Phases 2 and 3 share only the `be-infra` parent in the dev-plan mermaid → BE phase review is self-contained per domain.
- Phases 4~6 (FE) E2E 5 = 3 screens × 1~2 each. Aligned per screen (R9 alignment).
- Overall ratio: Unit 60% / Integration 32% / E2E 8% (close to the 60/30/10 goal).
- **Domain axis vs layer axis review-unit difference**: in layer-axis example 1 you must reach the `be-api` phase to confirm true behavior (`be-service` is Mock Mapper Unit only). In domain-axis example 2 the `be-order` phase itself can confirm the order API works OK (the review unit is self-contained).

---

### Example 3 — small REST API feature (R9·R10 not applied)

Aligned with dev-planner example 4 → 3 phases, no screens = 0 E2E:

| Phase| 페이즈명| slug| Unit| Int| E2E| 합계|
|:-:|---------|------|:---:|:---:|:---:|:---:|
| 1| DTO·Mapper·Service| phase-1-data| 8| 4| 0| 12|
| 2| Controller + API 스펙| phase-2-api| 4| 6| 0| 10|
| 3| 배포 준비| phase-3-deploy| 0| 2| 0| 2|
| **합계**| —| —| **12**| **12**| **0**| **24**|

> **R9·R10 not applied**: no screens, not full-stack. 0 E2E (Integration verifies the user entry points).

---

### Example 4 — small full-stack (R9 + R10 applied, BE 1 + FE 1 = 2 phases)

Aligned with dev-planner example 3 (the 농민수당 8888 pattern) → BE 1 + FE 1 = 2 phases:

| Phase| 페이즈명| slug| 화면| Unit| Int| E2E| 합계|
|:-:|---------|------|------|:---:|:---:|:---:|:---:|
| 1| BE 인프라 & API & Generalize| be| (없음)| 8| 5| 0| 13|
| 2| FE 단일 화면| fe-{화면-slug}| {화면}.html| 4| 3| 2| 9|
| **합계**| —| —| —| **12**| **8**| **2**| **22**|

> **R9 alignment**: the FE phase is a single screen → the 2 E2Es (golden path + NEGATIVE) cover only that screen. R10 single-BE pattern (slug `be`) → the BE phase has 0 E2E.
