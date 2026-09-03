<#
.SYNOPSIS
  develop 7단계 모듈 캐시 스캐너 — 결정론적 출력.

.DESCRIPTION
  scope.yaml 의 스코프 entry 를 찾아 Java 소스를 스캔하고
  메모리 캐시(scopes/{scope}.md)를 생성/갱신한다.

  AI 추론 대신 deterministic file enumeration 으로 동일 입력 → 동일 출력 보장.

.PARAMETER Scope
  스코프 식별자 (scope.yaml 의 groups.*.scopes[].id).

.PARAMETER Mode
  init      — 캐시 미존재 시 최초 전체 스캔
  full      — 전체 재스캔, 기존 캐시 덮어쓰기
  incremental — 하위 호환 별칭. 전체 인벤토리를 다시 계산한다.

.PARAMETER SubScopeParam
  하위 스코프 파라미터 (menuId/jobId). 미지정 시 메인 스코프 전체.

.PARAMETER WorkspaceRoot
  워크스페이스 루트 (기본: pwd).

.PARAMETER MemoryRoot
  scopes/ 캐시 디렉토리 (기본: $HOME/.claude/projects/{workspace-slug}/memory).

.EXAMPLE
  powershell scan-module.ps1 -Scope backoffice -Mode init
  powershell scan-module.ps1 -Scope backoffice -SubScopeParam customer -Mode full
  powershell scan-module.ps1 -Scope batch -SubScopeParam cardOtcRtrvlJob -Mode incremental
#>

param(
  [Parameter(Mandatory=$true)][string]$Scope,
  [ValidateSet('init','full','incremental')][string]$Mode = 'init',
  [string]$SubScopeParam,
  [string]$WorkspaceRoot = (Get-Location).Path,
  [string]$MemoryRoot
)

$ErrorActionPreference = 'Stop'

# --- 1. scope.yaml 파싱 (entry 추출) ---------------------------------------
$scopesFile = Join-Path $WorkspaceRoot '.claude/config/scope.yaml'
if (-not (Test-Path $scopesFile)) {
  throw "scope.yaml not found: $scopesFile"
}

$lines = Get-Content $scopesFile
$entry = @{
  id = $null; project = $null; sharedModule = $null; allowedPaths = @();
  groupKey = $null;
  subScope = $null  # @{ paramName, validatePath, allowedPaths[], scanPaths(@inherit-shared | @()), cacheFileSuffix }
}
$groupShared = @{}  # groupKey → @{ java=@(); javaRootFiles=@(); resources=@() }

$inEntry      = $false
$currentId    = $null
$currentGroup = $null
$inSubScope   = $false
$subAllowedCollecting = $false
$subScanCollecting    = $false
$inGroupShared        = $false
$groupSharedSection   = $null  # java | javaRootFiles | resources

foreach ($line in $lines) {
  # 그룹 헤더 (`  A:` 형태, 들여쓰기 2)
  if ($line -match '^\s{2}([A-Z]):\s*$') {
    $currentGroup = $matches[1]
    if (-not $groupShared.ContainsKey($currentGroup)) {
      $groupShared[$currentGroup] = @{ java = @(); javaRootFiles = @(); resources = @() }
    }
    $inEntry = $false
    $inSubScope = $false
    $inGroupShared = $false
    continue
  }
  # 그룹 단위 sharedCodeRange:
  if ($line -match '^\s{4}sharedCodeRange:\s*$') {
    $inGroupShared = $true; $groupSharedSection = $null; $inEntry = $false; $inSubScope = $false
    continue
  }
  if ($inGroupShared) {
    if ($line -match '^\s{6}(java|javaRootFiles|resources):\s*$') {
      $groupSharedSection = $matches[1]; continue
    }
    if ($line -match '^\s{8}-\s+(.+?)\s*$' -and $groupSharedSection -and $currentGroup) {
      $val = $matches[1].Trim().Trim('"').Trim("'")
      $groupShared[$currentGroup][$groupSharedSection] += $val
      continue
    }
    if ($line -match '^\s{0,4}\S' -and $line -notmatch '^\s*#') {
      $inGroupShared = $false; $groupSharedSection = $null
    }
  }

  if ($line -match '^\s*-\s+id:\s*(.+?)\s*$') {
    $currentId = $matches[1].Trim()
    $inEntry = ($currentId -eq $Scope)
    $inSubScope = $false
    $subAllowedCollecting = $false
    $subScanCollecting = $false
    if ($inEntry) {
      $entry.id = $currentId
      $entry.groupKey = $currentGroup
    }
    continue
  }

  if (-not $inEntry) { continue }

  # subScope 블록 진입
  if ($line -match '^\s{8}subScope:\s*$') {
    $inSubScope = $true
    $entry.subScope = @{ paramName = $null; validatePath = $null; allowedPaths = @(); scanPaths = $null; cacheFileSuffix = $null }
    continue
  }

  if ($inSubScope) {
    if ($line -match '^\s{10}paramName:\s*(.+?)\s*$') {
      $entry.subScope.paramName = $matches[1].Trim()
      continue
    }
    if ($line -match '^\s{10}validatePath:\s*"?(.+?)"?\s*$') {
      $entry.subScope.validatePath = $matches[1].Trim().Trim('"').Trim("'")
      continue
    }
    if ($line -match '^\s{10}allowedPaths:\s*$') {
      $subAllowedCollecting = $true; $subScanCollecting = $false; continue
    }
    if ($line -match '^\s{10}scanPaths:\s*"?@inherit-shared"?\s*$') {
      $entry.subScope.scanPaths = '@inherit-shared'
      $subAllowedCollecting = $false; $subScanCollecting = $false; continue
    }
    if ($line -match '^\s{10}scanPaths:\s*$') {
      $entry.subScope.scanPaths = @()
      $subScanCollecting = $true; $subAllowedCollecting = $false; continue
    }
    if ($line -match '^\s{10}cacheFileSuffix:\s*"?(.+?)"?\s*$') {
      $entry.subScope.cacheFileSuffix = $matches[1].Trim().Trim('"').Trim("'")
      continue
    }
    if ($subAllowedCollecting -and $line -match '^\s{12}-\s+(.+?)\s*$') {
      $entry.subScope.allowedPaths += $matches[1].Trim().Trim('"').Trim("'")
      continue
    }
    if ($subScanCollecting -and $line -match '^\s{12}-\s+(.+?)\s*$') {
      $entry.subScope.scanPaths += $matches[1].Trim().Trim('"').Trim("'")
      continue
    }
    # subScope 블록 종료 (들여쓰기 8 미만)
    if ($line -match '^\s{0,7}\S' -and $line -notmatch '^\s*#') {
      $inSubScope = $false; $subAllowedCollecting = $false; $subScanCollecting = $false
    }
  }

  if ($line -match '^\s{6,8}project:\s*(.+?)\s*$') {
    $entry.project = $matches[1].Trim()
  } elseif ($line -match '^\s{6,8}sharedModule:\s*(.+?)\s*$') {
    $val = $matches[1].Trim()
    if ($val -ne 'null') { $entry.sharedModule = $val }
  } elseif ($line -match '^\s{6,8}allowedPaths:\s*\[(.+?)\]\s*$') {
    $entry.allowedPaths = $matches[1] -split ',' | ForEach-Object { $_.Trim() -replace '"','' }
  } elseif ($line -match '^\s{0,4}\S' -and $line -notmatch '^\s*#' -and -not $inSubScope) {
    # 다음 entry 또는 그룹 시작 — 종료
    break
  }
}

if (-not $entry.project) {
  throw "Scope '$Scope' not found in scope.yaml"
}

if ($SubScopeParam -and -not $entry.subScope) {
  throw "Scope '$Scope' does not support subScope param (scope.yaml subScope 미정의)"
}

# --- 2. basePackagePath 추출 (project.yaml) ------------------------------
$wsFile = Join-Path $WorkspaceRoot '.claude/config/project.yaml'
$basePackagePath = 'com/acme/platform'
if (Test-Path $wsFile) {
  $pattern = (Get-Content $wsFile) | Where-Object { $_ -match '^baseNamespacePattern:\s*(.+)$' } | Select-Object -First 1
  if ($pattern -match 'baseNamespacePattern:\s*(.+?)(\.\{module\})?\s*$') {
    $basePackagePath = $matches[1].Trim() -replace '\.', '/'
  }
}

# --- 3. 캐시 경로 결정 -----------------------------------------------------
if (-not $MemoryRoot) {
  $wsName = Split-Path $WorkspaceRoot -Leaf
  $wsSlug = "C--Users-$env:USERNAME-workspaces-$wsName"
  $MemoryRoot = Join-Path $HOME ".claude/projects/$wsSlug/memory"
}
$scopesCacheDir = Join-Path $MemoryRoot 'scopes'
if (-not (Test-Path $scopesCacheDir)) {
  New-Item -ItemType Directory -Path $scopesCacheDir -Force | Out-Null
}

$cacheFileName = if ($SubScopeParam) {
  if ($entry.subScope -and $entry.subScope.cacheFileSuffix) {
    $suffix = $entry.subScope.cacheFileSuffix -replace '\{paramValue\}', $SubScopeParam
    "$Scope$suffix.md"
  } else {
    "$Scope--$SubScopeParam.md"
  }
} else {
  "$Scope.md"
}
$cacheFile = Join-Path $scopesCacheDir $cacheFileName

# --- 4. 현재 브랜치 확인 ---------------------------------------------------
$projectPath = Join-Path $WorkspaceRoot $entry.project
$branch = '_unknown'
$head = '_none'
if (Test-Path (Join-Path $projectPath '.git')) {
  Push-Location $projectPath
  try {
    $branch = git branch --show-current 2>$null
    if ($branch) { $branch = $branch.Trim() }
    if (-not $branch) {
      $sha = git rev-parse --short HEAD 2>$null
      if ($sha) { $branch = "_detached_$($sha.Trim())" }
    }
    $headValue = git rev-parse HEAD 2>$null
    if ($headValue) { $head = $headValue.Trim() }
  } finally { Pop-Location }
}

# --- 5. 스캔 대상 디렉토리 결정 --------------------------------------------
$scanDirs = @()
$srcMain = Join-Path $projectPath 'src/main/java'
$srcTest = Join-Path $projectPath 'src/test/java'
$srcResources = Join-Path $projectPath 'src/main/resources'

function Resolve-Vars {
  param([string]$Path, [string]$ParamValue, [string]$BasePackagePath)
  $r = $Path -replace '\{basePackagePath\}', $BasePackagePath
  if ($ParamValue) { $r = $r -replace '\{paramValue\}', $ParamValue }
  return $r
}

if ($SubScopeParam -and $entry.subScope) {
  # 하위 스코프 — subScope.allowedPaths + scanPaths 만 스캔
  foreach ($p in $entry.subScope.allowedPaths) {
    $resolved = Resolve-Vars -Path $p -ParamValue $SubScopeParam -BasePackagePath $basePackagePath
    $full = Join-Path $projectPath $resolved
    if (Test-Path $full) { $scanDirs += $full }
  }
  if ($entry.subScope.scanPaths -eq '@inherit-shared') {
    $gkey = $entry.groupKey
    if ($gkey -and $groupShared.ContainsKey($gkey)) {
      foreach ($jp in $groupShared[$gkey].java) {
        $full = Join-Path $projectPath "src/main/java/$basePackagePath/$($entry.id)/$jp"
        if (Test-Path $full) { $scanDirs += $full }
      }
      foreach ($jf in $groupShared[$gkey].javaRootFiles) {
        $full = Join-Path $projectPath "src/main/java/$basePackagePath/$($entry.id)/$jf"
        if (Test-Path $full) { $scanDirs += $full }
      }
      foreach ($rp in $groupShared[$gkey].resources) {
        $full = Join-Path $projectPath "src/main/resources/$rp"
        if (Test-Path $full) { $scanDirs += $full }
      }
    }
  } elseif ($entry.subScope.scanPaths -is [array]) {
    foreach ($p in $entry.subScope.scanPaths) {
      $resolved = Resolve-Vars -Path $p -ParamValue $SubScopeParam -BasePackagePath $basePackagePath
      $full = Join-Path $projectPath $resolved
      if (Test-Path $full) { $scanDirs += $full }
    }
  }
  $scanDirs = $scanDirs | Select-Object -Unique
} else {
  # 전체 스코프 — 기존 로직
  foreach ($p in $entry.allowedPaths) {
    if ($p -eq '**') {
      if (Test-Path $srcMain) { $scanDirs += $srcMain }
      if (Test-Path $srcTest) { $scanDirs += $srcTest }
    } else {
      $sub = Join-Path $projectPath $p
      $subSrc = Join-Path $sub 'src/main/java'
      if (Test-Path $subSrc) { $scanDirs += $subSrc }
      elseif (Test-Path $sub) { $scanDirs += $sub }
    }
  }
  if ($entry.sharedModule) {
    $sharedSrc = Join-Path $projectPath "$($entry.sharedModule)/src/main/java"
    if (Test-Path $sharedSrc) { $scanDirs += $sharedSrc }
  }
}

# --- 6. 스캔 실행 ---------------------------------------------------------
$javaFiles = @()
$mapperXmls = @()

if ($Mode -eq 'incremental') {
  Write-Warning '-Mode incremental is deprecated; rebuilding the complete cache'
}
foreach ($d in $scanDirs) {
  $javaFiles += Get-ChildItem -Path $d -Recurse -Filter '*.java' -File -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
}
if (Test-Path $srcResources) {
  $mapperXmls += Get-ChildItem -Path $srcResources -Recurse -Filter '*Mapper.xml' -File -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
}
$javaFiles = @($javaFiles | Select-Object -Unique | Sort-Object)
$mapperXmls = @($mapperXmls | Select-Object -Unique | Sort-Object)

# The cached summary depends on the selected file inventory, not file contents. A stable path
# fingerprint catches additions, removals, renames, committed changes, and untracked files.
$inventory = @($javaFiles + $mapperXmls | ForEach-Object {
  $_.Substring($projectPath.Length).TrimStart([char[]]@('\','/')) -replace '\\','/'
} | Sort-Object -Unique)
$sha256 = [System.Security.Cryptography.SHA256]::Create()
try {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes(($inventory -join "`n"))
  $fingerprint = ([System.BitConverter]::ToString($sha256.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
} finally { $sha256.Dispose() }

if ($Mode -eq 'init' -and (Test-Path $cacheFile)) {
  $existing = Get-Content $cacheFile
  $existingFingerprint = $existing | Where-Object { $_ -match '^fingerprint:\s*(\S+)' } | Select-Object -First 1
  $existingSchema = $existing | Where-Object { $_ -match '^schema_version:\s*2\s*$' } | Select-Object -First 1
  if ($existingSchema -and $existingFingerprint -match '^fingerprint:\s*(\S+)' -and $matches[1] -eq $fingerprint) {
    Write-Output "cache unchanged: $cacheFile"
    exit 0
  }
}

# --- 7. 분류 카운트 -------------------------------------------------------
$counts = @{
  controller = 0; service = 0; serviceImpl = 0; mapper = 0;
  model = 0; config = 0; util = 0; other = 0
}
foreach ($f in $javaFiles) {
  $name = [IO.Path]::GetFileNameWithoutExtension($f)
  $normalized = $f -replace '\\','/'
  switch -Regex ($normalized) {
    '/controller/'                { $counts.controller++; break }
    '/service/impl/'              { $counts.serviceImpl++; break }
    '/service/'                   { $counts.service++; break }
    '/mapper/'                    { $counts.mapper++; break }
    '/(model|dto|vo|domain)/'     { $counts.model++; break }
    '/config/'                    { $counts.config++; break }
    '/util/'                      { $counts.util++; break }
    default                       { $counts.other++ }
  }
}

# --- 8. 캐시 파일 작성 ----------------------------------------------------
$now = (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
$scopeId = if ($SubScopeParam) { "$Scope $SubScopeParam" } else { $Scope }

$content = @"
---
schema_version: 2
scope: $scopeId
scanned_at: $now
project_root: $($entry.project)
branch: $branch
head: $head
fingerprint: $fingerprint
mode: full
---

## Scan summary

- Java files: $($javaFiles.Count)
- Mapper XML files: $($mapperXmls.Count)

## Package classification

| Category | Count |
|-----|-------|
| controller | $($counts.controller) |
| service (interface) | $($counts.service) |
| service (impl) | $($counts.serviceImpl) |
| mapper | $($counts.mapper) |
| model/dto/vo | $($counts.model) |
| config | $($counts.config) |
| util | $($counts.util) |
| other | $($counts.other) |

## Scanned paths

$($scanDirs | ForEach-Object { "- $($_.Replace($WorkspaceRoot + [IO.Path]::DirectorySeparatorChar, ''))" } | Out-String)

## Notes

- Detailed class names are omitted to keep the cache compact.
- Query details on demand with Grep/Glob.
- ``-Mode incremental`` is a deprecated alias for a safe full rebuild.
"@

Set-Content -Path $cacheFile -Value $content -Encoding UTF8

Write-Output "📦 cache saved: $cacheFile"
Write-Output "   branch: $branch | java: $($javaFiles.Count) | mapper: $($mapperXmls.Count)"
