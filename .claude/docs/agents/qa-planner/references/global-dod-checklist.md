---
name: global-dod-checklist
description: qa-plan 산출물 자체 통과 기준 — Failure_Modes_To_Avoid 안티패턴 목록과 Final_Checklist (산출물 self-check 항목). 8단계 페이즈 병렬 Write 직후 self-check 시점에 Read.
---

# qa-plan self-pass criteria (global DoD)

> Single source for the qa-planner output self-check. This file holds the body Success_Criteria item "required references/X.md Read at the right time" and the Final_Checklist items.

---

## Failure_Modes_To_Avoid (anti-patterns)

- **Reinterpreting the brief**: reinterpreting requirements stated in brief §3·§8 as "maybe it actually means this" → the brief is a contract. Convert it to TCs as-is.
- **Missing Task coverage**: some Tasks in development plan §7 have no corresponding TC → build the **Task ↔ TC mapping table** so an omission is detected immediately. Total Task count must equal the mapping-table row count.
- **Putting automatically measurable items in the §5 TC body**: creating §5 TC-body entries for auto-measured items such as coverage or API doc comments intrudes on qa-tester's automatic-execution territory + duplicates. Auto-measured items are classified only in the §4 *자동 측정 가능 품질 항목* section (no TC generated).
- **TC ID format deviation (phase markers)**: inserting a phase marker like `TC-WV-Phase2-CTRL-001` → breaks the qa-tester regex `TC-[A-Z]+-[A-Z]+-\d{3}`. **Absolutely forbidden.** Phase information is expressed by file location.
- **TC ID format deviation (group abbreviations containing digits)**: `TC-WV-E2E-001` (the `2` inside E2E) / `TC-WV-V1-001` / `TC-WV-API-V2-001` — digits or hyphens in the group-abbreviation slot break qa-tester parsing. **E2E is not a group but the Type field** (e.g. `TC-WV-LOGIN-001` + `**Type**: E2E`).
- **Phase slug mismatch**: the `{slug}` in a test filename differs from dev-planner's development filename `{slug}` → file-pair matching breaks. Use the slug extracted by regex from the dev `phase_files` paths, as-is.
- **Happy paths only**: each feature has only its happy path with no exceptions/boundary values → P2 TCs (exceptions/boundary values) are mandatory.
- **E2E over/under-generation**: generating E2E for a REST API project / 0 E2E for a Web project → follow the limit rules per project type.
- **Missing the Mapped Task field**: a TC without `Mapped Task` loses Task traceability → a **mandatory field** on every TC.
- **Duplicate TC IDs across phase documents**: TC-WV-CTRL-001 in Phase 2 and TC-WV-CTRL-001 in Phase 3 → must be **globally unique**. Numbering continues across phase boundaries (if Phase 2 has CTRL-001~010, Phase 3 starts at CTRL-011).
- **Missing parallel Write**: writing phase test documents sequentially → execution time grows with the phase count. **Single-message parallel Write is mandatory**.
- **Reading config files**: opening YML/Properties — absolutely forbidden.
- **Querying real data**: PostgreSQL `SELECT * FROM ...` — metadata only.
- **Misusing the legacy fallback**: no `phase_files` array = a legacy single plan. In that case do not force phase partitioning. Fall back to generating a single `{N}_test_plan.md`.
- **Handling only one legacy key (transition period only)**: looking only at `dev_brief` and ignoring `work_request` → silent failure when the hook or dev-planner filled only `work_request`. **Until the 2026 Q3 debt cleanup**, try both keys and use whichever is filled. Same for `dev_plan.root_file` ↔ `dev_plan.file_path`.
- **Violating the debt-cleanup order**: if removing dev-planner's dual-key writing (step 2) or the hook's single-key fix (step 3) lands before the qa-planner agent correction (step 1) → qa-planner cannot receive the input and fails silently. **Order: qa-planner → dev-planner → hook → Failure_Modes cleanup**. Skipping any one breaks compatibility.
- **Bypassing the step-6.5 review gate**: perfunctorily skipping the TC-distribution review and going straight to the step 7~8 Writes → a bad distribution invalidates all N phase test documents. **Step 6.5 is a user-agreement gate** — no bypassing. Auto-skip is allowed only for the obvious-partition case.
- **Violating R9 screen 1:1 (bundling/splitting E2E TCs)**: bundling several screens' E2E into one FE phase (slug `fe-*`), or splitting a single-screen phase into N per-wizard-step E2Es → **R9 violation**. A dev-planner phase = one screen's review unit. Its E2E TCs also cover only that screen. No bundling or splitting.
- **Generating E2E in BE phases**: creating E2E TCs in a BE phase (slug `be` or `be-*`) → the browser entry point is the FE phase. BE phases get Unit + Integration only.
- **Ignoring the BE split axis (axis-blind TC distribution)**: not auto-detecting whether the dev-plan phase slugs are layer-axis (`be-infra`/`be-service`/`be-api`) or domain-axis (`be-infra` + `be-{도메인}`) and distributing with one pattern → breaks review units. The **6-6-2 BE two-axis alignment rules** are mandatory.
- **Missing Integration in a domain-axis BE phase**: putting only Unit and 0~few Integration in a domain-axis `be-{도메인}` phase → breaks the phase review unit (that domain's API works OK). A domain-axis BE phase includes **both Service Unit + Controller Integration** so the phase is self-contained.
- **Received a domain-axis dev-plan but omitted the *exceptional-case guidance* at 6.5**: qa-planner receives a dev-plan partitioned on the domain axis but omits the one guidance line *"BE 도메인 축 적용 — dev-planner 4.5에서 과업 분리 불가 판정 후 적용된 예외 케이스 안전망. 분리 검토가 누락된 것이 의심되면 dev-planner 재호출 권장"* from the step-6.5 review-gate output → the user cannot recognize a possibly skipped preliminary check on the dev-planner side. **The operational standard is per-domain work-item separation** — a domain-axis dev-plan is a discouraged exceptional case, so the guidance is a duty.
- **MockMvc Integration in a layer-axis `be-service` phase**: writing Controller integration tests in the `be-service` phase → area intrusion. MockMvc Integration goes to the `be-api` phase. `be-service` covers Service Unit + at most 0~few Service↔Mapper Integration.
- **Ignoring mixed axes**: the dev-plan mixes the two axes like `be-service` + `be-payment`, and qa-planner distributes TCs as-is → condoning a dev-planner alignment-break signal. **At step 6.5, advise the user to have dev-planner re-partition at step 4.5**.
- **Ignoring the auto-chained flow**: even when entry was automatic via the `/dev-plan` skill dispatch after dev-planner returned, the step-6.5 review gate must still be printed to the user. Automatic *start* and automatic *pass* are different. No going straight to step 8 without printing the gate.
- **Missing the §5-2 기능 검증 체크리스트 (FE phases)**: not writing §5-2 for an FE phase (slug `fe-*`) or an R10-not-applied full-stack single phase with screens → the human-review territory (the essence of `프론트는 사람이 봐야 한다`) disappears from the output. Writing it is mandatory.
- **Writing §5-2 for BE phases**: writing §5-2 for a BE phase (slug `be` / `be-*`) or for REST API/Batch/Daemon/Library/Proxy/single service → there is no browser-review target, so it is an area intrusion. Do not write it.
- **Putting automatically measurable items in §5-2**: putting items automatic TCs can cover — response-code verification, DB persistence, HTTP status — into the manual checklist intrudes on qa-tester's automation territory + increases the human review burden. **§5-2 is limited to items automatic TCs cannot cover** (UX, accessibility, visual consistency, user-perceived flow).
- **Expressing §5-2 only as a per-phase review gate (missing the 시나리오 C feature-verification gate)**: stating only phase-end review and omitting the automatic-mode 시나리오 C gate meaning of *one feature verification after all phases end* → `/develop` automatic-mode users cannot recognize the feature-verification point. Stating *기능 검증 공식 게이트* in the §5-2 header and review-timing notes is a duty.
- **Not self-adding test/regression/coverage items to qa-plan**: the dev-plan phase §9 DoD is only the develop end-verdict table, not a test/coverage spec, and the §검증 방법(테스트 파일·커버리지) section is absent from dev-plan, so test-pass, coverage, and regression items are *not in the dev-plan output to begin with*. If qa-planner does not self-add these items to the qa-plan §6 global DoD checklist + §5 TC body → the integrated quality gate is missing. Area separation includes qa-plan filling that gap.
- **Intruding on qa-tester's delegated territory**: writing test-code bodies, execution results, or coverage % measurements in qa-plan → Scope_Boundaries violation. qa-plan goes up to **TC specs + mapping tables + the 기능 검증 체크리스트**. Code is written by qa-tester when the phase runs.

---

## Final_Checklist (output self-check)

- [ ] Does the test plan reflect, without omission, the requirements of brief §3·§8 and the development plan (root + the relevant phases)?
- [ ] Was the scope information consumed accurately from the meta JSON?
- [ ] Were existing test patterns (annotations, naming) explored and conventions matched?
- [ ] Does every Task exist in the Task ↔ TC mapping table, covered by at least 1 TC?
- [ ] Are auto-measured items (coverage, API doc comments, etc.) classified in the §4 자동 측정 가능 품질 항목 section, without duplicates in the §5 TC body?
- [ ] Do TC IDs match the `TC-[A-Z]+-[A-Z]+-\d{3}` regex? (Recheck that group abbreviations contain no digits/hyphens)
- [ ] Are TC IDs globally unique (no duplicates across phases)?
- [ ] Does the `{slug}` of each phase test file exactly match the `{slug}` of the dev-planner development file?
- [ ] Does every TC have a `Mapped Task` field?
- [ ] Does every TC consider happy + exception + boundary cases?
- [ ] Do the E2E TCs follow the project-type limit rules?
- [ ] Is the type ratio (Unit 60% / Integration 30% / E2E 10%) reasonable?
- [ ] **Is the TC total within the 6-2.5 cap formula?** (`기능 TC ≤ clamp(ceil(프로덕션 델타 라인 / 6), 4, 40)` + regression TCs separate). Were the formula and actual values recorded in root §4? If exceeded, was the reason recorded?
- [ ] **Are there no TCs verifying framework/library-guaranteed territory?** (Generated accessors/builders, annotation/decorator existence, serialization default behavior, ORM mapping itself — verifying someone else's code, not ours. Per-language list in the language pack's `test-schema-lang.md`)
- [ ] Is the P0~P3 priority distribution appropriate?
- [ ] Were both the root test plan (8 sections) + the per-phase test plans (7 sections × N) generated?
- [ ] Were the phase test documents generated with **parallel Writes**?
- [ ] Was the **step-6.5 TC-distribution review gate** passed? (For the obvious-partition case, is the skip stated?)
- [ ] Do FE-phase (`fe-*`) E2E TCs cover only that phase's screen? (R9 alignment — no screen bundling/splitting)
- [ ] Do BE phases (`be` / `be-*`) have 0 E2E TCs? (Integration owns the user entry points)
- [ ] Was the **BE split axis** (layer vs domain) auto-detected and TCs distributed per the 6-6-2 alignment rules? (Slug pattern + dev-plan §5-2 partition-rationale cross-check)
- [ ] **Does each domain-axis `be-{도메인}` phase include both Service Unit + Controller Integration**, making the phase self-contained? (Missing Integration breaks the review unit)
- [ ] **If a domain-axis dev-plan was received, does the step-6.5 review-gate output include the one line of *exceptional-case safety-net guidance + split-review recommendation***? (The operational standard is per-domain work-item separation; the domain axis is discouraged)
- [ ] **Is there no MockMvc Integration in a layer-axis `be-service` phase**, with MockMvc Integration in the `be-api` phase?
- [ ] If mixed axes (`be-service` + `be-payment`) were detected in the dev-plan, was a dev-planner step-4.5 re-partition recommendation given at step 6.5?
- [ ] Was the auto-chained flow (dev-planner step 4.5 passes → `/dev-plan` skill dispatch → qa-planner → step 6.5) recognized and the gate printed normally?
- [ ] For FE phases (`fe-*`) or R10-not-applied full-stack phases with screens, was the **§5-2 기능 검증 체크리스트** (7 universal + phase-specific) written?
- [ ] Is §5-2 not written for BE phases (`be` / `be-*`) and REST API/Batch/Daemon/Library/Proxy/single service?
- [ ] Is §5-2 limited to human-review territory (UX, accessibility, visual consistency), with no items automatic TCs can cover?
- [ ] **Do the §5-2 header + review-timing notes state the *시나리오 C 기능 검증 공식 게이트* meaning?** (Automatic mode: one feature verification after all phases end / default mode: per-phase self-check)
- [ ] Per the Scope_Boundaries area-separation table, was qa-tester's delegated territory (code bodies, execution results, coverage measurements) kept out of qa-plan?
- [ ] Were the test/regression/coverage items absent from the dev-plan output self-added to the qa-plan §6 global DoD / §5 TC body? (Area separation = qa-plan fills the gap — the dev-plan §9 DoD is only the develop end-verdict table, not a test/coverage spec, so qa-plan self-adds tests, regression, and coverage)
- [ ] Were the rules honored: no `.yml/.properties` reading, no encryption-token decryption, no real DB data queries?
