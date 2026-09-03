# Runtime contract

## Ownership

| File | Writer | Purpose |
|---|---|---|
| `autopilot-map.json` | main session through `state.mjs` | current state |
| `events.jsonl` | `state.mjs` | append-only transition history |
| `artifacts.json` | `artifact.mjs` | artifact allowlist and metadata |
| `tasks/{task}/**` | owning task agent | per-task evidence |
| `tasks.{task}.steps` in `autopilot-map.json` | `state.mjs step` | which skill actually performed each workflow step |

The run root is exactly `{workspaceRoot}/.autopilot/{runId}`, where `workspaceRoot` is the directory holding the project repositories, persisted at initialization. It may be a repository top level or a plain directory outside any repository; a path inside a repository is rejected, since runtime state buried in one working tree pollutes it. The run root holds **state and evidence only**.

The current map schema is version 5. Approval records (the run authorization, approved gate documents, the expert gap report) may additionally carry `snapshotPath` — a run-root snapshot of the approved bytes — and a `sourceMissingObservation` marker; both fields are optional, and a schema-5 record without them is verified against its original path only, exactly as before. Earlier run maps are rejected with an explicit unsupported-schema error rather than guessed or silently migrated; start a new run so remote delivery evidence cannot be misattributed.

Task ids are path segments (`tasks/{task}/**`). A new task must match `[A-Za-z0-9][A-Za-z0-9_-]*`; consuming commands reject only the dangerous forms (`.`, `..`, `/`, `\`, `:` — both separators regardless of platform, and `:` because Windows reads it as an NTFS alternate data stream), so a dotted legacy task id keeps resuming.

## Run id

`{run-id}` names the run directory: `{session}-{task-number}-{seq}`. `{session}` is the **first 8 characters** of `$CLAUDE_CODE_SESSION_ID`, and `{seq}` counts re-runs of the same task from that session, starting at 1.

Why abbreviated: `{run-root}` is spelled out in full in every command of the run, so a 36-character id would be paid dozens of times over for no added meaning inside one workspace. Why the session at all: a task number alone cannot tell two attempts apart, and the run cannot be matched back to the session that produced it — which is what a measurement needs.

The truncation is display-only. `init --session-id` records the **untruncated** id as `sessionId` in `autopilot-map.json` and echoes it in the `initialized` line, so the durable link is the field, not the folder name. The argument is optional and records `null` when absent, since a run started outside a Claude session has no id to give — the run still works, it just cannot be correlated.

No script enforces the format: `init` only requires `--run-root` to equal `{workspace-root}/.autopilot/{run-id}`, and run lookup globs `.autopilot/*/autopilot-map.json`, so a differently named run is found either way. The convention is for the person reading `ls .autopilot/`.

## Workflow steps

`references/autopilot-workflow.json` is the whole step contract, and `state.mjs` reads it rather than carrying a second copy, so the contract and the check cannot drift apart. Each step declares what it is called with (`skill`, `mode`), what it must produce (`proof`), and **which transition demands it** (`requiredFor`, plus `perPhase`, `freshnessAfter`, `exemptWhen`). The stage machine — the legal transitions and every non-step gate — stays in `state.mjs`; a gate that required editing the script for each new step would let a step be registered with nothing demanding it.

| Transition into | Required step | Proof |
|---|---|---|
| `BRIEF_APPROVAL` | `brief` | format-gate verdict receipt (`pass: true`) |
| `PLAN` | `prepare` | none — attestation with an actor, plus the proposal's artifact snapshot |
| `PROJECTS` | `plan` | `plan-manifest.json` |
| `CODE_REVIEW` | `develop`, one per planned phase (`perPhase`) | that phase's `round-{n}.json` |
| `CODE_REVIEW` | `qa`, once per task (`freshnessAfter: develop`) | verdict receipt (`pass: true`), **and newer than every recorded `develop` step** |
| `COMMIT` | `code-review` (`exemptWhen: reviewAcceptedExisting`) | none — attestation with an actor |

`accept-existing-review` is exempt from the `code-review` step: that path deliberately does not run a review in this run, and it records the original review's hash, the target commit, the actor, and the reason instead. Demanding a step record there would only produce an attestation for a call nobody made.

`step` **composes** the recorded invocation from the workflow contract: `/{skill}`, the caller's `--args`, and the step's mode word. The caller supplies arguments only, and `--args` beginning with `/` is refused. Composing beats checking a caller-supplied string for two reasons. A POSIX-imitating shell rewrites a leading `/` into its own install path, and a run that recorded `C:/Program Files/Git/dev-interview …` passed a substring check while no longer describing the command anyone issued. And once the script owns the string, `/dev-interviewer` and `autopilot-orchestrated-plus` cannot appear at all — there is nothing left to mistake for the real skill or the real mode word.

Two different things are being checked, with two different strengths. **Which skill ran is attested** — Autopilot records that it issued the call, and nothing here can prove it really did. **What the step produced is measured** — the proof file is read, and a proof that cannot be parsed is refused: not knowing the verdict must not read as passing it. The contract declares which of two kinds each step produces. `proof: "verdict"` is a judgment the step wrote about its own output (brief format gate, QA conformance receipt) and passes only on `pass: true` — the party being checked is the party writing the file, so a receipt with no verdict in it (`{}`) must not count as one. `proof: "file"` is the artifact itself (plan manifest, QA round) where no verdict field is expected and a `RED` round still has to be recordable; it is checked for existence and parseability, and refused if it does carry `pass: false`. Proofs are not snapshotted, so register the file as an artifact and point `--proof-file` at the run-root copy; otherwise the recorded evidence can outlive the file it names. The `code-review` step has no machine proof because that skill writes no file, so it is attestation only; its record exists so a missing review is visible in `events.jsonl` rather than invisible everywhere.

The `prepare` step is the one step whose own outcome can stop the run. `/dev-prepare` proposes and never executes, so what it produces is a list of things a person must finish — and while a **BLOCKING** item is open, planning around it would build a plan on a precondition nobody met. That case blocks with `PREPARE_INCOMPLETE: {items}`. `unblock` does not accept that reason: the recoverable list covers the failures where a run already holds work worth saving (weakened QA evidence, repeated failures, a failed remote delivery on top of an existing commit), and a preparation block happens before `register-project`, so no branch and no commit exist yet. Once the items are done, start a **new run** — the cost is one brief and one proposal, and no branch-name collision can occur. Adding the reason to the recoverable list is a separate change; nothing here silently rewinds a stage that never advanced.

Autopilot creates no checkout; it creates the working branch inside one. `register-project` takes the existing checkout — path defaults to `{workspaceRoot}/{project}`, `--path` may name another checkout inside the workspace root — requires it to be a Git work tree top level and clean, then creates `--branch` from `--base-ref` (default `HEAD`) with `git switch -c`. The first project fixes the task-level `sourceBranch`; every later repository must use that exact branch name. BE/FE areas and phases do not create branch variants. An existing branch name is refused rather than reused, so a task never lands on top of another history. The branch's starting commit becomes `baseCommit`. No linked worktree is created; the run root holds state and evidence only. `goal-start` binds a phase to one registered project and stores that checkout as `workingDirectory`. The subagent session must start there and verify its Git top level before any write.

Because the checkouts are shared with the rest of the workspace, isolation is **not Autopilot's to guarantee and not Autopilot's to enforce**: two tasks registering the same checkout would interleave commits under one HEAD ratchet, and nothing here checks for it. Whoever schedules tasks in parallel owns that separation. Autopilot assumes one task per checkout, works on the branch it created, and reports what it observes there.

The run map also stores the initial authorization document path and SHA-256. That authorization is immutable for the run. `state.mjs verify` re-hashes it and every approved gate document before resume or remote delivery, and checks each registered project checkout for forward-only movement: same branch, and the recorded head still an ancestor of the current HEAD. Commits made while implementing are expected and pass; every successful check records the observed HEAD, so the recorded value ratchets forward and a later attempt to drop an observed commit fails. A branch switch or a rewritten history (`reset`, `rebase`, force update) fails, because the recorded evidence no longer describes the tree. `projects.{project}.baseCommit` keeps the immutable starting point; `head` is the last observed one.

Approval evidence is snapshotted at record time: `init`, `approve`, and `reapprove` copy the document into the run root at an immutable content-addressed path (`authorization/{sha256}.md`, `tasks/{task}/gates/{gate}/{sha256}.md`, `tasks/{task}/gates/expert-gap/{sha256}.md`) and store it as `snapshotPath`. Every hash check is then dual-path: the snapshot must exist and match the recorded hash, and the original (`documentPath`) is re-hashed **whenever it still exists** — a changed original still fails with hash drift, while a deleted original passes on the snapshot and is reported as a missing source. The same rule applies at every check site (stage transitions, plan registration, remote delivery); only the explicit inspection commands `verify` and `next` persist the missing-source observation, deduplicated per (documentPath, documentHash) so a reapproval's new hash re-arms it. `autopilot-map.json` is the source of truth for source-missing observations; the matching `SOURCE_MISSING` event is best-effort and at-most-once — a process failure between map persistence and event append may leave the map observation without an event. `verify` reports the full current `missingSources` on every run plus `resumeReadiness`: `DEGRADED` when any source is gone, `UNKNOWN` otherwise. `valid` attests the integrity of recorded approval evidence, **not** that every working document (plan and phase documents included) still exists for the next stage to consume — snapshots are a recovery net, not sanctioned deletion, so do not clean the output directory while any of its documents is still unconsumed by the run. Snapshot writes guard their own filesystem boundary (canonical run root, pre-`mkdir` realpath of the nearest existing parent, exclusive UUID-named temporaries, rename-only placement that severs pre-planted links), but path checks cannot close the window between check and write: a concurrently malicious process altering the run root is outside the trust boundary.

Stages: `INPUT → BRIEF → BRIEF_APPROVAL → PLAN → PROJECTS → DEVELOP → QA → CODE_REVIEW → COMMIT → MR_APPROVAL → MR_CREATE → DONE`.

Commit, push, and the MR request are part of every run: `COMMIT` leads only to `MR_APPROVAL`, and there is no shortcut from the commit to `DONE`.

Delivery is tracked per registered project at `projects.{project}.delivery`. `PUSHED` is accepted only in `MR_APPROVAL`, only for that project's recorded commit SHA. `MR_CREATE` opens only after every project has either `PUSHED` or a recorded push failure. `CREATED` is accepted only in `MR_CREATE` and only after that same project is `PUSHED`.

Delivery is mandatory, so a delivery failure blocks the run: `mr-result --project <id> --status FAILED --reason <text>` records `stage: PUSH` in `MR_APPROVAL` or `stage: MR_CREATE` after a successful push, sets the task to `BLOCKED` with reason `REMOTE_DELIVERY_FAILED: <project> — <cause>`, and leaves `nextAction` at `REPORT_BLOCKER`. `DONE` requires every project to be `CREATED`; a recorded failure is not an accepted ending, because a run that implemented and committed but delivered nothing would otherwise report as complete while no branch or MR exists for anyone to pick up.

The recorded `failure.stage` is what a later run reads to decide how to resume: `PUSH` means nothing reached that remote, `MR_CREATE` means the branch is already pushed and only creation failed. Never re-push to resolve a failed create — the recorded `remoteSha` proves the branch is there. Forge connection values come from `.claude/config/system.yaml` (`gitlab.url`, `gitlab.token`, `gitlab.projects`), the same file `mr-reviewer` reads; `preflight` refuses to start a run when they are missing, so a missing forge configuration fails before implementation rather than after it. `mr-deliver.mjs` is the only script that calls the forge and the only place the token is read at delivery time. Push validates the current checkout and explicit branch ref before remote mutation; MR payloads use an HTTP body, and each project reads its own description path from the request. Empty or unfinished descriptions are refused before network access. `mr-request.mjs` validates the complete run before writing, derives one request entry and description per project, and never touches the network. `qa-collect.mjs` runs the build, parses the caller-selected xUnit XML reports, and records the round itself; existing round files are immutable, malformed reports exit `2`, and a `RED` round exits `1` after evidence is written. It reads the `buildArgs`/`buildArgsRequired` contract fail-closed, because a guard against vacuous GREEN that disables itself when a config line changes shape is not a guard. `evidence-lint.mjs` checks `file:line` citations and blocks only on coordinates that cannot be right — a missing file or a line past the end of one.

All scripts print one compact JSON object on stdout and one line on stderr when they fail; `evidence-lint` takes `--pretty true` for human reading. A silent success is a defect, not a convention: piping empty output into a parser raises `Unexpected end of JSON input`, which reads exactly like the command having failed — and a caller avoiding that re-parses `autopilot-map.json` after every state change instead.

`state.mjs` satisfies this in one place rather than per command: `init`, `goal-start`, `verify`, `next`, `timeline`, and `unlock` print their own shape, and every other subcommand gets `{status, command, task, taskStatus, currentStage, nextAction, blockedReason}` from a single emitter after the dispatch. A new subcommand is therefore never silent by default.

`state.mjs timeline` reports where a run's wall clock went, derived from `events.jsonl` alone — `RUN_INITIALIZED`, `STAGE_TRANSITION`, and `STEP_RECORDED` are the span boundaries because those are the points the orchestrator declared it had moved on. It reads and computes only; `--task` narrows to one task plus the run-level events. None of them print the forge token, and `mr-deliver` masks it in every message it emits.

Statuses: `PENDING`, `RUNNING`, `WAITING_APPROVAL`, `BLOCKED`, `FAILED`, `COMPLETED`, `CANCELLED`.

## Goals and loops

- Stable logical goal: `task-{task}-phase-{phase}`.
- Replacing an agent session adds an execution; it does not create a new logical goal.
- Keep `INITIAL_IMPLEMENTATION` and `REVIEW_REMEDIATION` goals distinct.
- Each goal gets its own QA round budget. Round numbers keep increasing across goals so evidence files never collide, and the limit is measured from `convergence.roundBase`, the round count the previous goal ended on. Sharing one budget would make a phase that needed three rounds unable to record its remediation result at all.
- `register-plan` parses the validated manifest, records its non-empty unique phase-id set, and `goal-start` accepts only those ids. `CODE_REVIEW` requires every planned phase to have a completed logical goal; an empty runtime phase map never counts as completion.
- `register-plan` accepts only a schema-2 manifest, where every phase carries `project` (`project.yaml projects[].name`, a single safe identifier), and records it as `plan.phaseProjects`. `goal-start` binds a phase to one project permanently, so the plan has to declare that project up front: the `DEVELOP` transition refuses unless the planned project set equals the registered project set (`register-project` is legal only in `PROJECTS`, and `DEVELOP` never returns there), and `goal-start` refuses a project other than the phase's planned one. A map without `phaseProjects` (an older run) skips both checks so it can still resume; a v1 manifest is not registered — rebuild it. Projects are never inferred from relative paths: phase file paths and scope `allowedPaths` are both project-root-relative, so two checkouts with the same layout cannot be told apart that way.
- `plan.revision` starts at `1` and is raised by each `PLAN_` recovery. Plan artifacts are registered under it — `{task}-plan-r{revision}-root|manifest|phase-{id}` at `tasks/{task}/artifacts/plan/r{revision}/…` — because the artifact registry refuses a reused id and a reused destination, and a re-plan in the same run would otherwise stall at its first registration. Earlier revisions stay in the registry as evidence of the plan that was discarded.
- A QA round is independent from an execution. Reassigning an interrupted agent does not consume a QA retry.
- Task agents write evidence only. The main session applies validated evidence to the central map.
- Recording a phase result moves the task to `QA`. If another phase goal is incomplete, the next action remains `WAIT_DEVELOP_GOAL`; only the last completed phase unlocks `RUN_CODE_REVIEW`. Starting another goal moves the task back to `DEVELOP`. Completeness is measured against `plan.phaseIds`, not against the phases that happen to be in the runtime map — a phase nobody has started yet must not read as one with nothing left to do.
- QA budget exhaustion, weakened test evidence, repeated QA fingerprints, and repeated review fingerprints are terminal convergence violations. The failing command records `BLOCKED`, a stable reason, and a `TASK_BLOCKED` event before returning validation exit `1`.
- `BLOCKED` is enforced, not advisory: while a task is `BLOCKED`, only `unblock`, `next`, `verify`, and `timeline` run; every progress or recording command — including a second `block` — is refused with the current reason. Without this, `goal-start` and `transition` used to overwrite the status to `RUNNING` and leave `blockedReason` set with no `TASK_UNBLOCKED` event, and a second `block` overwrote the reason.
- `unblock` is limited to evidence-correctable `WEAKENED_QA_EVIDENCE`, `REPEATED_QA_FAILURE`, `REPEATED_REVIEW_FINDING`, `REMOTE_DELIVERY_FAILED`, and `PLAN_`-prefixed blocks. It requires the exact expected blocked reason, an actor, a recovery reason, and a resolution-evidence file. It stores that file's SHA-256 and appends `TASK_UNBLOCKED`. Budget, attempt, and authorization blocks require a new or explicitly redesigned run path.
- A `PLAN_*` reason (one the orchestrator raises because the plan itself cannot be executed — `PLAN_PHASE_SPANS_TWO_PROJECTS`, for instance) rewinds to `PLAN` / `CREATE_PLAN`, and only while no phase has an execution, `commit.status` is `NOT_STARTED`, and no project's delivery has started; after any of those, the evidence belongs to the old plan and the recovery is a new run. The recovery records the previous plan (paths, hashes, revision) in the unblock record, resets `task.plan` with `revision + 1`, and deletes the `plan` step record, so `PROJECTS` cannot reopen on the stale plan — the plan step, `register-plan`, and the `PROJECTS`/`DEVELOP` transitions all run again. Registered projects and their branches are kept (that is the point: `register-project` would refuse the existing branch in a new run), and the `DEVELOP` set check refuses a re-plan that changed the project set — that case is a new run. Neither `unblock`'s common response nor `goal-start` prints the revision; read it from `next`.
- A `REMOTE_DELIVERY_FAILED` unblock rewinds each failed project to the state its recorded `failure.stage` implies — `PUSH` back to `NOT_STARTED` so the push is retried, `MR_CREATE` back to `PUSHED` with `remoteSha` preserved so only creation is retried — and restores the run to `MR_APPROVAL` or `MR_CREATE` accordingly. It is recoverable because the cause is usually an external credential or permission fix, and the run already holds a commit and possibly a pushed branch: forcing a new run would strand them, since `register-project` refuses a branch name that already exists.

## Approvals

Store evidence gates with the document path, SHA-256, actor, and timestamp. Treat a gate as invalid if the document changes. The brief gate requires a resolved expert gap report before planning. The MR-request gate and unchanged initial authorization gate push.

The developer's initial invocation is the user authorization. Intermediate brief and MR checks are internal evidence gates performed by Autopilot and expert agents; they are not conversational approval prompts.

Hashes are byte-exact. `reapprove` may replace an already approved gate only while the task is still in that gate's approval stage, and records the previous hash, new hash, reason, actor, and time. It cannot bless a brief after planning has begun; later drift requires blocking and restarting from the brief so dependent evidence is rebuilt.

## Review evidence

`review-result` is accepted only in `CODE_REVIEW`. Do not pre-record a result before entering that stage.

A remediation goal's QA round moves the task to `QA`, so the second review result needs `QA -> CODE_REVIEW` first. That transition is allowed; the phase goals are already complete and their `develop` steps already recorded, which is what the `CODE_REVIEW` guard checks. One demand can re-arm on re-entry: the guard also refuses a `qa` verdict older than the newest recorded `develop` step, so if remediation re-recorded a `develop` step, `/qa-test` must run again before the stage reopens — a verdict taken before the fix vouches for code that no longer exists. Re-entering the stage is a step in the remediation path, not a recovery from a mistake.

The `qa` step's proof is a **verdict receipt**, not a machine measurement: the step skill in orchestrated mode writes a small JSON recording what it evaluated and what it concluded, and that skill owns the receipt's fields. `state.mjs` does not re-judge the report — it checks the receipt parses, `pass` is `true`, and the record is fresh. Test execution's machine evidence stays with the qa-collect rounds; the receipt adds plan-conformance on top. Unattended runs never execute E2E TCs (they need a live server, credentials, and human-supplied data), so a required-E2E skip is `INCOMPLETE`/`pass:false` — a skip is not a failure, but it is not a success either, and the skipped list must reach the MR description.

It writes `tasks/{task}/review/attempt-{n}.json` itself — attempt number, verdict, the `--critical`/`--warning`/`--info` counts, the fingerprints, and the review document path. `mr-request` derives the MR's review table from that directory, so the recording command and the aggregator share one producer. Leaving the counts off records them as `null`, and the derived table then shows blanks where the MR reviewer expects numbers.

An existing review may be reused only through `accept-existing-review` while already in `CODE_REVIEW`. It requires a registered project, a clean checkout, an original review file, a target commit SHA equal to that checkout's current HEAD, a reason, and an actor. The map records `sourceReviewSha256`, `targetCommitSha`, `project`, `reason`, `actor`, and `acceptedAt`; `events.jsonl` receives the same immutable audit facts. This explicit path is the only supported review-reuse exception.

## Autonomous decisions

Autopilot records each decision as `{kind,value,evidence,decidedAt}`. Required kinds are `PROJECT_SCOPE`, `BASE_REF`, `SOURCE_BRANCH`, and `PHASE_ROUTING`.

- Project scope comes from changed-code ownership, brief anchors, plan files, repository boundaries, and expert review.
- Base ref comes from the remote default-branch symbolic ref or explicit repository configuration.
- Source branch follows the installed commit convention and must be collision-free.
- A missing routine choice is resolved internally. A non-derivable product, legal, security, or destructive-operation choice blocks the run.

## Resume

`verify` must succeed before `next`, reassignment, commit, push, or MR creation. Recover a stale state lock only with `state.mjs unlock --run-root <root> --expected-pid <pid>` and a stale artifact lock only with `artifact.mjs unlock --run-root <root> --expected-pid <pid>`; both refuse while the recorded process is alive or its identity cannot be verified. Reassignment closes the active execution as `INTERRUPTED` and appends a new execution to the same logical goal.

## Next action

Use one `nextAction` enum instead of combinations of booleans:

`BUILD_BRIEF`, `REQUEST_BRIEF_APPROVAL`, `CREATE_PLAN`, `REGISTER_PROJECTS`, `CREATE_DEVELOP_GOAL`, `WAIT_DEVELOP_GOAL`, `REASSIGN_GOAL`, `RUN_CODE_REVIEW`, `CREATE_REVIEW_REMEDIATION_GOAL`, `CREATE_COMMIT`, `BUILD_MR_REQUEST`, `REQUEST_MR_APPROVAL`, `PUSH_BRANCH`, `CREATE_MR`, `FINALIZE`, `STOP_AND_REPORT`, `NONE`.

## Executable documentation

Fence info strings are part of the contract: `shell` contains the normal completion sequence, `shell optional` contains conditional alternatives, and `shell recovery` contains failure recovery. Validation tooling must parse and test the three categories separately rather than executing every shell-like block as one sequence.
