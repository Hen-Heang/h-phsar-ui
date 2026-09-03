#!/bin/bash
# PreToolUse hook: block access to sensitive config files.
# 정책: 모든 yaml/yml/properties/env 설정 파일 접근 차단.
#   예외 = .claude/**·.we-adp/** 아래 전부 허용(하네스 자체 관리 영역.
#   .we-adp 는 인스턴스 정본이라 /config-update 등 하네스 스킬이 직접 읽고 쓴다).
#   단 하네스 자신의 secret(config/system.yaml·*.local.yaml·settings.local.json)은 이 훅이 아니라
#   settings.json permissions.deny 가 도로 막는다 — 훅은 그 파일들을 통과시킨다.
#   (훅·스크립트는 OS 프로세스라 permissions 검사를 지나지 않으므로 system.yaml 을 직접 읽는다.)
# Read/Write/Edit 의 file_path 와, 내용을 노출할 수 있는 shell 명령 양쪽을 커버한다.
# Core 중립: 특정 언어의 config 위치(src/resources 등)를 하드코딩하지 않고 확장자로 판정한다.

# stdin 전체를 읽는다. read -r 은 한 줄만 읽고 끝 개행 없는 입력에 EOF 로 실패해
# (|| exit 0) 훅이 아무것도 차단 못 하고 통과된다 — pretty(여러 줄) JSON 도 첫 줄만 읽혀 실패.
INPUT=$(cat)
[ -z "$INPUT" ] && exit 0

# description 필드는 모델이 쓴 설명 텍스트라 실행되지 않는데, 파일명이 자주 들어가
# (예: "Read project.yaml config") whole-input 스캔이 허용 command 까지 차단하는
# 오탐을 낸다 → 스캔 전에 제거. escaped quote(\") 포함 JSON 문자열 단위로 지운다.
INPUT=$(printf '%s\n' "$INPUT" | sed -E 's/"description"[[:space:]]*:[[:space:]]*"(\\.|[^"\\])*"//g')

# 훅은 Read/Write/Edit/Bash 마다 실행된다 — 값 추출·소문자화·basename 은 bash 내장으로
# 처리해 툴콜당 자식 프로세스를 줄인다(정책 판정 로직은 그대로). 백슬래시 정규화만 sed 유지:
# JSON 원문의 `\\` 와 `\` 를 순서대로 접는 규칙이라 파라미터 확장으로 옮기면 의미가 달라진다.
TOOL=""
[[ $INPUT =~ \"tool_name\"[[:space:]]*:[[:space:]]*\"([^\"]*)\" ]] && TOOL="${BASH_REMATCH[1]}"
[ -z "$TOOL" ] && TOOL="tool"

FILE_PATH=""
[[ $INPUT =~ \"file_path\"[[:space:]]*:[[:space:]]*\"([^\"]*)\" ]] && FILE_PATH="${BASH_REMATCH[1]}"
# 역슬래시 정규화 + 앞뒤 공백 제거(끝 공백이 붙으면 *.yml case 매칭을 회피하는 우회가 생긴다).
FILE_PATH=$(printf '%s\n' "$FILE_PATH" | sed 's|\\\\|/|g; s|\\|/|g; s/^[[:space:]]*//; s/[[:space:]]*$//')
FILENAME="${FILE_PATH##*/}"
LOWER_NAME="${FILENAME,,}"

# Normalize the whole event too. Shell hooks often receive only a command string,
# not a file_path field.
NORMALIZED_INPUT=$(printf '%s\n' "$INPUT" | sed 's|\\\\|/|g; s|\\|/|g')
LOWER_INPUT="${NORMALIZED_INPUT,,}"

# 차단을 유발한 구체 대상(파일 경로/명령 토큰). detector 가 채운다.
# 미설정이면 block() 이 FILE_PATH 로 대체한다.
OFFENDER=""

# reason 에 사용자 입력(경로/명령)이 들어가므로 JSON 문자열 이스케이프 필수.
# 역슬래시 먼저, 그다음 따옴표. 제어문자(개행/탭)는 공백 처리로 제거. (jq 미설치 → 수동.)
json_escape() {
	printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr '\t\n\r' '   '
}

block() {
	# PreToolUse structured deny: JSON on stdout + exit 0 (NOT exit 2).
	# exit 2 면 stdout JSON 무시됨 — 둘 중 하나만 가능. reason 은 모델에 전달된다.
	local target="$OFFENDER"
	if [ -z "$target" ] && [ -n "$FILE_PATH" ]; then
		target="$FILE_PATH"
	fi
	local reason="$TOOL denied - $1"
	if [ -n "$target" ]; then
		reason="$reason (target: $target)"
	fi
	reason=$(json_escape "$reason")
	printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$reason"
	exit 0
}

# 보호 대상 확장자: yaml/yml/properties/env (언어 무관).
is_protected_filename() {
	case "$1" in
		*.yml|*.yaml|*.properties|*.env|.env.*)
			return 0
			;;
	esac
	return 1
}

# .claude/**(조립 산출물)·.we-adp/**(인스턴스 정본) 아래는 하네스 관리 영역이라 허용한다.
# 정확히 세그먼트만 매칭한다 — `.claude/*`(루트 상대) 또는 `*/.claude/*`(중첩), `.we-adp` 도 동일.
# `*.claude/*` 로 쓰면 `myapp.claude/` 같은 가짜 디렉토리도 통과하는 우회가 생긴다.
# 디렉토리 자체(`.claude`·`proj/.claude`·`.claude/`)도 인정한다 — Grep(path=".claude") 처럼
# 트레일링 슬래시 없이 하네스 루트를 겨냥하는 호출이 오탐으로 막혔다.
is_under_harness_dir() {
	case "$1" in
		.claude|.we-adp|*/.claude|*/.we-adp)
			return 0
			;;
		.claude/*|*/.claude/*|.we-adp/*|*/.we-adp/*)
			return 0
			;;
	esac
	return 1
}

# glob 문자열이 하네스 디렉토리 안만 겨냥하는가(`.claude/config/*.yaml`·`.we-adp/**/*.yml`).
# Glob 툴은 대상을 pattern 에 담아 오므로 path 만 보면 하네스 자산 조회가 오탐으로 막힌다.
# brace 대안(`{.claude,app}/**/*.yml`)은 밖 경로가 섞일 수 있어 인정하지 않는다.
glob_scoped_to_harness() {
	case "$1" in
		*[{,]*) return 1 ;;
	esac
	is_under_harness_dir "$1"
}

# 하네스 디렉토리 아래 config 는 전부 열람·수정 허용(하네스 자체 관리 영역), 그 외 config 확장자는 차단.
# $1 = 소문자 정규화 경로.
is_allowed_config() {
	is_under_harness_dir "$1"
}

# ── Grep/Glob 툴 ─────────────────────────────────────────────────────────────
# 이 둘은 file_path 도 command 도 안 넘긴다. 그래서 위 두 검사(파일경로·명령본문)를
# 통째로 비껴가는데, Grep 의 output_mode=content 는 매칭된 줄을 그대로 돌려주므로
# Read 와 동등한 본문 노출 경로다(실제로 application.yml 의 계정·비밀번호가 이 경로로 샜다).
#
# 값은 키 단위로만 뽑는다. whole-input 스캔을 쓰면 정규식 pattern 안의 ".yml" 같은
# 텍스트를 경로로 오인해 무관한 검색까지 막는다.
json_str_field() {
	local key="$1" re
	re="\"$key\"[[:space:]]*:[[:space:]]*\"(([^\"\\]|\\.)*)\""
	[[ $NORMALIZED_INPUT =~ $re ]] && printf '%s' "${BASH_REMATCH[1]}"
}

# glob 문자열이 보호 확장자를 겨냥하는가. `*.yml` 뿐 아니라 brace 확장
# (`*.{yml,yaml,example}`) 도 잡아야 해서 확장자 위치 문자(`.` `{` `,`)를 앞에 요구한다.
# 이렇게 해야 `src/main/properties/*.java` 같은 디렉토리명 오탐이 안 난다.
glob_targets_protected() {
	printf '%s\n' "$1" | grep -qiE '[.{,](yml|yaml|properties|env)($|[^a-z0-9_-])'
}

# glob 이 "대상을 좁혔다"고 인정할 값인가. 확장자 리터럴이 있어야 한다.
# `**/*`·`*`·`src/**` 처럼 전부를 훑는 glob 은 비어 있지 않다는 이유로 content 모드 게이트를
# 통과해 config 본문을 그대로 흘렸다 → 좁힘으로 인정하지 않는다.
glob_is_narrow() {
	[ -n "$1" ] || return 1
	printf '%s\n' "$1" | grep -qiE '\.[a-z0-9_-]+($|[^a-z0-9_-])'
}

# file_path 기반 도구(Read/Write/Edit) 또는 file_path 를 넘긴 이벤트 검사.
check_file_path() {
	[ -z "$FILE_PATH" ] && return
	is_protected_filename "$LOWER_NAME" || return
	local np
	np=$(printf '%s\n' "$FILE_PATH" | tr '[:upper:]' '[:lower:]')
	is_allowed_config "$np" && return
	block "$FILENAME is a protected config file (yaml/yml/properties/env)."
}

# 명령 본문에 yml/yaml/properties 경로가 직접 나오는지.
has_direct_protected_path() {
	local found path
	found=$(printf '%s\n' "$LOWER_INPUT" | grep -oiE '([a-z]:)?[a-z0-9_./-]+\.(yml|yaml|properties)')
	[ -z "$found" ] && return 1
	while IFS= read -r path; do
		[ -z "$path" ] && continue
		case "$path" in
			*psobject.properties)
				# PowerShell 멤버 접근($x.PSObject.Properties) 오탐 — 파일 아님
				continue
				;;
		esac
		if is_allowed_config "$path"; then
			continue
		fi
		OFFENDER="$path"
		return 0
	done <<< "$found"
	return 1
}

# glob 경유 config 읽기 (예: cat conf/*.yml) — 확장자 리터럴은 있으나 경로에 glob 문자가
# 있어 has_direct_protected_path(리터럴 경로)를 피하는 경우. grep --exclude/--include 필터의
# *.yml 도 여기 걸리지만, 호출부에서 has_required_config_excludes 로 게이트해 정상 grep 은 통과.
has_globbed_config_path() {
	local seg
	seg=$(printf '%s\n' "$LOWER_INPUT" | grep -oiE '[a-z0-9_./-]*[*?][a-z0-9_.*?/-]*\.(yml|yaml|properties)' | head -n 1)
	[ -z "$seg" ] && return 1
	if is_allowed_config "$seg"; then return 1; fi   # 하네스 디렉토리(.claude/.we-adp) glob 은 허용
	OFFENDER="$seg"
	return 0
}

# 명령 본문에 .env / .env.* 파일이 나오는지. (.environment 오탐은 뒤 경계로 방지)
has_env_path() {
	local scan
	# `--exclude=.env`·`-g '!.env'` 처럼 **제외 지시**로 쓰인 .env 는 "읽겠다"가 아니다 → 스캔에서 뺀다.
	# 이게 없으면 has_required_config_excludes 의 .env 요구를 만족시키는 순간 이 규칙이 걸려
	# 어떤 재귀 검색도 통과할 수 없다(요구와 차단이 서로 맞물리는 교착).
	scan=$(printf '%s\n' "$LOWER_INPUT" | sed -E "s/(--?exclude(-dir)?[=[:space:]]+|!)[^[:space:]\"']*\.env[a-z0-9_.*-]*//g")
	printf '%s\n' "$scan" | grep -qiE '(^|[^a-z0-9_./-])\.env(\.[a-z0-9_-]+)?([^a-z0-9_-]|$)' || return 1
	# 하네스 디렉토리(.claude/.we-adp) 아래 .env 는 허용(정책 일관 — 실제로는 거의 없음).
	printf '%s\n' "$scan" | grep -qiE '\.(claude|we-adp)/[a-z0-9_./-]*\.env' && return 1
	OFFENDER=".env"
	return 0
}

# stdin-fed searcher (find ... | grep) reads piped text, not files — cannot expose
# file content, so it is exempt from the exclude requirement. Only file-reading
# searchers (grep -r, grep pattern file.yml) must carry the config excludes.
# 파이프로 받은 grep 은 stdin 텍스트만 필터하므로 파일 내용 노출 불가 → 제외 면제.
has_file_reading_searcher() {
	printf '%s\n' "$LOWER_INPUT" |
		sed -E 's/\|[[:space:]]*(rg|grep|select-string|findstr)(\.exe)?/| _filtered_/g' |
		grep -qiE '(^|[^a-z0-9_-])(rg|grep|select-string|findstr)(\.exe)?([^a-z0-9_-]|$)'
}

# A recursive search whose explicit filesystem operands are all under a real
# `.claude/` (or `.we-adp/`) directory is allowed without config excludes. Split
# compound shell input first so an unrelated `cd <workspace>` clause does not
# widen the search clause. Stay conservative: a broad root (`.`), an outside
# path-like operand, or a search clause without an explicit harness-dir target
# keeps the exclude requirement.
searchers_scoped_to_harness() {
	local clauses clause token normalized saw_searcher=1 saw_harness
	clauses=$(printf '%s\n' "$LOWER_INPUT" | sed -E 's/&&|[;]|\|\|/\n/g')
	while IFS= read -r clause; do
		printf '%s\n' "$clause" |
			sed -E 's/\|[[:space:]]*(rg|grep|select-string|findstr)(\.exe)?/| _filtered_/g' |
			grep -qiE '(^|[^a-z0-9_-])(rg|grep|select-string|findstr)(\.exe)?([^a-z0-9_-]|$)' || continue
		saw_searcher=0
		saw_harness=1
		for token in $clause; do
			normalized=$(printf '%s' "$token" | sed -E 's/^["'"'"'{]+//; s/["'"'"',)}]+$//')
			case "$normalized" in
				*">"*|*"<"*)
					# Redirection targets are not search roots.
					continue
					;;
				.claude/*|*/.claude/*|.we-adp/*|*/.we-adp/*)
					saw_harness=0
					;;
				.|./*|../*|/*|[a-z]:/*|*/*)
					return 1
					;;
			esac
		done
		[ "$saw_harness" -eq 0 ] || return 1
	done <<< "$clauses"
	return $saw_searcher
}

# 재귀 검색이 config 를 안 읽는다는 증거로 요구하는 exclude 목록.
# `.env` 는 2026-08-18 추가 — 그전에는 yml·yaml·properties 세 개만 요구해서
# `grep -r pw . --exclude=*.yml --exclude=*.yaml --exclude=*.properties` 가 .env 를 그대로 읽었다.
has_required_config_excludes() {
	printf '%s\n' "$LOWER_INPUT" | grep -qiE '!\*\.yml|--exclude[=[:space:]]+\*\.yml|-exclude[[:space:]][^"]*\*\.yml' &&
		printf '%s\n' "$LOWER_INPUT" | grep -qiE '!\*\.yaml|--exclude[=[:space:]]+\*\.yaml|-exclude[[:space:]][^"]*\*\.yaml' &&
		printf '%s\n' "$LOWER_INPUT" | grep -qiE '!\*\.properties|--exclude[=[:space:]]+\*\.properties|-exclude[[:space:]][^"]*\*\.properties' &&
		printf '%s\n' "$LOWER_INPUT" | grep -qiE '!\*?\.env|--exclude[=[:space:]]+\*?\.env|-exclude[[:space:]][^"]*\*?\.env'
}

# 명령이 config 확장자 경로를 명시하고, 그 경로가 전부 허용(.claude/.we-adp)인가.
# 이럴 땐 grep/rg 라도 대상이 특정된 안전한 읽기 → searcher exclude 강제를 면제한다.
# (경로 없는 광역 grep(예: grep -r x .)은 여기 해당 없음 → 넷 유지.)
all_protected_paths_allowed() {
	local found path any=1
	found=$(printf '%s\n' "$LOWER_INPUT" | grep -oiE '([a-z]:)?[a-z0-9_./-]+\.(yml|yaml|properties)')
	[ -z "$found" ] && return 1
	while IFS= read -r path; do
		[ -z "$path" ] && continue
		case "$path" in *psobject.properties) continue;; esac
		is_allowed_config "$path" || return 1
		any=0
	done <<< "$found"
	return $any
}

# git commit 컨텍스트 — 커밋 메시지에 application.yml 같은 파일명이 언급돼도
# 실제 파일 읽기·쓰기가 아니므로 direct-path 차단에서 면제한다.
# (실제 내용 노출 경로인 git show/cat-file 은 "commit" 단어가 없어 면제되지 않음.)
#
# 면제는 **절 단위**다: 보호 경로가 든 절이 하나라도 git commit 절이 아니면 면제하지 않는다.
# 명령 전체를 면제하면 `git commit -m x && cat cfg/app.yml` 로 세탁된다(2026-08-18 봉합).
is_git_commit() {
	local clauses clause saw_protected=1
	clauses=$(printf '%s\n' "$LOWER_INPUT" | sed -E 's/&&|\|\||[;]/\n/g')
	while IFS= read -r clause; do
		printf '%s\n' "$clause" |
			grep -qiE '\.(yml|yaml|properties)($|[^a-z0-9_-])|(^|[^a-z0-9_./-])\.env(\.[a-z0-9_-]+)?([^a-z0-9_-]|$)' || continue
		saw_protected=0
		printf '%s\n' "$clause" | grep -qiE '(^|[^a-z0-9_-])git([^a-z0-9_-]|$)' || return 1
		printf '%s\n' "$clause" | grep -qiE '(^|[^a-z0-9_-])commit([^a-z0-9_-]|$)' || return 1
	done <<< "$clauses"
	return $saw_protected
}

# file_path 검사는 모든 도구 공통(Read/Write/Edit 및 file_path 를 넘기는 shell 이벤트).
check_file_path

case "$TOOL" in
	Read|Write|Edit|NotebookEdit)
		# file_path 검사로 충분. 입력 JSON 본문(new_string 등)에 대한 명령 패턴 검사를
		# 함께 돌리면 일반 파일 본문에 grep/.yml 단어가 있다는 이유로 무차별 차단된다.
		;;
	Grep|Glob)
		# 아래 *) 로 흘리면 안 된다 — tool_name 의 "grep" 이 has_file_reading_searcher 에
		# 걸려 모든 Grep 이 막힌다. 전용 판정만 돌린다.
		G_PATH=$(json_str_field path)
		G_GLOB=$(json_str_field glob)
		G_TYPE=$(json_str_field type)
		G_MODE=$(json_str_field output_mode)
		# Glob 툴은 검색 대상이 pattern 에 들어온다(Grep 의 pattern 은 정규식이라 제외).
		[ "$TOOL" = "Glob" ] && G_GLOB="$G_GLOB $(json_str_field pattern)"

		G_PATH=$(printf '%s\n' "$G_PATH" | sed 's|\\\\|/|g; s|\\|/|g; s/^[[:space:]]*//; s/[[:space:]]*$//')
		G_PATH_LOWER="${G_PATH,,}"

		# .claude/**·.we-adp/** 는 하네스 자체 관리 영역 — 다른 도구와 같은 예외를 준다.
		if ! is_allowed_config "$G_PATH_LOWER"; then
			# ① path 가 보호 파일을 직접 겨냥
			G_BASE="${G_PATH_LOWER##*/}"
			if [ -n "$G_PATH_LOWER" ] && is_protected_filename "$G_BASE"; then
				OFFENDER="$G_PATH"
				block "$TOOL on a protected config file is not allowed (yaml/yml/properties/env)."
			fi

			# ② glob/type 이 보호 확장자를 겨냥 (`*.yml` · `*.{yml,yaml,…}` · --type yaml)
			#    토큰 단위로 본다 — Glob 툴은 glob 과 pattern 두 값을 합쳐 넘기고, 그중
			#    하네스 안만 겨냥하는 값(`.claude/config/*.yaml`)은 다른 도구와 같은 예외를 준다.
			for G_TOK in $G_GLOB; do
				glob_targets_protected "$G_TOK" || continue
				glob_scoped_to_harness "${G_TOK,,}" && continue
				OFFENDER="$G_TOK"
				block "$TOOL must not target yml/yaml/properties/env files."
			done
			case "${G_TYPE,,}" in
				yaml|yml|properties)
					OFFENDER="$G_TYPE"
					block "$TOOL type filter must not select yaml/properties files."
					;;
			esac

			# ③ content 모드는 매칭 줄을 그대로 돌려준다. 대상을 좁히지 않으면 설정 파일에
			#    걸린 줄이 그대로 새어 나온다 — shell 쪽에 exclude 를 강제하는 것과 같은 취지다.
			#    path 가 보호 대상 아닌 "단일 파일"이면(위 ①을 이미 통과) 좁혀진 것으로 본다.
			#    glob 은 **확장자를 지정한 것만** 좁힘으로 본다(`**/*` 는 좁힌 게 아니다 — glob_is_narrow).
			if [ "$TOOL" = "Grep" ] && [ "$G_MODE" = "content" ] &&
				! glob_is_narrow "$G_GLOB" && [ -z "$G_TYPE" ] && [ ! -f "$G_PATH" ]; then
				block "Grep output_mode=content must narrow targets with glob or type (config file contents would leak)."
			fi
		fi
		;;
	*)
		# Bash / PowerShell / shell_command 등 명령어 본문 도구
		if has_direct_protected_path && ! is_git_commit; then
			block "direct access to yml/yaml/properties files is not allowed."
		fi

		if has_env_path && ! is_git_commit; then
			block "access to .env files is not allowed."
		fi

		if has_globbed_config_path && ! has_required_config_excludes && ! is_git_commit; then
			block "globbed reads of yml/yaml/properties config files are not allowed."
		fi

		if has_file_reading_searcher &&
			! has_required_config_excludes &&
			! all_protected_paths_allowed &&
			! searchers_scoped_to_harness; then
			block "search commands must exclude *.yml, *.yaml, *.properties, and .env."
		fi
		;;
esac

exec 0<&- 2>/dev/null
exit 0
