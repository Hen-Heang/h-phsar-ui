---
name: dev-prepare
description: 개발 브리프에서 개발 착수 전 사람이 먼저 끝내야 할 준비(DDL·코드값·설정·권한·외부 요청·의사결정)와 개발 최소화 결정을 1페이지 제안서로 만든다 — 계획(dev-plan) 전에 실행. 제안만 하며 파일 수정·코드 작성·DDL 실행은 하지 않는다. 사용자가 "dev-prepare", "사전 준비", "선행작업", "DDL 뽑아줘", "개발 최소화", "안 만들고 되는 방법" 등을 언급하면 이 스킬을 사용한다.
argument-hint: "{task-number | brief-filename} [--verify]"
---

# /dev-prepare {task-number | brief-filename} [--verify]

From a development brief, produce a one-page proposal (`{{config.outputDir}}/{taskId}_dev_prepare.md`) covering **what humans must finish before work starts** and **how to shrink the development to its minimum**.

Why this stage exists: when work only a human can do (production DB changes, configuration changes, access grants) is buried inside a plan, implementation stalls right there. And when every brief requirement is developed as written, things a single config line or an existing asset could cover become code. This skill separates those two **before planning**.

---

## ★ Preload (always the first step)

Immediately on entering this skill, Read exactly **one file**:

| File | Purpose |
|------|------|
| `.claude/config/project.yaml` | all operating variables — `outputDir`, `projects[]`, `db.*`, `commonUtilsArtifact`, … |

`{{config.xxx}}` below resolves against those values. Read references **only right before use** (each point is marked).

---

## Core principles

1. **Propose only — change nothing.** The only permitted write is the one-page proposal (see "Write contract" below). Do not edit source, config, the brief, or the plan; do **not create** `.sql`/migration/script files; do **not execute** DDL or DML.
2. **Hand human work to humans.** Write each item with the verbatim execution statement, verification method, rollback, and owner — then hand it over. Do not do it for them.
3. **The plan assumes completion.** Proposal §4 "Plan premises" is `dev-plan`'s input. The purpose of this document is to keep prerequisite work from becoming development tasks.
4. **Judge minimization in ladder order** (L0 don't build → L5 build new). Decisions that shrink the requirement (L0) or shift work onto humans (L2) are **never adopted without human approval.**
5. **Red lines are never minimized.** Input validation, authentication/authorization, personal-data handling, audit logging, transaction boundaries, and tests are not L0/L2 candidates.
6. **No unsupported items — ask instead.** Never fill a cell with "TBD" or "needs confirmation" — an unsupported premise propagates untouched into the plan and the implementation.
7. **All questions are 1:1** (one question per message, `AskUserQuestion`). Ask only what needs approval; decide the rest autonomously.

### Write contract (the strongest rule)

| Allowed | one page: `{{config.outputDir}}/{taskId}_dev_prepare.md`. `--verify` updates **the same file only** |
|---|---|
| Forbidden | editing source/config files, editing the brief or the plan, creating `.sql`/migration/script files, executing DDL/DML, git operations (repository creation included), editing the build manifest, Writes to any other path |

- **DDL goes into code blocks inside the proposal — never into files.** A `.sql` file left on disk ends up on someone's execution pipeline. This document's output is "a proposal a human reads and judges"; execution happens through the human's own procedure.
- **Even if asked "make it a file" or "apply it right away" — don't.** This rule cannot be skipped by user instruction. In that case, answer with the proposal path and the owner, plus one line on why this skill does not execute.
- Subagent dispatch prompts also state **read-only / no writes**.

---

## Input format

```
$ARGUMENTS = {task-number | brief-filename} [--verify] [autopilot-orchestrated]
```

| Mode | Example args | Behavior |
|------|----------|------|
| Default | `055` / `055_dev_brief.md` | write a new proposal (see "Execution flow" below) |
| Verify | `055 --verify` | re-judge whether the existing proposal's prerequisites are done ("`--verify` mode") |
| Orchestrator | `055 autopilot-orchestrated` | run autonomously without questions ("Orchestrator mode") |

**Brief search order** (same as `dev-plan` step 2):

1. `{{config.outputDir}}/{taskId}_dev_brief.md`
2. `{briefFile}` relative to workspace root
3. Glob `**/{briefFile}`

If the argument is empty or malformed, print an error and stop (no proposal is written):

```
❌ Invalid argument: '{input}'

Usage:
  /dev-prepare {task-number}            (e.g. /dev-prepare 055)
  /dev-prepare {task-number} --verify   (re-check prerequisite completion)
```

If the brief cannot be found, list the three search paths, point to `/dev-interview` as the step to run first, and stop.

---

## Execution flow (default mode)

```
1. Confirm brief + load project.yaml + record brief SHA-256
2. Shortcut check (below) — if it applies, jump to 6
3. One dispatch of 2 parallel agents (db-meta-manager · code-investigator)
4. Draft: §2 human prerequisites + §3 minimization decisions
5. 1:1 questions for approval items only (L0 · L2 · unresolved owner)
6. Write §4 plan premises + §5 rejected/deferred + §6 residual risks
7. Present full text → one save confirmation → Write (this skill's only write)
8. Completion notice — A-item summary to hand to humans + next steps
```

### 2. Shortcut (tasks that need no preparation)

If brief §2 (system decisions — project name, project type, build shape), §3-4 (new tables/columns), §6·§8-1 (security/access/external integration), and §8-2 (infra/config) carry **no signal at all**, skip the step-3 dispatch and write a short proposal:

**§2 check**: its development-type and build rows say whether a new project or module is added, and its project name is or is not in the preloaded `project.yaml` `projects[]`. Either signal → **no shortcut**, and a `Code home` item is mandatory.

- §2 = "0 items (basis: brief §2 project already registered in `projects[]`; no new schema, config, or access items in §3-4·§6·§8)"
- §3 = check only brief §10 reusable assets; list L3/L4 candidates if any, otherwise "build as-is (L5)"
- §4 = "No prerequisites. No minimization decisions."

**Never skip the judgment itself.** "Nothing was needed" is also a conclusion, and that one page later distinguishes "preparation was skipped" from "there was nothing to prepare". The shortcut only cuts cost.

### 3. Dispatch 2 parallel agents (multiple Agent calls in one response)

Fill only what the brief cannot. No re-dispatch — if a result is thin, supplement it with 1:1 questions.

> ```
> Agent(subagent_type="db-meta-manager",
>       prompt="topicHints={new/affected tables JSON} taskNumber={N}
>               goal=preparation: (1) confirm the new tables/columns in brief §3-4 do not exist yet
>                                 (2) if they do exist, judge them already applied
>                                 (3) return similar tables' schema and column_comment as DDL draft evidence
>               constraints=schema metadata only. No SELECT on real data. **read-only — write no files**")
> Agent(subagent_type="code-investigator",
>       prompt="primary={target project} related={integration candidates JSON} topicHints={keywords JSON} taskNumber={N} workType={frontend|backend|fullstack|unknown}
>               goal=minimization candidates for preparation: can this requirement be met by (L0) an existing feature or screen,
>                    (L3) a reusable shared asset, (L4) an existing extension point — file:line per candidate
>               goal2=code home evidence: is there an existing project or module that can host this requirement
>                    (L4 before L5), and where is the build manifest's module list — file:line
>               constraints=**read-only — write no files**")
> ```

Do not call `security-auditor` — the security requirements in brief §6·§8-1 are already that agent's output. **Quote those two sections verbatim** as candidates for access/certificate/account prerequisites.

If a precondition (e.g. `db.vendor`) is missing and one agent cannot be dispatched, record that fact in proposal §6 as "{agent} skipped — {reason}".

### 4–6. Writing

- Output schema (6 sections, table columns, self-check) → **`references/prepare-doc-schema.md`** (Read right before writing)
- Required fields, verification style, rollback requirements per prerequisite kind → **`references/human-task-catalog.md`**
- Minimization ladder L0–L5 criteria, approval format, red lines → **`references/minimization-ladder.md`**

### 5. Approval questions (only where applicable)

Ask in order with `AskUserQuestion`, **one question** each. Only four things are ever asked:

1. **L0 — scope-exclusion proposal**: "This requirement is met by existing {evidence}. Remove it from development scope?"
2. **L2 — manual-operation proposal**: option text must include **expected volume/week · time per case · owning team · duration**. Permanent manual operation is never the recommended option.
3. **The owner of a blocking prerequisite** when the brief and `project.yaml` do not settle it.
4. **Code home, only when the judgment differs from brief §2**: "§2 decided {new project}, but {evidence} shows {existing project} can host it as a module. Place it there?" The brief is an already-verified contract — reversing its system decision is never autonomous. When the judgment matches §2, no question: write the item and move on.

Everything else (L1·L3·L4·L5, writing execution statements, choosing verification methods) is decided autonomously with the evidence recorded.

Rejected or deferred proposals go into §5 "Rejected & deferred" with the reason — the record that keeps the next run from repeating the same proposal.

### 7. Save confirmation

Present the full proposal **as text first**, then confirm with one `AskUserQuestion`:

```jsonc
{
  "questions": [{
    "header": "Save",
    "question": "Save this as {{config.outputDir}}/{taskId}_dev_prepare.md?",
    "multiSelect": false,
    "options": [
      { "label": "Save (recommended)", "description": "Save the proposal, then summarize the items to hand to humans" },
      { "label": "Request changes", "description": "Enter changes → re-present after applying" }
    ]
  }]
}
```

Write happens only after this confirmation. With no confirmation — even with an upfront "just save it" demand — no file is created.

### 8. Completion notice

```
Preparation proposal: {{config.outputDir}}/{taskId}_dev_prepare.md
  · human prerequisites: {n} (blocking: {b})
  · minimization decisions: {m} (estimated tasks saved: {k})

Items to hand to humans (copy & send):
  A-0 [Code home/{owner}] {placement} — {registration checklist count} items
  A-1 [{kind}/{owner}] {one-line summary}
  ...

Once they are done:
  /dev-prepare {taskId} --verify   ← re-check completion
  /dev-plan {taskId}               ← plan (premise = items above are done)
```

---

## `--verify` mode

```
1. If {{config.outputDir}}/{taskId}_dev_prepare.md is missing, refuse — do not create it
   ("No preparation proposal found. Run /dev-prepare {taskId} first.")
2. Walk the §2 A-items (judge only ☐ items — ☑ already carries its evidence in the document)
   · kind DDL → one db-meta-manager dispatch → judge existence via schema metadata
              → ☑ + evidence (query result summary + judgment timestamp)
   · kind Code home → human question, with the `projects[]` lookup attached as a basis — never an automatic ☑
   · every other kind → **no automatic judgment.** One human question (multiSelect checklist of completed items)
              → ☑ + "human reply: {actor} {datetime}"
3. All BLOCKING items ☑ → §1 status READY + "next: /dev-plan {taskId}"
   Any left unfinished → §1 status WAITING + print only the unfinished list
4. Write = one update to the same file. Touch nothing else.
```

Why only DDL is auto-judged: schema metadata queries are allowed, but SELECT on real data is forbidden (security policy). Code-value INSERTs, config changes, and access grants can **only be confirmed by human reply**, so they are never closed automatically — marking unseen work as done puts the plan on a false premise.

---

## Orchestrator mode (`autopilot-orchestrated`)

An unattended run. It does not remove the answers — it **changes their source to evidence.**

- **`AskUserQuestion` is forbidden.**
- **L0 and L2, which need approval, are not adopted.** Park them in §5 "Rejected & deferred" as "unattended run — needs human approval". An unattended run never decides on its own to shrink the requirement or shift operational burden onto humans.
- L1·L3·L4·L5 are adopted autonomously with evidence (`file:line`, brief §).
- Fill the §2 A-items from the brief and agent reports; if an owner cannot be resolved, mark it "owner unresolved" and flag the item BLOCKING.
- **`--verify` unattended: only DDL can close.** Every human-reply kind is returned **still ☐, with no question asked**; ☑ marks a conversational run already stamped are respected, never re-judged. State the consequence in the returned list: finishing the work does not close such an item — the person stamps it with a **conversational** `/dev-prepare {taskId} --verify` before the next run, or it blocks that run too.
- The write contract is unchanged — no human present is no license to execute DDL or create files.
- Instead of a save confirmation, write the proposal and **return the list of unfinished blocking items to the caller.** Skip the completion-notice hook (the caller owns the next step).

---

## Security policy

The full policy lives in a **single source: `.claude/docs/agents/common/security-policy.md`** (lazy Read just before dispatch). Shared by this skill + the 2 sub-agents.

Core: workspace root is read-only / never Read forbidden file patterns (production yaml·properties·env) / never decrypt encryption markers / no SELECT on real DB data (metadata only).

> These constraints are §2's evidence. Not being able to open or edit a config file means **that change is human work**, and the proposal turns that fact into an item.
