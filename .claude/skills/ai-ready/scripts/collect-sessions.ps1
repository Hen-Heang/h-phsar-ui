# ai-ready stage 1 collector - emits session transcript inventory as JSON to stdout.
# Compatible with Windows PowerShell 5.1 (no external dependencies).
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File collect-sessions.ps1 `
#     -WorkspaceRoot "C:\WorkSpace\myproject" -Start 2026-06-05 -End 2026-06-11 [-ProjectsDir <dir>]
#
# Output schema:
#   {"period": {"start","end"}, "sessions": [ {
#       "file","session_id","start","end","duration_min","size_kb",
#       "cwd","user_turns","interrupts","tool_rejections",
#       "skills":[...], "projects":[...], "first_goal" } ] }

param(
	[Parameter(Mandatory = $true)][string]$WorkspaceRoot,
	[Parameter(Mandatory = $true)][string]$Start,
	[Parameter(Mandatory = $true)][string]$End,
	[string]$ProjectsDir = (Join-Path $env:USERPROFILE ".claude\projects")
)

$ErrorActionPreference = "Stop"
# Force UTF-8 on redirected stdout (PS 5.1 defaults to the console codepage, e.g. cp949)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Get-WsSlug([string]$path) {
	# C:\WorkSpace\myproject -> C--WorkSpace-myproject (each of : \ / . becomes one dash)
	return ($path.TrimEnd('\', '/') -replace '[:\\/.]', '-')
}

function Get-MsgText($msg) {
	if ($null -eq $msg -or $null -eq $msg.content) { return "" }
	if ($msg.content -is [string]) { return $msg.content }
	$parts = @()
	foreach ($b in @($msg.content)) {
		if ($b.PSObject.Properties['text'] -and $b.text) { $parts += $b.text }
	}
	return ($parts -join ' ')
}

function Read-Session([string]$file, [string]$wsRoot) {
	$first = $null; $last = $null; $cwd = $null
	$userTurns = 0; $interrupts = 0; $rejections = 0
	$skills = New-Object System.Collections.Generic.List[string]
	$projects = New-Object System.Collections.Generic.List[string]
	$firstGoal = ""
	$wsLower = $wsRoot.ToLower()

	foreach ($line in [System.IO.File]::ReadLines($file)) {
		try { $row = $line | ConvertFrom-Json } catch { continue }
		if ($row.PSObject.Properties['timestamp'] -and $row.timestamp) {
			try {
				$ts = [DateTimeOffset]::Parse($row.timestamp, [cultureinfo]::InvariantCulture)
				if ($null -eq $first) { $first = $ts }
				$last = $ts
			} catch {}
		}
		if ($row.PSObject.Properties['cwd'] -and $row.cwd) { $cwd = $row.cwd }
		$msg = $null
		if ($row.PSObject.Properties['message']) { $msg = $row.message }

		if ($row.type -eq 'user' -and $msg) {
			$text = Get-MsgText $msg
			if ($text.Contains('[Request interrupted by user')) { $interrupts++ }
			elseif ($text.Contains("doesn't want to proceed")) { $rejections++ }
			elseif ($text.Trim()) {
				$userTurns++
				if (-not $firstGoal) {
					$firstGoal = $text.Trim()
					if ($firstGoal.Length -gt 120) { $firstGoal = $firstGoal.Substring(0, 120) }
				}
			}
		}
		if ($row.type -eq 'assistant' -and $msg -and -not ($msg.content -is [string])) {
			foreach ($block in @($msg.content)) {
				if ($block.type -ne 'tool_use') { continue }
				$inp = $block.input
				if ($block.name -eq 'Skill' -and $inp -and $inp.PSObject.Properties['skill'] -and $inp.skill) {
					$skills.Add([string]$inp.skill)
				}
				if ($inp -and $inp.PSObject.Properties['file_path'] -and $inp.file_path) {
					$fp = [string]$inp.file_path
					if ($fp.ToLower().Contains($wsLower)) {
						$rel = $fp.Substring($wsRoot.Length).TrimStart('\', '/')
						$seg = ($rel -split '[\\/]')[0]
						if ($seg -and -not $projects.Contains($seg)) { $projects.Add($seg) }
					}
				}
			}
		}
	}
	return [pscustomobject]@{
		first = $first; last = $last; cwd = $cwd
		user_turns = $userTurns; interrupts = $interrupts; rejections = $rejections
		skills = $skills; projects = $projects; first_goal = $firstGoal
	}
}

$styles = [System.Globalization.DateTimeStyles]::AssumeUniversal -bor [System.Globalization.DateTimeStyles]::AdjustToUniversal
$startDt = [DateTimeOffset]::ParseExact($Start, 'yyyy-MM-dd', [cultureinfo]::InvariantCulture, $styles)
$endDt = ([DateTimeOffset]::ParseExact($End, 'yyyy-MM-dd', [cultureinfo]::InvariantCulture, $styles)).AddDays(1)
$slug = Get-WsSlug $WorkspaceRoot

$sessions = @()
$dirs = @(Get-ChildItem -Path $ProjectsDir -Directory -Filter ($slug + '*') -ErrorAction SilentlyContinue | Sort-Object Name)
foreach ($dir in $dirs) {
	foreach ($jsonl in (Get-ChildItem -Path $dir.FullName -Filter '*.jsonl' -File -ErrorAction SilentlyContinue)) {
		$s = Read-Session $jsonl.FullName $WorkspaceRoot
		if ($null -eq $s.first) { continue }
		if ($s.last -lt $startDt -or $s.first -ge $endDt) { continue }
		$sessions += [ordered]@{
			file = $jsonl.FullName
			session_id = [System.IO.Path]::GetFileNameWithoutExtension($jsonl.Name)
			start = $s.first.ToLocalTime().ToString("yyyy-MM-dd'T'HH:mm:sszzz")
			end = $s.last.ToLocalTime().ToString("yyyy-MM-dd'T'HH:mm:sszzz")
			duration_min = [math]::Round(($s.last - $s.first).TotalMinutes, 1)
			size_kb = [math]::Round($jsonl.Length / 1024, 1)
			cwd = $s.cwd
			user_turns = $s.user_turns
			interrupts = $s.interrupts
			tool_rejections = $s.rejections
			skills = @($s.skills | Sort-Object -Unique)
			projects = @($s.projects)
			first_goal = $s.first_goal
		}
	}
}
$sessions = @($sessions | Sort-Object { $_['start'] })

$result = [ordered]@{
	period = [ordered]@{ start = $Start; end = $End }
	sessions = $sessions
}
# -Depth 6 covers period/sessions/arrays; PS 5.1 escapes non-ASCII as \uXXXX (still valid JSON)
ConvertTo-Json -InputObject $result -Depth 6
