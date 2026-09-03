/**
 * mr-review-flow-send.js — Flow API 알림 전송
 *
 * 환경변수로 전달받은 정보를 기반으로 Flow 알림을 전송한다.
 * Node.js가 UTF-8로 소스를 읽으므로 한글을 직접 작성할 수 있다.
 *
 * 필수 환경변수:
 *   HOOK_PROJECT_NAME, HOOK_MR_IID, HOOK_BOT_ID, HOOK_FLOW_API_KEY
 * 선택 환경변수:
 *   HOOK_AUTHOR_USERNAME (없으면 작성자 알림 스킵)
 *   HOOK_ASSIGNEES       (콤마 구분 GitLab username 목록 — MR 담당자. 없으면 스킵)
 *   HOOK_REVIEWERS       (콤마 구분 GitLab username 목록 — MR 리뷰어. 없으면 스킵)
 *
 * 수신자 매핑: Flow receiverId = GitLab username 가정 (작성자·담당자·리뷰어 동일).
 * 담당자·리뷰어 알림은 합집합(중복 제거) + 작성자 제외 후 발송한다.
 */

const https = require("https");

const projectName = process.env.HOOK_PROJECT_NAME;
const mrIid = process.env.HOOK_MR_IID;
const author = process.env.HOOK_AUTHOR_USERNAME || "";
const parseList = (v) =>
  (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
const assignees = parseList(process.env.HOOK_ASSIGNEES);
const reviewers = parseList(process.env.HOOK_REVIEWERS);
const botId = encodeURIComponent(process.env.HOOK_BOT_ID || "");
const apiKey = process.env.HOOK_FLOW_API_KEY || "";

// --- 메시지 템플릿 (한글 원문 그대로 작성) ---
const title = "MR 리뷰 완료";
const authorMsg = `${projectName} !${mrIid} 리뷰등록이 완료되었습니다.`;
const reviewMsg = `${projectName} !${mrIid} 리뷰가 완료되었습니다. MR 확인 후 승인 부탁드립니다.`;

function sendNotification(receiverId, contents) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ receiverId, title, contents });
    const opts = {
      hostname: "api.flow.team",
      path: "/v1/bots/" + botId + "/notifications",
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-flow-api-key": apiKey,
        "Content-Length": Buffer.byteLength(body),
      },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      process.stderr.write(
        "[flow-notify] sent to " +
          receiverId +
          " (HTTP " +
          res.statusCode +
          ")\n",
      );
      res.resume();
      res.on("end", resolve);
    });
    req.on("error", (e) => {
      process.stderr.write(
        "[flow-notify] failed for " + receiverId + ": " + e.message + "\n",
      );
      resolve();
    });
    req.write(body);
    req.end();
  });
}

(async () => {
  // 알림 1: MR 작성자
  if (author) {
    await sendNotification(author, authorMsg);
  } else {
    process.stderr.write("[flow-notify] author username not found, skipping\n");
  }

  // 알림 2: MR 담당자 + 리뷰어 합집합(중복 제거) — 작성자와 중복되면 제외
  const seen = new Set();
  const targets = [...assignees, ...reviewers].filter((u) => {
    if (!u || u === author || seen.has(u)) {
      return false;
    }
    seen.add(u);
    return true;
  });
  if (targets.length === 0) {
    process.stderr.write(
      "[flow-notify] no assignees/reviewers to notify, skipping\n",
    );
  }
  for (const target of targets) {
    await sendNotification(target, reviewMsg);
  }
})();
