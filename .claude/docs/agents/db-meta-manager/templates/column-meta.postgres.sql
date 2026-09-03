-- column-meta.postgres.sql
-- 용도: 단일 테이블의 컬럼명 + 자료형 + 코멘트 조회 (코드값 정규식 파싱 입력)
-- 호출: db-meta-manager sub-agent 이 :table_name, :schema 치환 후 실행
-- 보안: information_schema/pg_catalog 메타데이터만 조회. 실데이터 접근 금지.

SELECT
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.character_maximum_length,
    col_description(t.oid, c.ordinal_position) AS column_comment
FROM information_schema.columns c
JOIN pg_class t      ON t.relname = c.table_name
JOIN pg_namespace n  ON n.oid = t.relnamespace
                   AND n.nspname = c.table_schema
WHERE c.table_schema = :schema
  AND c.table_name   = :table_name
ORDER BY c.ordinal_position;
