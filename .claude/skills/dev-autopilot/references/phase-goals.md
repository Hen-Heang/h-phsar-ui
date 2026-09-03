# Phase goals and QA rounds

Detail for step 4 of the workflow. `SKILL.md` keeps the call sequence; this file holds why each part of the dispatch is shaped the way it is.

## The task agent's reading budget

The phase document and its manifest control record are the contract. The brief and the root plan are the two largest documents in the run, and their requirements were already resolved into the phase document — an agent that opens them anyway is not being thorough, it is spending its context on decisions someone already made.

Measured: an implementation agent that read brief + root plan + phase document reached 306k tokens and died on `529 Overloaded` after 31 minutes, and resuming that transcript failed the same way. A large context makes the retry fail too, so the budget is what keeps a phase recoverable.

If the phase document turns out to be insufficient, that is a planning defect to report back — not a gap to fill by re-reading upstream.

## Why the agent may not run other workflow steps

- **Review happens once**, over the cumulative diff. Per-phase reviews duplicate findings and still miss the contradictions that only appear across phase boundaries.
- **QA is measured in the main session** by `qa-collect.mjs`, and the implementation-to-QA convergence loop belongs to the goal level (invariant 5). A loop that tests and fixes inside the agent reports a convergence nobody measured.
- **The task-level conformance pass happens once**, after every phase is GREEN. The agent implements and returns.

The step skill also has a mode that dispatches whole phase sets and advances to the next set by itself. Appending it would walk straight past the per-phase evidence gate the `develop` step exists to hold, so the contract's mode word is the only one that goes into the instruction.

## Round budget and convergence

- Complete the goal on QA GREEN.
- Each goal has **its own three rounds**, counted from where the previous goal ended, so a remediation goal always has room to record its result. Round numbers keep increasing so evidence files stay distinct.
- On a RED round below the limit, re-dispatch the task agent for the same goal with **that round's failure report** (`round-{n}.json`: failed tests, expected vs actual). Remediation input comes from the machine's report, not the agent's memory of what it ran.
- Stop on the third RED of the current goal, repeated failure fingerprints, reduced tests or assertions, or increased skip markers.
- A QA round is independent from an execution: reassigning an interrupted agent does not consume a retry.

## What the stage machine does with the result

`phase-result` moves the task into `QA`, making QA an observable stage rather than only an evidence label. `register-plan` recorded the exact phase-id set from the validated manifest, and `goal-start` refuses any phase outside it. In a parallel phase set, one GREEN phase leaves `nextAction=WAIT_DEVELOP_GOAL` while any planned sibling is incomplete; only when every manifest phase has a completed goal does the `CODE_REVIEW` transition succeed. Starting a later goal or a remediation goal moves the task back to `DEVELOP`.
