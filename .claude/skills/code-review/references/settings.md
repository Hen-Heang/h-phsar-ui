# code-review default settings

<Default_Settings>

| Key | Default | Description |
|---|---|---|
| `default_lang` | `ko` | Review language (ko / en) |
| `default_target` | `staged` | Review target (staged / unstaged / all / HEAD~N) |
| `review_focus` | bug, security, performance, quality, test | Review focus items |

</Default_Settings>

<Ignore_Files>

File patterns excluded from analysis:

- `*.lock`
- `*.min.js`
- `*.min.css`
- `package-lock.json`
- `yarn.lock`
- `migrations/*`
- `*.generated.*`
- `**/js/lib/**`
- `**/vendor/**`

</Ignore_Files>

<Severity_Rules>

The severity classification pattern data has been split out into the **single source [`severity-rules.md`](severity-rules.md)**.

- Classification algorithm: [`severity-algorithm.md`](severity-algorithm.md) STEP 0–3
- Pattern tables (C01~C11 / W01~W16 / S01~S06): [`severity-rules.md`](severity-rules.md)
- Adding/editing organization rules: edit `severity-rules.md` only — no changes to the settings.md body needed

</Severity_Rules>

<Custom_Checklist>

The team's custom checklist. Verified in the `### 📝 팀 체크리스트` section after the per-type evaluation.
Items that cannot be judged because the diff does not include the relevant content are not printed.

1. Check for duplicate implementations of `{{config.commonUtilsArtifact}}`
2. Timeout settings and exception handling present for external API calls
3. Missing HikariCP connection return (try-with-resources not used)
4. Check that ResponseCode/ResponseTemplate are defined in the correct module
5. Wrap @Scheduled/@KafkaListener methods in try-catch (unhandled → stoppage/infinite loop)
6. Explicit TTL set when storing to Redis (unset → memory leak)
7. No modifying the original collection while iterating it (prevents ConcurrentModificationException)

For additional per-language evaluation items, see the language pack's `skills/code-review/references/review-checklist-lang.md` (if present).

</Custom_Checklist>
