---
name: dev-gate
description: dev-backend·dev-frontend 등 구현 에이전트 공통 — 작업유형별 방법론(NEW=TDD / MODIFY=PRESERVE 특성화) + `{{config.test.command}}` GREEN/RED brake. 방법론 선택 단일 출처는 `testing.md`.
---

> **Single source**: this file is the master for 작업유형 (work-type) judgment, methodology selection, and the `{{config.test.command}}` GREEN/RED verdict and brake. Do not inline-copy methodology descriptions into a calling agent's body — edit only this file and every implementation agent picks it up automatically.

---

## 작업유형 judgment + methodology gate

Judge each implementation item's 작업유형 (NEW/MODIFY) (using the NEW/MODIFY distinction in the phase §3 implementation-target file table + the dev-planner 방법론 태그). **The single source for methodology selection = the *작업유형별 방법론 선택* table in `testing.md`** — do not duplicate detailed methodology rules in this document.

- **NEW items** (new items, pure units without external dependencies, etc.): skip the PRESERVE 게이트 below and enter the code-generation step (TDD/RED if needed — failing test first → implement → GREEN).
- **MODIFY items** (modifying an existing flow): before generating code, run the **PRESERVE 게이트** (DDD 특성화) first:
  1. **Identify the paths being changed** — check the inputs/outputs the item to be modified currently produces.
  2. **Write 특성화 tests** — tests that snapshot the current behavior as-is. Not correctness verification but *pinning the current state*. If external dependencies are strong, write them at the integration-test level.
  3. **Confirm GREEN** — the 특성화 tests pass against the current code (safety net in place), then enter the code-generation step.
  4. (Code-generation step = IMPROVE)
  5. **Confirm still GREEN after the change** — confirm there is no regression by checking that the 특성화 tests are still GREEN when `{{config.test.command}}` runs.

> No retroactive backfill: 특성화-test *only the paths touched this time*. No whole-legacy backfill (`testing.md` coverage principle).

---

## `{{config.test.command}}` — phase-end signal

After code generation + self-checks are complete, run `{{config.test.command}}` and confirm GREEN. This is the phase-end signal for this area. **If there were MODIFY items, also confirm that the 특성화 tests are still GREEN after the change** (= no regression), and state that result in the step-5 report.

> **What this step covers**: whether the generated/modified code *keeps the existing GREEN state*. If new tests were added, whether those tests are GREEN too.
> **What this step does _not_ cover**: formal regression, coverage % measurement, Task ↔ TC mapping verification, E2E scenario verification, integrated quality gates → all belong to the separate qa-plan / qa-tester phase areas.

### Verdict

| Result | Handling |
| --- | --- |
| Run succeeded + 0 failures + 0 errors | **GREEN** — enter the step-5 report |
| Run failed, or 1+ failures/errors | **RED — stop immediately** |
| Build/compile failure | Equivalent to RED — stop immediately |

### Auto-continue brake on RED

1. This agent does not proceed to the next step (auto-continue brake)
2. Write the step-5 report in *RED report mode* (`dev-report-format.md` template)
3. Main Claude outputs the RED result to the user verbatim and waits for input (the brake applies even in automatic mode)

### Handling on GREEN

1. Include the test-result summary line quoted verbatim in the step-5 report
2. Report to main that this area's *phase-end signal is GREEN*

> **Run options**: do not use filter options that select only specific tests (the goal is confirming GREEN for the whole suite). The run may take long, so set a generous timeout.
