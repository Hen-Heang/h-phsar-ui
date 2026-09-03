# Mechanical convention thresholds (Core defaults)

> The key/value table read by `scripts/convention-measure.ps1`. **Core does not set language thresholds** —
> the values below are neutral defaults used "when the language pack provides no values".
>
> A language pack appends its own values to the same target path as a `.part2`. The parser
> **adopts the last occurrence when the same key appears multiple times**, so pack values automatically override the Core defaults.

## Keys

| key | value | Meaning |
|---|---|---|
| maxLineLength | 0 | Line length cap (**character count**). `0` = unchecked (languages that delegate to a formatter) |
| indent | any | `tab` / `space` / `any`. Enforced indentation character |
| indentTargets | * | File globs the indentation rule applies to (`;`-separated). `*` = all files. Must match the language convention's applicability |
| indentBlockStart |  | Token that starts a block-alignment exemption. Empty = no block exemption |
| indentBlockLine |  | First token of aligned lines inside the block. Exempt only inside an actual block |
| indentBlockEnd |  | Token that ends the block-alignment exemption |
| trailingWhitespace | forbid | `forbid` / `allow` |
| requireEofNewline | true | Whether a newline at end of file is required |

## Contract

- **The unit of measurement is always the character.** Never measure in bytes — in a codebase with non-ASCII comments, byte measurement fabricates violations (measured: 5 lines of Korean comments were misreported as violations, costing one correction round).
- Measurement covers **only the added lines of the diff**. Existing legacy lines are not this change's responsibility.
- Per-language rules not in this table (import order, naming, AST patterns) are not handled here — they belong to the language pack's `astgrep/rules/*` and `references/severity-rules.md.part2`.
- The aligned-block-line exemption activates only when the language pack declares all three tokens. Code is not excluded merely for starting with a certain character; only lines confirmed to be inside an actual block in the diff context are counted as `filtered.commentAligned`.

## lang-typescript 임계값

> 출처: `rules/typescript-convention.md` (Prettier 위임, 들여쓰기 2 스페이스).

| key | value | 의미 |
|---|---|---|
| maxLineLength | 0 | **미검사** — 줄 길이는 Prettier 소관이고 수동 정렬을 금지한다. 여기서 재면 포매터와 이중 규제가 된다 |
| indent | space | 스페이스 2칸 (탭 금지) |
| indentTargets | *.ts;*.tsx;*.js;*.jsx;*.mjs;*.cjs | TS/JS 소스만. JSON·설정 파일은 재지 않는다 |
| indentBlockStart | /* | 블록 주석 시작 |
| indentBlockLine | * | 블록 주석 내부 정렬행 |
| indentBlockEnd | */ | 블록 주석 종료 |
| trailingWhitespace | forbid | 후행 공백 제거 |
| requireEofNewline | true | 파일 끝 개행 |
