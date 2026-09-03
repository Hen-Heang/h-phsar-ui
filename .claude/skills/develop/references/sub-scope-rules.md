# Sub-scope validation · discovery rules

> Invoked from the `/develop` skill's step 1 (argument validation) and step 7 (module scan targets).
> This file holds **organization-agnostic generic algorithms** only. Organization-specific vocabulary (scope names/parameter names) and paths have a single source: the `subScope` definitions in **`.claude/config/scope.yaml`**.
>
> **Variables**:
> - `{basePackagePath}` = `.claude/config/project.yaml` `baseNamespacePattern` with `.{module}` removed and dots converted to slashes.
>   E.g. `com.acme.platform.{module}` → `com/acme/platform`
> - `{projectRoot}` = the matching entry's `project` in `scope.yaml` (= project.yaml `projects[].name`)
> - `{paramValue}` = the second argument the user entered in the `{스코프} {값}` form

---

## 1. Argument validation (invoked at step 1)

### 1-1. General algorithm

```
parseArguments(args):
  scopeId  = args[0]
  paramVal = args[1] or null

  entry = scope.yaml.groups.*.scopes[].find(id == scopeId)
  if entry is null:
    return error("스코프 미존재")

  if paramVal is null:
    return { mode: "fullScope", entry }

  if entry.subScope is null:
    return error("이 스코프는 하위 파라미터를 지원하지 않습니다")

  validatePath = resolveVars(entry.subScope.validatePath, paramValue=paramVal)
  if not exists({projectRoot}/{validatePath}):
    return error("유효하지 않은 {entry.subScope.paramName}: " + paramVal +
                 ". 유효 목록은 다음 디렉토리에서 확인: " + dirname(validatePath))

  return { mode: "subScope", entry, paramValue: paramVal }
```

### 1-2. Variable substitution rules

Variable tokens in `subScope.validatePath` / `subScope.allowedPaths` / `subScope.scanPaths` / `subScope.cacheFileSuffix`:

| Token | Substituted value |
|---|---|
| `{basePackagePath}` | project.yaml `baseNamespacePattern` with `.{module}` removed + dot→slash |
| `{paramValue}` | The user-entered second argument |

Perform substitution in one pass immediately after the `paramValue` value is determined.

### 1-3. `--ref-read` value constraints

- `--ref-read` values may only be top-level scope identifiers (`scope.yaml` `groups.*.scopes[].id`).
- Sub-scope identifiers are not accepted (`--ref-read=backoffice {menuId}` is invalid). Specify the parent scope (`--ref-read=backoffice`).

---

## 2. Module scan targets (invoked at step 7)

### 2-1. scanPaths interpretation

`subScope.scanPaths` value:

- Explicit path list → add each item to the scan targets after variable substitution
- The `"@inherit-shared"` token → inherit the group's `sharedCodeRange` as-is (per-group shared code)
- Unspecified → same as `subScope.allowedPaths`

### 2-2. Group sharedCodeRange inheritance

With `scanPaths: "@inherit-shared"`, expand each path of the group's `sharedCodeRange` by these rules:

```
java[]            → {projectRoot}/src/main/java/{basePackagePath}/{scopeId}/{path}
javaRootFiles[]   → {projectRoot}/src/main/java/{basePackagePath}/{scopeId}/{file}
resources[]       → {projectRoot}/src/main/resources/{path}
```

> If `{scopeId}` differs from the package directory name, add a `packageDir` key to the group's `sharedCodeRange` (for exceptional cases; currently unused).

### 2-3. Combining results

Step 7 scan targets = substituted `subScope.allowedPaths` ∪ interpreted `subScope.scanPaths`.

---

## 3. Cache identifier (step 7 storage path)

Substitute variables in `subScope.cacheFileSuffix`, then join it into the cache filename:

```
cacheFileName = scopeId + resolveVars(subScope.cacheFileSuffix) + ".md"
```

If unspecified, `{scopeId}.md` (same as a regular scope).

---

## 4. Group sharedCodeRange definition

The `scope.yaml` `groups.{X}.sharedCodeRange` field:

```yaml
groups:
  {X}:
    sharedCodeRange:
      java: [common/, config/, ...]          # 패키지 하위 디렉토리
      javaRootFiles: [Application.java, ...] # 패키지 루트 직속 파일
      resources: [views/templates/, ...]     # 리소스 하위 경로
```

This definition applies with `subScope.scanPaths: "@inherit-shared"`. When an explicit path list is used, the group `sharedCodeRange` is ignored.

---

## 5. Adoption guide for external organizations

To support sub-scopes in a new organization:

1. Add a `subScope` block to the relevant entry in `scope.yaml` (paramName/validatePath/allowedPaths/scanPaths/cacheFileSuffix).
2. If shared-code inheritance is needed, define `sharedCodeRange` on the group + set `scanPaths: "@inherit-shared"`.
3. No changes to this file (`sub-scope-rules.md`) are needed — the generic algorithm handles it automatically.
