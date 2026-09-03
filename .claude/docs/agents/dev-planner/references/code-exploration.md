---
name: code-exploration
description: 5단계 코드 탐색 절차 — 글로벌 탐색(루트 문서 재료) + 페이즈별 탐색(엔드포인트/화면 매칭) + DB 스키마 메타데이터 조회 + SQL 함수 시그니처 호환성 검증 룰. dev-planner 5단계 진입 시 Read.
---

# Code Exploration — step-5 procedure

> Single source for dev-planner step 5. Three-part structure: global + per-phase + DB schema exploration.

---

## 5-1. Global exploration (root-document material)

> **Consult the domain index first**: if `.claude/docs/domain/index.md` exists, before any Glob/Grep read the target module page (`docs/domain/modules/<slug>.md`), `common.md`, and the reverse index (`tables/`) first, and use them as the starting point for package structure, key files, and domain flows. If there is no index, skip this.

Within the `allowed_paths` scope:

```
{project_root}/{allowed_paths}/src/main/**/* ← 패키지/클래스
{project_root}/{allowed_paths}/src/main/resources/**/*Mapper.xml ← 쿼리 매퍼 파일
{project_root}/{shared_module}/src/main/ ← 공유 모듈 (있을 경우)
```

Projects that include a frontend (web-fullstack):
```
{project_root}/src/main/resources/templates/ or views/
{project_root}/src/main/resources/static/{js,css,images}/
```

**Collect with Glob + Grep:**
- Package structure (record in root §2)
- List of common Config/Filter/Interceptor/ExceptionHandler (record in root §7, §8)
- Actual implementation-class locations of the brief §6 security spec (record in root §7)

---

## 5-2. Per-phase exploration

For each phase, pick the related endpoints/screens from brief §4·§7 and check whether existing files actually exist:
- Existing-extension project: if an existing Controller/Service/Template exists → `MODIFY`, otherwise `NEW`
- New project (the case where brief §10-2 "참조 코드 패턴" specifies porting-source paths): all `NEW` (port)
- **Attach 방법론 태그**: mark the methodology together with the classification result (single source: the *작업유형별 방법론 선택* table in `testing.md`) — `NEW → TDD`, `MODIFY → DDD` (특성화 gate), bug fix → `RED 재현`. These tags carry through to the NEW/MODIFY distinction in the phase document's §3 implementation-target file table + §9 완료의 정의(DoD).

---

## 5-3. DB schema exploration (all tables used — existing + new)

For **every table** the phase uses (existing or new), query the column metadata (including `data_type`) with `mcp__postgres__query`. For new-table DDL drafts, consult a similar table's schema; for existing tables, use the result as the input to function-compatibility verification when writing SQL:

```sql
SELECT c.column_name, c.data_type, c.character_maximum_length, c.is_nullable, c.column_default,
 col_description(t.oid, c.ordinal_position) AS column_comment
FROM information_schema.columns c
JOIN pg_class t ON t.relname = c.table_name
JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = c.table_schema
WHERE c.table_schema = '{{config.db.schema}}' AND c.table_name = '{테이블명}'
ORDER BY c.ordinal_position;
```

** SQL function-signature compatibility verification (agent-specific rule — not in the guidelines / mandatory whenever SQL bodies are included in phase §4 or §5):**
- When writing SQL code blocks in §4·§5, verify that the input-argument types of every function used (`TO_CHAR`, `TO_DATE`, `CAST`, `SUBSTRING`, `LPAD`, `||` concat, arithmetic operators, etc.) are compatible with the column `data_type` queried above, per the PostgreSQL function-overload table.
- In particular, *never call `TO_CHAR` directly on a string column* — the `TO_CHAR(varchar, format)` signature does not exist in PostgreSQL and leads straight to a runtime `function does not exist` error. If conversion is needed, write it with explicit casting (`TO_DATE(varchar,'YYYYMMDD')` then `TO_CHAR(date,'YYYY.MM.DD')`).
- To reduce the verification burden, the principle is to delegate SQL bodies to the `/develop` step (see the §4 guideline item below) and have the dev-planner output state only SQL IDs and responsibilities. Only when dev-planner unavoidably writes an SQL body itself (e.g. a short SELECT, or when the signature is itself a decision) does dev-planner perform this compatibility verification.
- Mapper SQL rules follow the single sources `base-rule.md §8` + the language pack's mapper guideline. This §5-3 adds only the one guideline-uncovered rule: *function-signature compatibility*.

> Querying actual table data is forbidden; metadata only — single source: the workspace `CLAUDE.md` *설정 보안 규칙*.
