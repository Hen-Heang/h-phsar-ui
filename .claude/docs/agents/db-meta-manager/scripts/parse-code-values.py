#!/usr/bin/env python3
# parse-code-values.py
# 용도: column_comment 텍스트에서 코드값 패턴 `(A : 의미1, B : 의미2)` 정규식 추출 → JSON Lines.
# 입력: stdin JSON Lines — {"table": "...", "column": "...", "comment": "..."}
# 출력: stdout JSON Lines — {"table": "...", "column": "...", "code": "A", "meaning": "신청"}
# 인자:
#   --pattern   PAIR 정규식 (default: `^([A-Z0-9]+)\s*[:：]\s*(.+)$`)
#               이 인자는 .claude/config/project.yaml db.codePattern 에서 주입.
#   --separator 코드 쌍 구분자 (default: `,`)
#               여러 코드가 한 코멘트에 있을 때 분할 기준.
# 사용 예:
#   echo '{"table":"TB_USER","column":"USER_STAT","comment":"사용자 상태 (A : 활성, I : 비활성)"}' \
#     | python3 parse-code-values.py --pattern '^([A-Z0-9]+)\s*[:：]\s*(.+)$' --separator ','

import argparse
import json
import re
import sys

# 괄호 블록 추출 (모든 vendor 공통)
PAREN_BLOCK = re.compile(r'\(([^()]*?:[^()]*?)\)')


def build_pair_regex(pattern: str) -> re.Pattern:
    return re.compile(pattern)


def extract_codes(comment: str, pair_regex: re.Pattern, separator: str):
    if not comment:
        return []
    results = []
    for paren_block in PAREN_BLOCK.findall(comment):
        for token in paren_block.split(separator):
            token = token.strip()
            if not token:
                continue
            m = pair_regex.match(token)
            if m and len(m.groups()) >= 2:
                results.append({"code": m.group(1).strip(), "meaning": m.group(2).strip()})
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pattern", default=r'^([A-Z0-9]+)\s*[:：]\s*(.+)$',
                        help="코드 쌍 정규식. .claude/config/project.yaml db.codePattern 값.")
    parser.add_argument("--separator", default=",",
                        help="한 괄호 안 코드 쌍 구분자. .claude/config/project.yaml db.codeSeparator 값.")
    args = parser.parse_args()
    pair_regex = build_pair_regex(args.pattern)

    for raw_line in sys.stdin:
        raw_line = raw_line.strip()
        if not raw_line:
            continue
        try:
            record = json.loads(raw_line)
        except json.JSONDecodeError:
            continue
        table = record.get("table", "")
        column = record.get("column", "")
        comment = record.get("comment", "")
        for entry in extract_codes(comment, pair_regex, args.separator):
            out = {"table": table, "column": column, **entry}
            print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()
