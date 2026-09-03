# Input Format — shared by code-review / code-reviewer

> Single source for the `$ARGUMENTS` parsing spec of the code-review skill and the code-reviewer agent. This reference is cited from both SKILL.md `<Input_Format>` and the agent prompt `<Input_Format>`.

## Parsing tokens

| Value    | Description                      | Default     |
| -------- | -------------------------------- | ----------- |
| `TARGET` | Review target range              | `staged`    |
| `LANG`   | Review language `ko` / `en`      | `ko`        |
| `PATH`   | Specific file/directory scope (optional, **multiple allowed**) | none (all) |

## Invocation examples

```
(없음)                        # staged 변경사항 (git diff --staged)
unstaged                      # unstaged 변경사항 (git diff)
all                           # staged + unstaged 전체 (git diff HEAD)
HEAD~1                        # 마지막 커밋 (git diff HEAD~1 HEAD)
HEAD~3                        # 최근 3개 커밋
en                            # 언어 지정 (ko/en)
staged en                     # 조합 가능
path/to/File.java             # 특정 파일만 리뷰
app-api/order-api/            # 특정 모듈만 리뷰
all en app-backoffice/        # 전체 조합 가능
app-api/account-api/ app-api/common/     # 복수 경로 — 둘 중 하나라도 매칭되면 리뷰 (스코프 자동 한정 시)
```

## Behavior rules

- When `PATH` is given, filter the diff result to only the files matching that path and review those.
- **`PATH` may be given multiple times** — with several paths, a diff file is included in the review if it matches **any one of them (OR)**. (Used when the code-review skill's automatic scope confinement passes the active scope's multiple allowedPaths)
- With no `TARGET`, use `staged`. With no `LANG`, apply `project.yaml codeReview.defaultLang` (falling back to `ko`).
- Token order does not matter — classify automatically by pattern (`HEAD~N`/`staged`/`unstaged`/`all` → TARGET, `ko`/`en` → LANG, **every other token is collected into the PATH list**).
