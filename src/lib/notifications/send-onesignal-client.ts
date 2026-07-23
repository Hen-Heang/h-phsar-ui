type OneSignalNotificationPayload = {
  contents: Record<string, string>;
  include_external_user_ids: string[];
};

// OneSignal push notifications require a REST API key, which must never be
// shipped to the browser. No app id/key or backend relay endpoint exists yet,
// so this is a safe no-op until that server-side piece is built — callers
// already treat this as fire-and-forget and ignore the resolved value.
export async function sendOneSignalNotification(
  payload: OneSignalNotificationPayload
): Promise<{ ok: false; reason: string }> {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "sendOneSignalNotification: OneSignal is not configured; notification skipped.",
      payload
    );
  }
  return { ok: false, reason: "onesignal_not_configured" };
}
