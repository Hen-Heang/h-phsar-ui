#!/usr/bin/env bash
# pdf-to-text.sh — PDF → UTF-8 텍스트 변환 (pdftotext wrapper)
#
# 사용법:
#   bash pdf-to-text.sh <input.pdf> <output.txt>
#
# 종료 코드:
#   0 - 성공
#   1 - 인수 오류 또는 파일 없음
#   2 - pdftotext 미설치 또는 변환 실패

set -euo pipefail

if [ $# -ne 2 ]; then
	echo "❌ 사용법: bash $0 <input.pdf> <output.txt>" >&2
	exit 1
fi

INPUT_PDF="$1"
OUTPUT_TXT="$2"

if [ ! -f "$INPUT_PDF" ]; then
	echo "❌ 입력 파일 없음: $INPUT_PDF" >&2
	exit 1
fi

if ! command -v pdftotext &>/dev/null; then
	echo "❌ pdftotext 미설치. poppler-utils 설치 필요." >&2
	echo "   Windows (choco):  choco install xpdf-utils" >&2
	echo "   macOS (brew):     brew install poppler" >&2
	echo "   Linux (apt):      apt-get install poppler-utils" >&2
	exit 2
fi

mkdir -p "$(dirname "$OUTPUT_TXT")"

if pdftotext -enc UTF-8 "$INPUT_PDF" "$OUTPUT_TXT"; then
	echo "✅ 변환 완료: $OUTPUT_TXT"
	exit 0
else
	echo "❌ pdftotext 변환 실패" >&2
	exit 2
fi
