# Module cache strategy

`/develop` step 7 delegates cache creation to `scripts/scan-module.ps1`. The cache summarizes the main scope's selected Java and Mapper XML paths; it never stores class bodies or relies on model inference.

## Storage and identity

`$HOME/.claude/projects/{workspace-slug}/memory/scopes/{scope}.md`

- Main scope: `{scope}.md`
- Sub-scope: `{scope}--{paramValue}.md`, unless `scope.yaml` defines `cacheFileSuffix`
- Reference scopes (`--ref-read`): read-only; never generated automatically

## Freshness

The scanner hashes the sorted relative file inventory. This detects adds, deletes, renames, committed changes, and untracked files without time-based guesses.

| Condition | Action |
|---|---|
| no cache, old schema, or fingerprint mismatch | complete rebuild |
| matching `schema_version` and `fingerprint` | load unchanged |
| `--refresh` or `--full-rescan` | complete rebuild |
| legacy `-Mode incremental` | warn, then complete rebuild |

Never write a delta-only summary: the cache's counts always describe the complete scope. `scanned_at` is diagnostic metadata, not a freshness key.

For an existing reference cache, require matching branch and HEAD with no relevant dirty paths. Otherwise read source on demand and do not refresh the reference cache.

## Invocation

```powershell
powershell .claude/skills/develop/scripts/scan-module.ps1 -Scope backoffice -Mode init
powershell .claude/skills/develop/scripts/scan-module.ps1 -Scope backoffice -SubScopeParam customer -Mode full
```

The scanner resolves scope data from `.claude/config/scope.yaml`, namespace data from `.claude/config/project.yaml`, enumerates the selected paths, classifies file paths, and writes:

```yaml
---
schema_version: 2
scope: backoffice
scanned_at: 2026-08-19T12:00:00+09:00
project_root: app-api
branch: feature/057/example
head: 0123456789abcdef
fingerprint: <sha256-of-sorted-relative-paths>
mode: full
---
```

The body contains total Java/Mapper counts, package-category counts, and scanned paths. Query detailed classes with Grep/Glob only when needed.
