# Human prerequisite tasks (kinds · required fields · verification)

> Per-kind spec for `/dev-prepare` §2 items. This skill **proposes** items; humans execute them.
> Execution statements live only inside the proposal's code blocks — never create `.sql` or script files.

---

## Kind table

| Kind | What | Default owner | Completion check | Brief source |
|---|---|---|---|---|
| `Code home` | securing the place the code will live — new repository, CI/pipeline entry, build-manifest module entry, harness registration | Infra / DevOps (harness entry: the developer) | human reply | §2 |
| `DDL` | create/alter tables, columns, indexes, sequences | DBA | **auto-judgeable** — schema metadata query | §3-4 |
| `DML` | code-value INSERTs, seed data, migration | DBA / Ops | human reply | §5 |
| `Config change` | production config files, env vars, endpoints, schedule registration | Infra / Ops | human reply | §8-2 |
| `Access/account` | account issuance, permission grants, certificate/key issuance, firewall openings | Security / Infra | human reply | §6, §8-1 |
| `External request` | external system integration requests, third-party approvals, spec delivery | Product / owning team | human reply | §6, §8-4 |
| `Human decision` | settling undecided policy or business-rule items | Product | human reply | §9 |
| `Ops procedure` | work humans keep performing after an adopted L2 decision | Ops | human reply | §3 B-items |

**Only DDL is auto-verified.** Schema metadata queries are allowed but SELECT on real data is forbidden (security policy), so everything else can only be confirmed by human reply. Marking unseen work as done puts the plan on a false premise.

---

## Required fields per kind

Common to every item: **target / why-a-human / execution (or request) statement / verification / rollback / duration / owner · effort**.

**Target** names the project (and module) the item lands in. In a multi-project workspace an item without a target is unusable — the owner cannot tell which project to touch, and the plan cannot derive file paths. Use `workspace` for workspace-wide items.

### Code home

Where the new code lives is a human prerequisite, not a development task: creating a repository, opening a pipeline, and registering a module are all outside what this pipeline may do. Left to the plan stage it surfaces as "new project — unregistered, register after approval", and implementation stalls on a missing path.

- Placement decision, one line: `new repository {name}` or `module {name} inside {existing project}`. Evidence = the `projects[]` lookup in the preloaded `project.yaml` + the similar project/module entry point from the `code-investigator` report. State placement before the checklist — every checklist item depends on it.
- Request statement = **registration checklist** (only the applicable lines):
  1. repository creation + access for the working members (new-repository placement only)
  2. CI/pipeline job entry
  3. multi-module placement — add the module to the **build manifest's module list**, in `{{config.build.tool}}` syntax
  4. harness registration — `/config-update {name}` (registers `project.yaml` `projects[]` + `scope.yaml`). Add the line "do not hand-edit `.claude/config/*` — it is a build artifact and the edit is lost on `we-adp update`".
- Verification: human reply. Item 4 alone may carry a **supporting basis** — whether the name appears in `project.yaml` `projects[]` (readable). It is a basis attached to the question, never an automatic ☑; registration also covers `scope.yaml` and the instance source, which this skill does not judge.
- Rollback: how the repository/module is withdrawn. Once pushed or deployed, state "expensive to reverse — rename instead of removing".
- **Always BLOCKING.** With no place for the code there is no file path, so neither the plan nor the tests can be written.

### DDL

- Execution statement: target tables, columns, types, constraints, comments included. Vendor syntax per `{{config.db.vendor}}`.
- Quote the actual column types and comments of similar tables from the `db-meta-manager` report — never guess types.
- Verification: state the schema-metadata condition (which table/column existing means done).
- Rollback: the reverting statement. If it cannot be reverted once data lands, state "impossible — back up first".
- For column adds and type changes, one line on the existing-data impact (e.g. default value when adding NOT NULL).

### DML

- Execution statement: the **complete list** of values to insert. Never abbreviate with "etc." — a human runs that list verbatim.
- Cross-check code values against the brief §5 code dictionary and record the result of the collision check.
- Verification: human reply. Write the expected reply wording into the proposal (e.g. "reply: 3 code values registered").
- Rollback: the statement deleting the inserted values + the fact that deletion becomes impossible once referencing data exists.

### Config change

- A **change request** instead of an execution statement: which key, to which value. Production config files cannot be opened, so **never assert the current value** — "{key}: add/change to {value} (current value unconfirmed — no read access)".
- For values needing encryption (`ENC(...)` etc.), never write the value itself — write only "inject via the production encryption procedure".
- Rollback: restore the previous value. If the previous value is unknown, list "back up the current value first" as a precondition.

### Access/account

- Request statement: subject (account/role/certificate), scope (which system, which tables, which paths), period.
- Ask for least privilege. Broad grants never get revoked.
- Rollback: how to revoke.

### External request

- Request statement: target organization/system, needed deliverables (spec documents, test accounts, integration approval), lead time.
- **Always state the lead time** — this kind is discovered latest in the schedule and waits longest.
- Blocking judgment: BLOCKING if implementation is impossible without the spec.

### Human decision

- Question statement: what must be decided + **the options and how each changes the implementation**.
- Take items straight from brief §9 (open questions), but raise only those that fork the implementation. Non-forking ones are NON-BLOCKING.

### Ops procedure (adopted L2)

- Procedure statement: what the human does each time, in order.
- Burden: expected volume/week · time per case · owning team.
- Duration: `temporary (end condition: …)` or `permanent`. Permanent keeps the human-approval note in §3's Approval column.
- Rollback = "build the automation" — one line on what would need building to reverse it.

---

## Blocking judgment

| Verdict | Criterion |
|---|---|
| `BLOCKING` | implementation and tests cannot start without it (**no place for the code**, no storage path, no integration spec, unresolved implementation fork) |
| `NON-BLOCKING` | implementation can proceed; must be closed before deploy/operations |

`--verify` raises the status to `READY` only when every BLOCKING item is ☑. Unfinished NON-BLOCKING items stay in the plan's premises as "open".

---

## Hand-off format

Summarize in the completion notice in a **copy-and-send form**. The human may receive only this summary without ever opening the document:

```
A-0 [Code home/Infra] Register {name} as a module inside {project} — 3 items: pipeline, build manifest, harness (/config-update)
A-1 [DDL/DBA] Create new order-history table — statement, verification, rollback in proposal §2 A-1
A-2 [Config change/Infra] Add external integration endpoint key (current value unconfirmed)
A-4 [External request/Product] Receive integration spec — 2-week lead time; implementation impossible without it
```
