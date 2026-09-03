-- column-meta.oracle.sql
-- 용도: 단일 테이블 컬럼명·자료형·코멘트 조회 (코드값 정규식 파싱 입력)
-- 호출: db-meta-manager sub-agent 이 :table_name, :schema 치환 후 실행
-- 보안: 시스템 카탈로그(all_tab_columns, all_col_comments) 만 조회. 실데이터 접근 금지.

SELECT
    c.column_name,
    c.data_type,
    c.nullable                       AS is_nullable,
    c.data_length                    AS character_maximum_length,
    cc.comments                      AS column_comment
FROM all_tab_columns c
LEFT JOIN all_col_comments cc
       ON cc.owner       = c.owner
      AND cc.table_name  = c.table_name
      AND cc.column_name = c.column_name
WHERE c.owner       = :schema
  AND c.table_name  = :table_name
ORDER BY c.column_id;
