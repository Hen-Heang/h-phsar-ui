# Scope registry — schema document

> **Data location**: `.claude/config/scope.yaml` (replaceable per organization)
>
> This document defines the scope registry's **data schema and usage**. To add or change data, edit `scope.yaml` only.

---

## 1. Data file format

```yaml
groups:
  {GroupKey}:                          # A-K 그룹 (조직 자유)
    name: {그룹명}                      # 사용자 표시용
    scopes:
      - id: {스코프 식별자}             # 사용자가 /develop 인자로 입력
        project: {프로젝트명}            # project.yaml `projects[].name` 참조
        allowedPaths: [{허용 경로 목록}] # 메인 스코프 쓰기 허용 범위 (프로젝트 루트 기준)
        sharedModule: {공유 모듈 또는 null}
        subScope:                       # 선택 — 하위 스코프 지원 시
          paramName: {파라미터명}        # 예: menuId, jobId — /develop 두 번째 인자명
          validatePath: {경로}           # paramValue 유효성 검증 디렉토리 (변수 치환 후 존재 확인)
          allowedPaths: [...]            # paramValue 지정 시 메인 쓰기 허용 경로 (변수 치환)
          scanPaths: "@inherit-shared" | [...]  # 7단계 스캔 대상. "@inherit-shared" 시 그룹 sharedCodeRange 상속
          cacheFileSuffix: "--{paramValue}"     # 캐시 파일명 접미사 패턴
    sharedCodeRange:                    # 선택 — 하위 스코프 시 항상 허용 코드
      java: [...]
      javaRootFiles: ...
      resources: [...]
```

> **Truth-source separation**: project information (`name/shortName/multiModule/role/guideline`) is mastered by `project.yaml` `projects[]`. This file's `project:` references that name; look up derived information in project.yaml when needed.

---

## 2. Guideline decision (project.yaml single source)

`scope.yaml` has no `guideline:` field. Guides are derived from `project.yaml projects[].guideline`:

Format (project.yaml side):

```yaml
projects:
  - name: app-admin
    guideline:
      backend: guide-webmvc.md
      frontend: [guide-frontend/common.md, guide-frontend/mvc-pattern.md]
```

→ `backend` loads immediately. `frontend[]` is lazy (loaded on the first Read/Edit of an FE file, or immediately with the `--fe` flag).

---

## 3. Sub-scopes (subScope)

Generic sub-scopes with an identifier + parameter structure (independent of any organization's vocabulary).
E.g. `admin {menuId}`, `sales {menuId}`, `batch {jobId}`.

| Field | Purpose |
|---|---|
| `paramName` | Name of `/develop`'s second argument (user display + validation messages). |
| `validatePath` | Directory for validating `paramValue`. Error if it does not exist. |
| `allowedPaths` | List of main write-allowed paths when `paramValue` is given. `{paramValue}`·`{basePackagePath}` variables. |
| `scanPaths` | Step 7 scanner targets. Explicit list or the `"@inherit-shared"` token. |
| `cacheFileSuffix` | Cache filename suffix (`{scopeId}{suffix}.md`). |

**Group sharedCodeRange**: with `scanPaths: "@inherit-shared"`, the group-level shared-code definition is inherited.

**Validation · discovery rules**: see the generic algorithm in `sub-scope-rules.md`.

---

## 4. Variable references

Variables inside `scope.yaml` are injected from `.claude/config/project.yaml`:

| Variable | Source |
|---|---|
| `{baseNamespacePattern}` | project.yaml `baseNamespacePattern` key (e.g. `com.acme.platform.{module}`) |
| `{workspaceName}` | project.yaml `workspaceName` key |

---

## 5. Procedure for adding a scope

1. Add an entry to the appropriate group (or a new group) in `.claude/config/scope.yaml`
2. If sub-scopes are needed, write `subScope` + `sharedCodeRange`
3. Confirm the guideline file exists under `.claude/docs/guideline/`
4. If a new guide is needed, add a guide file under `.claude/docs/guideline/` + set `project.yaml` `guideline.backend`

---

## 6. Adoption by an external organization

No changes to the skill body (`SKILL.md`, `references/*`) are needed. Replace only these two files:

| File | Contents |
|---|---|
| `.claude/config/scope.yaml` | The organization's project inventory |
| `.claude/config/project.yaml` | Workspace globals such as package patterns and DB metadata |
