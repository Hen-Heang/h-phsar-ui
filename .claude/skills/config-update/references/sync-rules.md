# Config sync rules (diff taxonomy · authoring · self-check · rollback)

> Reference for `/config-update`. Read right before authoring edits (SKILL.md step 6).
> Field-level spec for scope entries lives in `develop/references/scope-registry.md` — single source, not duplicated here.

---

## Diff taxonomy

| Item | File | Kind | Required evidence | Confirmation |
|---|---|---|---|---|
| Register new project | project.yaml `projects[]` | `[+]` | directory path + build file or `.git` + `we-adp detect --summary` output | batch |
| New project's scopes | scope.yaml | `[+]` | skeleton group from `analyze-structure --format scope` | batch (same item) |
| Remove vanished project | project.yaml + scope.yaml | `[-]` | registered name whose directory is absent | batch, blast radius stated |
| Scope drift | scope.yaml | `[~]` | skeleton vs current entry diff (allowedPaths / sharedModule / subScope / multiModule) | batch |
| Adopt hand-edit | project.yaml / scope.yaml | `[~]` | `.claude/config/` copy differs from instance copy | batch |
| Adopt filled project-meta | project-meta.yaml | `[~]` | `.claude/` copy differs from instance copy | batch |
| Regenerate workspace-inventory block | CLAUDE.md.part2 | `[~]` | block disagrees with post-edit `projects[]`, or markers missing (legacy part2) | batch (rides the `projects[]` items) |

- An item without its evidence column is not proposed.
- Out-of-composition stack: still a `[+]` item, with the notice "pack guidelines do not cover {stack} — changing packs requires a full `/we-init` re-run".

## Authoring rules

- **Text-edit, never re-serialize.** Preserve comments, key order, quoting, and indentation of the existing file. A YAML-library round-trip destroys comments and may flip styles.
- **`projects:` stays a block-style list.** `dev-autopilot/scripts/qa-collect.mjs` parses it line-by-line (fail-closed); a flow-style `projects: [...]` breaks the autopilot QA gate.
- **New projects**: structure fields (`allowedPaths`, `sharedModule`, `subScope`, group/scope shape) come verbatim from the skeleton. The skill authors only: `name` (= directory name unless the user says otherwise), `shortName`, `multiModule` (skeleton group has >1 scopes), `role`, `guideline` (choose from values already used by existing entries), scope group `name`, `subScope.paramName`.
- **Removals**: delete the `projects[]` entry AND every scope entry whose `project:` references it, in the same apply.
- **project-meta adoption**: byte-copy the `.claude/config/project-meta.yaml` content into `.we-adp/config/project-meta.yaml`. No content authoring — that is `/domain-update` territory.
- **Inventory block**: regenerate only between `<!-- workspace-inventory:begin -->` and `<!-- workspace-inventory:end -->` in `.we-adp/CLAUDE.md.part2` (one intro line + one bullet per project: name, module shape, role one-liner + stack/build lines). Markers missing (legacy part2) → wrap the leading summary facts once. Prose outside the block is authored content — never touched.

## Self-check (before reassembly)

1. Every `scopes[].project` value resolves to a `projects[].name` entry.
2. Scope `id` values are unique across all groups.
3. `projects:` is still a block-style list (one `- name:` per project).
4. No top-level or depth-2 key of the original `project.yaml` was lost (compare against the backup copy) — sections like `db.*`, `tracing`, `structure`, pack-appended keys must survive untouched.
5. Removal edits are paired (rule above) — no dangling references.
6. Only the permitted files changed (the three config files + `CLAUDE.md.part2`); `composition.yaml`, `system.yaml`, `settings.json`, `answers.json` byte-identical.
7. A `CLAUDE.md.part2` diff (if any) is confined to the `<!-- workspace-inventory:begin/end -->` block, and both markers are present exactly once.

## Rollback

- Backups: `.claude/tmp/config-update/{project,scope,project-meta}.yaml` + `CLAUDE.md.part2` (taken in step 6, before editing).
- Reassembly validation failure → copy the backups back over `.we-adp/config/*`, report the engine's validation output, stop. Do not retry with guessed fixes — a failed validation means the proposal was wrong, not the syntax.
- After a successful `we-adp update --no-self-update`, `.claude/tmp/` is cleared by the pipeline; the applied state is recoverable from git (`.we-adp/` is committed) if the user wants to revert — say so instead of keeping manual copies.
