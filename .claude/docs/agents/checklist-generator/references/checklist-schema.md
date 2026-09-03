# checklist-schema — deployment-checklist output spec (single source)

> Consumers: `checklist-generator` agent step 5 + the `make-checklist-xlsx.mjs` script. Item derivation rules are in `checklist-playbook.md`.

---

## §1. Output paths

| Output | Path (relative to the workspace root) |
| --- | --- |
| Excel (final) | `{{config.outputDir}}/checklists/{업무요약}_체크리스트.xlsx` |
| Intermediate JSON | `{{config.outputDir}}/checklists/{N}_checklist.json` (for regeneration/audit — never delete. This file owns task-number tracking) |
| Fallback CSV | `{{config.outputDir}}/checklists/{업무요약}_체크리스트_{시트명}.csv` (only when the script fails) |

**`{업무요약}` rule**: summarize the brief §1 task title (or, if absent, the work identified from the diff) in **Korean, 10 characters or fewer**. Write it as a noun phrase with no spaces, special characters, or English (e.g. `주문화면개선`, `재고연계추가`). Record the same value in the JSON `fileTitle` field.

## §2. Sheet composition (fixed order)

| # | Sheet name | Nature |
| --- | --- | --- |
| 0 | `Summary` | Cover — task meta + per-sheet item counts + P0 summary (the script does not auto-generate it — write it explicitly in the JSON) |
| 1 | `1.요건검증` | Brief requirements → production verification items |
| 2 | `2.화면동작` | **Mandatory sheet** — per-screen check scenarios. **The reader is a non-developer (business/planning)** — the dedicated column spec (§3) applies |
| 3 | `3.DB작업` | Production-deployment queries (dedicated columns) |
| 4 | `4.서버설정` | Server, configuration, and integration changes |
| 5 | `5.영향도회귀` | Impact scope and regression checks |

Create sheets even when not applicable, with one row "해당 없음 — {사유}" (sheets other than 화면동작 may be omitted when they have 0 items. 화면동작 may not be omitted — playbook §3).

## §3. Column specs

**Common sheets (1·4·5)**:

| Column | Content |
| --- | --- |
| No | Serial number within the sheet |
| 분류 | Sub-category within the sheet |
| 점검 항목 | One sentence — what is being verified |
| 점검 방법 | Concrete procedure (URL, menu path, command, query) |
| 기대 결과 | Pass criterion |
| 환경 | `스테이징` / `운영` / `공통` |
| 우선순위 | P0~P3 (playbook §5) |
| 근거 | playbook §4 format |
| 결과 | (blank — filled by the checker; OK/NG/N.A dropdown) |
| 점검자/일자 | (blank) |
| 비고 | Cautions and prerequisites |

**화면동작 sheet (2)** — dedicated spec for the non-developer (business/planning) audience. **No 환경/근거 columns**:

| Column | Content |
| --- | --- |
| No | Serial number within the sheet |
| 분류 | **Korean menu name + feature** (e.g. `주문관리 > 주문현황 · 조회`). Substitute the filename only when the menu name cannot be determined (playbook §3) |
| 점검 항목 | One sentence — business wording a non-developer who has not read the brief understands immediately |
| 점검 방법 | Screen operation procedure such as menu path and click order (no developer terms — except developer-only rows) |
| 기대 결과 | A result visually verifiable on the screen |
| 우선순위 | `높음` / `중간` / `낮음` (P-grade mapping: playbook §5) |
| 결과 | (blank — filled by the checker; OK/NG/N.A dropdown) |
| 점검자/일자 | (blank) |
| 비고 | Cautions and prerequisites. Developer-only rows are marked `[개발자 전용]` |

- **Developer-only rows**: checks a non-developer cannot perform (direct API calls, server logs, forced browser-cache refresh, etc.) are written as `{"cells": [...], "dev": true}` JSON row objects → the script renders the whole row with a **yellow background**. Only these rows use developer-oriented technical wording.

**DB작업 sheet (3)**:

| Column | Content |
| --- | --- |
| 순서 | Execution order (the sort key) |
| 구분 | DDL / DML / GRANT / SEQ |
| 대상 테이블 | Table/index name |
| SQL/스크립트 | Original text or script path (quote the plan verbatim — no arbitrary alteration) |
| 실행 전 확인 | Backup, row counts, lock impact |
| 실행 후 검증 | Verification query and expected counts |
| 롤백 | Rollback SQL or "롤백 불가 — 사유" |
| 근거 | playbook §4 format |
| 결과 | (blank; OK/NG/N.A dropdown) |
| 비고 | Meta-comparison result (already applied / not applied) etc. |

**Summary sheet (0)**: 2 columns (항목|값) — task number, title, 업무요약 (= filename `fileTitle`), creation date, branch, scope, diff base, per-sheet item counts, P0 item list (1 item per row).

## §4. JSON spec (the script's input contract)

```json
{
  "taskNumber": "057",
  "title": "{과업 제목 — 브리프 §1}",
  "fileTitle": "주문화면개선",
  "createdAt": "2026-07-27",
  "branch": "feature/057/dev1",
  "scope": "order-api",
  "diffBase": "staged (snapshot 2026-07-27)",
  "sheets": [
    {
      "name": "Summary",
      "columns": ["항목", "값"],
      "widths": [22, 80],
      "rows": [["과업번호", "057"], ["…", "…"]]
    },
    {
      "name": "1.요건검증",
      "columns": ["No", "분류", "점검 항목", "점검 방법", "기대 결과", "환경", "우선순위", "근거", "결과", "점검자/일자", "비고"],
      "widths": [5, 14, 40, 45, 30, 9, 8, 16, 8, 12, 25],
      "resultCol": 9,
      "rows": [[1, "…", "…", "…", "…", "운영", "P1", "브리프 §3-1", "", "", ""]]
    },
    {
      "name": "2.화면동작",
      "columns": ["No", "분류", "점검 항목", "점검 방법", "기대 결과", "우선순위", "결과", "점검자/일자", "비고"],
      "widths": [5, 26, 40, 45, 35, 9, 8, 12, 22],
      "resultCol": 7,
      "rows": [
        [1, "주문관리 > 주문현황 · 조회", "…", "…", "…", "높음", "", "", ""],
        {"cells": [2, "주문관리 > 주문현황 · API 응답", "…", "…", "…", "중간", "", "", "[개발자 전용]"], "dev": true}
      ]
    }
  ]
}
```

- `fileTitle`: the Korean ≤ 10-character 업무요약 (§1) — used in the Excel filename `{fileTitle}_체크리스트.xlsx` and the Summary sheet. The script does not consume it (`--out-path` is passed at call time).
- `widths`: column character widths (optional — script defaults when omitted).
- `resultCol`: 1-based position of the 결과 column — the script attaches `OK,NG,N.A` data validation (dropdown) to that column (not applied when omitted).
- A row is either an array (normal row) or a `{"cells": [...], "dev": true}` object (**developer-only row → yellow background**). Usable in any sheet, but its main use is the 화면동작 sheet.
- Cell values are strings or numbers. Line breaks are `\n` (the script handles wrapping).
- The script auto-substitutes the 31-character sheet-name limit and forbidden characters (`: \ / ? * [ ]`), but use the §2 standard names as-is.

## §5. Script call contract

```bash
node .claude/skills/deploy-checklist/scripts/make-checklist-xlsx.mjs \
  --json-path "{{config.outputDir}}/checklists/{N}_checklist.json" \
  --out-path "{{config.outputDir}}/checklists/{업무요약}_체크리스트.xlsx"
```

- Arguments are `--kebab-case value` pairs. Success: exit `0` + `OK {절대경로}` on stdout.
- Failure: exit `1` (validation violation — no JSON, no `sheets`, no columns) or `2` (any other error). Both print 1 line to stderr. **On non-zero, the agent performs the CSV fallback** (agent step 5).
- The script runs on every platform with only Node (no Excel, COM, or external packages — it generates OOXML directly).
