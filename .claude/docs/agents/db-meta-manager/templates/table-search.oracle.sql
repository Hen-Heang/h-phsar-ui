-- table-search.oracle.sql
-- 용도: all_tables + all_tab_comments 메타데이터에서 업무명사 매칭 테이블 조회
-- 호출: db-meta-manager sub-agent 이 :keyword_en, :keyword_ko, :schema 치환 후 실행
-- 보안: 시스템 카탈로그(all_tables, all_tab_comments) 만 조회. 실데이터 접근 금지.

SELECT *
FROM (
  SELECT
      t.table_name                    AS table_name,
      tc.comments                     AS table_comment
  FROM all_tables t
  LEFT JOIN all_tab_comments tc
         ON tc.owner      = t.owner
        AND tc.table_name = t.table_name
  WHERE t.owner = :schema
    AND (
          UPPER(t.table_name) LIKE UPPER(:keyword_en)
       OR tc.comments         LIKE :keyword_ko
    )
  ORDER BY t.table_name
)
WHERE ROWNUM <= 10;
