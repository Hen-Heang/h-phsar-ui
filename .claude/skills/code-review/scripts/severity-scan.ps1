<#
.SYNOPSIS
  code-review STEP 1 severity 결정론 스캐너.

.DESCRIPTION
  references/severity-rules.md 의 keywords 컬럼을 파싱하여 diff 본문에
  대조하고 매칭 결과(ID·severity·파일·라인·키워드)를 JSON 으로 출력한다.

  AI 추론 대신 deterministic grep 으로 동일 입력 → 동일 출력 보장.
  STEP 0(incident-antipatterns IC/IW) 와 STEP 2(휴리스틱) 는 LLM 책임.
  본 script 는 STEP 1 pattern_table 매칭만 담당한다.

.PARAMETER DiffFile
  diff 본문 파일 경로 (`git diff --staged > diff.txt` 결과).

.PARAMETER RulesFile
  severity-rules.md 경로. 기본: $PSScriptRoot/../references/severity-rules.md

.PARAMETER OutFormat
  json | tsv (기본 json)

.EXAMPLE
  git diff --staged | Out-File -Encoding utf8 .tmp/diff.txt
  powershell .claude/skills/code-review/scripts/severity-scan.ps1 -DiffFile .tmp/diff.txt
#>

param(
  [Parameter(Mandatory=$true)][string]$DiffFile,
  [string]$RulesFile,
  [ValidateSet('json','tsv')][string]$OutFormat = 'json'
)

$ErrorActionPreference = 'Stop'

# 입력·출력 인코딩을 둘 다 UTF-8 로 고정한다. Windows PowerShell 5.1 은 BOM 없는 파일을
# ANSI 로 읽고 stdout 도 ANSI 로 쓰기 때문에, 한쪽만 고치면 오히려 더 깨진다(실측).
# 자산(severity-rules.md)은 BOM 없는 UTF-8 이고, 이 출력을 읽는 쪽은 LLM 이다.
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch { }

if (-not $RulesFile) {
  $RulesFile = Join-Path $PSScriptRoot '..\references\severity-rules.md'
}
if (-not (Test-Path $RulesFile)) {
  throw "severity-rules.md not found: $RulesFile"
}
if (-not (Test-Path $DiffFile)) {
  throw "diff file not found: $DiffFile"
}

# --- 1. severity-rules.md 표 파싱 ------------------------------------------
$rules = @()
# -Encoding UTF8 필수: Windows PowerShell 5.1 은 BOM 없는 파일을 ANSI 로 읽어 한글
# 룰명·키워드가 깨진다(실측: 리뷰 출력에 룰 이름이 깨져 나왔다). 자산은 BOM 없는 UTF-8 이다.
#
# 심각도는 **ID 접두**(C/W/S)로 판정한다 — 섹션 제목 위치가 아니라.
# 이유: severity-rules.md 는 층별 단편(core→언어팩→프레임워크팩)을 이어 붙인 파일이고,
# 프레임워크 단편은 `## {프레임워크} 특화 룰` 같은 자체 제목 아래에 여러 심각도의 룰을 함께 둔다.
# 섹션 추적 방식에서는 그 제목이 인식되지 않아 직전 층의 마지막 섹션(= Suggestion)을 그대로
# 물려받았고, Critical 룰이 Suggestion 으로 출력됐다(실측 14행/4팩).
# ID 접두는 층과 무관하게 고정이므로 조립 순서에 의존하지 않는다.
foreach ($line in Get-Content $RulesFile -Encoding UTF8) {
  if ($line -notmatch '^\|\s*[CWS]\d{2}') { continue }
  $cols = $line -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
  if ($cols.Count -lt 4) { continue }
  $id        = $cols[0]
  $name      = $cols[1]
  $kwBlob    = $cols[2]
  $keywords  = $kwBlob -split ',' | ForEach-Object {
    ($_ -replace '`','').Trim()
  } | Where-Object { $_ -ne '' }
  # ID 접두 → baseline 심각도 (C=Critical / W=Warning / S=Suggestion)
  $severity = switch ($id.Substring(0, 1)) {
    'C'     { 'Critical' }
    'W'     { 'Warning' }
    default { 'Suggestion' }
  }
  $rules += [PSCustomObject]@{
    id       = $id
    severity = $severity
    name     = $name
    keywords = $keywords
  }
}

# --- 2. diff 본문 → 변경 파일별 추가/수정 라인 추출 ------------------------
$diffLines = Get-Content $DiffFile -Encoding UTF8
$currentFile = $null
$lineNo = 0
$entries = @()   # @{file, line, text}
foreach ($l in $diffLines) {
  if ($l -match '^\+\+\+ b/(.+)$') {
    $currentFile = $matches[1]
    $lineNo = 0
    continue
  }
  if ($l -match '^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@') {
    $lineNo = [int]$matches[1] - 1
    continue
  }
  if (-not $currentFile) { continue }
  if ($l.StartsWith('+') -and -not $l.StartsWith('+++')) {
    $lineNo++
    $entries += [PSCustomObject]@{
      file = $currentFile
      line = $lineNo
      text = $l.Substring(1)
    }
  } elseif (-not $l.StartsWith('-')) {
    $lineNo++
  }
}

# --- 3. 매칭 ---------------------------------------------------------------
$hits = @()
foreach ($e in $entries) {
  foreach ($r in $rules) {
    foreach ($kw in $r.keywords) {
      if ([string]::IsNullOrWhiteSpace($kw)) { continue }
      $escaped = [regex]::Escape($kw)
      # 낱말 경계 매칭 — 순수 단어형 키워드는 부분문자열로 걸리면 오탐이 된다.
      # 실측 사례: 특정 언어팩 전용 룰의 짧은 키워드가 다른 언어 파일의 식별자
      # (상수명 등) 안에 부분문자열로 들어 있어 무관한 지적이 나왔다.
      # 애노테이션 표기처럼 비단어 문자로 시작·끝나는 키워드나 한글 어구는
      # \b 가 오히려 매칭을 깨므로 그대로 부분문자열로 둔다.
      if ($kw -match '^\w[\w.]*\w$' -or $kw -match '^\w$') { $escaped = "\b$escaped\b" }
      if ($e.text -match $escaped) {
        $hits += [PSCustomObject]@{
          id        = $r.id
          severity  = $r.severity
          name      = $r.name
          file      = $e.file
          line      = $e.line
          keyword   = $kw
          snippet   = $e.text.Trim().Substring(0, [Math]::Min(120, $e.text.Trim().Length))
        }
        break
      }
    }
  }
}

# --- 4. 출력 ---------------------------------------------------------------
if ($OutFormat -eq 'tsv') {
  "id`tseverity`tname`tfile`tline`tkeyword`tsnippet"
  foreach ($m in $hits) {
    "$($m.id)`t$($m.severity)`t$($m.name)`t$($m.file)`t$($m.line)`t$($m.keyword)`t$($m.snippet)"
  }
} else {
  $hits | ConvertTo-Json -Depth 4 -Compress
}
