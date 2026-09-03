# Expert challenge (brief step)

Detail for step 1 of the workflow. Autopilot dispatches one expert subagent over the finished brief before planning; this file holds the discipline that dispatch runs under. `SKILL.md` keeps the calls and the gate.

## Anchor IDs

When the source documents carry anchor IDs, validate zero loss between their exact set and the anchors carried into the brief. Compare the anchor strings **verbatim** — do not re-encode, prefix, or otherwise rewrite them. When no source anchor exists, record `anchorCheck: NOT_APPLICABLE` in the expert gap report instead of inventing anchors.

## Citation lint

Lint the brief's citations **before** dispatching the expert, and lint the expert's report when it returns. A wrong `file:line` costs twice: the reader trusts evidence that is not there, and the reviewer spends judgment budget on coordinate arithmetic.

- `ERROR` (missing file, line past the end of the file) blocks.
- `WARN` (the quoted literal sits at another line, a quoted method does not exist, an ambiguous bare filename) is reported with the line the literal actually occupies.

The linter checks coordinates, not conclusions. A citation can be perfectly valid while the inference drawn from it is wrong — that is what the expert is for, and no lint result excuses skipping it.

## One expert, with a budget

One expert, not a panel: splitting the challenge into three section-scoped experts was measured at 19, 21, and 24 minutes against the single expert's 13 — a narrower scope does not make a subagent finish sooner, it makes it dig deeper into the scope it was given. Parallelism hid part of that cost and the rest arrived as a main-session backlog of findings to fold in. The budget in the prompt is what keeps one expert from doing the same thing.

- **Cap the findings** at roughly a dozen, ranked, and say what was dropped. An expert that reports everything it noticed transfers its own triage cost to the caller, who then pays it serially.
- **Every finding carries `file:line` or a brief section number.** A finding with no coordinate cannot be verified and cannot be dispositioned — it becomes a paragraph the caller has to think about instead of check.
- **Severity is required and means what it says.** `BLOCKER` = the output goes out wrong or the contract is unimplementable. Everything else is `NOTE`. There is no middle tier, because a middle tier is where the backlog grows.
- Cross-section contradictions are the point of giving it the whole brief — a mapping in one section that disagrees with a code value in another, an implementation order that assumes something scope excluded. A section-scoped expert structurally cannot see those, which is the reason not to split.

## What to fold

Revise the brief for `BLOCKER` findings and for anything that changes a field, a filter, a code value, or a boundary — **by re-invoking the step**, never by editing the file. Everything else goes into the brief's open-items section with its coordinate: the brief schema has a designed place for a known-but-undecided thing, and moving a `NOTE` there costs one line instead of a rewrite. Reflecting every finding is how a 13-minute verification became an hour.

The expert's report is advisory evidence, not authority to expand the requested scope (invariant 9).
