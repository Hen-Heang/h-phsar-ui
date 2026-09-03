---
disable-model-invocation: true
name: deploy-checklist
description: 개발 완료(최종 code-review 통과) 건의 배포 점검 체크리스트 엑셀(.xlsx)을 checklist-generator 에이전트로 생성한다 — 기본 백그라운드 실행이라 후속 작업과 병렬 진행. 사용자가 "deploy-checklist", "배포 체크리스트", "점검표 생성" 등을 언급하면 이 스킬을 사용한다.
argument-hint: "{과업번호} [--foreground] [--regen]"
---

# /deploy-checklist {과업번호}

Generates the **deployment inspection checklist Excel** for a development-complete item via the `checklist-generator` agent (isolated context · background).

> **The generation engine is the `checklist-generator` agent.** The single source for item-derivation rules and the Excel spec is `.claude/docs/agents/checklist-generator/references/*`. This skill handles **input collection · diff snapshot · agent dispatch** only.

**Preload (once at entry)**: `.claude/config/project.yaml` — resolve `{{config.outputDir}}`·`{{config.tempDir}}`·`{{config.projects[]}}` into absolute paths from the workspace root.

---

## Input format

```
$ARGUMENTS = {과업번호} [--foreground] [--regen]
```

| Option | Behavior |
| --- | --- |
| (default) | Background dispatch — the main session immediately proceeds to the next work (commit/push · /mr-review etc.) |
| `--foreground` | Wait until completion (when the checklist is needed right now) |
| `--regen` | If an existing deliverable exists, regenerate without confirmation |

## G0: Determine the target

1. **Task number** — if not in `$ARGUMENTS`, search candidates: ① the task in the active `/develop` scope · conversation context ② N of the current branch `feature/{N}/*` ③ the most recent of the `{{config.outputDir}}/plans/*/` directory names (= task numbers) ④ the most recent `{{config.outputDir}}/*_dev_brief.md`. If candidates are multiple/unclear, one `AskUserQuestion`.
2. **Existing deliverable** — `{{config.outputDir}}/checklists/{N}_checklist.json` exists + no `--regen` → one `AskUserQuestion` (regenerate / stop). (The Excel filename is `{업무요약}_체크리스트.xlsx` and carries no task number, so judge existence by the JSON.)
3. **Input file discovery** (pass only what exists — can proceed on the diff alone even if all are missing):
   - Brief `{{config.outputDir}}/{N}_dev_brief.md`
   - Plan root `{{config.outputDir}}/plans/{N}/{N}_dev_plan.md` + phases `{{config.outputDir}}/plans/{N}/phases/phase-*.md`
   - Test plan root `{{config.outputDir}}/plans/{N}/{N}_test_plan.md` + phases `{{config.outputDir}}/plans/{N}/phases/phase-*-test.md` (the §5-2 functional verification checklist lives in the phase files)
4. **Scope** — determine the target project in the order: plan root §1 meta → brief §2·§3 → active scope. If unclear, one `AskUserQuestion`.

## G1: diff snapshot (required before dispatch — prevents race conditions)

**Pin the diff to files before dispatch** so the agent's evidence does not shift even if the main session commits/pushes shortly after:

```bash
mkdir -p {{config.tempDir}}/checklist/{N}
cd {projectRoot}
git diff --staged --name-status > {{config.tempDir}}/checklist/{N}/name-status.txt
git diff --staged > {{config.tempDir}}/checklist/{N}/diff.patch
```

- **If staged is empty**, range fallbacks (in order): ① include unstaged, `git diff HEAD` ② if already committed, the parent-branch range `git diff {parent}...HEAD` (parent = the fork parent per `.claude/rules/base-rule.md` §2 Git branch strategy — if unidentifiable, one `AskUserQuestion`).
- Record the basis used as the `base` string (e.g. `"staged"`, `"{배포 브랜치}...HEAD"`).
- If even the snapshot is empty (0 changes), stop: `❌ 변경사항이 없어 체크리스트를 생성할 수 없습니다.`

## G2: Dispatch

Run `subagent_type=checklist-generator` with the Task/Agent tool — **explicitly pass `run_in_background: true`** (consistent with frontmatter `background: true`). Foreground only with `--foreground`.

Agent prompt = the full meta of the checklist-generator `<Input_Format>` contract (task_number·brief_path·plan_root·plan_phases·test_plan_root·test_plan_phases·scope·diff_snapshot·output_dir·workspace_root·created_at). The skill fills `created_at` with `date +%F`.

Immediately after dispatch, announce one line and **return to the calling flow without waiting**:

```
🧾 배포 체크리스트 생성 시작 (백그라운드) — 과업 {N}
산출물: {{config.outputDir}}/checklists/{업무요약}_체크리스트.xlsx (파일명의 업무요약은 에이전트가 브리프에서 결정 — 한글 10자 이내, 완료 시 알림)
커밋·push·/mr-review 등 다음 작업을 병렬로 진행하셔도 됩니다.
```

When the background completion notification arrives, show the agent's result summary (per-sheet item counts · P0 caution items) to the user as-is.

## Guardrails

- **No-boilerplate-items contract** — do not put directives like "빌드·기동 테스트 항목 추가" into the agent prompt. The single source for inclusion/exclusion is the playbook — if the user requests a specific item, only pass it explicitly in the prompt as a "사용자 추가 요청 항목".
- **Never dispatch without a diff snapshot** — if the agent re-reads live git, it races with parallel commits.
- **secrets**: if the snapshot patch contains content changes to files matching the forbidden patterns of `.claude/docs/agents/common/security-policy.md` §2 (config · env-var · secret files), save that hunk with **only filenames and key names kept and the value lines removed** (the `secrets-guard` principle — values go nowhere, neither to the agent nor into the checklist).
- Generation is local-deliverable-only — attaching/registering to a remote MR is done by the user.
