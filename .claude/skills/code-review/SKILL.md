---
name: code-review
description: 현재 git 변경사항을 자동으로 읽어 코드 리뷰를 수행한다. 사용자가 "코드 리뷰", "리뷰 해줘", "변경사항 검토", "PR 리뷰", "커밋 전 검토", "diff 확인", "코드 점검", "code review" 등을 언급하면 이 스킬을 사용한다.
argument-hint: "[staged|unstaged|all|HEAD~N] [ko|en] [경로...]"
---

# Code Review

<Overview>
Reviews the current git changes by **delegating** to the `code-reviewer` sub-agent (isolated context). Only the review markdown (stdout) returns to the main session, so there is no accumulation burden of references · diff · log.

If an active `/develop` scope exists, the review is **automatically confined to that range (allowedPaths)**.

**Preload (once at entry)**:
- `.claude/config/project.yaml` — single source for paths · DB schema · project enums · projects[].guideline · `codeReview.*` knobs · `features.scope.enabled` (missing → `ko`·`staged`·30·500·scope on).
- `.claude/config/scope.yaml` — scope identifier · allowedPaths resolution (for automatic scope confinement; only when `project.yaml features.scope.enabled: true`).

> **The review engine is the `code-reviewer` agent.** The single sources for algorithms · rules · severity · output templates · large-diff policy · mapper SQL are [`references/*`](references/) and [`scripts/severity-scan.ps1`](scripts/severity-scan.ps1). This skill handles **input parsing · scope resolution · agent dispatch** only.
</Overview>

<Input_Format>

The `$ARGUMENTS` parsing spec (TARGET / LANG / PATH) has a single source: [`references/input-format.md`](references/input-format.md).

If `$ARGUMENTS` contains the word `autopilot-orchestrated`, strip that token before parsing and set `{orchestrated} = true` (see 「Orchestrator mode」).

</Input_Format>

<Scope_Resolution>

Determine the review range (PATH) **before** agent dispatch.

> **Automated callers pass PATH as an argument.** When another skill/agent invokes this skill, it already knows the scope, so it carries PATH tokens in `$ARGUMENTS`. Then steps 1·3 below are skipped and step 2 settles it — the range is decided deterministically without inference, and what was reviewed is reproducible from the arguments alone. There is no need to pass the scope around via files or separate state.

1. **Determine the active scope (only when a human invokes directly, with no arguments)** — check the conversation context for an active scope set via `/develop` in the current session (+ subScope param: `menuId`/`jobId`). In executions without conversation context (headless · sub-agent) this determination cannot be made, so it always falls through to 4.
2. **Explicit PATH wins** — if `$ARGUMENTS` has PATH tokens, use them as-is and skip scope resolution.
3. **Scope → PATH resolution** (when 1 holds and 2 does not) — each project is an **independent git repository**, so `/code-review` runs inside that project's repository and `git diff` emits **paths relative to the project root** (`account-api/...`, `common/...`). The `allowedPaths` in `scope.yaml` are also **project-root-relative**, so use them as PATH **as-is** — do not prepend the `{project}/` prefix. **Same mapping as effectiveAllowedPaths in `develop` SKILL.md step 8**:
   - Main scope: each of `allowedPaths` + `sharedModule` (if present). All project-root-relative paths.
   - `allowedPaths: ["**"]` → the whole project → **no PATH applied** (review the entire repository).
   - When subScope is active: the finer `allowedPaths` with `{paramValue}`·`{basePackagePath}` substituted + the group `sharedCodeRange`.
   - The `{project}` field is only for **confirming** that the current repository is that scope's project; it is not a path prefix.
   - **Reference scopes (`--ref-read`) are excluded** — confine to the main scope's range only.
4. **No scope / ambiguous** — no PATH applied (full diff). Notify the user: **"활성 스코프 없음 → 전체 변경 리뷰"**.

Pass the resolved PATH list (may be multiple) as PATH tokens in `$ARGUMENTS` at dispatch time (input-format.md multi-PATH spec — OR matching).

</Scope_Resolution>

<Convention_Measure>

**Before agent dispatch**, measure mechanical conventions with a script. This is measurement, not judgment, so it is not left to the LLM.

```powershell
git diff --staged | Out-File -Encoding utf8 {tempDir}/diff.txt
powershell .claude/skills/code-review/scripts/convention-measure.ps1 -DiffFile {tempDir}/diff.txt
```

- Thresholds come from `references/convention-thresholds.md` (Core defaults + language-pack override merge) — neither the skill nor the agent guesses values.
- Measurement covers **only the added lines of the diff**. Existing legacy lines are not this change's responsibility.
- Attach the resulting JSON to the dispatch prompt as **measured fact**.
- If the script is missing or fails, skip this stage and leave one line in the review output saying so (do not block the review itself).

> **Why this was pushed down to code**: line length · trailing whitespace · indentation characters are values settled by measuring, yet in a measured case the review agent counted them by eye, **calculated in bytes, and reported 5 nonexistent violations**. Correcting that false positive consumed an entire round. Measurement is deterministic territory.

</Convention_Measure>

<Dispatch>

Run the `subagent_type=code-reviewer` agent with the Task/Agent tool.

- Agent prompt = `{TARGET} {LANG}` + the PATH list decided in Scope_Resolution (input-format.md token spec) + the Convention_Measure result JSON.
- State in the prompt: **for mechanical convention items (line length · trailing whitespace · indentation characters · EOF newline), quote the attached measurement result as-is and do not re-measure (재측정하지 않는다).** Do not newly claim mechanical violations absent from the measurement result.
- The agent **performs everything**: diff collection · references loading · severity classification · output. The skill receives the result text (stdout) and displays it to the user **as-is** in the main session.

> **Pass through verbatim — no summarizing.** Print the markdown the agent returned **as-is as the final answer body**. Do not replace it with a summary, an excerpt, a rewrite, or guidance like "전체 내용은 위 리뷰 참고". Do not add sentences before or after it either.
> Reason: the review deliverable is a **spec document** whose header · issue tally · TRUST axes · rule IDs · location notation carry meaning as one set. Summarizing erases that spec wholesale and the user loses severity and rationale (measured: in a run replaced by a summary, 5 of the 6 spec items were lost).
> Do not shorten it for being long — volume control belongs to `settings.md`'s `codeReview.maxFiles` and the large-diff policy.

</Dispatch>

<Orchestrator_Mode>

`autopilot-orchestrated`: no human reads the output; everything returned stays in the orchestrator's context. Same review — only where the full text goes changes.

- Add two prompt lines: `mode: autopilot-orchestrated` and `evidence_path: {{config.tempDir}}/code-review-{HEAD short SHA or ISO timestamp}.md` (resolve `{{config.tempDir}}` from `.claude/config/project.yaml`).
- The **agent** writes the full review to `evidence_path` and returns its `<Output_Format>` compact form (header counts · one `severity · rule-id · file · subject` line per finding · the path). Trimming here, after the return, saves nothing — the tokens are already in the main session.
- Return it as-is. **반환값에 `evidence_path` 를 실어 준다** — the caller registers the file by SHA-256 and derives fingerprints from the lines.

</Orchestrator_Mode>

<Guardrails>

The caller (this skill) must comply with the following when dispatching the agent.

- **No file saving (human mode)**: never include phrases like "산출물 경로", "target/reviews/...md 작성", "파일로 저장", "Write 도구로 저장" in the agent prompt. On the human path code-reviewer's only deliverable is console output; its Write tool is for the orchestrated `evidence_path` alone.
- **stdout-only result**: receive the review result only as the agent's returned text (stdout) and show it to the user as-is.
- **Format directives limited to structure**: if the prompt must specify a format, limit it to the **returned text's structure**, e.g. "Summary / Critical / Warning / Info 섹션을 마크다운으로 반환".
- **stdout-only, one exception**: even if the user explicitly asks to "리뷰를 파일로 남겨달라", do not save. Do not write from the main session either.
  Reason: a review is a verdict on the diff at that moment; left as a file, it reads as still valid after the code has changed. If something must persist, it should persist not as a review but as **the code change that reflects the finding**, or as an MR comment — the latter is `/mr-review`'s responsibility.
  Exception: 「Orchestrator mode」 — run evidence the caller registers by SHA-256 (as `/qa-test` does for its receipt), written by the agent to the caller's path.
- **No GitLab registration**: this skill is local-review-only. Registering to a GitLab MR is the responsibility of `/mr-review` (the mr-reviewer agent).

If `$ARGUMENTS` contains anything violating the guardrails above, ignore that part, tell the user "stdout-only 정책상 파일 저장 지시는 적용하지 않았다", and proceed. If they want persistence, point them to the `/mr-review` path that leaves it on the MR.

</Guardrails>
