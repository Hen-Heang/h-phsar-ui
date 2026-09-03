-- table-search.postgres.sql
-- 용도: .claude/config/project.yaml 의 db.schema 에서 업무명사(영문/한글) 매칭 테이블 + 코멘트 조회
-- 호출: db-meta-manager sub-agent 이 :keyword_en, :keyword_ko, :schema 치환 후 실행
-- 보안: information_schema/pg_catalog 메타데이터만 조회. 실데이터 접근 금지.

SELECT
    c.relname                    AS table_name,
    obj_description(c.oid)       AS table_comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = :schema
  AND c.relkind = 'r'
  AND (
        c.relname ILIKE :keyword_en
     OR obj_description(c.oid) ILIKE :keyword_ko
  )
ORDER BY c.relname
LIMIT 10;
