#!/usr/bin/env bash
# ============================================================================
# convert-office.sh — Office 문서 텍스트 추출 스크립트 (pptx / docx / xlsx)
#
# 사용법:
#   bash .claude/skills/parse-spec-doc/scripts/convert-office.sh <파일경로> [출력경로]
#   (오케스트레이터는 Skill(skill="parse-spec-doc", args="...") 로 호출 권장)
#
# 인수:
#   $1 - 변환할 Office 파일 경로 (.pptx, .docx, .xlsx)
#   $2 - (선택) 출력 파일 경로. 생략 시 stdout 출력.
#
# 변환 우선순위:
#   1순위: PowerShell .NET (Windows 기본 내장)
#   2순위: Python (python-pptx / python-docx / openpyxl)
#   3순위: LibreOffice (PNG 이미지 변환)
#
# 종료 코드:
#   0 - 성공
#   1 - 인수 오류 또는 파일 없음
#   2 - 모든 변환 방식 실패
# ============================================================================

set -euo pipefail

# --- 인수 검증 ---
if [ $# -lt 1 ]; then
	echo "❌ 사용법: bash $0 <파일경로> [출력경로]"
	exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="${2:-}"

if [ ! -f "$INPUT_FILE" ]; then
	echo "❌ 파일을 찾을 수 없습니다: $INPUT_FILE"
	exit 1
fi

# 확장자 추출 (소문자 변환)
EXT=$(echo "${INPUT_FILE##*.}" | tr '[:upper:]' '[:lower:]')

if [[ "$EXT" != "pptx" && "$EXT" != "docx" && "$EXT" != "xlsx" ]]; then
	echo "❌ 지원하지 않는 파일 형식입니다: .$EXT (지원: pptx, docx, xlsx)"
	exit 1
fi

# --- 출력 처리 함수 ---
# 결과를 stdout 또는 파일로 출력
output_result() {
	if [ -n "$OUTPUT_FILE" ]; then
		cat > "$OUTPUT_FILE"
		echo "✅ 변환 완료: $OUTPUT_FILE"
	else
		cat
	fi
}

# --- 1순위: PowerShell .NET ---
try_powershell() {
	if ! command -v powershell.exe &>/dev/null; then
		return 1
	fi

	local ps1_file="/tmp/convert_office_$$.ps1"
	local win_input
	win_input=$(cygpath -w "$INPUT_FILE" 2>/dev/null || echo "$INPUT_FILE")

	case "$EXT" in
		pptx)
			cat > "$ps1_file" << 'PS1_EOF'
param([string]$FilePath)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName WindowsBase
$package = [System.IO.Packaging.Package]::Open($FilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
$parts = $package.GetParts() | Where-Object { $_.Uri.OriginalString -match '/ppt/slides/slide[0-9]+\.xml$' } | Sort-Object { [int]([regex]::Match($_.Uri.OriginalString, 'slide([0-9]+)').Groups[1].Value) }
foreach ($part in $parts) {
    $stream = $part.GetStream()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    $xml = [xml]$reader.ReadToEnd()
    $reader.Close(); $stream.Close()
    $slideNum = [regex]::Match($part.Uri.OriginalString, 'slide([0-9]+)').Groups[1].Value
    Write-Output "=== Slide $slideNum ==="
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
    $texts = $xml.SelectNodes('//a:t', $ns)
    foreach ($t in $texts) { if ($t.InnerText.Trim()) { Write-Output $t.InnerText } }
    Write-Output ''
}
$package.Close()
PS1_EOF
			;;
		docx)
			cat > "$ps1_file" << 'PS1_EOF'
param([string]$FilePath)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName WindowsBase
$package = [System.IO.Packaging.Package]::Open($FilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
$part = $package.GetPart([Uri]::new('/word/document.xml', [UriKind]::Relative))
$stream = $part.GetStream()
$reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
$xml = [xml]$reader.ReadToEnd()
$reader.Close(); $stream.Close()
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$paragraphs = $xml.SelectNodes('//w:p', $ns)
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes('.//w:t', $ns)
    $line = ($texts | ForEach-Object { $_.InnerText }) -join ''
    if ($line.Trim()) { Write-Output $line }
}
$package.Close()
PS1_EOF
			;;
		xlsx)
			cat > "$ps1_file" << 'PS1_EOF'
param([string]$FilePath)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName WindowsBase
$package = [System.IO.Packaging.Package]::Open($FilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)

# SharedStrings 로드
$ssPart = $package.GetPart([Uri]::new('/xl/sharedStrings.xml', [UriKind]::Relative))
$ssStream = $ssPart.GetStream()
$ssReader = New-Object System.IO.StreamReader($ssStream, [System.Text.Encoding]::UTF8)
$ssXml = [xml]$ssReader.ReadToEnd()
$ssReader.Close(); $ssStream.Close()
$ssNs = New-Object System.Xml.XmlNamespaceManager($ssXml.NameTable)
$ssNs.AddNamespace('s', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
$strings = $ssXml.SelectNodes('//s:si', $ssNs) | ForEach-Object {
    ($_.SelectNodes('.//s:t', $ssNs) | ForEach-Object { $_.InnerText }) -join ''
}

# Sheet 순회
$sheetParts = $package.GetParts() | Where-Object { $_.Uri.OriginalString -match '/xl/worksheets/sheet[0-9]+\.xml$' } | Sort-Object { [int]([regex]::Match($_.Uri.OriginalString, 'sheet([0-9]+)').Groups[1].Value) }
foreach ($sheetPart in $sheetParts) {
    $sheetNum = [regex]::Match($sheetPart.Uri.OriginalString, 'sheet([0-9]+)').Groups[1].Value
    Write-Output "=== Sheet $sheetNum ==="
    $sheetStream = $sheetPart.GetStream()
    $sheetReader = New-Object System.IO.StreamReader($sheetStream, [System.Text.Encoding]::UTF8)
    $sheetXml = [xml]$sheetReader.ReadToEnd()
    $sheetReader.Close(); $sheetStream.Close()
    $sheetNs = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
    $sheetNs.AddNamespace('s', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')
    $rows = $sheetXml.SelectNodes('//s:row', $sheetNs)
    foreach ($row in $rows) {
        $cells = $row.SelectNodes('s:c', $sheetNs)
        $values = foreach ($c in $cells) {
            $v = $c.SelectSingleNode('s:v', $sheetNs)
            if ($v) {
                if ($c.GetAttribute('t') -eq 's') { $strings[[int]$v.InnerText] } else { $v.InnerText }
            }
        }
        if ($values) { Write-Output ($values -join "`t") }
    }
    Write-Output ''
}
$package.Close()
PS1_EOF
			;;
	esac

	# ps1 파일에 파일 경로를 인수로 전달하여 실행
	local win_ps1
	win_ps1=$(cygpath -w "$ps1_file" 2>/dev/null || echo "$ps1_file")
	local result
	if result=$(powershell.exe -ExecutionPolicy Bypass -File "$win_ps1" -FilePath "$win_input" 2>&1); then
		rm -f "$ps1_file"
		echo "$result"
		return 0
	else
		rm -f "$ps1_file"
		return 1
	fi
}

# --- 2순위: Python ---
try_python() {
	if ! command -v python &>/dev/null && ! command -v python3 &>/dev/null; then
		return 1
	fi

	local py_cmd="python"
	command -v python3 &>/dev/null && py_cmd="python3"

	case "$EXT" in
		pptx)
			if ! $py_cmd -c "import pptx" 2>/dev/null; then return 1; fi
			$py_cmd -c "
from pptx import Presentation
import sys
prs = Presentation(sys.argv[1])
for i, slide in enumerate(prs.slides):
    print(f'=== Slide {i+1} ===')
    for shape in slide.shapes:
        if shape.has_text_frame:
            print(shape.text_frame.text)
    print()
" "$INPUT_FILE"
			;;
		docx)
			if ! $py_cmd -c "import docx" 2>/dev/null; then return 1; fi
			$py_cmd -c "
from docx import Document
import sys
doc = Document(sys.argv[1])
for para in doc.paragraphs:
    if para.text.strip():
        print(para.text)
" "$INPUT_FILE"
			;;
		xlsx)
			if ! $py_cmd -c "import openpyxl" 2>/dev/null; then return 1; fi
			$py_cmd -c "
import openpyxl, sys
wb = openpyxl.load_workbook(sys.argv[1])
for sheet in wb.sheetnames:
    ws = wb[sheet]
    print(f'=== Sheet: {sheet} ===')
    for row in ws.iter_rows(values_only=True):
        if any(cell is not None for cell in row):
            print('\t'.join(str(c) if c is not None else '' for c in row))
    print()
" "$INPUT_FILE"
			;;
	esac
}

# --- 3순위: LibreOffice ---
try_libreoffice() {
	if ! command -v libreoffice &>/dev/null; then
		return 1
	fi

	local out_dir="/tmp/convert_office_lo_$$"
	mkdir -p "$out_dir"

	if libreoffice --headless --convert-to png --outdir "$out_dir" "$INPUT_FILE" &>/dev/null; then
		# PNG 파일 목록 출력 (Claude가 Read로 이미지를 읽을 수 있도록)
		echo "=== LibreOffice PNG 변환 완료 ==="
		find "$out_dir" -name "*.png" -type f | sort
		return 0
	else
		rm -rf "$out_dir"
		return 1
	fi
}

# --- 메인 실행 ---
echo "📄 파일 변환 시작: $INPUT_FILE (.$EXT)"

# 1순위: PowerShell
if result=$(try_powershell 2>&1); then
	echo "$result" | output_result
	exit 0
fi
echo "⚠️  PowerShell 변환 실패, Python으로 전환..."

# 2순위: Python
if result=$(try_python 2>&1); then
	echo "$result" | output_result
	exit 0
fi
echo "⚠️  Python 변환 실패, LibreOffice로 전환..."

# 3순위: LibreOffice
if result=$(try_libreoffice 2>&1); then
	echo "$result" | output_result
	exit 0
fi

# 모든 방식 실패
echo "❌ 모든 변환 방식이 실패했습니다."
echo ""
echo "해결 방법:"
echo "  1) Python 패키지 설치: pip install python-pptx python-docx openpyxl"
echo "  2) LibreOffice 설치 후 재시도"
echo "  3) 파일을 수동으로 PDF 또는 텍스트로 변환 후 전달"
exit 2
