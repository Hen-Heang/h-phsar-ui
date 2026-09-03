# QA verdict contract (qa-verdict-contract)

> **Single source for the input/output contract that the convergence-loop owner (the caller — human or orchestrator) requires of the QA stage.**
> Pipeline role split: develop implements only, qa-test does QA only, and the "RED → re-implement → re-test" convergence loop is owned by the **caller**. The current QA implementation is the `/qa-test` skill (→ `qa-tester` agent), but as long as this contract is honored, the convergence decision keeps working even if the QA implementation is swapped — the implementation may change, the requirement remains.
>
> The owner of the report's **full format** is `qa-tester`'s `<Output_Format>`. This document pins down only **the minimal set that consumers read mechanically** — anything not listed here the implementation is free to change.

---

## Consumer list

| Consumer | What it reads |
|---|---|
| Human (convergence decision on the manual path — develop's completion guidance points to this flow) | Status line → DoD objective-item check, failure list/details → input for the `/develop` re-invocation |
| Human (direct `/qa-test` invocation) | Full report |
| `dev-autopilot` (once per task, right before review — `autopilot-orchestrated`) | Verdict receipt JSON (`qa-verdict-{N}.json`) → qa step proof, `skippedE2E` → MR description |

The unattended path's **phase convergence loop** is still not a consumer of this contract — round evidence is the machine measurement of `qa-collect.mjs` (direct build execution + xUnit XML parsing). On the unattended path, `/qa-test` appears exactly once, as **test-plan conformance verification after all phases are GREEN**, and its output is consumed as a receipt, not a report (orchestrator mode — `qa-test/SKILL.md` is the single source).

## Input contract (invocation arguments)

```
/{QA스킬} {과업번호} [phase-{N}[-{slug}]] [unit|integration|e2e]
/{QA스킬} {테스트 계획서 파일 경로} [e2e]
```

- Phase filter: run only the TCs of the given phase. Phase convergence decisions are always invoked in the `{과업번호} phase-{N}` form.
- Type filter: based on the TC `Type` field. TCs outside the filter are not run and are tallied as "필터 제외".

## Return contract (elements consumers read mechanically)

RED verdict criterion: **1 or more failures = RED, 0 failures = GREEN.**

| # | Element | Shape | Consumed by |
|---|---|---|---|
| 1 | **Status line** | `상태: GREEN/완료` or `상태: RED/확인 필요` — these two strings are the machine signal | DoD check in the convergence decision (the test-GREEN item) |
| 2 | **Summary table** | Total tests / passed / failed (/skipped) counts | Verdict-basis verification (if it contradicts the status line, distrust the report) |
| 3 | **Failure list** (when RED) | Per row: TC ID · test (class#method) · type · failure cause | Re-implementation re-invocation — the input for "고칠 위치 전달" (conveying where to fix) |
| 4 | **Failure details** (when RED) | Per TC: expected result vs actual result vs difference | Goes verbatim into the re-implementation prompt |
| 5 | **Characterization TC distinction** | Characterization TCs are reported separately from regular TCs — RED after a change = regression detection (working as intended) | DoD characterization-item check in the convergence decision |
| 6 | **Precondition table** | OK/FAIL for build · test-file existence · E2E access | When the failure list is empty but the verdict is RED, this is the consumer's basis for identifying an environment problem (not solvable by re-implementation) |
| 7 | **Per-phase tally** (for phased input) | Per-phase table of type · passed · failed · status | Confirms that only the invoked phase's TCs were run |

- The implementation must capture the actual execution output before judging — no assumed PASS, no ignoring exit codes, no silent retries (a verdict without evidence cannot be verified by the consumer).
- On precondition failure, do not proceed in an incomplete environment; report immediately — "tests could not run" and "tests failed" must never look the same.

## Replacement rules

To switch to a different QA implementation (an external test-management system, CI-driven QA, etc.):

1. Provide the input argument format above and return elements 1–6 (including 7 if phased) as-is. In particular, the `GREEN`/`RED` strings in the status line.
2. Change only what the convergence-loop owner invokes to the new skill — the convergence decision looks only at the contract, so it needs no changes.
3. Swapping the test runner or language level is unrelated to this contract — `qa-tester` already delegates execution commands to the language pack's test skill, so it ends at that layer.
