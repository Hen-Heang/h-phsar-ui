<#
.SYNOPSIS
  code-review STEP 1.5 AST 구조 룰 결정론 스캐너 (ast-grep 래퍼).

.DESCRIPTION
  sg(ast-grep) CLI 를 변경 소스 파일에 실행해 구조 룰 매칭을 JSON 으로 출력한다.
  sg 미설치 / 룰셋 부재 / 타임아웃 / sg 에러 시 비차단 skip(JSON)으로 종료(exit 0).
  매칭의 룰 id 는 severity ID 와 일치하며, 심각도·축 룩업은 호출자(에이전트)가 한다.
  언어/도메인 무관 — 룰셋이 무엇이든 그대로 실행하는 순수 범용 메커니즘.

.PARAMETER Files
  스캔할 소스 파일 경로 목록(저장소 루트 상대). 비면 빈 배열 출력.
#>
param(
  [string[]]$Files = @()
)

function Write-Skip([string]$reason, [string]$detail) {
  $o = [ordered]@{ skipped = $true; reason = $reason }
  if ($detail) { $o.detail = $detail }
  if ($reason -eq 'sg-not-installed') { $o.hint = 'install: npm i -g @ast-grep/cli' }
  ($o | ConvertTo-Json -Compress)
  exit 0
}

# 1. 룰셋 존재 확인
$cfg = Join-Path $PSScriptRoot '..\astgrep\sgconfig.yml'
$rulesDir = Join-Path $PSScriptRoot '..\astgrep\rules'
if (-not (Test-Path $cfg) -or -not (Test-Path $rulesDir) -or
    -not (Get-ChildItem -Path $rulesDir -Filter '*.yml' -ErrorAction SilentlyContinue)) {
  Write-Skip 'no-ruleset' $null
}

# 2. sg 설치 확인
if (-not (Get-Command sg -ErrorAction SilentlyContinue)) {
  Write-Skip 'sg-not-installed' $null
}

# 3. 스캔 대상 없으면 빈 결과
if (-not $Files -or $Files.Count -eq 0) { '[]'; exit 0 }
$existing = @($Files | Where-Object { Test-Path $_ } | Sort-Object)
if ($existing.Count -eq 0) { '[]'; exit 0 }

# 4. 60초 타임아웃으로 sg 실행 (stdout=JSON, stderr=진단 분리)
$job = Start-Job -ScriptBlock {
  param($cfg, $files)
  $errText = ''
  $outLines = & sg scan -c $cfg --json $files 2>&1 | ForEach-Object {
    if ($_ -is [System.Management.Automation.ErrorRecord]) { $errText += ([string]$_ + "`n") }
    else { $_ }
  }
  [pscustomobject]@{ out = ($outLines -join "`n"); err = $errText }
} -ArgumentList $cfg, $existing

if (-not (Wait-Job $job -Timeout 60)) {
  Stop-Job $job; Remove-Job $job -Force
  Write-Skip 'timeout' '60s exceeded'
}
$result = Receive-Job $job
Remove-Job $job -Force
$raw = ([string]$result.out).Trim()
$errText = ([string]$result.err).Trim()

# 5. 정규화: stdout(JSON) → {id, file, line, snippet, source}. 파싱 실패 시 sg-error.
if (-not $raw) {
  if ($errText) {
    $d = ($errText -replace '\s+', ' ')
    Write-Skip 'sg-error' $d.Substring(0, [Math]::Min(200, $d.Length))
  }
  '[]'; exit 0
}
$matches = @()
try {
  foreach ($m in ($raw | ConvertFrom-Json)) {
    $snip = ([string]$m.text).Trim()
    $matches += [ordered]@{
      id      = $m.ruleId
      file    = $m.file
      line    = [int]$m.range.start.line + 1
      snippet = $snip.Substring(0, [Math]::Min(120, $snip.Length))
      source  = 'ast'
    }
  }
} catch {
  Write-Skip 'sg-error' 'sg output not parseable as JSON'
}
($matches | ConvertTo-Json -Depth 4 -Compress)
