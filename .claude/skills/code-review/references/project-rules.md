# Project-type detection and per-type evaluation rules

> Project-type identification and evaluation rules referenced from Step 4 of the code-review skill.

<Project_Detection>

For each project grouped in Step 3.1, identify its guide (`guideline.backend`) and apply the per-guide evaluation items for that project. In a diff spanning multiple projects, evaluate each project independently.

**Detection method**: use each entry `(name, guideline.backend)` of `{{config.projects[]}}` as ground truth. Match a file path's first directory (or base package) to a project name to determine that entry's `guideline.backend` guide file.

**Loading per-type evaluation items (single source = the guide file)**: Read the guide file the matched project's `projects[].guideline.backend` points to (`.claude/docs/guideline/{filename}`), and apply the items inside its `<type-eval>` ~ `</type-eval>` fence as the **per-type evaluation**. Interpret severity codes (`[W..]`/`[S..]`) via `severity-rules.md`. If multiple projects point to the same guide file, apply the same fence as-is (no separate branching logic needed).

> If the guide file is missing or the type-eval fence is empty, apply only `<Common_Evaluation>`.
> This file does **not hard-code** per-type evaluation items — a new workspace only needs to add the fence to its guide file, with no changes to this skill.

</Project_Detection>

<Common_Evaluation>

Common evaluation items always applied regardless of type:

- Package/module structure
- Class/function naming
- API doc comments written
- No hard-coded sensitive information
- Log configuration
- MDC `{{config.tracing.mdcKey}}` async propagation verification (when async threads/tasks are used, [W11])
- Domain-rule violations — if `.claude/docs/domain/index.md` exists, check the changed files against the confirmed rules (`## 핵심`) of the module page they belong to (`docs/domain/modules/<slug>.md`) and `docs/domain/common.md`, and flag deviating changes (skip if there is no index)

</Common_Evaluation>

<Frontend_Evaluation>

Applied only when frontend files are detected in Step 3.2. Read [`references/frontend-rules.md`](frontend-rules.md) to load the detailed criteria.

- JS pattern conformance [W07e]
- XSS prevention [C04]
- CSRF token [C05]
- Variable declarations: `var` forbidden [W07d], `const` by default [S02]
- Strict comparison `===`/`!==` [W03]
- AJAX error handling [W05]
- Duplicate-request prevention [W02]
- Thymeleaf global variables [W07f]
- Leftover `console.log` [S05]

</Frontend_Evaluation>

<Checklist_Judgment>

Judgment criteria:
- If the condition is confirmed **satisfied** → do not print
- If the condition is confirmed **violated** → item name + a brief violation note (no checkbox)
- If that layer is **not included in the diff and cannot be judged** → do not print
- If **all items are satisfied** → print only the single line "✅ 모든 항목 충족"

The checklist is always included in the review output's `### 📝 팀 체크리스트` section.

</Checklist_Judgment>
