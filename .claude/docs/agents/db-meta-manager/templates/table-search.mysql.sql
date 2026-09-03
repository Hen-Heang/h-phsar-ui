-- table-search.mysql.sql
-- 용도: information_schema 메타데이터에서 업무명사(영문/한글) 매칭 테이블 + 코멘트 조회
-- 호출: db-meta-manager sub-agent 이 :keyword_en, :keyword_ko, :schema 치환 후 실행
-- 보안: information_schema 메타데이터만 조회. 실데이터 접근 금지.

SELECT
    table_name    AS table_name,
    table_comment AS table_comment
FROM information_schema.tables
WHERE table_schema = :schema
  AND table_type   = 'BASE TABLE'
  AND (
        table_name    LIKE :keyword_en
     OR table_comment LIKE :keyword_ko
  )
ORDER BY table_name
LIMIT 10;
