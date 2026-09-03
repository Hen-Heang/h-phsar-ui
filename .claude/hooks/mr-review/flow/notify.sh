#!/usr/bin/env bash
# ============================================================================
# mr-review-flow-notify.sh — SubagentStop hook for mr-reviewer
#
# 메타 JSON을 읽고, GitLab API로 MR 작성자 + 담당자(assignees) + 리뷰어(reviewers) 정보를 추출한 뒤
# Flow API로 알림을 전송한다 (MR 작성자 + 담당자·리뷰어 합집합, 작성자 중복 제외).
# 완료 후 메타 JSON과 완료 마커를 삭제한다.
#
# 필요 파일:
#   .claude/tmp/mr-review-posted.json  (post-comment.sh 가 댓글 등록 성공 시 남기는 완료 마커)
#                                      — 이 파일이 없으면 아무것도 하지 않는다(조기 알림 차단)
#   .claude/tmp/mr-review-meta.json    (mr-reviewer 에이전트가 MR 조회 때 생성)
#   .claude/config/system.yaml         (GitLab 인증 gitlab.url/token + Flow 인증 flow.apiKey/botId)
# ============================================================================

set -uo pipefail

# stdin 소비 (pipe error 방지)
cat > /dev/null


SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
_RAW_WORKSPACE="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
WORKSPACE_DIR="$(cygpath -m "$_RAW_WORKSPACE" 2>/dev/null || echo "$_RAW_WORKSPACE")"

META_FILE="$WORKSPACE_DIR/.claude/tmp/mr-review-meta.json"
POSTED_FILE="$WORKSPACE_DIR/.claude/tmp/mr-review-posted.json"
SYSTEM_CONFIG="$WORKSPACE_DIR/.claude/config/system.yaml"

# --- Guard: 완료 마커 (제일 먼저) ---
# SubagentStop 은 matcher 로 에이전트를 고르지 못해 **모든** 서브에이전트 종료마다 이 훅이 돈다.
# meta 는 MR 조회 시점(리뷰 시작)에 생기므로 게이트가 못 된다 — 리뷰 도중 끝난 다른
# 서브에이전트로도 알림이 나가 버렸다. 댓글 등록까지 끝냈다는 신호(post-comment.sh 가
# payload 를 rename 해 남기는 마커)만 게이트로 쓴다.
if [ ! -f "$POSTED_FILE" ]; then
	echo "[flow-notify] review not posted yet, skip (no $POSTED_FILE)" >&2
	exit 0
fi

# --- Guard: 필수 파일 확인 ---
if [ ! -f "$META_FILE" ]; then
	echo "[flow-notify] meta file not found: $META_FILE" >&2
	rm -f "$POSTED_FILE"
	exit 0
fi
if [ ! -f "$SYSTEM_CONFIG" ]; then
	echo "[flow-notify] system config not found: $SYSTEM_CONFIG" >&2
	rm -f "$POSTED_FILE"
	exit 0
fi

# 여기부터는 어떤 경로로 끝나도 meta·마커를 치운다 — 마커가 남으면 다음 리뷰 도중
# 다른 서브에이전트가 끝날 때 또 발사된다(조기 알림 재발).
trap 'rm -f "$META_FILE" "$POSTED_FILE"' EXIT

# --- 설정 파일 파싱 (node 단일 실행, 환경변수로 경로 전달) ---
export HOOK_META_FILE="$META_FILE"
export HOOK_SYSTEM_CONFIG="$SYSTEM_CONFIG"

PARSED=$(node -e '
const fs = require("fs");
const meta = JSON.parse(fs.readFileSync(process.env.HOOK_META_FILE, "utf8"));
// system.yaml (YAML) — gitlab.url/token + flow.apiKey/botId 를 정규식으로 추출 (2-space indent 키).
// 키 값 뒤 인라인 주석 금지 — (.+?) 가 주석까지 캡처한다.
const sysText = fs.readFileSync(process.env.HOOK_SYSTEM_CONFIG, "utf8");
// 값 앞 공백은 수평 공백만([ \t]) 매칭 — \s 는 \n 을 포함해 빈 값일 때 다음 줄을
// 침범한다. (.*?)\s*$ 로 CRLF(\r) 안전 + 빈 값은 같은 줄 안에서 "" 캡처.
// 값의 인라인 주석(` # ...`)은 떼어낸다 — 템플릿 token 줄에 주석이 달려 있어 그대로 쓰면
// 값에 주석이 붙는다. url·token·apiKey·botId 에 `#` 이 들어가는 경우는 없다.
const pick = (re) => { const m = sysText.match(re); return m ? m[1].split("#")[0].trim() : ""; };
const result = {
  project_name: meta.project_name || "",
  project_id: meta.project_id || 0,
  mr_iid: meta.mr_iid || 0,
  flow_api_key: pick(/^[ \t]*apiKey:[ \t]*(.*?)\s*$/m),
  bot_id: pick(/^[ \t]*botId:[ \t]*(.*?)\s*$/m),
  gitlab_url: pick(/^[ \t]*url:[ \t]*(.*?)\s*$/m),
  access_token: pick(/^[ \t]*token:[ \t]*(.*?)\s*$/m)
};
process.stdout.write(JSON.stringify(result));
' 2>/dev/null)

if [ -z "$PARSED" ]; then
	echo "[flow-notify] failed to parse config files" >&2
	rm -f "$META_FILE"
	exit 0
fi

# node로 개별 값 추출 (환경변수로 JSON 전달)
extract() {
	export HOOK_JSON="$PARSED"
	export HOOK_KEY="$1"
	node -e '
const d = JSON.parse(process.env.HOOK_JSON);
process.stdout.write(String(d[process.env.HOOK_KEY] || ""));
'
}

PROJECT_NAME=$(extract project_name)
PROJECT_ID=$(extract project_id)
MR_IID=$(extract mr_iid)
FLOW_API_KEY=$(extract flow_api_key)
BOT_ID=$(extract bot_id)
GITLAB_URL=$(extract gitlab_url)
ACCESS_TOKEN=$(extract access_token)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "0" ] || [ -z "$MR_IID" ] || [ "$MR_IID" = "0" ]; then
	echo "[flow-notify] invalid meta data (project_id=$PROJECT_ID, mr_iid=$MR_IID)" >&2
	rm -f "$META_FILE"
	exit 0
fi

# --- GitLab MR API 호출: 작성자 + MR URL 추출 ---
MR_RESPONSE=$(curl -s --connect-timeout 10 --max-time 15 \
	-H "PRIVATE-TOKEN: $ACCESS_TOKEN" \
	"$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests/$MR_IID" 2>/dev/null)

if [ -z "$MR_RESPONSE" ]; then
	echo "[flow-notify] GitLab MR API returned empty response" >&2
	rm -f "$META_FILE"
	exit 0
fi

# MR 응답에서 author.username, assignees[].username, web_url 추출
export HOOK_MR_RESPONSE="$MR_RESPONSE"

MR_INFO=$(node -e '
try {
  const mr = JSON.parse(process.env.HOOK_MR_RESPONSE);
  const result = {
    author_username: (mr.author || {}).username || "",
    assignees: (mr.assignees || []).map(a => (a || {}).username).filter(Boolean),
    reviewers: (mr.reviewers || []).map(r => (r || {}).username).filter(Boolean),
    web_url: mr.web_url || ""
  };
  process.stdout.write(JSON.stringify(result));
} catch(e) {
  process.stderr.write("[flow-notify] MR JSON parse error: " + e.message + "\n");
  process.stdout.write("{}");
}
' 2>/dev/null)

export HOOK_JSON="$MR_INFO"
export HOOK_KEY="author_username"
AUTHOR_USERNAME=$(node -e 'const d=JSON.parse(process.env.HOOK_JSON||"{}");process.stdout.write(String(d[process.env.HOOK_KEY]||""));')
export HOOK_KEY="assignees"
ASSIGNEES=$(node -e 'const d=JSON.parse(process.env.HOOK_JSON||"{}");const v=d[process.env.HOOK_KEY];process.stdout.write(Array.isArray(v)?v.join(","):String(v||""));')
export HOOK_KEY="reviewers"
REVIEWERS=$(node -e 'const d=JSON.parse(process.env.HOOK_JSON||"{}");const v=d[process.env.HOOK_KEY];process.stdout.write(Array.isArray(v)?v.join(","):String(v||""));')
export HOOK_KEY="web_url"
MR_WEB_URL=$(node -e 'const d=JSON.parse(process.env.HOOK_JSON||"{}");process.stdout.write(String(d[process.env.HOOK_KEY]||""));')

# --- Flow 알림 전송 ---
# 한글 인코딩 문제(Windows CP949) 방지를 위해 별도 .js 파일에서 처리.
# Node.js가 UTF-8 소스를 직접 읽으므로 한글을 그대로 작성할 수 있다.
export HOOK_PROJECT_NAME="$PROJECT_NAME"
export HOOK_MR_IID="$MR_IID"
export HOOK_AUTHOR_USERNAME="$AUTHOR_USERNAME"
export HOOK_ASSIGNEES="$ASSIGNEES"
export HOOK_REVIEWERS="$REVIEWERS"
export HOOK_BOT_ID="$BOT_ID"
export HOOK_FLOW_API_KEY="$FLOW_API_KEY"

SEND_JS="$WORKSPACE_DIR/.claude/hooks/mr-review/flow/send.js"
node "$SEND_JS"

# --- 메타 파일 정리 ---
rm -f "$META_FILE"

exit 0
