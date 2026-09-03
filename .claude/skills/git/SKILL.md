---
name: git
description: 멀티 프로젝트 워크스페이스의 git 작업을 프로젝트 단축명으로 자동화하고 브랜치 전략·커밋 컨벤션을 강제한다. 특정 프로젝트에 git 명령(checkout·commit·push·status·diff 등)을 실행하려 할 때 — "api 커밋해줘", "bo 브랜치 만들어줘" 같은 요청 포함 — 반드시 이 스킬을 사용한다.
argument-hint: "{subcommand} {project[/module]} [options...]"
---

# /git {서브커맨드} {프로젝트} [옵션...]

Automates git work in a multi-project workspace. Automatically enforces the branch strategy (base-rule.md) and the commit convention.

> Project registry: `.claude/config/project.yaml` `projects[]` (single truth source — name/shortName/multiModule)
> Commit convention: [`references/commit-convention.md`](references/commit-convention.md)

---

## Input format ($ARGUMENTS)

```
{subcommand} {project[/module]} [options...]
```

| Subcommand | Example |
|-----------|------|
| `checkout {project} {branch}` | `/git checkout api feature/1001` |
| `checkout {project} -b {branch}` | `/git checkout api -b feature/1001` |
| `branch {project} [-r\|-a]` | `/git branch api -a` |
| `fetch {project} [--all]` | `/git fetch api` |
| `commit {project[/module]} [--skip-review] [--push]` | `/git commit api/gateway --push` |
| `push {project}` | `/git push api` |
| `pull {project} [--rebase]` | `/git pull api --rebase` |
| `status {project}` | `/git status api` |
| `log {project} [-N]` | `/git log api -5` |
| `stash {project} [pop\|list\|drop]` | `/git stash api pop` |
| `diff {project} [--staged\|HEAD~N]` | `/git diff api --staged` |

---

## Common procedure

### Input parsing

1. **SUBCMD** — first token: `checkout` / `branch` / `fetch` / `commit` / `push` / `pull` / `status` / `log` / `stash` / `diff`
2. **PROJECT** — second token: match against `.claude/config/project.yaml` `projects[]`
   - Short name (`api` = `projects[].shortName`), full name (`app-api` = `projects[].name`), and slash-module (`api/gateway`) are all allowed
   - Multi-module status = `projects[].multiModule`. Slash-modules are allowed only when `multiModule: true`.
3. **OPTIONS** — remaining tokens

**Path notation:**
- bash commands use **relative paths** from the workspace root (e.g. `git -C app-api status`). The primary working directory is the workspace root, so the `cd app-api && ...` form suffices.
- When an absolute path is needed, use the `$CLAUDE_PROJECT_DIR` environment variable (Claude Code sets it to the workspace root automatically, e.g. `$CLAUDE_PROJECT_DIR/app-api`).
- `GIT_ROOT` = `{레지스트리의 Git 루트}` (relative path from the workspace root, e.g. `api` → `app-api`)

### Pre-checks

```bash
ls {GIT_ROOT}/.git && cd {GIT_ROOT} && git branch --show-current && git status --porcelain
```

If there is no `.git` → `❌ '{project}'는 Git 저장소가 아닙니다.`

### Protected-branch rules

On main/develop/release-*/internal-* branches, **commit·push are blocked by default**. The following exceptions apply:

**`claude` project exception**: the `claude` project (the `.claude/` repository) is a config-only repository, so **direct commit·push on the main branch is allowed**. Code review (D-5) is skipped too.

**`.claude/` file exception** (other projects): allowed when **all** staged or unpushed files have the `.claude/` prefix.
- On commit: the entire `git diff --staged --name-only` result is under `.claude/`
- On push: the entire `git log origin/{branch}..{branch} --name-only --pretty=format:""` result is under `.claude/`
- If even one non-`.claude/` file is mixed in → block as usual

### Common push logic

Both commit `--push` and the push subcommand follow the same flow:

```bash
# 업스트림 유무에 따라 분기
cd {GIT_ROOT} && git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
# 있으면 → git push origin {branch}
# 없으면 → git push -u origin {branch}
```

---

## Subcommands

### A. checkout

**Switch to an existing branch** — `/git checkout {project} {branch}`

```bash
cd {GIT_ROOT} && git checkout {branch}
```

When switching to main/develop/release-*/internal-*, warn: `⚠️ main/develop/release-*/internal-*에서는 직접 작업하지 마세요. feature/* 또는 hotfix/* 브랜치를 생성하세요.`

**Create a new branch** — `/git checkout {project} -b {branch} [--from {parent}]`

1. Verify the branch name starts with `feature/` or `hotfix/`. Block otherwise.
2. Pull the latest on the parent branch, then fork:
   - `feature/{과업번호}/*` → derived from a `release-*` branch (the user specifies it via `--from` or picks it in conversation):
     `git checkout {release-branch} && git pull origin {release-branch} && git checkout -b {branch}`
   - `feature/internal/*` → derived from an `internal-*` branch (the user specifies it via `--from` or picks it in conversation):
     `git checkout {internal-branch} && git pull origin {internal-branch} && git checkout -b {branch}`
   - `hotfix/*` → from `main`: `git checkout main && git pull origin main && git checkout -b {branch}`
   - When `--from` is not given: list the existing `release-*` or `internal-*` branches and ask the user to choose.
     If no existing branch, confirm with the user whether to create a new `release-*`/`internal-*` branch from `develop`.
3. Result:
   ```
   ✅ 브랜치 '{branch}' 생성 완료 (부모: {parent_branch})
   📂 {project} ({GIT_ROOT})
   ```

### B. branch

| Option | Command |
|------|--------|
| (none) | `git branch -v` |
| `-r` | `git branch -rv` |
| `-a` | `git branch -av` |

### C. fetch

| Option | Command |
|------|--------|
| (none) | `git fetch origin` |
| `--all` | `git fetch --all` |

### D. commit

```
/git commit {project[/module]} [--skip-review] [--push]
```

Execute in order:

**D-1. Branch verification** — apply the protected-branch rules (including the `.claude/` exception)

**D-2. Check for changes** — `git status --porcelain`. Stop if none.

**D-3. Staging** — if there are unstaged files, show the list and confirm staging with the user. If there are staged files, show the contents.

**D-4. Module filtering** — when `/module` is given, show only that module path's diff (for reference). The commit targets all staged files.

**D-5. Code review** — invoke the `/code-review staged` skill.
- CRITICAL/WARNING → block the commit
- `--skip-review` → warn `⚠️ 코드 리뷰를 건너뜁니다.` and proceed

**D-6. Commit message** — per the `commit-convention.md` rules:
1. Auto-detect the type with `git diff --staged --name-status` (only A → ADD, only D → DELETE, R → CHANGE, otherwise → CHANGE)
2. Analyze the diff and propose a draft message
3. Print a preview → user confirms/edits
   ```
   📝 커밋 메시지 미리보기:
   {TYPE} : {메시지} (#{branch})
   ```

**D-7. Execute the commit** — commit using the HEREDOC form. This safely handles special characters (quotes, `$`, etc.) in the message:

```bash
cd {GIT_ROOT} && git commit -m "$(cat <<'EOF'
{TYPE} : {message} (#{branch})
EOF
)"
```

**D-8. Result** — show `git log --oneline -1`
```
✅ 커밋 완료 — {해시} {TYPE} : {message} (#{branch})
📂 {project} 🌿 {branch}
```

**D-9. Auto-push** — when `--push` is given, run the common push logic. Protected-branch rules apply.

### E. push

1. Apply the protected-branch rules (including the `.claude/` exception)
2. Run the common push logic
3. Result: `✅ push 완료 — {project} {branch} → origin/{branch}`

### F. pull

```
/git pull {project} [--rebase]
```

1. **Dirty check** — warn if there are changes (recommend commit/stash)
2. **Execute** — `git pull origin {branch}`, or `git pull --rebase origin {branch}` with `--rebase`
3. Show a result summary

### G. status

```
/git status {project}
```

```bash
cd {GIT_ROOT} && git status --short --branch
```

Result:
```
📂 {project} 🌿 {branch}
{git status 출력}
```

### H. log

```
/git log {project} [-N]
```

| Option | Command |
|------|--------|
| (none) | `git log --oneline -10` |
| `-N` | `git log --oneline -N` |
| `--all` | `git log --oneline --all -10` |

### I. stash

```
/git stash {project} [pop|list|drop]
```

| Option | Command |
|------|--------|
| (none) | `git stash push -m "auto-stash by Claude"` |
| `pop` | `git stash pop` |
| `list` | `git stash list` |
| `drop` | `git stash drop` |

### J. diff

```
/git diff {project} [--staged|HEAD~N]
```

| Option | Command |
|------|--------|
| (none) | `git diff` |
| `--staged` | `git diff --staged` |
| `HEAD~N` | `git diff HEAD~N HEAD` |

---

## Error handling

| Situation | Response |
|------|------|
| Project name not recognized | Suggest similar names + show the full list |
| Push rejected (remote changed) | Guide `pull --rebase` then retry |

### Merge conflict resolution procedure

When a conflict occurs during pull or rebase, guide in this order:

1. **Show the conflicting file list**
   ```bash
   git diff --name-only --diff-filter=U
   ```
2. **Inspect the conflicts** — point out the conflict marker locations (`<<<<<<<`, `=======`, `>>>>>>>`) in each file
3. **Guide the post-resolution procedure**
   - merge conflict: `git add {resolved_files} && git commit`
   - rebase conflict: `git add {resolved_files} && git rebase --continue`
   - to abort: `git merge --abort` or `git rebase --abort`
4. If the user asks, Read the conflicting files and propose resolutions
