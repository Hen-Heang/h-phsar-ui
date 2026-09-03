# Preparation proposal schema (output contract)

> Format of `{{config.outputDir}}/{taskId}_dev_prepare.md`, the only artifact `/dev-prepare` writes.
> This document is a **proposal** — not an execution artifact. DDL and config-change statements live only in code blocks; humans execute them.
> Style: telegraphic (noun-phrase endings, one line per item) — single source `docs/agents/common/artifact-style.md`.

---

## Document status (§1 `Status` value)

| Value | Meaning |
|---|---|
| `DRAFT` | just written; prerequisites have only been handed to humans |
| `WAITING` | `--verify` ran but BLOCKING items remain |
| `READY` | every blocking item ☑; `dev-plan` may take this document as premise |

If there are zero blocking items to begin with, write `READY` at creation time.

## Item ID rules

- Human prerequisites = `A-1`, `A-2` … (§2)
- Minimization decisions = `B-1`, `B-2` … (§3)
- IDs are **never reused or renumbered.** `--verify` re-runs and revision requests keep existing IDs — the plan and phase documents point at this document through these IDs.
- Status marks are `☐` (open) / `☑` (done) only.

---

## Field notes (kept out of the schema body)

These rules govern what goes in the cells; they are **not** copied into the artifact.

- **§1 brief hash** — Why the brief hash is pinned: if the brief changes afterwards, it must be possible to judge **which brief** this proposal's premises belong to. Planning against a brief with a different hash silently divorces premises from plan.
- **§2 `Target`** — `Target` is the project (and module) the item lands in — `workspace` for workspace-wide items. Without it, a multi-project workspace leaves the owner guessing which project to touch and the plan unable to derive file paths.
- **§3 columns** —
  - `Rung` is L0–L5 (`minimization-ladder.md`).
  - `Evidence` is `file:line` or `brief §N`. Decisions without evidence are not written.
  - `Saved` is the estimated number of development tasks this decision removes. Leave it blank without a basis — never invent numbers.
  - `Approval` is one of `autonomous` / `approved ({datetime})` / `deferred` / `rejected`. L0·L2 can never be `autonomous`.
- **§4** — `dev-plan` reads the sentences below as **completed facts** and plans on them. Each sentence points at §2/§3 item IDs.
- **§5** — Why this table exists: it is the record that keeps the next run from repeating the same proposal. Never delete rows without a reason.
- **§6** — Exploration gaps like `{agent} skipped — {reason}` also go here.

---

## Schema body

````markdown
# Preparation proposal — {task-number} {topic}

## 1. Meta

| Item | Value |
|---|---|
| Task number | {N} |
| Topic | {one line} |
| Base brief | {path} |
| Base brief SHA-256 | {hash} |
| Target projects | {primary} (+ related) |
| Date | {YYYY-MM-DD} |
| Status | DRAFT \| WAITING \| READY |

## 2. Human prerequisites

| ID | Kind | Target | Owner | Blocking | Status | Summary | Evidence |
|---|---|---|---|---|---|---|---|
| A-0 | Code home | {project}/{module} | Infra | BLOCKING | ☐ | Register the new module (pipeline · build manifest · harness) | brief §2 |
| A-1 | DDL | workspace | DBA | BLOCKING | ☐ | Create new order-history table | brief §3-4 |
| A-2 | Config change | {project} | Infra | BLOCKING | ☐ | Add external integration endpoint setting | brief §8-2 |
| A-3 | Human decision | {project} | Product | NON-BLOCKING | ☐ | Finalize retention-period policy | brief §9 |

### A-1. {summary}

- **Target**: {project}/{module} \| workspace
- **Why a human**: {one line — which of access, policy, or query constraints}
- **Execution statement**:
  ```sql
  -- vendor syntax per {{config.db.vendor}}
  CREATE TABLE {table} ( ... );
  ```
- **Verification**: {auto-judgeable via schema metadata / needs human reply — state which}
- **Rollback**: {how to revert. If irreversible, state "impossible — back up first"}
- **Duration**: one-off \| temporary (end condition: {…}) \| permanent
- **Owner · effort**: {owning team} / {estimated effort}

(Repeat the same format per item. Required fields and per-kind differences: single source `human-task-catalog.md`.)

## 3. Minimization decisions

| ID | Requirement | Rung | Decision | Evidence | Saved | Approval |
|---|---|---|---|---|---|---|
| B-1 | Add order status | L1 | handled by a code value — no code change | brief §5-1 / `db-meta-manager` report | 2 tasks | autonomous |
| B-2 | Stock-alert screen | L3 | reuse existing notification component | `src/.../NotifyPanel:41` | 3 tasks | autonomous |
| B-3 | Monthly aggregation | L2 | manual ops run instead of a new batch | brief §11 | 4 tasks | approved ({datetime}) |

## 4. Plan premises (dev-plan input)

- A-0 done — the code lives in {project}/{module}. Plan every file path from that root (an unregistered project has no path to plan against).
- A-1–A-2 done — plan the implementation assuming the new table and setting are applied (prerequisites never become development tasks).
- B-1 adopted — order status is handled by adding a code value. No new state-management code.
- B-3 adopted — monthly aggregation is a manual ops run. No batch is built.
- (if any are unfinished) A-3 open — retention period undecided. Keep the related implementation in the plan but leave "apply the value once the policy is fixed" in the DoD.

## 5. Rejected & deferred

| ID | Proposal | Outcome | Reason |
|---|---|---|---|
| B-4 | drop notification feature from scope (L0) | rejected | mandatory requirement — product confirmed no substitute |
| B-5 | manual bookkeeping of approval history (L2) | not adopted | audit-trail item — red line |

## 6. Residual risks

| Premise | What becomes invalid if it breaks |
|---|---|
| A-1 (table creation) | every related phase — no storage path, so neither implementation nor tests can run |
| B-3 (manual operation) | if the ops burden exceeds the estimate (monthly), batch development must be re-planned |

````

---

## self-check (before saving)

1. §1 status and base-brief hash are filled.
2. Every §2 item has **target / why-a-human / execution statement / verification / rollback / duration / owner**.
3. §2 created no `.sql` file paths — execution statements exist only inside code blocks.
3-1. Every §2 item's `Target` is filled (`workspace` counts). With more than one entry in `project.yaml` `projects[]`, a blank Target is a defect, not a shorthand.
4. Every §3 decision has evidence (`file:line` or brief §). No L0/L2 item has `Approval` = `autonomous`.
5. §3 contains no decision demoting a red-line item (input validation, authentication/authorization, personal data, audit logs, transaction boundaries, tests) to L0/L2.
6. Every §4 premise points at §2/§3 item IDs. No premise without an ID.
7. No cell is filled with "TBD" / "needs confirmation" / "unconfirmed" — those are questions, not content to save.
8. Nothing outside this document was modified, the brief included.
9. Every cell and bullet is telegraphic (noun-phrase ending, one line per item) — `docs/agents/common/artifact-style.md`.
