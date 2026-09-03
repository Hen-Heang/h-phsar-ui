---
name: dev-autopilot
description: 하나 이상의 과업을 브리프 승인부터 계획·페이즈 구현·QA 수렴·코드 리뷰·커밋·MR 승인·생성까지 재개 가능한 상태로 오케스트레이션한다. 시작뿐 아니라 **재개·복구도 이 스킬이 소유한다** — 중단·차단된 런을 이어받고, 상태와 증거를 검증하고, 막힌 이유를 풀어 다음 단계로 넘긴다. 사용자가 "dev-autopilot", "autopilot", "오토파일럿", "과업 하나 끝까지", "전체 개발 흐름 실행", 병렬 과업 전달, "오토파일럿 이어서", "중단된 런 재개", "막힌 런 풀어줘", ".autopilot 런 확인" 등을 요청하면 이 스킬을 사용한다.
---

# Autopilot

Treat one ticket as one task over the project checkouts it touches. Control flow and evidence gates here; delegate implementation and requirement-gap analysis to existing skills and expert agents. Use scripts for state transitions, project registration, artifacts, counters, and authorization hashes.

The developer receives one final result, not a stream of operational questions. Invoking Autopilot authorizes the complete delivery workflow: branch creation, scoped implementation, commit, push, and MR creation. Autopilot decides project scope, base branch, source branch, phase routing, and remediation from repository evidence and records each decision. It does not ask the developer to choose routine implementation details. Remote delivery is part of that authorization, not an optional tail: every registered project must end with a pushed branch and a created MR, and a delivery failure blocks the run with its cause recorded rather than closing it as done.

Before planning, have a domain-relevant expert subagent challenge the brief for missing behavior, contradictions, acceptance gaps, and affected-project boundaries. Autopilot answers discoverable gaps from source, project instructions, ticket material, and the expert dialogue. Escalate to the developer only when a missing product, legal, security, or destructive-operation decision cannot be derived safely. In that case, block the run and return one consolidated decision request.

## Load on demand

- Read [references/runtime-contract.md](references/runtime-contract.md) before creating or resuming a run.
- Read [references/autopilot-workflow.json](references/autopilot-workflow.json) before the first workflow step. Each step declares what it is called with, what proof it must produce, and which transition demands it; `state.mjs` reads the same file to check what you record.
- Read [references/expert-challenge.md](references/expert-challenge.md) before dispatching the expert over the brief.
- Read [references/phase-goals.md](references/phase-goals.md) before starting the first phase goal.
- Read [references/delivery.md](references/delivery.md) and `.claude/config/system.yaml` (`gitlab.*`) before push or MR creation.

## Invariants

1. Start Autopilot only in the main session.
2. Only the main session may update shared handoff files, the central map, authorizations, remote branches, or MRs.
3. A task agent may write only inside the project checkouts registered for its own task and its evidence directory. It must not invoke `/pack`, push, create an MR, touch another task's project, or edit the central map.
4. Use one logical goal per development-plan phase. Include the task, phase, plan path, objective DoD, and QA limit in the goal objective.
5. Autopilot owns the implementation-to-QA convergence loop at the goal level: `qa-collect.mjs` measures each round, and a RED round re-dispatches the task agent with that round's failure report, within the goal's three rounds. The `develop` step implements only — it must not invoke the `qa` step's skill or run a QA loop of its own, because a loop that tests and fixes inside the agent reports a convergence nobody measured.
6. Create at most one separate `REVIEW_REMEDIATION` goal when code review fails.
7. Never edit runtime JSON by model reasoning. Use `state.mjs` and `artifact.mjs`.
8. Never ask the developer to choose a branch name, base branch, project scope, phase split, retry, or routine implementation approach. Resolve and record them from repository evidence.
9. Internal expert review is mandatory before planning. It is advisory evidence, not authority to expand the user's requested scope.
10. The initial invocation is the sole user authorization document. Hash it at run initialization and reject push or MR creation if it drifts or does not authorize remote delivery.
11. Perform every workflow step by invoking the skill [references/autopilot-workflow.json](references/autopilot-workflow.json) names, with its mode word, and record it with `state.mjs step`. Dispatching that skill's subagent yourself is a bypass, not a shortcut: the skill is where the format gate, the guideline load, the secrets guard, and the convergence loop live, and an agent invoked directly carries none of them. The stage gates refuse to open without the record.

## Start or resume

Read [references/runtime-contract.md](references/runtime-contract.md) first — it owns the script conventions (`--kebab-case` arguments, exit `0`/`1`/`2`, one JSON object on stdout), the run-id format, the stage order, and the `nextAction` enum. Resolve `{{config.outputDir}}` from `.claude/config/project.yaml`; `{run-root}` is `{workspace-root}/.autopilot/{run-id}`; `{J}` is `.claude/skills/dev-autopilot/scripts`.

Shell variables do not survive between tool calls, so write resolved paths out in full every time — `$CLAUDE_CODE_SESSION_ID` is the exception, an inherited environment variable (`$env:CLAUDE_CODE_SESSION_ID` in PowerShell). Never wrap it in `{...}`: this file's braces mean "resolve and write it out", and a shell leaves `{$VAR}` braced.

Command fences are machine-readable: `shell` is the normal path, `shell optional` a conditional alternative, `shell recovery` an error recovery. Never append an optional or recovery block to the normal path unconditionally.

`{...}` placeholders come from two different places, and confusing them is how a run invents a path. **Values you resolve** (`{run-root}`, `{task-number}`, `{project}`, `{phase-id}`) you write out yourself. **Values a step returns** — every `-path` and `-document` placeholder, such as `{brief-path}` or `{qa-verdict-path}` — come from that step's return value, because where the step writes its output is its contract, not this file's. If you reach a fence holding one of those and do not have the returned value, the step either was not invoked or returned nothing to record: fix that instead of guessing a path.

First write the developer's initial invocation **verbatim** to `{{config.outputDir}}/{task-number}_autopilot_request.md`. `init` hashes that file, and that hash is the only thing standing between a drifted request and a real push — a paraphrase quietly weakens the gate it is supposed to hold.

```shell
node {J}/preflight.mjs --claude-root .claude
node {J}/state.mjs init --workspace-root "{workspace-root}" \
  --run-root "{run-root}" --run-id "{run-id}" --session-id "$CLAUDE_CODE_SESSION_ID" \
  --authorization-document "{{config.outputDir}}/{task-number}_autopilot_request.md" --remote-authorized true
node {J}/state.mjs add-task --run-root "{run-root}" --task "{task-number}"
node {J}/artifact.mjs init --run-root "{run-root}"
```

Stop when preflight exits non-zero. Register **every** task with `add-task` and initialize the artifact registry **once per run**; without them the first `transition` fails with `task not found` and every `register` with `artifact registry is not initialized`.

Nothing advances the stage implicitly. Each step ends with an explicit `transition` naming the stage you enter and the action you intend next; the script refuses a transition whose evidence is missing, which is how a skipped step surfaces immediately instead of at MR time:

```shell
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage BRIEF --next-action BUILD_BRIEF
```

Record each autonomous decision when you make it, not at the end, so the run can explain its own scope and branch choices:

```shell
node {J}/state.mjs decision --run-root "{run-root}" --task "{task-number}" \
  --kind PROJECT_SCOPE --value "{resolved value}" --evidence "{what proved it}"
```

Register every document you act on. The registry snapshots the file and its SHA-256, so a later session can tell whether the evidence a decision rested on is still the same file:

```shell
node {J}/artifact.mjs register --run-root "{run-root}" --id "{stable-id}" \
  --source "{path}" --destination "tasks/{task-number}/artifacts/{name}" \
  --task "{task-number}" --stage "{stage}" --kind "{kind}" --format markdown
```

On resume run `verify`, then read `next` (both need `--task`), and never repeat a completed stage. To find the run, scan `{workspace-root}/.autopilot/*/autopilot-map.json` for the task key: prefer a `RUNNING` or `BLOCKED` run, never resume a `COMPLETED` one, and when more than one candidate remains report each runId with its status and let the developer choose.

`verify` separates two facts. `status: valid` means the recorded approval evidence is intact. `resumeReadiness: DEGRADED` with a `missingSources` list means some original documents are gone and only their run-root snapshots vouch for them — a degraded run resumes past stages that no longer read those documents, but a stage that consumes a listed one stops at the missing file. Snapshots are a recovery net, not sanctioned deletion: do not clean `{{config.outputDir}}` while any of its documents is still unconsumed by the run.

## Workflow

Every step has one shape: **invoke the skill [references/autopilot-workflow.json](references/autopilot-workflow.json) names for that step id, record it, branch on what came back.** A step id absent from that file is not performed and its section does not apply — that file is the step list, not this prose. It is the call too: **never write a step's skill name or mode word below** — a copy keeps calling the old skill after the contract changes while `state.mjs step` records the new one, so the run attests to a call it did not make. Only skills the contract omits (`/git`, `/pack`, `/mr-review`) are named here — they gate no transition, so the contract has nothing to say about them.

Each section states only what this skill decides: which call, what to record, what proof, when to block. **Never restate another skill's internals** (its write contract, gates, per-case rules) — nothing here reads that prose, and it turns false the moment that skill changes while reading as this skill's guarantee. Take facts from a step's **return value or proof file**, not from a copy kept here.

### 1. Produce and approve the brief

Anchor checks, the citation-lint taxonomy, the expert's budget, and what to fold live in [references/expert-challenge.md](references/expert-challenge.md). This section holds the calls and the gate.

- Invoke the `brief` step with args `{task-number} {spec-path}` when a specification file exists, `{task-number}` for an internal improvement. One step skill covers both, so a specification needs no different route. Do not edit the workflow contract to name an instance's own adapter — that file is a Core asset an update overwrites, and a per-project step skill needs a config surface that does not exist yet.
- Pass the contract's mode word, and do not dispatch that skill's own subagents instead: that is the bypass invariant 11 forbids, and here the guard nobody notices missing is the security audit.
- Take the brief path and its **format-gate receipt** path from the step's **return value** — `{brief-path}` and `{brief-check-path}` below. Where that skill writes them is its own contract, and a path copied here keeps pointing at the old location after it moves. Do not re-run that gate: the mode word already made it the step's save condition, so re-running would re-judge bytes the step judged and put its script layout in this file.
- Validate anchor-ID zero loss against the source documents, then lint the brief's citations **before** dispatching the expert and lint the expert's report when it returns. `ERROR` findings block:

```shell
node {J}/evidence-lint.mjs check --file "{brief-path}" \
  --search-root "{workspace-root}" --prefer "{primary project}"
```

- Dispatch **one** expert over the whole brief and give it a budget in the prompt: **Cap the findings** at roughly a dozen ranked, every finding carrying `file:line` or a brief section, severity `BLOCKER` or `NOTE` with no middle tier.
- **Fold only what changes a contract, and fold by re-invoking the step** — never by editing the brief yourself. That skill owns the brief's schema and its format gate: a hand-edited brief is bytes no gate judged, and the first call's receipt no longer describes the file you are about to approve.
- Register the expert gap report as an artifact. Resolve all discoverable gaps and record any remaining non-derivable decision as a blocker.
- **With the brief final, register both files and record the step.** Order matters: the receipt describes the bytes it judged and the gate below hashes the bytes you approve, so record after the last fold, never before. Register first — `state.mjs` never snapshots a step proof and never re-checks one on resume, so a receipt left where the step wrote it can be gone by the next session while the map still points at it:

```shell
node {J}/artifact.mjs register --run-root "{run-root}" --id "{task-number}-brief" \
  --source "{brief-path}" --destination "tasks/{task-number}/artifacts/brief.md" \
  --task "{task-number}" --stage "BRIEF" --kind "brief" --format markdown
node {J}/artifact.mjs register --run-root "{run-root}" --id "{task-number}-brief-check" \
  --source "{brief-check-path}" --destination "tasks/{task-number}/artifacts/brief-check.json" \
  --task "{task-number}" --stage "BRIEF" --kind "brief-gate" --format json
node {J}/state.mjs step --run-root "{run-root}" --task "{task-number}" \
  --id brief --args "{task-number}" \
  --proof-file "{run-root}/tasks/{task-number}/artifacts/brief-check.json"
```

  `--kind brief` is not decorative: `mr-request` finds the brief by that kind to derive the MR's open-question list, and without it the MR body keeps a placeholder `mr-deliver` refuses to send. Check the receipt's `file` and `sha256` against the brief you register — the script refuses a `pass: false` receipt but cannot tell which file it describes. Block on a mismatch instead of approving on it. `--args` carries arguments only; a leading `/{skill}` is refused, because a POSIX-imitating shell expands that slash into its own install path.
- Have the expert verify the registered brief against the sources, then record the internal evidence gate. Do not interrupt the developer for routine brief approval:

```shell
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage BRIEF_APPROVAL --next-action REQUEST_BRIEF_APPROVAL
node {J}/state.mjs approve --run-root "{run-root}" --task "{task-number}" \
  --gate brief --document "{brief-path}" \
  --expert-report "{{config.outputDir}}/{task-number}_expert_gap.md" --actor "dev-autopilot+expert"
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage PLAN --next-action CREATE_PLAN
```

`BRIEF_APPROVAL` is its own stage, so the gate sits between writing the brief and planning; `BRIEF -> PLAN` is refused. `--expert-report` is required, not decorative: it is what proves the expert challenge happened.

Gate hashes are byte-exact, so a CRLF/LF rewrite counts as a changed document. While still in `BRIEF_APPROVAL`, reapprove explicitly and keep both hashes in the audit log:

```shell optional
node {J}/state.mjs reapprove --run-root "{run-root}" --task "{task-number}" \
  --gate brief --document "{brief-path}" \
  --expert-report "{{config.outputDir}}/{task-number}_expert_gap.md" \
  --reason "{why the bytes changed}" --actor "dev-autopilot+expert"
```

Reapproval is limited to that stage. A drift discovered after planning invalidates downstream evidence: block and restart from the brief rather than blessing changed bytes.

### 2. Prepare the human prerequisites and the minimization decisions

Some of the work a ticket implies is not yours to do. Planning around it as if it were an implementation task produces a plan that stops at the first such item, which is why this step runs **before** the plan exists. What counts as that kind of work, and how each item is judged, belongs to the step skill — this section only issues the call and acts on what it returns.

Invoke the `prepare` step. Which args it takes depends on whether the proposal document already exists. Do not record a call you did not issue. This is the one step whose document path is spelled out here — the presence check happens **before** the call, so there is no return value to take it from:

| State | Args |
|---|---|
| `{{config.outputDir}}/{task-number}_dev_prepare.md` absent | `{task-number}` — writes the proposal |
| Already present (a developer produced it conversationally) | `{task-number} --verify` — the step re-judges what is still open |

```shell
node {J}/state.mjs step --run-root "{run-root}" --task "{task-number}" \
  --id prepare --args "{task-number}" --actor "dev-autopilot"
node {J}/artifact.mjs register --run-root "{run-root}" --id "{task-number}-prepare" \
  --source "{{config.outputDir}}/{task-number}_dev_prepare.md" \
  --destination "tasks/{task-number}/artifacts/prepare-proposal.md" \
  --task "{task-number}" --stage "BRIEF_APPROVAL" --kind "prepare-proposal" --format markdown
```

The step carries no machine proof because the proposal is Markdown and the skill is not allowed to write a second file to be judged by; the artifact registry's SHA-256 snapshot is the evidence instead. `--args` carries the arguments only, as everywhere else.

When the step returns any unfinished blocking item, stop the run rather than planning around it — that returned list is the judgment; re-deriving it here would be a second opinion nothing asked for. Those items are the non-derivable, privileged decisions the preamble's escalation rule (product, legal, security, and destructive-operation decisions belong to the developer) reserves for the developer:

```shell
node {J}/state.mjs block --run-root "{run-root}" --task "{task-number}" \
  --reason "PREPARE_INCOMPLETE: {item ids + one-line summary}"
```

Relay the step's returned request as the block's message — it already names each open item, its owner, what it blocks, and how the item gets closed; deriving any of that here would be this skill restating another skill's rules, which go stale the moment that skill changes. `PREPARE_INCOMPLETE` is not on the recoverable list, so the resumed work starts as a **new run**; nothing has been branched or committed at this point, which is why that is cheap here and would not be after implementation.

With no open blocking item, proceed to planning. How the plan consumes the proposal is the planning step's contract, not this one's.

### 3. Plan

Invoke the `plan` step with args `{task-number}`. The contract's mode word is what keeps the step unattended — the phase split is already yours to decide by invariant 8, so a gate that stopped to confirm it would stop for a question this skill has answered.

Take the plan root document and the routing manifest from the step's **return value** (`{plan-root-document}` and `{plan-manifest-path}` below); the step builds and validates the manifest at the end of its own run, so do not rebuild or re-validate it here. `register-plan` is the machine check that matters to this run: it parses the manifest, records the phase-id set every later `goal-start` is limited to, and is what unlocks project registration — the `PROJECTS` stage refuses to start without it.

```shell
node {J}/state.mjs step --run-root "{run-root}" --task "{task-number}" \
  --id plan --args "{task-number}" --proof-file "{plan-manifest-path}"
node {J}/state.mjs register-plan --run-root "{run-root}" --task "{task-number}" \
  --root-document "{plan-root-document}" --manifest "{plan-manifest-path}"
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage PROJECTS --next-action REGISTER_PROJECTS
```

Stop instead of guessing when the step reports a validation failure or `register-plan` refuses the manifest. When the plan itself cannot run — a phase spanning two projects, a project the workspace lacks — block with a `PLAN_`-prefixed reason (`PLAN_PHASE_SPANS_TWO_PROJECTS`); that class re-plans in the same run (stop conditions).

Register the root plan, the manifest, and every phase plan as artifacts under `plan.revision` (`1` at first, +1 per `PLAN_` recovery; read it from `next`) — ids `{task-number}-plan-r{revision}-{root|manifest|phase-{phase-id}}`, destinations `tasks/{task-number}/artifacts/plan/r{revision}/{root.md|manifest.json|phase-{phase-id}.md}` — so a re-plan never reuses an id or destination the registry refuses:

```shell
node {J}/artifact.mjs register --run-root "{run-root}" --id "{task-number}-plan-r{revision}-root" \
  --source "{plan-root-document}" --destination "tasks/{task-number}/artifacts/plan/r{revision}/root.md" \
  --task "{task-number}" --stage "PLAN" --kind "plan-root" --format markdown
```

### 4. Register the projects and run phase goals

Autopilot does not create checkouts. The workspace already holds each project at `{workspace-root}/{project}` — Autopilot creates the **working branch** there and works on it in place. No separate worktree is made; the run directory holds only state and evidence.

The affected project set is the set of `project` values in the registered manifest; the brief, repository boundaries, and expert gap report confirm it, not extend it. Record the decision, resolve one logical source branch from the installed commit convention (for example `feature/{task-number}/{actor}`), register **every** project in the set with that branch, then transition once — `DEVELOP` refuses a planned project that is not registered or a registered project the plan never names:

```shell
node {J}/state.mjs register-project --run-root "{run-root}" --task "{task-number}"   --project "{project}" --branch "{autopilot-resolved-branch}"
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}"   --stage DEVELOP --next-action CREATE_DEVELOP_GOAL
```

Registration creates the branch and records what it started from; [references/runtime-contract.md](references/runtime-contract.md) owns what `register-project` refuses (path inside the workspace root, Git top level, clean tree, unused branch name, one project id per tree) and why. What is this skill's here: the first registration fixes `task.sourceBranch` and every later project reuses that exact name — BE/FE areas and phases never create branch variants — and both the name and `--base-ref` are recorded as the `SOURCE_BRANCH` and `BASE_REF` decisions so the choices are verifiable.

Registration is legal only in this stage — `DEVELOP` never returns to `PROJECTS` — so a project missing here cannot be added later: block with a `PLAN_` reason instead. Autopilot does not enforce one-task-per-checkout — whoever schedules tasks in parallel owns that separation.

For each dependency-ready phase:

1. Register its logical goal and execution session. `--project` is the manifest's `project` for that phase; `goal-start` refuses any other. Its objective must contain labeled `Task`, `Phase`, `Plan`, `DoD`, and `QA limit` fields; `DoD` is the phase plan's objective acceptance checklist, not a paraphrase.

```shell
node {J}/state.mjs goal-start --run-root "{run-root}" --task "{task-number}" \
  --phase "{phase-id}" --session-id "{agent-session-id}" --project "{project}" \
  --goal-kind INITIAL_IMPLEMENTATION
```

2. Give the task agent the complete phase Markdown and its manifest control record — **and a reading budget that says those two are the contract.** Tell it not to read the brief or the root plan; one measured run that did reached 306k tokens and died on `529 Overloaded`, and the resumed transcript failed the same way.
3. Start the subagent with its working directory set to the exact registered checkout path recorded by `state.mjs`, and require it to report `git rev-parse --show-toplevel` before it invokes the `develop` step — the canonical result must equal that path. Never dispatch a phase from an unregistered directory or another task's project.
4. Instruct it to invoke the `develop` step with args `{scope} {task-number}` and finish that one phase: it holds the logical goal ID and a single phase document, returns goal evidence, and does not invoke `/pack`. Spell the contract's mode word out in the instruction — it is what the skill and the recorded step both read. **Append no other mode word, and forbid every other workflow step's skill inside the agent**; [references/phase-goals.md](references/phase-goals.md) explains what each of those would break.
5. Collect the QA round in the **main session** with `qa-collect.mjs`, not from the agent's report. It runs the build, parses the test reports, writes `round-{N}.json` plus `round-{N}.log`, computes the weakening flags by comparing the previous round, and records the result through `state.mjs`. The agent implements; the machine measures. A self-reported number is the one link in the evidence chain nobody can check afterwards.

```shell
node {J}/qa-collect.mjs collect --run-root "{run-root}" --task "{task-number}" \
  --phase "{phase-id}" --round "{n}" --project "{project}" \
  --command "{build/test command without project-specific args}" \
  --build-arg "{placeholder}={value}" \
  --reports-dir "{xUnit XML report directory}" \
  --test-class-pattern "{regex for the classes this phase must actually run}" \
  --assertion-scope "{test source path}" \
  --assertion-extensions ".{ext1},.{ext2}" \
  --assertion-pattern "{language-pack assertion call regex}"
node {J}/state.mjs step --run-root "{run-root}" --task "{task-number}" \
  --id develop --phase "{phase-id}" --args "{scope} {task-number}" \
  --proof-file "{run-root}/tasks/{task-number}/phase-{phase-id}/round-{n}.json"
```

The measurement contract — `buildArgs`/`buildArgsRequired` read fail-closed, a required `--reports-dir` of xUnit XML, `--test-class-pattern` with no match counting as `RED`, `--allow-no-tests`/`--no-build-contract` as the explicit opt-outs — is in [references/runtime-contract.md](references/runtime-contract.md). Two exit codes matter to the caller: a `RED` round exits `1` after writing its evidence, so a chained command stops instead of walking past a failed round, and `exit 2` is reserved for a build that could not start or a report that could not be parsed. "Tests failed" and "the measurement broke" must stay distinguishable.

6. Read the round file the script wrote before you trust its verdict. `qa-collect` records the result itself; use `--no-record true` when you want to inspect first and record separately:

```shell optional
node {J}/state.mjs phase-result --run-root "{run-root}" --task "{task-number}" \
  --phase "{phase-id}" --round "{n}" --qa-status GREEN \
  --evidence "{run-root}/tasks/{task-number}/phase-{phase-id}/round-{n}.json" \
  --fingerprint "{failure fingerprint on RED}" \
  --tests-reduced false --assertions-reduced false --skips-increased false
```

Complete the goal on QA GREEN; on a RED round below the limit re-dispatch the task agent for the same goal with that round's failure report. The round budget, the stop conditions, and what `phase-result` does to the stage are in [references/phase-goals.md](references/phase-goals.md).

### 5. Verify the delivery against the test plan

The machine rounds prove the build's tests ran GREEN; they do not prove the delivery matches the **test plan** — a suite can pass while a planned TC was never mapped to any test. After every planned phase goal is `COMPLETED`, invoke the `qa` step with args `{task-number}` once for the whole task.

The step returns a **verdict receipt** path (`{qa-verdict-path}` below), and that receipt is the step's proof — a `pass: false` receipt is refused at recording time, and the LLM's report alone is never the gate. Read the receipt's own verdict rather than judging conformance here.

Register it before recording it, for the same reason as the brief gate: a step proof is never snapshotted, so the run must hold its own copy of the file its evidence points at.

```shell
node {J}/artifact.mjs register --run-root "{run-root}" --id "{task-number}-qa-verdict" \
  --source "{qa-verdict-path}" \
  --destination "tasks/{task-number}/artifacts/qa-verdict.json" \
  --task "{task-number}" --stage "QA" --kind "qa-verdict" --format json
node {J}/state.mjs step --run-root "{run-root}" --task "{task-number}" \
  --id qa --args "{task-number}" \
  --proof-file "{run-root}/tasks/{task-number}/artifacts/qa-verdict.json"
```

- **Freshness is gated, not assumed.** `CODE_REVIEW` refuses a qa record older than the newest recorded `develop` step, so a verdict taken before a remediation cannot vouch for the code that replaced it — re-run this step after any implementation change and record it again. Step re-records overwrite the map entry; `events.jsonl` keeps every attempt.
- **On `RED`**: keep completed goals completed. Create a remediation goal on the phase that owns the failing TCs (the report's phase column names it), reconverge through qa-collect rounds, then re-run this step. Do not proceed to review with a failing or stale verdict.
- **On `INCOMPLETE`** (a required E2E TC cannot run unattended): block the run and return the skipped TC list as a decision request — an unattended run must not report success over a verification nobody performed.
- Carry the receipt's `skippedE2E` list into the MR description in step 7 — the reviewer must see what was not executed and why.

### 6. Review

After all phases complete, transition to `CODE_REVIEW` and invoke the `code-review` step **once** over the cumulative diff, passing the changed paths as args — this is the only review in the run, and there is no conversation here for the step to derive its scope from.

It is the one step with no machine proof the script can judge, so its record is an attestation whose absence is visible in the event log. The step returns a **compact result** — header counts, one line per finding (`severity · rule id or category · file · subject`), and the path of the full review its agent wrote (`{review-path}` below). Register that file as an artifact, hand the run-root snapshot to `review-result` (which writes the per-attempt summary itself), and derive counts and fingerprints from the compact lines.

Pass `--critical`, `--warning`, and `--info` every time: `mr-request` builds the MR's review table from those files, and an omitted count is a blank the MR reviewer reads as "nothing found".

A fingerprint identifies a finding across rounds so a repeated one is detectable. Derive it from what does not change when the text is reworded — rule id or category, file, normalized subject (`line-length:src/OrderService:imports`). Including line numbers or the reviewer's wording changes it every round and silently disables the repeat check.

```shell
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage CODE_REVIEW --next-action RUN_CODE_REVIEW
node {J}/state.mjs step --run-root "{run-root}" --task "{task-number}" \
  --id code-review --args "{changed paths}" --actor "dev-autopilot"
node {J}/artifact.mjs register --run-root "{run-root}" --id "{task-number}-review-{attempt}" \
  --source "{review-path}" --destination "tasks/{task-number}/review/review-{attempt}.md" \
  --task "{task-number}" --stage "CODE_REVIEW" --kind "code-review" --format markdown
node {J}/state.mjs review-result --run-root "{run-root}" --task "{task-number}" \
  --status PASSED --evidence "{run-root}/tasks/{task-number}/review/review-{attempt}.md" --fingerprints "{fp1,fp2}" \
  --critical "{count}" --warning "{count}" --info "{count}"
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage COMMIT --next-action CREATE_COMMIT
```

The `CODE_REVIEW` transition refuses while any phase goal is unfinished, and `COMMIT` refuses without a recorded `PASSED` review — the two guards that stop a review from being skipped by jumping stages.

- No Critical or Warning: record `PASSED`, transition to `COMMIT`. Info findings are reported, not remediated.
- At least one Critical or Warning and no prior remediation: record `FAILED`, create one `REVIEW_REMEDIATION` goal for the affected phases (`goal-start --goal-kind REVIEW_REMEDIATION`), rerun their QA, review again. The script accepts remediation only when exactly one review has failed, so there is no third attempt.
- Repeated fingerprint or failed second review: stop and report.

**Transition back to `CODE_REVIEW` before recording the second review result.** The remediation QA round moved the task to `QA`, and `review-result` is accepted only in `CODE_REVIEW`, so the second attempt is refused until you re-enter the stage — an ordinary allowed transition, not a recovery:

```shell
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage CODE_REVIEW --next-action RUN_CODE_REVIEW
```

Every run with a remediation goal passes this point, so it is a step in the normal path rather than a recovery.

Scope the second review to the paths the remediation goal changed, read from its round evidence (`filesChanged`) — the first review already judged the rest against the same bytes, and re-reading them costs a full attempt to re-derive findings you have dispositioned.

When an existing review already covers the exact current commit, reuse it explicitly instead of pretending it was generated in this run:

```shell optional
node {J}/state.mjs accept-existing-review --run-root "{run-root}" --task "{task-number}" \
  --project "{project}" --evidence "{original review path}" --target-sha "{checkout HEAD}" \
  --reason "{why this review remains applicable}" --actor "{accepting actor}"
```

This path needs no `code-review` step record — it did not call the skill, and recording that it did would be a false attestation; the acceptance facts are its evidence instead. It is a controlled exception inside the review stage, not a stage bypass: the target SHA must equal the registered checkout's current HEAD, that checkout must be clean, and if the working snapshot is not exactly the reviewed commit, run a new review.

### 7. Commit and request an MR

Resolve the staging set and commit-message input in the main session. Never delegate interactive `/git` confirmations to a task agent. Commit inside the registered checkout, then record the commit per project — the recorded SHA must be that checkout's current HEAD, which is what keeps the map and Git from disagreeing:

```shell
node {J}/state.mjs commit-result --run-root "{run-root}" --task "{task-number}" \
  --project "{project}" --sha "{checkout HEAD}"
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage MR_APPROVAL --next-action BUILD_MR_REQUEST
```

The commit stage stays `PARTIAL` until every registered project has a recorded commit, so a multi-project task cannot slip into the MR stage half-committed.

Commit, push, and the MR request are all part of the flow — there is no path that stops at the commit. `COMMIT` leads only to `MR_APPROVAL`, and `DONE` requires a recorded MR outcome.

Only the main session performs remote delivery, once per project, always on that task's common source branch. Push and creation are recorded separately per project — that is what makes a push that succeeded before a failed MR resumable instead of something you feel tempted to undo.

**Delivery is mandatory.** Every registered project must end with a real pushed branch and a real MR. A run that implemented and committed but delivered nothing is not finished, so a delivery failure blocks the run rather than closing it.

How the two delivery scripts derive the request, why the payload never goes through shell arguments, and how a failure is classified are in [references/delivery.md](references/delivery.md). Read it before the first push.

```shell
node {J}/mr-request.mjs build --run-root "{run-root}" --task "{task-number}"
node {J}/state.mjs approve --run-root "{run-root}" --task "{task-number}" \
  --gate mr --document "{run-root}/tasks/{task-number}/mr-request.json" --actor "dev-autopilot"
```

Fill every `mr-desc-{project}.md` `<<< >>>` block **before** delivery: `create` refuses an empty description or a remaining placeholder before calling the forge, and `--dry-run true` reports them without touching the remote.

```shell
node {J}/mr-deliver.mjs push --run-root "{run-root}" --task "{task-number}" --project "{project}"
```

Repeat for every registered project. Only after every project is pushed may the task enter `MR_CREATE`:

```shell
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage MR_CREATE --next-action CREATE_MR
node {J}/mr-deliver.mjs create --run-root "{run-root}" --task "{task-number}" --project "{project}"
```

Each `create` that reports `CREATED` emits that MR's `url`. Hand that URL straight to `/mr-review` with `--background`, once per created MR: the MR reviewer runs as a background subagent, posts its comment through the SubagentStop hook, and notifies Flow by itself. **It gates nothing** — never wait for it, never record it as a workflow step, and never let a failed dispatch block the task. A reused MR (`reused: true`) already carries its review, so skip it.

On failure the script records `FAILED` with a classified cause and exits `2`, and then the run blocks. Record the failure by hand only when the script could not — it ran with `--no-record true`, or it died before reaching the recording step:

```shell recovery
node {J}/state.mjs mr-result --run-root "{run-root}" --task "{task-number}" \
  --project "{project}" --status FAILED --reason "{what the forge reported, verbatim}"
node {J}/state.mjs block --run-root "{run-root}" --task "{task-number}" \
  --reason "REMOTE_DELIVERY_FAILED: {project} — {cause from mr-deliver stderr}"
```

The recorded `failure.stage` is what a resumed run reads: `PUSH` means retry the push, `MR_CREATE` means the branch is already there and only creation is retried. **Never re-push while resolving a failed create.** `DONE` requires every registered project to be `CREATED`.

### 8. Finalize

Transition the task to `DONE`, aggregate every task result in the main session, then update the shared handoff once — through `/pack` where that skill is installed, and skipped entirely where it is not, since a handoff file only means something to a project that keeps one. Preserve the map, the event log, and the artifacts. Return one developer-facing result with scope decisions, commits, QA and review evidence, MR URLs, and any consolidated blocker — and include the run's own timing, so a slow stage gets noticed while the evidence for it still exists:

```shell
node {J}/state.mjs timeline --run-root "{run-root}" --task "{task-number}"
node {J}/state.mjs transition --run-root "{run-root}" --task "{task-number}" \
  --stage DONE --next-action FINALIZE
```

Autopilot created no checkout, so it removes none: leave each project on its branch with its commits. Do not ask whether to clean the run directory or tidy untracked files — preservation is already the decision, and a blocked run's evidence is all a resumed session has. When the run stops early, the consolidated decision request is the **only** place a question may appear; appending operational questions to it turns one answerable report back into the stream of prompts this skill exists to avoid.

## Stop conditions

Report instead of bypassing, and record the reason so the resumed run knows why it stopped: missing approval, approval hash drift, invalid plan, project checkout mismatch, missing goal evidence, missing workflow step record, QA limit, weakened tests, repeated review findings, partial forge failure, or disagreement between the central map and Git.

```shell optional
node {J}/state.mjs block --run-root "{run-root}" --task "{task-number}" --reason "{reason}"
```

Two failure classes, two behaviours. **Correctable validation errors** — syntax, missing arguments, a wrong stage, a non-sequential round — refuse the action and leave the task status alone; call `block` only when the underlying problem cannot be corrected, so the next session does not retry into the same wall. **Convergence violations** — QA budget exhaustion, weakened QA evidence, repeated QA fingerprints, repeated review fingerprints — set the task to `BLOCKED` themselves before returning exit `1`.

A `state lock exists` or `artifact lock exists` message after a crashed process is recovered deliberately, never by deleting the file. Both commands refuse while the recorded process is alive or its identity cannot be verified:

```shell recovery
node {J}/artifact.mjs unlock --run-root "{run-root}" --expected-pid "{pid}"
```

Only evidence-correctable convergence blocks can be reopened. Supply the exact current blocked reason so a stale recovery command cannot clear a newer failure, and register the resolution evidence:

```shell recovery
node {J}/state.mjs unblock --run-root "{run-root}" --task "{task-number}" \
  --expected-reason "{blockedReason}" --reason "{why recovery is valid}" \
  --actor "{recovering actor}" --resolution-evidence "{resolution evidence path}"
```

Which reasons `unblock` accepts, and where each one rewinds to, is in [references/runtime-contract.md](references/runtime-contract.md). Budget exhaustion, review-attempt exhaustion, and authorization failures are not among them — those need a new or explicitly redesigned run.

A `PLAN_` reason is recoverable only before any goal, commit, or push: rewind to `PLAN`, plan and plan step invalidated, `plan.revision` +1, projects and branches kept. Read the revision from `next`, redo the plan step, register artifacts under it; a changed project set is refused at `DEVELOP` (new run). While `BLOCKED`, only `unblock`, `next`, `verify`, and `timeline` run — a second `block` included, everything else is refused.

There is no run viewer. Read `autopilot-map.json`, `events.jsonl`, and `artifacts.json` directly when you need to inspect a run.
