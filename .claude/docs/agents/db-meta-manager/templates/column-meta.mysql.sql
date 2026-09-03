-- column-meta.mysql.sql
-- 용도: 단일 테이블 컬럼명·자료형·코멘트 조회 (코드값 정규식 파싱 입력)
-- 호출: db-meta-manager sub-agent 이 :table_name, :schema 치환 후 실행
-- 보안: information_schema 메타데이터만 조회. 실데이터 접근 금지.

SELECT
    column_name,
    data_type,
    is_nullable,
    character_maximum_length,
    column_comment
FROM information_schema.columns
WHERE table_schema = :schema
  AND table_name   = :table_name
ORDER BY ordinal_position;
