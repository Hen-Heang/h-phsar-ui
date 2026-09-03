#!/usr/bin/env bash
# ============================================================================
# post-comment.sh — SubagentStop hook for mr-reviewer (직렬 1번: 댓글 등록)
#
# mr-reviewer 가 작성한 리뷰 페이로드를 GitLab MR 댓글(/notes)로 등록한다.
# SubagentStop matcher "mr-reviewer" 직렬: 본 hook(댓글 등록) → notify.sh(Flow 알림).
#
# 필요 파일:
#   .claude/tmp/mr-review-payload.json  (mr-reviewer 생성: {"body":"..."}) — 등록 성공 시 mr-review-posted.json 로 rename
#   .claude/tmp/mr-review-meta.json     (mr-reviewer 생성: project_id/mr_iid) — notify.sh 가 삭제하므로 본 hook 은 유지
#
# rename 으로 남는 mr-review-posted.json 이 notify.sh 의 유일한 게이트다 — SubagentStop 은
# matcher 로 에이전트를 못 골라 모든 서브에이전트 종료마다 두 훅이 돌기 때문에, "댓글까지 등록됐다"는
# 신호가 없으면 리뷰 도중에 Flow 알림이 새어 나간다.
#   .claude/config/system.yaml          (gitlab.url / gitlab.token)
#
# 토큰은 system.yaml 에서 직접 읽어 LLM 컨텍스트·명령줄 밖에 격리.
# 어느 단계든 실패해도 exit 0 (SubagentStop 차단 금지). 실패 시 payload 보존.
# ============================================================================

set -uo pipefail

# stdin 소비 (pipe error 방지)
cat > /dev/null

# SCRIPT_DIR = .claude/hooks/mr-review → 3단계 상위가 워크스페이스 루트
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
_RAW_WORKSPACE="$(cd "$SCRIPT_DIR/../../.." && pwd)"
WORKSPACE_DIR="$(cygpath -m "$_RAW_WORKSPACE" 2>/dev/null || echo "$_RAW_WORKSPACE")"

PAYLOAD_FILE="$WORKSPACE_DIR/.claude/tmp/mr-review-payload.json"
POSTED_FILE="$WORKSPACE_DIR/.claude/tmp/mr-review-posted.json"
META_FILE="$WORKSPACE_DIR/.claude/tmp/mr-review-meta.json"
GITLAB_CONFIG="$WORKSPACE_DIR/.claude/config/system.yaml"

# scratch diff 즉시 정리 (severity-scan 입력 — 소비 완료, 디버그 가치 없음)
rm -f "$WORKSPACE_DIR/.claude/tmp/mr_diff.txt"

# --- Guard: 필수 파일 (없으면 조용히 통과 — 리뷰 미생성 등) ---
if [ ! -f "$PAYLOAD_FILE" ]; then
	echo "[mr-post-comment] payload not found, skip: $PAYLOAD_FILE" >&2
	exit 0
fi
if [ ! -f "$META_FILE" ]; then
	echo "[mr-post-comment] meta not found, skip: $META_FILE" >&2
	exit 0
fi
if [ ! -f "$GITLAB_CONFIG" ]; then
	echo "[mr-post-comment] gitlab config not found, skip: $GITLAB_CONFIG" >&2
	exit 0
fi

# --- 설정 파싱 (node 단일 실행, 환경변수로 경로 전달) ---
export HOOK_META_FILE="$META_FILE"
export HOOK_GITLAB_CONFIG="$GITLAB_CONFIG"

PARSED=$(node -e '
const fs = require("fs");
const meta = JSON.parse(fs.readFileSync(process.env.HOOK_META_FILE, "utf8"));
// system.yaml (YAML) — gitlab.url / gitlab.token 만 정규식으로 추출 (2-space indent 키).
// 값 앞 공백은 수평 공백만([ \t]) — \s 는 \n 을 포함해 빈 값(`url:`)일 때 다음 줄(token)을 훔친다.
// 값에서 인라인 주석(` # ...`)은 떼어낸다 — 템플릿 token 줄에 주석이 달려 있어 그대로 쓰면
// 토큰에 주석이 붙어 401 이 난다. url·token 에 `#` 이 들어가는 경우는 없다.
const gitlabText = fs.readFileSync(process.env.HOOK_GITLAB_CONFIG, "utf8");
const pick = (re) => { const m = gitlabText.match(re); return m ? m[1].split("#")[0].trim() : ""; };
process.stdout.write(JSON.stringify({
  project_id: meta.project_id || 0,
  mr_iid: meta.mr_iid || 0,
  gitlab_url: pick(/^[ \t]*url:[ \t]*(.*?)[ \t]*$/m),
  access_token: pick(/^[ \t]*token:[ \t]*(.*?)[ \t]*$/m)
}));
' 2>/dev/null)

if [ -z "$PARSED" ]; then
	echo "[mr-post-comment] failed to parse config files" >&2
	exit 0
fi

extract() {
	export HOOK_JSON="$PARSED"
	export HOOK_KEY="$1"
	node -e 'const d=JSON.parse(process.env.HOOK_JSON);process.stdout.write(String(d[process.env.HOOK_KEY]||""));'
}

PROJECT_ID=$(extract project_id)
MR_IID=$(extract mr_iid)
GITLAB_URL=$(extract gitlab_url)
ACCESS_TOKEN=$(extract access_token)

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "0" ] || [ -z "$MR_IID" ] || [ "$MR_IID" = "0" ] || [ -z "$GITLAB_URL" ] || [ -z "$ACCESS_TOKEN" ]; then
	echo "[mr-post-comment] invalid meta/config (project_id=$PROJECT_ID, mr_iid=$MR_IID)" >&2
	exit 0
fi

# --- GitLab MR 댓글 등록 (/notes) ---
API_URL="${GITLAB_URL}/api/v4/projects/${PROJECT_ID}/merge_requests/${MR_IID}/notes"

RESPONSE=$(curl -s -w "\n__HTTP_STATUS__%{http_code}" --connect-timeout 10 --max-time 20 \
	-X POST \
	-H "PRIVATE-TOKEN: ${ACCESS_TOKEN}" \
	-H "Content-Type: application/json" \
	--data-binary @"$PAYLOAD_FILE" \
	"$API_URL" 2>/dev/null)

HTTP_BODY=$(echo "$RESPONSE" | sed '/__HTTP_STATUS__/d')
HTTP_STATUS=$(echo "$RESPONSE" | grep '__HTTP_STATUS__' | sed 's/__HTTP_STATUS__//')

if [ -n "$HTTP_STATUS" ] && [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
	NOTE_ID=$(echo "$HTTP_BODY" | node -e "let d='';process.stdin.setEncoding('utf8');process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>process.stdout.write(String(JSON.parse(d).id)));" 2>/dev/null || echo "")
	# 성공 시 payload 를 완료 마커로 rename (meta·마커는 notify.sh 가 삭제).
	# notify.sh 는 이 마커만 게이트로 쓴다 — 리뷰가 실제로 끝나 댓글까지 등록된 뒤에만
	# Flow 알림이 나가게 하는 유일한 신호다(meta 는 MR 조회 시점에 이미 생겨 게이트가 못 된다).
	mv -f "$PAYLOAD_FILE" "$POSTED_FILE" 2>/dev/null || rm -f "$PAYLOAD_FILE"
	echo "✅ MR 댓글이 등록되었습니다."
	if [ -n "$NOTE_ID" ]; then
		echo "🔗 ${GITLAB_URL}/projects/${PROJECT_ID}/merge_requests/${MR_IID}#note_${NOTE_ID}"
	fi
else
	# 성공 메시지와 같은 stdout 으로 낸다 — stderr 로만 내면 exit 0 인 훅이라 사용자 눈에
	# 아무것도 안 보이고 "조용히 등록 안 됨" 이 된다(실패 원인을 그 자리에서 보게 한다).
	echo "❌ MR 댓글 등록 실패 (HTTP ${HTTP_STATUS:-N/A})"
	echo "$HTTP_BODY"
	echo "💡 payload 보존됨: $PAYLOAD_FILE — 원인 고친 뒤 재리뷰하면 다시 등록된다."
fi

exit 0
