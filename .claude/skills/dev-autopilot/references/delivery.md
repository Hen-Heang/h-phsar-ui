# Remote delivery (commit → push → MR)

Detail for step 7 of the workflow. `SKILL.md` keeps the call sequence and the guards; this file explains what the two delivery scripts do and why the run must not do it by hand.

## `mr-request.mjs build`

Builds the request from the run itself — branch, commit, target branch (from the recorded `baseRef`), MR title (from the commit subject, minus the branch tag), changed files, QA rounds, review attempts, the brief's open questions, and the forge project id from `.claude/config/system.yaml`. Do not transcribe any of it by hand: every value already exists in the run, and a hand-copied number becomes the number the MR reviewer trusts.

It validates every project before writing anything, then generates one `mr-desc-{project}.md` **skeleton per project**, so each MR contains only its own repository's files. Tables are derived; the `<<< >>>` blocks are the only part a human writes. Re-running keeps each existing description unless `--force true`.

It refuses to finish when a registered project has no forge id in `gitlab.projects` — otherwise the document looks complete and fails only at delivery, after the gate has already been recorded. `--allow-missing-forge-id true` overrides that when the forge is deliberately unconfigured.

The open-question list comes from the brief registered with `--kind brief`. Without that artifact the list is empty, the description keeps its placeholder, and `create` refuses to send it.

## `mr-deliver.mjs push` / `create`

The only script that talks to the forge, and the only place the token is read at delivery time (`gitlab.url`, `gitlab.token`, `gitlab.projects` — the same values `mr-reviewer` uses), so the token never reaches a command line, a log, or a report. It sends the payload through an HTTP body rather than shell arguments: a Korean title passed as an argument gets its UTF-8 mangled by the shell on Windows and the forge answers with a plain `Bad Request` that reads exactly like a credential failure. **Do not replace these calls with `curl`** — that is the trap they exist to remove.

Both commands are idempotent:

- `push` verifies HEAD, the checked-out branch, and its local ref all equal the recorded commit before using an explicit local→remote refspec; an already recorded delivery is skipped.
- `create` adopts an existing open MR for the same source→target instead of opening a second one, which is what a resumed run needs.
- `--dry-run true` prints the payload (title, description size, unfilled placeholders, target) without calling the forge.

## Failure

On failure the script records `FAILED` with a classified cause and exits `2`. It classifies **before** recording, using read-only probes — project access, then source and target branch existence — because a token that reads but cannot write is a permission problem, a missing branch is a push problem, and a rejected payload is neither.

`projects.{project}.delivery.failure.stage` is:

| stage | meaning | how a resumed run proceeds |
|---|---|---|
| `PUSH` | nothing reached that remote | retry the push |
| `MR_CREATE` | the branch is pushed, only creation failed | retry creation only — **never re-push** |

The recorded `remoteSha` is proof the branch is already there, and `push` refuses anyway once a delivery is recorded. `DONE` requires every registered project to be `CREATED`, so neither a missing MR nor one repository's success can hide another's missing delivery.
