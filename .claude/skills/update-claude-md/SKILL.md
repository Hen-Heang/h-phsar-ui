---
name: update-claude-md
description: "프로젝트 CLAUDE.md 를 워크스페이스 공통 템플릿의 섹션 구조·순서에 맞춘다 — 기존 내용은 보존하고 배치만 조정. 사용자가 '/update-claude-md', 'CLAUDE.md 템플릿대로 구조 맞춰줘', 'CLAUDE.md 표준화', '섹션 순서 정리', '빠진 표준 섹션 채워줘' 등을 언급하면 이 스킬을 사용한다. 품질 감사·세션 학습 기록은 이 스킬 몫이 아니다."
argument-hint: "{프로젝트명|all|root} [--refresh]"
---

# update-claude-md skill

Updates a project's CLAUDE.md to match the workspace standard template.

Arguments: `$ARGUMENTS`

---

## Invocation formats

| Form | Behavior |
|------|------|
| `/update-claude-md {프로젝트명}` | Single project — structure standardization |
| `/update-claude-md {프로젝트명} --refresh` | Single project — structure standardization + rewrite of the core role |
| `/update-claude-md all` | All projects — structure standardization |
| `/update-claude-md all --refresh` | All projects — structure standardization + rewrite of the core role |
| `/update-claude-md root` | Root CLAUDE.md — refresh the summary by consulting the per-project CLAUDE.md files |

---

## Workflow

Parse the arguments and determine the target projects.

- `all` → process the entire project list of the workspace CLAUDE.md
- A project name → process only that single project
- The `--refresh` option → re-analyze the code and refresh even if a `### 핵심 역할` already exists

For each project, perform the following procedure:

### Step 1 — Read the current file

Read `{프로젝트명}/CLAUDE.md` with the Read tool.
If the file does not exist, switch to new-creation mode.

### Step 2 — Determine the project classification

**Priority (single source):**
1. Match the project in `.claude/config/project.yaml` `projects[]` → extract the `guideline.backend` **or** `guideline.frontend` guide filename — **authoritative source**. (If the schema is the `id`/`type` form, use the `type` value as the type.)
2. On match failure → secondary determination from the `가이드` (or `유형`) row of that project's `CLAUDE.md` `## Overview` table

The table converting guide filenames into classification codes (web-api/web-fullstack/batch etc.) is owned by the **installed language/framework pack** — consult 「guideline → 분류 코드」 in `templates/type-templates.md`. If that file is absent (no pack installed), use the `## Overview` label as the type as-is and apply only the common skeleton (`templates/templates.md`).

### Step 3 — Check `### 핵심 역할`

Check whether `### 핵심 역할` exists directly under `## 업무 설명`.

**If absent → auto-writing mode:**

1. Analyze the source code following the business-comprehension methodology (Steps 1–6) of `references/core-role-guide.md`.
2. Apply the writing pattern matching the project type and write the `### 핵심 역할` content.
3. Preview the written content to the user, get confirmation, then insert it into the file.

**If present + no `--refresh` option → preserve the content**, continue with the structure check only.

**If present + `--refresh` option → re-analysis mode:**

1. Read the existing `### 핵심 역할` content (for comparison).
2. **Re-analyze** the source code following the business-comprehension methodology (Steps 1–6) of `references/core-role-guide.md`.
3. **Show the user a diff** between the existing content and the new analysis:
   - Changed parts (new domains, added modules, changed integrated systems, etc.)
   - Deletion candidates (content no longer valid)
   - Reinforcement candidates (parts that were too brief)
4. If the user approves, update; if they decline, keep the existing content.

---

### Step 4 — Section check

Extract the current file's `##` section list and compare it with the standard order.

**Standard section order (common to all types):**

```
1.  # {프로젝트명}          ← 제목 + 한 줄 설명
2.  ## Overview             ← 메타 테이블
    (### 서브모듈)          ← 멀티모듈만
3.  ## 업무 설명            ← 핵심 역할 + 도메인 섹션
4.  ## Base Package
5.  ## 패키지 구조
6.  ## 주요 의존성          ← Library는 "허용 의존성"
7.  ## Build & Run
8.  ## Development Guide
    (## 정적 리소스 디렉토리 구조)  ← web-fullstack만
    (## {메뉴 구조 등 도메인 특화})  ← 해당 프로젝트만
    (## JavaScript 코딩 패턴)       ← web-fullstack만
9.  ## Project-Specific Notes
```

**Check items:**

- [ ] Missing required sections
- [ ] Section order differing from the standard
- [ ] Whether `### 핵심 역할` is the first subsection directly under `## 업무 설명`
- [ ] Presence of per-type extra sections (per the installed pack's `templates/type-templates.md` — e.g. web-fullstack static resources · JS patterns, Library allowed dependencies, Batch Job categories)

### Step 5 — Draft the update plan

Report the items needing change to the user:

```
[프로젝트명] 변경 계획:
  - 섹션 순서 조정: ## 패키지 구조 ↔ ## 주요 의존성 순서 변경
  - 누락 섹션 추가: ## Development Guide
  - 기존 내용 보존: ## 업무 설명 (핵심 역할 + 도메인 섹션 전체)
```

If nothing changes, print "✅ {프로젝트명}: 이미 표준 구조입니다." and skip.

### Step 6 — User confirmation

In `all` mode: report the entire change plan at once, then confirm with "계속 진행할까요?".
In single mode: confirm immediate application.

### Step 7 — Update the file

After confirmation, update the file with the Edit or Write tool.

**Preservation principles (never modify):**
- `### 핵심 역할` content (text paragraphs)
- `### {도메인명}` business-description content
- `## Project-Specific Notes` content
- `## 패키지 구조` tree content
- `## 주요 의존성` / `## 허용 의존성` table content
- `## JavaScript 코딩 패턴` code examples

**May change:**
- Reordering sections
- Adding missing empty sections (content is the `{작성 필요}` placeholder)
- Adding missing rows to the `## Overview` table
- Standardizing the `## Build & Run` command format

### Step 8 — Result summary

Print a summary of the processed project count and changes.

```
업데이트 완료 (3/N):
  ✅ app-cache — 섹션 순서 조정
  ✅ app-batch — ## Development Guide 추가
  ⏭ app-kafka — 변경 없음 (스킵)
```

---

## Reference templates

- Common skeleton template (all types): `templates/templates.md`
- Per-type detail templates · classification table: the installed language/framework pack's `templates/type-templates.md` (common skeleton only when no pack is installed)
- Root CLAUDE.md template: `templates/root-template.md`
- Root-mode workflow: `references/root-mode.md`

---

## Root CLAUDE.md refresh workflow (`root` mode)

When `/update-claude-md root` is invoked, the workflow (R-1–R-4) follows the single source `references/root-mode.md`.

---

## Cautions

- Never read config files (`.yml`·`.properties`·`.env` etc.) (security rule).
- Build manifests (`pom.xml`·`build.gradle`·`package.json` etc.) may be read only to check dependency versions.
- The AI does not arbitrarily modify business-description content. Only the structure is adjusted.
- Even in `all` mode, get user confirmation before each file's Write.

---

## Coexistence rules with the external plugin `claude-md-management`

> **Installation-dependent:** this section applies only when the Anthropic official plugin `claude-md-management` is installed in the workspace. In a workspace without it (external port), ignore this entire section.

The workspace also has the Anthropic official plugin `claude-md-management` installed.
The division of roles is:

| Entry point | Responsibility |
|--------|------|
| `/update-claude-md` (this skill) | **Structure standardization** — per-type section order · auto-writing the core role · root↔sub synchronization |
| `claude-md-improver` skill | **Quality audit** — A–F score + per-criterion evaluation report |
| `/revise-claude-md` | **Session-learning capture** — records commands · patterns · quirks into CLAUDE.md / `.claude.local.md` |

**Operating rule:** if content added by `/revise-claude-md` breaks the standard section order, realign with `/update-claude-md {프로젝트}` during the next piece of work. External skills are unaware of the standard template (section order · type classification), so this skill is the single source for structural consistency.
