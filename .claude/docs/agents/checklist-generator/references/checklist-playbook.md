# checklist-playbook — deployment-check item derivation rules (single source)

> Consumer: `checklist-generator` agent, step 3. Sheet composition, columns, and the JSON spec have `checklist-schema.md` as their single source — this document covers only **what goes in and what stays out**.

---

## §1. Inclusion criteria (all must hold for an item to be promoted)

1. **A developer must verify it by hand** — anything the automated pipeline (build, tests, review) already guarantees is not an item.
2. **This development work is the cause** — it is a brief requirement, or an effect this diff created. General operations common sense (disk capacity etc.) does not go in.
3. **Failure leads to an operational outage, data corruption, or a business error** — items whose consequence is harmless are noise.

> Requirements (brief §3·§8) are **included exhaustively** as a principle — a requirement missing from the checklist is the worst omission.

## §2. Exclusion rules (no perfunctory items — violations are removed in Self_Check)

The following go in **no sheet whatsoever**:

- Build success (the project build command) / no compile errors
- Server start/restart success, health-check response
- Unit/integration tests passing, coverage %
- code-review / MR approval done, commit/merge done
- Doc comments, conventions, static-analysis compliance
- Vague items like "로그 확인" whose **action and expected result are unspecified** (allowed if it names a specific log keyword or a specific error situation)

> However, when a formality step carries **a verification target unique to this development work**, such as "재기동 **후 스케줄러 재등록 여부**" or "기동 **시 신규 설정 키 로드 확인**", promote only that unique part into an item.

## §3. Per-sheet derivation rules

### Sheet 1 — 요건검증

- **At least 1 row per requirement** in brief §3 (requirements) and §8 (special requirements). If a requirement spans several screens/APIs, split it by verification unit.
- Write the check method as **a verification procedure in the production (or staging) environment** — "코드에 구현됨" is not a check.
- No brief (diff-based) → state `브리프 없음 — diff 기반 도출` in the first row, then write feature-verification items reverse-derived from the diff.

### Sheet 2 — 화면동작 (mandatory · non-developer audience)

- **This sheet must always exist.** If there is no screen change at all, one row "해당 없음 — {사유}" (the reason also in non-developer wording — e.g. "화면 변경 없음 — 서버 내부 처리만 변경").
- **The reader is a non-developer (business/planning staff) who does not read the brief or the plan.** Write every cell as a self-contained sentence understandable on its own — no notation like "브리프 §N 참조", and no developer terms such as classes, methods, API paths, filenames, or query mappings (except developer-only rows).
- **분류 = Korean menu name + feature** (e.g. `주문관리 > 주문현황 · 엑셀 다운로드`). Confirm the menu name from brief §4 (business↔code mapping), §7 (screen map), and the screen template's title. **Only when the menu name cannot be determined**, substitute the filename and leave "메뉴명 미확인" in the 비고 column.
- Seed: if the phase test plan's §5-2 기능 검증 체크리스트 exists, **bring it in and reinforce it from the deployment viewpoint** (no duplicate rewriting) — but rewrite even the imported items in non-developer wording.
- Minimum per screen: ① entry path (menu path) ② key operation scenarios (register/edit/delete/query etc. — the operations this development targets) ③ expected results (visually verifiable on the screen) ④ exception paths this development touched, such as permissions and invalid input.
- **Developer-only rows**: checks a non-developer cannot perform (direct API calls, server-log checks, devtools checks, forced browser-cache refresh, etc.) also go in this sheet if screen-related, but write the JSON row as `{"cells": [...], "dev": true}` (→ yellow background) and mark `[개발자 전용]` in the 비고 column. Only in these rows use technical wording fit for developers (URLs, API paths, log keywords).
- When static assets (JS/CSS) change, add a **browser cache refresh verification** item (hard refresh, version query) — as a **developer-only row**.
- This sheet has no 환경/근거 columns (schema §3) — the basis is not shown, but derivation itself still follows the §1 inclusion criteria and the §4 basis principle (no items without a basis).

### Sheet 3 — DB작업 (production-deployment queries)

- Targets: DDL (ALTER/CREATE TABLE/INDEX/SEQUENCE), DML (code-value INSERT/UPDATE, migrations), and GRANT/permissions from the diff and the plan.
- State the **execution order (순번)**, and if there is an order dependency, write the reason in 비고.
- Mandatory per row: pre-execution checks (backup, lock impact, target-count SELECT), post-execution verification query, and a **rollback method** (if impossible, state "롤백 불가 — 사유").
- For ALTER, leave a production data-volume/lock-time caution in 비고 (if no basis, use "규모 미확인 — 실행 전 건수 확인").
- Record the step-4 schema-meta comparison result (already applied / not applied) in 비고.

### Sheet 4 — 서버·설정

- Targets: config **key names** (no values — Security_Rules), environment variables and runtime arguments, schedulers/batch (period registration, re-registration on start), external integrations (API key issuance, IP allowlisting, callback URLs), infrastructure (reverse proxy, ports, firewall, certificates), log configuration.
- If the deployment targets differ per environment (dev/staging/production), split rows or distinguish with the 환경 column.
- If the diff changes a config file that the plan does not mention, promote it to an item with the basis `diff: {파일명}`.

### Sheet 5 — 영향도·회귀

- **Common-module changes** (projects whose `project.yaml projects[].role` is a common library, and `sharedModule`): Grep for usages of the changed classes/methods → enumerate the affected modules/screens/APIs and write representative regression-verification items.
- **Existing-file MODIFY**: items verifying that the modified existing feature's original behavior is preserved (paths outside this requirement).
- **Integration impact**: external systems in brief §6 — the counterpart system's deployment/config prerequisites.
- If the usage search result is vast, narrow to high-impact usages (usage frequency, critical business), but state the narrowing in 비고 (no silent omission).

## §4. Basis notation rules

- The 근거 column of every row (**except the 화면동작 sheet** — it has no 근거 column): the formats `브리프 §3-2` / `계획서 phase-2 §4` / `테스트계획 §5-2` / `diff: {파일경로}` / `schema 메타 대조`.
- An item without a citable basis is **not written** — no guessing. Generalities that "seem necessary" violate §1-2.
- On finding a contradiction between documents (in the plan but not in the diff = suspected unimplemented), do not make it an item — report it in the result return's omissions/unverified section.

## §5. Priority rules

| Grade | Criterion | Examples |
| --- | --- | --- |
| P0 | Immediate outage or data corruption if skipped | Missing production ALTER, required config key not applied |
| P1 | Core business flow malfunctions | Main screen behavior, requirement verification |
| P2 | Partial feature / conditional errors | Exception paths, regression checks |
| P3 | Usability / display level | Wording, alignment, cache |

**The 화면동작 sheet uses Korean labels instead of P grades** (non-developer readability): P0·P1 → `높음`, P2 → `중간`, P3 → `낮음`.

In-sheet sorting is P0 → P3 (화면동작: 높음 → 낮음); only the DB작업 sheet sorts by **execution order**.
