---
name: develop
description: 프로젝트/모듈의 개발 스코프를 설정하고, 설정 파일 접근을 차단하며, 세션 종료 시 스코프 자가 점검을 수행한다. "account-api 개발 시작", "backoffice customer 작업", "--ref-read로 열어줘" 등 특정 프로젝트나 모듈에서 개발을 시작하려 할 때 반드시 이 스킬을 사용한다.
argument-hint: "{스코프} [과업번호] [--refresh|--full-rescan|--fe|자동]"
---

# /develop {스코프}

An **orchestrator skill** that explicitly restricts the scope of development work for any project/module in the workspace.

> This skill is built around sub-skill delegation: scope data validation, security blocking, branch handling, plan loading, module caching, etc. are all handled by external sub-skills / scripts. develop itself owns only flow control and the access-control algorithm.

## 위임 맵

| Step | Delegated to |
|---|---|
| 1·2 — Scope parsing · path resolution | `.claude/config/scope.yaml` (data) + `references/scope-registry.md` (schema) |
| 3 — Secrets protection | `/secrets-guard` micro skill |
| 4 — Guideline loading | `.claude/rules/dev-guide.md` + `.claude/docs/guideline/*` (lazy FE) |
| 5 — Branch handling | `/git` skill (`checkout -b`) |
| 6 — Plan loading · phase dispatch | `/plan-loader` micro skill |
| 6.7 — Implementation finish + next-step guidance | 수렴 루프는 호출자 (the caller — human or `dev-autopilot`) + `/qa-test` skill |
| 7 — Module caching | `scripts/scan-module.ps1` (deterministic) |
| 8·8.5·10 — Access control · self-check | Internal to this skill (organization-agnostic algorithm) |
| 9 — Output | `templates/output-templates.md` |
| 11 — Session wrap-up | `/pack` skill |

---

## Input format ($ARGUMENTS)

```
{스코프 식별자}                       예: account-api, backoffice, banking-proxy
{스코프 식별자} {subScopeParam}        하위 스코프 (scope.yaml subScope.paramName 정의 시)
{스코프 식별자} {과업번호}             예: webview 057
{스코프 식별자} {과업번호} 자동         플랜 자동 모드 (plan-loader §7)
{스코프 식별자} --refresh             증분 재스캔
{스코프 식별자} --full-rescan         전체 재캐싱
{스코프 식별자} --ref-read=s1,s2      특정 스코프 읽기 참조 허용 (콤마 리스트)
{스코프 식별자} --fe                 FE 가이드 즉시 로드 (기본 lazy)
```

> **Whether a scope supports sub-scopes** is determined by whether the matching entry in `.claude/config/scope.yaml` defines `subScope.paramName`. A scope that defines it can be invoked as `{스코프} {paramValue}` (e.g. `batch {jobId}`, `admin {menuId}`, `sales {menuId}`). Validation and discovery rules follow the generic algorithm in `references/sub-scope-rules.md`.
> A 3-digit number in the arguments → task number. If unspecified, the branch name is auto-extracted at step 6 (plan-loader §1).

---

## Path notation rules (common to all steps)

- In both bash/PowerShell, use **relative paths** from the workspace root (`git -C app-api ...`).
- When an absolute path is unavoidable, use **forward slashes** (`C:/Users/.../app-api`). Backslashes are forbidden.
- `{projectRoot}` = relative-path directory name (e.g. `app-api`).

---

## Execution procedure

### Step 0: Check the scope feature toggle

Read `features.scope.enabled` in `.claude/config/project.yaml` first.

- **`true`** (default; also when absent): perform all of steps 1–11 below (scope identification · allowedPaths restriction).
- **`false`**: **no scope specified — whole-source basis**. Skip steps 1·2 (scope parsing · path resolution) and any reference to `scope.yaml`. The work target is the entire source; do not apply step 8's out-of-scope write blocking (`DENY_OUT_OF_SCOPE`) or step 10's scope self-check. Step 3 secrets protection (`/secrets-guard`) is **always applied**. If the user names a specific project, perform steps 4–7·9·11 against that `{projectRoot}`; otherwise against the whole workspace.

### Step 1: Parse and validate arguments

Extract the scope identifier + `{paramValue}` (optional) + task number + flags from `$ARGUMENTS`.

> **Resolve the output paths first.** Read `.claude/config/project.yaml`'s `outputDir` and `tempDir` and resolve them into **워크스페이스 루트 기준 절대경로** (absolute paths from the workspace root). Step 8's access decision always treats these two paths as allowed, so if you skip resolution, even reading your own plan document gets judged out-of-scope. The values differ per project, so never use the notation itself as a path.

- Match the scope identifier against `groups.*.scopes[].id` in `.claude/config/scope.yaml`.
- The second argument (`paramValue`) is allowed only when the entry defines `subScope.paramName` → validate with the generic algorithm in `references/sub-scope-rules.md` §1.
- Scope not found → print the "스코프 미존재 시 오류 메시지" from `templates/output-templates.md`, then stop.

**Flags:**

| Flag | Behavior |
|---|---|
| `--refresh`, `재스캔` | Incremental rescan |
| `--full-rescan`, `전체 재캐싱` | Full re-cache |
| `--ref-read=s1,s2,...` | Allow read-only reference scopes (comma list) |
| `--fe` | Load FE guides immediately |

**`--ref-read` validation**: values may only be top-level `id`s from `scope.yaml`. If even one token fails to match → "유효하지 않은 참조 스코프" error, then stop. If the same identifier as the main scope is included, ignore it + one warning line. Sub-scope identifiers (`backoffice {menuId}`) are not accepted as values.

### Step 2: Path resolution

Determined by the matching `scope.yaml` entry + a `project.yaml` `projects[]` lookup:

| Variable | Source |
|---|---|
| `{projectRoot}` | entry `project` (= project.yaml `projects[].name`) |
| `{projectType}` | classified from project.yaml `projects[].guideline.backend` (derived by name) |
| `{multiModule}` | project.yaml `projects[].multiModule` |
| `{effectiveAllowedPaths}` | no `paramValue` → entry `allowedPaths` / with `paramValue` → result of `subScope.allowedPaths` variable substitution (`sub-scope-rules.md` §1-2) |
| `{sharedModule}` | entry `sharedModule` (or null) |
| `{groupSharedRange}` | when `paramValue` is present and `scanPaths == "@inherit-shared"`, the expansion of the group's `sharedCodeRange` (`sub-scope-rules.md` §2-2). Otherwise the empty set |
| `{guideline}` | project.yaml `projects[].guideline` (= `{backend, frontend?}`) |
| `{refReadScopes}` | `--ref-read` value |
| `{refReadPaths}` | union of the allowedPaths of each `--ref-read` scope |

### Step 3: Activate secrets protection

Invoke `/secrets-guard`. Session-wide blocking policy: all yaml/yml/properties/env config files (`.claude/**` config exempt, except deny-listed `config/system.yaml`·`*.local.*`), no decrypting of encrypted tokens, sensitive files (`.env`, `credentials.json`, `*.pem`, `*.p12`, `id_rsa*`). The same applies to reference scopes.

### Step 4: Load guidelines

Read `.claude/config/project.yaml` on entering this step (lazy load — at step 4 entry, not at develop entry).

1. `.claude/rules/dev-guide.md` (required — common policy)
2. **Guideline decision**: use `{backend, frontend?}` from project.yaml `projects[].guideline`
3. **Loading rules**:
   - `backend` → required, Read immediately
   - `frontend[]` (array) → lazy by default: load on the first Read/Edit of an FE file (`*.html`, `*.js`, `*.css`, `views/`, `static/`). Immediate with the `--fe` flag. On load, print one line: "📘 FE 가이드 로드: {파일}"
   - When writing/editing a query mapper file (`*Mapper.xml` etc.) is triggered → additionally load project.yaml `conditionalGuides.mapper.file`
4. `{projectRoot}/CLAUDE.md` (required)
5. `.claude/docs/domain/index.md` (if present) — the domain index (source map). Load the target module page (`docs/domain/modules/<slug>.md`) and `common.md` into the session context as well, as the starting point for domain rules and flows during implementation. Skip if absent.

Guide file path: `.claude/docs/guideline/{filename}` (project.yaml `projects[].guideline` values are filenames only).
File missing → print "⚠️ {파일명}을 찾을 수 없습니다." and continue.

### Step 5: Check and create the branch

```bash
git -C {projectRoot} branch --show-current
```

- `feature/*` / `hotfix/*` → "🌿 현재 브랜치: {branch}", done.
- Otherwise → ask the user for the work type (feature / feature/internal / hotfix) → delegate to `/git checkout {project} -b {branch} [--from {parent}]`.

> Branch strategy spec: `.claude/rules/base-rule.md` §2. Creation procedure: `/git` skill.

### Step 5.5: Surface HANDOFF context (develop-specific)

Surface the main scope's context to prepare for session restarts and branch switches. **No data changes** — stale preservation belongs to `/pack` step 0 P2.

> **External shared dependency**: this step depends on the workspace-root `HANDOFF.md` + `HANDOFF_HISTORY.md` format (`projects:` frontmatter, `## {project} @ \`{branch}\`` sections, `### Plan/Next/Caution`). When porting to another workspace, the HANDOFF convention in `.claude/CLAUDE.md` + the `/pack` skill must be ported along with it. In an environment without HANDOFF files, this step branches to "이전 컨텍스트 없음" and does not affect the behavior of other steps.

#### 5.5-a. Branch consistency check

1. Extract the `{projectRoot}` entry from the `projects:` table in the workspace-root `HANDOFF.md` frontmatter. Entry missing → "활성 부재" (no active entry).
2. Check the current git branch (detached HEAD → `_detached_{short-sha}`).
3. Compare:
   - Section exists + branch matches → **normal branch**
   - Section missing or branch mismatch → **HISTORY branch**

#### 5.5-b. Context surfacing

**Normal branch**: print the `### Plan` / `### Next` (max 5) / `### Caution` (max 3) from the root HANDOFF.md `## {projectRoot} @ \`{branch}\`` section as the step 9 "이전 세션 컨텍스트".

**HISTORY branch**: read the most recent entry in `HANDOFF_HISTORY.md` matching `## {ts} — {projectRoot} @ {cur-branch}` with `grep -m 1 -A 30`. On match:
- Surface the whole `### Done`
- Surface Plan / Next / Caution from `### In-progress (snapshot)`
- One line: "루트 HANDOFF.md 활성 섹션 부재/stale, HANDOFF_HISTORY.md `{entry-ts}` entry 에서 surface"
- If stale: one line: "stale 프로젝트 섹션은 다음 pack 시 HISTORY 로 자동 보존됩니다 (pack 0단계 P2)"

No match → "이전 컨텍스트 없음 (브랜치 신규 또는 첫 작업)".

**When `--ref-read` is active**: apply the same branching to the reference-scope projects, distinguishing them from the main scope with the "[참조 — {프로젝트명}]" tag (emphasizing that writes are blocked).

### Step 6: Check the development plan

Delegate to `/plan-loader`. Arguments: the extracted task number + progress mode (whether the word `자동` is included).

Returns:
- Phase list (BE/FE area · slug · dependencies)
- User selection → instruction to dispatch the dev-backend / dev-frontend sub-agent
- Guidance branch when no plan exists

> **Guard — no dispatch when the implementation agent is absent**: if it is a backend phase but the assembly has no `agents/dev-backend.md`, or a frontend phase but no `agents/dev-frontend.md`, do not dispatch; instead inform: "이 조합에는 해당 구현 에이전트가 없어 자동 구현은 미지원입니다. 계획/QA/리뷰 자산만 사용 가능합니다."

If no task number can be extracted → skip this step.

### Step 6.7: Implementation finish + next-step guidance (수렴 루프는 호출자 소유)

This skill's role ends at **implementation**. Running QA is `/qa-test`'s role, and the "RED → re-implement → re-test" convergence loop is owned by the caller (수렴 루프는 호출자 — human or orchestrator) — so that each stage of the pipeline (interview → prepare → plan → develop → qa → review) has exactly one role. This skill 자체 QA 루프를 돌지 않는다 (does not run its own QA loop).

- **Unattended path (`dev-autopilot`)**: the orchestrator owns convergence in goal-level rounds (cap of 3 REDs per goal) — `qa-collect.mjs` machine measurement → if RED, re-dispatch this skill with that round's failure report.
- **Human path**: after the step 6 implementation dispatch finishes, print the guidance below and stop:

```
구현 완료 — phase-{N}.

수렴은 직접 진행하세요:
  1. /qa-test {과업번호} phase-{N}     ← 이 페이즈 TC 실행 (GREEN/RED 판정)
  2. RED 면: 실패 목록(TC ID·기대 vs 실제)을 들고 /develop 재호출 → 재구현 후 1로
  3. GREEN 이면: 페이즈 §9 완료의 정의(DoD) 표가 있으면 객관 항목(테스트 GREEN·완성도·특성화)
     대조 — 전부 충족 시 페이즈 종료. 주관 항목(품질 게이트·정합)은 사람 판단 영역 (자동수정 금지)
  ※ 3회 반복해도 RED 면 수동 개입 필요 — 같은 실패 fingerprint 가 반복되면
     구현이 아니라 계획·TC 를 의심하세요
```

Single source for the QA invocation/return contract: [`references/qa-verdict-contract.md`](references/qa-verdict-contract.md) — all the convergence-loop owner reads is that contract (status line · failure list · characterization distinction), so the loop needs no changes even if the QA implementation is swapped for another one that honors the contract.

> **Do not invoke `/code-review` at the phase stage.** Code review is, as a rule, **one pass over the cumulative diff** after all phases complete, owned by the orchestrator (`dev-autopilot` step 6) or by the human right before commit. What the convergence loop looks at goes only as far as test GREEN · completeness · characterization · mechanical convention gates. Running a review per phase duplicates findings with the integrated review, and contradictions that only appear at phase boundaries are structurally invisible to a delta review. For a single-phase task (R0), that one pass is itself the integrated review.

### Step 7: Module structure caching

```powershell
powershell .claude/skills/develop/scripts/scan-module.ps1 -Scope {스코프} [-SubScopeParam {paramValue}] -Mode {init|full|incremental}
```

`-SubScopeParam` is the `paramValue` validated at step 1 (only for scopes whose `scope.yaml` defines `subScope.paramName`). The paths to scan are the sum of `subScope.scanPaths` + `allowedPaths` → `references/sub-scope-rules.md` §2.

Mode decision:
- No cache → `init`
- matching schema + inventory fingerprint → load
- inventory fingerprint mismatch, `--refresh`, or `--full-rescan` → `full`
- `incremental` is accepted only as a deprecated alias for `full`

Reference scopes (`--ref-read`) are never regenerated automatically. Lazy Load only when branch, HEAD, and relevant-path cleanliness match; otherwise Read source on demand.

Cache storage path · sub-scope filename rules · cache file format · load flow details: `references/cache-strategy.md` is the single source.

### Step 8: Scope access-control algorithm

```
judgeAccess(filePath, operation):
  # 0. 보편적 차단 (secrets-guard 정책 — check-file-access.sh hook)
  if filePath matches **/*.{yml,yaml,properties,env} AND not under .claude/ (system.yaml·*.local.* 은 deny 로 차단):
    return DENY_ALWAYS

  # 1. 메인 스코프 (읽기+쓰기)
  # paramValue 활성 시 effectiveAllowedPaths = subScope.allowedPaths 변수 치환 결과 (entry.allowedPaths 의 `**` 무시)
  # paramValue 비활성 시 effectiveAllowedPaths = entry.allowedPaths
  if filePath under {effectiveAllowedPaths} OR mainScope.sharedModule OR {groupSharedRange}:
    return ALLOW

  # 2. 참조 스코프 (읽기만)
  if filePath under any({refReadPaths}):
    return (operation == "read") ? ALLOW_REF_READ : DENY_REF_WRITE

  # 3. 워크스페이스 메타 (항상 허용)
  if filePath under workspaceMetaPaths:
    return ALLOW

  # 4. 그 외
  return DENY_OUT_OF_SCOPE
```

**Workspace meta paths** (always allowed):
- `{workspaceRoot}/.claude/**` (skills · rules · guidelines · memory)
- `{workspaceRoot}/{{config.outputDir}}/**` (plans · work outputs), `{workspaceRoot}/{{config.tempDir}}/**` (pre-exploration scratch)
- `{workspaceRoot}/HANDOFF.md`, `HANDOFF_HISTORY.md`, `CLAUDE.md`
- Each project's `CLAUDE.md` (for guideline loading)

**Glob/Grep**: when `path` is given, validate it against allowed paths. When omitted, allow the query + filter the results.

> Per-verdict output: "스코프 외 접근 차단 (8단계)" in `templates/output-templates.md`.

### Step 8.5: Dynamic reference-scope changes mid-session

The trigger keyword must include `참조` or `ref-read`. When ambiguous, confirm first.

| Intent | Example | Action |
|---|---|---|
| Add | "참조 X 추가" | Add to `{refReadScopes}` |
| Remove | "참조 X 제거", "ref-read에서 X 빼줘" | Remove from `{refReadScopes}` |

After approval, update `{refReadScopes}`·`{refReadPaths}` + one-line summary. No persistence ❌ — current session only.

> Reference-scope files already loaded into context do not disappear from memory after removal (only new Reads are blocked from then on).

### Step 9: Print the session-start summary

Print only the scope table (project · branch · allowed range), concisely. Components · architecture · rules are loaded internally only, no output ❌.

Additional rows:
- Plan loaded → one line of plan info
- `{refReadScopes}` not empty → "참조 범위 (읽기 전용)" row
- Step 5.5 surfaced something → "이전 세션 컨텍스트" section (Plan / Next max 5 / Caution max 3, separate group for refs)

> Format: "세션 시작 요약 (9단계)" in `templates/output-templates.md`.

### Step 10: Scope self-check

Check before commit/exit:

- **#1**: write attempts outside the main scope (Edit/Write)
- **#2**: reads of files in scopes that were not allowed (not covered by ref-read). Reads allowed via ref-read are recorded as a note: "참조 목적 읽기: N건 ({스코프})".

> Secrets (YML/Properties/ENC) checks are covered by the `/secrets-guard` policy, so no violation occurs in the normal flow.
> Output: "스코프 자가 점검 (10단계)" in `templates/output-templates.md`.

### Step 11: Session wrap-up

Step 10 passed → invoke `/pack`. The workspace-root `HANDOFF.md` + `HANDOFF_HISTORY.md` are updated automatically.

If violations remain → fix → re-check → `/pack`.
---

## Caller-owned phase goal

When an orchestrator supplies a logical goal ID and one phase document, execute only that phase. Keep the logical goal stable if the agent session is replaced. Treat session replacement as a new execution, not a QA retry. `/develop` implements only: do not invoke `/qa-test` and do not run an implementation-to-QA convergence loop of your own — the orchestrator owns that loop at the goal level (machine-measured rounds and remediation re-dispatch). In caller-owned mode, return goal evidence to the caller and do not invoke `/pack`; the main orchestrator owns shared handoff finalization.

In this mode, skip step 5's work-type confirmation and step 6's phase selection. The caller has already created and checked out the working branch, so do not call `/git checkout` and do not ask the user for the work type (feature/hotfix) — there is no one here to answer, and creating a new branch would put the tree out of sync with the evidence the caller recorded. The phase has also been fixed by the caller as a single document, so proceed straight to step 6.5 and onward with that document, without a selection question.
