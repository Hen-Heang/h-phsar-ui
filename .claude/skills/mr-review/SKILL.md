---
name: mr-review
description: GitLab MR 을 코드 리뷰하고 결과를 MR 댓글로 등록한다. 사용자가 "mr-review", "MR 리뷰", "MR 검토", "머지리퀘스트 리뷰", "MR 번호로 리뷰해줘", MR URL 리뷰 요청 등을 언급하면 이 스킬을 사용한다. dev-autopilot 이 MR 생성 직후 백그라운드로 부르는 진입점도 이 스킬이다.
argument-hint: "[MR 번호|project_id MR번호|MR URL] [--background]"
---

# MR Review

Dispatches the `mr-reviewer` agent. This skill owns the dispatch and nothing else: the review algorithm lives in `.claude/skills/code-review/references/*`, and comment registration + Flow notification belong to the SubagentStop hooks (`hooks/mr-review/post-comment.sh` → `hooks/mr-review/flow/notify.sh`). Never call the GitLab API from here.

## Dispatch

Run `subagent_type=mr-reviewer` with the Task/Agent tool and pass the arguments through as the agent prompt, verbatim.

- **Foreground (default)** — a person asked, so the review markdown has to come back into this conversation.
- **Background** — pass `run_in_background: true` when `--background` is present or when the caller is another skill (dev-autopilot dispatches this right after it creates the MR). The agent's stdout is not needed: the comment reaches the MR through the hook and the Flow notification follows it. Report what was dispatched (MR + agent name) and continue — never wait for the review, and never let its outcome gate the caller's flow.

One MR per dispatch. Several MRs = several dispatches; background ones may overlap.

## Input

No argument → ask which MR (number, `project_id MR번호`, or URL). Never infer it from git state: the branch you are on is not evidence of which MR is open.

`gitlab.url`/`token` come from `.claude/config/system.yaml`, read by the agent's own script. A missing or unfilled config surfaces as that script's error — do not pre-read the secret file to check it.
