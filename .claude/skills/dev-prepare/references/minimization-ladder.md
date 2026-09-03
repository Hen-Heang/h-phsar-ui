# Development minimization ladder (L0–L5)

> The judgment criteria behind `/dev-prepare` §3 decisions. **Check from the top; stop at the first rung that holds.**
> The goal is not writing less code but **keeping code that need not exist out of the plan.** Every task that enters the plan carries implementation, test, review, and deployment cost.

---

## The ladder

| Rung | Meaning | Holds when | Approval |
|---|---|---|---|
| **L0** | don't build | the requirement is **already met by an existing feature, screen, or report**; users can get the same result another way | **human approval required** |
| **L1** | data/config only | zero code change; a code value, parameter tweak, schedule registration, or permission grant finishes it | autonomous (execution moves to a §2 A-item) |
| **L2** | manual operation | an operational procedure (running a query, manual entry, spreadsheet work) replaces the code | **human approval required + burden quantified** |
| **L3** | reuse existing asset | a shared library, shared module, similar screen, or similar service is used as-is or cloned | autonomous |
| **L4** | extend existing code | add columns, branches, or fields to an existing class, screen, or query; no new class. **Also applies at code-home granularity** — a module inside an existing project | autonomous |
| **L5** | build new | none of the above holds. **One line on why L0–L4 do not apply is mandatory.** At code-home granularity this is a new repository | autonomous |

Why L5 demands its one line: skipping the ladder and landing straight on L5 is the default failure. Without that line, the judgment was not made — it was skipped.

---

## L0 — scope-exclusion proposal

- Evidence must be **`file:line` or a screen path**. "Something similar probably exists" is not evidence.
- Question format (`AskUserQuestion`, one question):
  - Question: "{requirement} is met by {evidence: existing feature/screen}. Remove it from development scope?"
  - Options: `Exclude (recommended)` / `Keep developing` — each option's description states **the path users will actually take if it is dropped**.
- If rejected, record it in §5 with the reason and re-judge from the next rung down.

## L2 — manual operation

The most dangerous rung. The development disappears, but **the burden may stay with humans permanently.**

- Always quantify when proposing: **expected volume/week · time per case · owning team · duration**.
- `Duration` is one of `one-off` / `temporary (end condition stated)` / `permanent`. **Permanent manual operation can never be the recommended option** — recommend only temporary (automation date or end condition stated).
- If adopted, it enters §2 as an A-item (kind `Ops procedure`) and §4 records "this feature is not developed."
- Do not propose without the burden numbers. Handing humans an unquantified burden is not a judgment — it is a transfer.

## L3·L4 — reuse & extension

- L3 evidence is brief §10 (reusable assets) or a `file:line` from the `code-investigator` report.
- L4 names the **extension point** — which class, screen, or query gains what. If the point is not pinned down, it is L5, not L4.
- If reuse covers only part of the requirement, split the covered and remaining scope. Lumping it as "reusable" blinds the plan to the remainder.

**Code home (where the code lives) is judged on the same two rungs**: a module inside an existing project (L4) is checked before a new repository (L5). A new repository multiplies the human prerequisites — repository, pipeline, build manifest, harness registration — so L5 here costs far more than L5 inside one class.

- Whichever rung wins, the placement becomes a §2 A-item (kind `Code home`); §3 only records the judgment.
- **Exception to autonomy**: if the judgment differs from the brief §2 system decision, it needs human approval (`SKILL.md` step 5 question 4). The brief is an already-verified contract; a placement flipped without approval moves the whole plan's file paths.

---

## Red lines — never candidates for minimization

The following are never demoted to L0 (exclusion) or L2 (manual). **Look for cheaper ways to build them, but never propose removing them or handing them to humans.**

- input validation (value checks at trust boundaries)
- authentication and authorization checks
- personal-data handling procedures
- audit logging
- transaction boundaries
- tests

Also, **proposing to hand money, permission changes, or personal-data handling to manual human work is forbidden** — the audit trail breaks.

Items in brief §6 (external communication security spec) and §8-1 (security requirements) are `security-auditor` verdicts, so this skill does not roll them back. If they look reducible, write that in §5 with the evidence and **hand it to a human** — never adopt it.

---

## Judgment order (per requirement item)

```
0. Once per task: judge the code home (L4 module vs L5 new repository) from brief §2 + project.yaml projects[]
1. Pick one requirement from the brief (per §4 mapping / §7 screen map / §11 implementation order)
2. Does it hit a red line? → if so, drop it from L0/L2 candidacy and judge from L3
3. L0 holds? → human approval question → adopt/reject
4. L1 holds? → adopt (move execution to a §2 A-item)
5. L2 holds? → quantify the burden → human approval question → adopt/reject
6. Check L3 then L4 → adopt
7. Otherwise L5 + one-line reason
```

Every rung's judgment leaves evidence. If the evidence is missing and no judgment can be made, **do not decide — ask.** A minimization decision without evidence does not shrink the plan; it drops a requirement.
