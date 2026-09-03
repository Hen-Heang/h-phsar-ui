#!/bin/bash
# PreToolUse hook: mcp__postgres__query — only allow schema metadata queries
# Blocks direct table data queries (SELECT/INSERT/UPDATE/DELETE/DROP/TRUNCATE).
# Pure bash — no Node.js dependency (avoids Windows stdin issues).
# Deny 출력은 check-file-access.sh 와 동일한 구조화 JSON(stdout) + exit 0 포맷.

# stdin 전체를 읽는다. read -r 은 한 줄만 읽고 끝 개행 없는 입력에 EOF 로 실패해 통과됨.
INPUT=$(cat)
[ -z "$INPUT" ] && { exec 0<&- 2>/dev/null; exit 0; }

TOOL=$(printf '%s\n' "$INPUT" | sed -n 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
[ -z "$TOOL" ] && TOOL="mcp__postgres__query"

# Extract sql or query from JSON using sed (POSIX compatible)
SQL=$(printf '%s\n' "$INPUT" | sed -n 's/.*"sql"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
[ -z "$SQL" ] && SQL=$(printf '%s\n' "$INPUT" | sed -n 's/.*"query"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
[ -z "$SQL" ] && { exec 0<&- 2>/dev/null; exit 0; }

# 차단을 유발한 구체 SQL. block() 이 target 으로 첨부한다.
OFFENDER=""

# reason 에 사용자 SQL 이 들어가므로 JSON 문자열 이스케이프 필수.
# 역슬래시 먼저, 그다음 따옴표. 제어문자(개행/탭)는 공백 처리로 제거. (jq 미설치 → 수동.)
json_escape() {
	printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr '\t\n\r' '   '
}

block() {
	# PreToolUse structured deny: JSON on stdout + exit 0 (NOT exit 2).
	# exit 2 면 stdout JSON 무시됨 — 둘 중 하나만 가능. reason 은 모델에 전달된다.
	local target="$OFFENDER"
	local reason="$TOOL denied - $1"
	if [ -n "$target" ]; then
		reason="$reason (target: $target)"
	fi
	reason=$(json_escape "$reason")
	printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$reason"
	exit 0
}

UPPER=$(printf '%s\n' "$SQL" | tr '[:lower:]' '[:upper:]')

# Block DML/DDL (except SELECT)
for STMT in INSERT UPDATE DELETE DROP TRUNCATE ALTER CREATE; do
	if printf '%s\n' "$UPPER" | grep -q "^$STMT"; then
		OFFENDER="$SQL"
		block "$STMT statements are not allowed. Only schema metadata queries are permitted."
	fi
done

# SELECT/WITH: only allow metadata source queries
if printf '%s\n' "$UPPER" | grep -qE '^(SELECT|WITH)'; then
	ALLOWED_SOURCES="INFORMATION_SCHEMA|PG_CATALOG|PG_INDEXES|PG_STAT|PG_CLASS|PG_NAMESPACE|PG_ATTRIBUTE|PG_TYPE|PG_CONSTRAINT|PG_INDEX|PG_DESCRIPTION"
	if printf '%s\n' "$UPPER" | grep -qE "$ALLOWED_SOURCES"; then
		exec 0<&- 2>/dev/null
		exit 0
	fi
	OFFENDER="$SQL"
	block "Direct table data queries are forbidden. Use system catalog prefixes such as pg_catalog. or information_schema."
fi

exec 0<&- 2>/dev/null
exit 0
