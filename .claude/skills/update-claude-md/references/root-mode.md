# Root CLAUDE.md refresh workflow (`root` mode)

When `/update-claude-md root` is invoked, perform the procedure below.

> The standard section order · platform summary · inventory writing rules follow the single source `templates/root-template.md`.

---

## Step R-1 — Verify the project.yaml inventory

Use `.claude/config/project.yaml projects[]` as the authoritative source. Read the first sentence of each project's `### 핵심 역할`, compare it with the `role:` field, and report differences to the user (candidates for a project.yaml update).

## Step R-2 — Refresh the Root CLAUDE.md structure

Compare against the standard section order of `templates/root-template.md` and refresh the root CLAUDE.md.

**Refresh targets:**
- The platform summary paragraph under the `#` title
- Alignment to the standard section order

**No project list table** — the `## 프로젝트 인벤토리` section keeps only the pointer guidance to project.yaml.

**Preservation principles (never modify):**
- `## 산출물 경로 규칙` content
- `## 세션 시작 규칙` content

## Step R-3 — User confirmation

Show a before/after diff and get the user's confirmation.

## Step R-4 — Update the file

After confirmation, update `.claude/CLAUDE.md` with the Write tool.
