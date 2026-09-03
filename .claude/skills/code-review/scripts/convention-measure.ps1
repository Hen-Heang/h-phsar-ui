<#
.SYNOPSIS
  code-review 기계적 컨벤션 결정론 측정기 (언어 무관).

.DESCRIPTION
  diff 의 **추가된 라인만** 대상으로 기계적 컨벤션 위반을 측정한다.
  판단이 아니라 계측이므로 LLM 에게 맡기지 않는다 — 동일 입력 → 동일 출력.

  측정 항목 (전부 언어 무관):
    LINE_LENGTH      줄 길이 초과 (**문자 수** 기준. 바이트 아님)
    TRAILING_WS      후행 공백
    INDENT_CHAR      들여쓰기 문자 불일치 (tab 강제인데 space, 또는 그 반대)
    NO_EOF_NEWLINE   파일 끝 개행 누락 (diff 의 "\ No newline at end of file" 마커)

  임계값은 언어팩이 소유한다 — 본 스크립트는 값을 하드코딩하지 않는다.
  `references/convention-thresholds.md` 의 키·값 표를 읽으며, 같은 키가 여러 번
  나오면 **뒤에 나온 값이 이긴다** (Core 기본값 → 팩 part2 override 순서로 병합되므로).

  왜 문자 기준인가: 실측 사례에서 리뷰 에이전트가 줄 길이를 바이트로 재
  한글 주석 5줄을 위반으로 보고했고(실제로는 전부 한도 내), 그 오탐을 보정하는 데
  라운드 하나가 통째로 들어갔다. 계측을 코드로 내리면 그 실패 모드가 사라진다.

.PARAMETER DiffFile
  unified diff 본문 파일 경로 (`git diff --staged > diff.txt` 결과).

.PARAMETER ThresholdsFile
  임계값 표 경로. 기본: $PSScriptRoot/../references/convention-thresholds.md

.PARAMETER OutFormat
  json | tsv (기본 json)

.EXAMPLE
  git diff --staged | Out-File -Encoding utf8 .tmp/diff.txt
  powershell .claude/skills/code-review/scripts/convention-measure.ps1 -DiffFile .tmp/diff.txt
#>

param(
  [Parameter(Mandatory=$true)][string]$DiffFile,
  [string]$ThresholdsFile,
  [ValidateSet('json','tsv')][string]$OutFormat = 'json'
)

$ErrorActionPreference = 'Stop'

# 입력·출력 인코딩 UTF-8 고정. Windows PowerShell 5.1 은 BOM 없는 파일을 ANSI 로 읽고
# stdout 도 ANSI 로 쓴다 — 한쪽만 고치면 오히려 더 깨진다. 이 출력을 읽는 쪽은 LLM 이다.
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch { }

if (-not $ThresholdsFile) {
  $ThresholdsFile = Join-Path $PSScriptRoot '..\references\convention-thresholds.md'
}
if (-not (Test-Path $ThresholdsFile)) {
  throw "convention-thresholds.md not found: $ThresholdsFile"
}
if (-not (Test-Path $DiffFile)) {
  throw "diff file not found: $DiffFile"
}

# --- 1. 임계값 표 파싱 (뒤에 나온 값이 이긴다) --------------------------------
$th = @{}
foreach ($line in Get-Content $ThresholdsFile -Encoding UTF8) {
  # | key | value | ...  형태만 취한다. 헤더·구분선은 값 검증에서 걸러진다.
  if ($line -match '^\s*\|\s*([A-Za-z][A-Za-z0-9_]*)\s*\|\s*([^|]+?)\s*\|') {
    $th[$matches[1]] = $matches[2].Trim()
  }
}

function Get-Threshold {
  param([string]$Key, [string]$Default)
  if ($th.ContainsKey($Key) -and $th[$Key] -ne '') { return $th[$Key] }
  return $Default
}

$maxLen        = [int](Get-Threshold 'maxLineLength' '0')          # 0 = 미검사(포매터 위임)
$indent        = (Get-Threshold 'indent' 'any').ToLower()          # tab | space | any
$checkTrailing = (Get-Threshold 'trailingWhitespace' 'forbid').ToLower() -eq 'forbid'
$checkEof      = (Get-Threshold 'requireEofNewline' 'true').ToLower() -eq 'true'
# 들여쓰기 규칙은 언어 컨벤션의 적용 대상에만 적용한다. `*` 는 전 파일(하위호환 기본값).
$indentTargets = @((Get-Threshold 'indentTargets' '*').Split(';') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
$indentBlockStart = Get-Threshold 'indentBlockStart' ''
$indentBlockLine  = Get-Threshold 'indentBlockLine' ''
$indentBlockEnd   = Get-Threshold 'indentBlockEnd' ''
$hasBlockRule = $indentBlockStart -ne '' -and $indentBlockLine -ne '' -and $indentBlockEnd -ne ''

function Test-IndentTarget {
  param([string]$Path)
  if ($indentTargets -contains '*') { return $true }
  $name = Split-Path $Path -Leaf
  foreach ($pattern in $indentTargets) {
    if ($name -like $pattern -or $Path -like $pattern) { return $true }
  }
  return $false
}

# --- 2. diff 추가 라인 스캔 ---------------------------------------------------
$violations = @()
$file = ''
$addedCount = 0
$lastAddedFile = ''
# 파일 내 실제 라인 번호. hunk 헤더 `@@ -a,b +c,d @@` 의 c 에서 시작해 추가·문맥 라인마다 오른다.
# 예전엔 diff 전체의 누적 추가 라인 수를 line 으로 냈다 — 두 번째 파일부터 위치를 못 찾는 값이다.
$fileLine = 0
$filteredByType = 0
$filteredComment = 0
$inIndentBlock = $false

foreach ($raw in Get-Content $DiffFile -Encoding UTF8) {
  if ($raw -match '^\+\+\+ (?:b/)?(.+)$') {
    $file = $matches[1].Trim()
    if ($file -eq '/dev/null') { $file = '' }
    $inIndentBlock = $false
    continue
  }
  if ($raw -match '^@@ -\d+(?:,\d+)? \+(\d+)') {
    $fileLine = [int]$matches[1] - 1
    # hunk 사이에 생략된 새 파일 본문은 추측하지 않는다.
    $inIndentBlock = $false
    continue
  }
  if ($raw -like '+++*' -or $raw -like '---*' -or $raw -like '@@*') { continue }

  # 파일 끝 개행 누락 마커는 직전 추가 라인이 속한 파일에 귀속된다.
  if ($raw -like '\ No newline at end of file*') {
    if ($checkEof -and $lastAddedFile -ne '') {
      $violations += [pscustomobject]@{
        file = $lastAddedFile; line = 0; rule = 'NO_EOF_NEWLINE'
        actual = 'missing'; limit = 'required'; text = ''
      }
    }
    continue
  }

  # 삭제 라인은 새 파일의 라인 번호나 블록 상태를 움직이지 않는다. 추가·문맥 라인은 움직인다.
  if ($raw.Length -gt 0 -and $raw[0] -eq '-') { continue }
  $isAdded = $raw.Length -gt 0 -and $raw[0] -eq '+'
  $body = if ($raw.Length -gt 0) { $raw.Substring(1) } else { '' }
  $wasInIndentBlock = $inIndentBlock
  $fileLine++

  if ($isAdded) {
    $addedCount++
    $lastAddedFile = $file

  # 길이는 문자 수로 잰다. PowerShell String.Length 가 곧 문자(UTF-16 코드유닛) 수다.
  if ($maxLen -gt 0 -and $body.Length -gt $maxLen) {
    $violations += [pscustomobject]@{
      file = $file; line = $fileLine; rule = 'LINE_LENGTH'
      actual = $body.Length; limit = $maxLen; text = $body.Trim()
    }
  }

  if ($checkTrailing -and $body -match '[ \t]+$') {
    $violations += [pscustomobject]@{
      file = $file; line = $fileLine; rule = 'TRAILING_WS'
      actual = 'trailing'; limit = 'none'; text = $body.TrimEnd()
    }
  }

  if ($indent -ne 'any' -and $body -match '^[ \t]+') {
    $lead = $matches[0]
    # 규칙 적용 대상이 아닌 파일은 애초에 재지 않는다.
    if (-not (Test-IndentTarget $file)) {
      $filteredByType++
    }
    # 언어팩이 토큰을 선언했고 보이는 새 파일 문맥에서 실제 블록 내부로 확인된 정렬행만 면제한다.
    elseif ($hasBlockRule -and $wasInIndentBlock -and $body.TrimStart().StartsWith($indentBlockLine)) {
      $filteredComment++
    }
    else {
      $bad = if ($indent -eq 'tab') { $lead -match ' ' } else { $lead -match "`t" }
      if ($bad) {
        $violations += [pscustomobject]@{
          file = $file; line = $fileLine; rule = 'INDENT_CHAR'
          actual = if ($indent -eq 'tab') { 'space' } else { 'tab' }
          limit = $indent; text = $body.Trim()
        }
      }
    }
  }
  }

  if ($hasBlockRule) {
    if (-not $inIndentBlock) {
      $startAt = $body.IndexOf($indentBlockStart)
      if ($startAt -ge 0) {
        $endAt = $body.IndexOf($indentBlockEnd, $startAt + $indentBlockStart.Length)
        $inIndentBlock = $endAt -lt 0
      }
    } elseif ($body.Contains($indentBlockEnd)) {
      $inIndentBlock = $false
    }
  }
}

# --- 3. 출력 -----------------------------------------------------------------
if ($OutFormat -eq 'tsv') {
  'file	line	rule	actual	limit'
  foreach ($v in $violations) { "$($v.file)	$($v.line)	$($v.rule)	$($v.actual)	$($v.limit)" }
  return
}

$byRule = @{}
foreach ($v in $violations) {
  if (-not $byRule.ContainsKey($v.rule)) { $byRule[$v.rule] = 0 }
  $byRule[$v.rule]++
}

[pscustomobject]@{
  thresholds = [pscustomobject]@{
    maxLineLength      = $maxLen
    indent             = $indent
    indentTargets      = ($indentTargets -join ';')
    indentBlockRule    = if ($hasBlockRule) { 'enabled' } else { 'disabled' }
    trailingWhitespace = if ($checkTrailing) { 'forbid' } else { 'allow' }
    requireEofNewline  = $checkEof
    measureUnit        = 'character'
  }
  addedLines = $addedCount
  violations = @($violations)
  # 걸러낸 것을 세어 보여준다. 조용히 빼면 "위반 0" 이 "측정 안 함" 과 구별되지 않는다.
  filtered   = [pscustomobject]@{
    byType         = $filteredByType
    commentAligned = $filteredComment
  }
  summary    = [pscustomobject]@{
    total  = $violations.Count
    byRule = [pscustomobject]$byRule
  }
} | ConvertTo-Json -Depth 5 -Compress
