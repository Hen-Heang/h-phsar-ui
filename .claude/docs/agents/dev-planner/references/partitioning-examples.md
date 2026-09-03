---
name: partitioning-examples
description: 페이즈 분할 6개 실 사례 — 풀스택 BE 레이어 축, 풀스택 BE 도메인 축(비권장 예외), 풀스택 소형(BE 1 + FE 1), REST API, Batch, 초소형 3단계. dev-planner 페이즈 분할 검토 게이트 단계에서 Read.
---

# Phase Partitioning Examples

> 6 real cases to consult at the step-4.5 review gate and during partitioning decisions.

---

**Example 1 — large full-stack work item (R9 + R10 applied together, BE layer axis — web-fullstack / many screens, large infra share + 1 domain):**

Brief §11 with 15 steps + §7 screen map (로그인·관리자·등록 v1/v2·외부 SSO·부가 도메인) → **R9 + R10 + layer axis applied** → **multi-stage BE (3: infra→service→API) + per-screen FE (4) = 7 phases**:

| N| 페이즈명| 영역| slug| §11 단계| 포함 화면| 적용 규칙| 기간|
|---|---------|------|------|---------|---------|----------|------|
| 1| BE 인프라 & 공통 & 보안| BE| be-infra| 1,2,3| (없음)| R1 + R10 BE 다단계(레이어 축)| 2.5d|
| 2| BE 도메인 Service & Mapper| BE| be-service| 4,5,6,8,9,10| (없음)| R10 레이어 축| 2.5d|
| 3| BE Controller & API| BE| be-api| 7,11| (없음)| R10 레이어 축| 1.5d|
| 4| FE 로그인| FE| fe-login| (4 BE 후)| login.html, otp-modal| R9 + R10 + R4(Account 흡수)| 1.5d|
| 5| FE 등록 v1/v2 + SSO| FE| fe-entry| (BE 후)| entry/v1, entry/v2, external-link| R9 + R10 + R2(v1/v2 분리)| 4d|
| 6| FE 관리자| FE| fe-admin| (BE 후)| admin/list, admin/stat| R9 + R10 + R4(History 흡수)| 2d|
| 7| FE 부가 도메인| FE| fe-addon| 12,13,14,15| addon/*| R9 + R10 + R3(신규 도메인)| 3d|

> **Why the layer axis was chosen**: there is 1 domain (a consolidated domain) while the infrastructure (security, common config, cross-cutting modules) takes a 2.5d share → the layer axis is natural. BE phase review = true behavior is confirmed on reaching `be-api`.

---

**Example 2 — large full-stack work item** ️ **discouraged scenario (operationally rare)** — demonstrates the pattern reserved for the exceptional case where ≥ 2 domains arrive bundled in one work item and cannot be separated. The operational standard is **per-domain work-item separation** → if separable, each work item has 1 domain = handled naturally by the layer axis or a single BE. Apply this pattern only after an inseparable verdict (R9 + R10 + domain axis, web-fullstack / many screens, ≥ 2 domains + high independence, inseparable):

> **Preliminary check mandatory**: at the step-4.5 gate, ask the user *"도메인 ≥ 2개가 묶여 있는데 과업 분리 가능한가?"*. If separable, split into one-domain work items right away and recommend a dev-interview re-request. Only when inseparable, proceed with the 6-phase pattern below.

Brief §11 with 12 steps + §7 screen map (order, inventory, and user domains added at once; confirmed inseparable) → **R9 + R10 + domain axis applied (exceptional case)** → **multi-stage BE (3: infra + 2 domains) + per-screen FE (3) = 6 phases**:

| N| 페이즈명| 영역| slug| §11 단계| 포함 화면| 적용 규칙| 기간|
|---|---------|------|------|---------|---------|----------|------|
| 1| BE 인프라 & 공통| BE| be-infra| 1,2,3| (없음)| R1 + R10 BE 다단계(도메인 축)| 1.5d|
| 2| BE 주문 도메인| BE| be-order| 4,5,6| (없음)| R10 도메인 축 + R3(신규 도메인)| 2d|
| 3| BE 재고 도메인| BE| be-inventory| 7,8| (없음)| R10 도메인 축 + R3(신규 도메인)| 2d|
| 4| FE 주문 화면| FE| fe-order| 9| order/edit.html| R9 + R10| 1.5d|
| 5| FE 재고 목록| FE| fe-inventory-list| 10| inventory/list.html| R9 + R10| 1d|
| 6| FE 재고 상세 + 내역| FE| fe-inventory-detail| 11,12| inventory/detail.html| R9 + R10| 1.5d|

> **Why the domain axis was chosen (after the inseparable verdict)**: applied after the work-item-split verdict came back impossible — the 2 new domains (order, inventory) are mutually independent + the infra fits a single 1.5d phase → in the inseparable case the domain axis makes review units clear. Reviewing BE phase 2 (`be-order`) = the order API works OK / reviewing phase 3 (`be-inventory`) = the inventory API works OK. Each phase is a self-contained review unit. Phases 2 and 3 share only the `be-infra` parent → no direct dependency.

> **Emphasized again — the standard flow**: operationally, order and inventory arrive as separate work items as standard. When they arrive bundled, first *recommend a work-item split* at step 4.5. The 6-phase pattern above is the safety net for the inseparable exceptional case.

---

**Example 3 — small full-stack work item (R9 + R10 applied together — web-fullstack / 1 screen) (case study — other projects borrow only the "BE 1 + FE 1 = 2 phases" pattern):**

Brief §11 with 14 steps + §7 screen map (a single wizard screen) → **R9 + R10 applied together** → **single BE + single FE = 2 phases**:

| N| 페이즈명| 영역| slug| §11 단계| 포함 화면| 적용 규칙| 기간|
|---|---------|------|------|---------|---------|----------|------|
| 1| BE 인프라 & API & Generalize| BE| be| 1,2,3,4,5,8,9,10| (없음)| R1 + R10 단일 BE| 2d|
| 2| FE 농민수당 신청 화면| FE| fe-farmer-apply| 6,7,13,14| farmer/apply.html| R9 + R10| 1.5d|

> **R10 single-BE pattern**: if the estimated BE duration ≤ 3d, no multi-stage BE split is needed. The slug is simply `be`. With 1 FE screen there is also 1 FE phase (`fe-{화면-slug}`).

---

**Example 4 — small REST API feature addition (R9·R10 not applied — non-full-stack):**

Brief §11 with 5 steps, project type = REST API → **R9·R10 not applied** (no screens, not full-stack).

| N| 페이즈명| §11 단계| 적용 규칙| 기간|
|---|---------|---------|----------|------|
| 1| DTO·Mapper·Service| 1,2| R1(공통 인프라)| 1d|
| 2| Controller + API 스펙| 3| R4| 0.5d|
| 3| 배포 준비| 4| R5(보정 — 테스트 페이즈 폐지)| 0.5d|

> **Example of stating the partition rationale in §5-2**: "R9·R10 미적용 — REST API 마이크로서비스, 화면 없음. R1·R4·R5만 적용. 페이즈 §9 완료의 정의(DoD 종료 판정표)는 작성, §검증 방법(테스트 파일·커버리지)은 미생성(qa-plan 위임), implementer-local 신호 = 빌드 도구 테스트 GREEN."

---

**Example 5 — Batch Job (R9·R10 not applied):**

Brief §11 with 6 steps, project type = Batch → **R9·R10 not applied**.

| N| 페이즈명| §11 단계| 적용 규칙| 기간|
|---|---------|---------|----------|------|
| 1| Job 스캐폴딩 + Reader| 1,2| R1| 1.5d|
| 2| Processor + Writer| 3,4| (도메인 묶음)| 1.5d|
| 3| 스케줄러 등록 + 마무리| 5,6| R5(보정)| 1d|

> **Partition rationale**: no screens, so R9·R10 not applied. Split by the stages of the Reader-Processor-Writer pattern.

---

**Example 6 — tiny (3-step brief):**

| N| 페이즈명| §11 단계| 적용 규칙| 기간|
|---|---------|---------|----------|------|
| 1| 구현| 1,2| (자명)| 1d|
| 2| 마무리| 3| R5(보정), R7 허용 하한| 0.5d|

> The step-4.5 review gate is auto-skipped as an obvious case.
