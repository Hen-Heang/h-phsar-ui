<#
.SYNOPSIS
  dev-interview Stage 1 형식 게이트 결정론 검증기.

.DESCRIPTION
  11섹션 개발 브리프(`{{config.outputDir}}/{과업번호}_dev_brief.md`) 의 출력 계약을
  references/brief-schema.md 의 self-check 항목에 따라 결정론 검증한다.

  AI 추론에 맡기던 self-check 를 regex/grep 기반 검증으로 전환하여
  동일 입력 → 동일 PASS/FAIL 결과 보장.

  검증 항목:
    1) §1 ~ §11 헤더 모두 존재 + 순서
    2) §1 문서 메타 표 7행 (기획서 파일·버전·품질등급·인터뷰일자·과업번호·작업 브랜치·제안 개발 기간)
    3) §2 시스템 결정 6행 (개발 유형·프로젝트 유형·프로젝트명·베이스 패키지·배포 포맷·빌드)
    4) §3 하위 절 (3-1, 3-2, 3-3, 3-4)
    5) §9 미결사항 비어있지 않음
    6) §11 Phase ≥ 3 (또는 단계 ≥ 3)
    7) 미확정 표현 없음 — TBD/추후 결정/미확정/미결정/TODO/N-A/확인 필요
       (§1 작업 브랜치의 "미정" 만 예외 — 브랜치는 인터뷰 시점에 없을 수 있다)
    8) 메타 footer (선탐색 시간·인터뷰 라운드·Codex 검토 등급)

.PARAMETER BriefFile
  검증 대상 브리프 마크다운 경로.

.OUTPUTS
  JSON: { pass: bool, checks: [...], failed: n, file: path, sha256: hex }

.EXAMPLE
  powershell .claude/skills/dev-interview/scripts/validate-brief.ps1 -BriefFile {{config.outputDir}}/057_dev_brief.md
#>

param(
  [Parameter(Mandatory=$true)][string]$BriefFile
)

$ErrorActionPreference = 'Stop'

# 입력·출력 인코딩 고정. Windows PowerShell 5.1 은 BOM 없는 파일을 ANSI 로 읽고 stdout 도
# ANSI 로 쓴다 — 브리프는 한국어라 한쪽만 고치면 오히려 더 깨진다(실측). 이 출력을 읽는
# 쪽은 스킬(LLM)이므로 UTF-8 이어야 한다.
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
try { [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false) } catch { }

if (-not (Test-Path $BriefFile)) {
  throw "Brief file not found: $BriefFile"
}

$content = Get-Content $BriefFile -Raw -Encoding UTF8
$lines   = $content -split "`r?`n"

$checks = @()
$failed = 0

function Add-Check {
  param([string]$Id, [string]$Name, [bool]$Pass, [string]$Detail = '')
  $script:checks += [PSCustomObject]@{
    id     = $Id
    name   = $Name
    pass   = $Pass
    detail = $Detail
  }
  if (-not $Pass) { $script:failed++ }
}

# --- 1. §1 ~ §11 헤더 순서 ---------------------------------------------------
$sectionHeaders = @()
foreach ($l in $lines) {
  if ($l -match '^## (\d+)\.\s') {
    $sectionHeaders += [int]$matches[1]
  }
}
$expected = 1..11
$missing  = @($expected | Where-Object { $sectionHeaders -notcontains $_ })
$ordered  = ($sectionHeaders -join ',') -eq ($expected -join ',').Substring(0, ($sectionHeaders -join ',').Length)
Add-Check 'SEC_HEADERS' '§1 ~ §11 헤더 존재 + 순서' (($missing.Count -eq 0) -and $ordered) `
  ("missing=$($missing -join ',') headers=$($sectionHeaders -join ',')")

# --- 2. §1 문서 메타 7항목 ---------------------------------------------------
$metaKeys = @('기획서 파일','기획서 버전','기획서 품질 등급','인터뷰 일자','과업번호','작업 브랜치','제안 개발 기간')
$missingMeta = @()
foreach ($k in $metaKeys) {
  if (-not (Select-String -InputObject $content -Pattern ([regex]::Escape("| $k |")) -Quiet) -and
      -not (Select-String -InputObject $content -Pattern ([regex]::Escape("| $k ")) -Quiet)) {
    $missingMeta += $k
  }
}
Add-Check 'META_TABLE' '§1 문서 메타 7항목' ($missingMeta.Count -eq 0) ("missing=$($missingMeta -join ',')")

# --- 3. §2 시스템 결정 6항목 -------------------------------------------------
$sysKeys = @('개발 유형','프로젝트 유형','프로젝트명','베이스 패키지','배포 포맷','빌드')
$missingSys = @()
foreach ($k in $sysKeys) {
  if (-not (Select-String -InputObject $content -Pattern ([regex]::Escape("| $k ")) -Quiet)) {
    $missingSys += $k
  }
}
Add-Check 'SYSTEM_TABLE' '§2 시스템 결정 6항목' ($missingSys.Count -eq 0) ("missing=$($missingSys -join ',')")

# --- 4. §3 하위 절 4개 -------------------------------------------------------
$subSections = @('3-1','3-2','3-3','3-4')
$missingSub = @()
foreach ($s in $subSections) {
  # (?m) 필수 — -InputObject 는 문자열 전체를 한 줄로 본다. 없으면 `^` 가 파일 선두에만
  # 걸려 어떤 브리프도 이 검사를 통과하지 못한다(실측: 항상 FAIL).
  if (-not (Select-String -InputObject $content -Pattern "(?m)^### $s\." -Quiet)) {
    $missingSub += $s
  }
}
Add-Check 'SCOPE_SUBSECTIONS' '§3 Primary/Related/패턴/영향 하위 절' ($missingSub.Count -eq 0) ("missing=$($missingSub -join ',')")

# --- 5. §9 미결사항 비어있지 않음 -------------------------------------------
$sec9Idx = -1; $sec10Idx = $lines.Count
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^## 9\.\s') { $sec9Idx = $i }
  elseif ($lines[$i] -match '^## 10\.\s' -and $sec9Idx -ge 0) { $sec10Idx = $i; break }
}
$sec9HasContent = $false
if ($sec9Idx -ge 0) {
  for ($i = $sec9Idx + 1; $i -lt $sec10Idx; $i++) {
    if ($lines[$i].Trim() -ne '' -and $lines[$i] -notmatch '^##') {
      $sec9HasContent = $true; break
    }
  }
}
Add-Check 'OPEN_QUESTIONS' '§9 미결사항 비어있지 않음' $sec9HasContent ''

# --- 6. §11 Phase ≥ 3 단계 --------------------------------------------------
$sec11Idx = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^## 11\.\s') { $sec11Idx = $i; break }
}
$phaseCount = 0
if ($sec11Idx -ge 0) {
  for ($i = $sec11Idx + 1; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^## ') { break }
    if ($lines[$i] -match '^\s*\d+\.\s' -or $lines[$i] -match '(?i)Phase\s*\d+' -or $lines[$i] -match '^\s*-\s+\d+단계') {
      $phaseCount++
    }
  }
}
Add-Check 'IMPL_PHASES' '§11 Phase/단계 ≥ 3' ($phaseCount -ge 3) "count=$phaseCount"

# --- 7. 미확정 표현 금지 -----------------------------------------------------
# 낱말 하나만 보면 표현만 바꿔서 통과한다. 실측: 브리프가 "TBD" 대신 "미확정" 을 써서
# 이 검사를 통과했고, 스스로 "미확정 항목이 없어서가 아니다" 라고 밝혔다.
# 그래서 같은 뜻의 표현을 함께 막는다.
$forbidden = @()
$tbdMatches = [regex]::Matches($content, '(?i)\bTBD\b|\bTODO\b|\bN/A\b|추후\s*(결정|확정|정의|협의)|미확정|미결정|확인\s*필요|정해지지\s*않')
foreach ($m in $tbdMatches) {
  $lineNum = ($content.Substring(0, $m.Index) -split "`n").Count
  $forbidden += "line $lineNum '$($m.Value)'"
}
# 예외: §1 작업 브랜치 행의 "미정" — 브랜치는 인터뷰 시점에 아직 없을 수 있다.
# 그 행이 아닌 곳의 "미정" 은 위반으로 잡는다.
foreach ($m in [regex]::Matches($content, '미정')) {
  $lineNum = ($content.Substring(0, $m.Index) -split "`n").Count
  if ($lines[$lineNum - 1] -match '브랜치') { continue }
  $forbidden += "line $lineNum '미정'"
}
Add-Check 'NO_TBD' '미확정 표현 없음 (TBD/미확정/TODO/확인 필요 등)' ($forbidden.Count -eq 0) ("hits=$($forbidden -join '; ')")

# --- 8. 메타 footer ----------------------------------------------------------
$hasExploreTime = (Select-String -InputObject $content -Pattern '선탐색 시간' -Quiet)
$hasRounds      = (Select-String -InputObject $content -Pattern '인터뷰 라운드' -Quiet)
$hasReview      = (Select-String -InputObject $content -Pattern '검토 등급' -Quiet)
Add-Check 'META_FOOTER' '메타 footer (선탐색·라운드·검토 등급)' ($hasExploreTime -and $hasRounds -and $hasReview) `
  ("explore=$hasExploreTime rounds=$hasRounds review=$hasReview")

# --- 9. 부록 Q&A 로그 --------------------------------------------------------
$hasAppendix = (Select-String -InputObject $content -Pattern '(?m)^## 인터뷰 Q&A 로그' -Quiet) -or
               (Select-String -InputObject $content -Pattern '(?m)^## .*Q&A.*부록' -Quiet)
Add-Check 'QNA_APPENDIX' 'Q&A 로그 부록 첨부' $hasAppendix ''

# --- 출력 -------------------------------------------------------------------
$result = [ordered]@{
  pass     = ($failed -eq 0)
  checks   = $checks
  failed   = $failed
  file     = (Resolve-Path $BriefFile).Path
  # 판정을 바이트에 묶는다. 이 JSON 이 호출자의 증거로 쓰일 때(무인 실행), file 경로만으로는
  # 검증 뒤 수정된 브리프가 옛 판정으로 통과한다 — 해시가 있으면 그 창이 닫힌다.
  sha256   = (Get-FileHash -Algorithm SHA256 -LiteralPath $BriefFile).Hash.ToLowerInvariant()
}
$result | ConvertTo-Json -Depth 5 -Compress
