# Large Diff Policy — handling large changes (full review guaranteed)

> **Single source** for the large-diff handling spec of the code-review skill / code-reviewer agent.
> The review runs in an isolated context (the code-reviewer agent), so the purpose of the delegation is to review even a large diff **in full**.

## Core principle — full review

- **No hard file cap. No per-file truncation.** Review **every changed file and every changed line**.
- Do **not drop** files just because the file or line count is high.

## Priority = review/output order (not dropping)

Review and output a large diff in the order below so important changes are handled first. It is only an order — lower-priority files **must still be reviewed**.

| Order | File type                            | Reason                             |
| ---- | ----------------------------------- | ---------------------------------- |
| 1    | Java sources (`.java`)              | Business logic, highest bug/security impact |
| 2    | XML Mappers (`.xml`)                | Query performance/security impact  |
| 3    | Frontend (`.js`, `.html`, `.css`)   | XSS/UI issues                      |
| 4    | Build config (`pom.xml`)            | Dependency conflicts/version management |
| 5    | Other                               | Config, resources, etc.            |

Within the same priority, handle files with more changed lines first.

## When context is exceeded — batch splitting (silent drops forbidden)

For an extremely large diff that cannot fit into context in a single pass:

1. **Split into batches** by project/file type and review in multiple passes.
2. **Merge** the issues found in each pass and output a single markdown (header issue tally `🔴/🟡/🔵`).
3. **Never silently drop** any file. If files were unavoidably omitted, **explicitly list** them at the end of the output.
