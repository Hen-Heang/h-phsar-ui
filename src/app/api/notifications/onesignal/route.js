import { NextResponse } from "next/server";
import { sendOneSignalNotification } from "@/server/notifications/onesignal";

export async function POST(request) {
  try {
    const payload = await request.json();
    const result = await sendOneSignalNotification(payload);

    return NextResponse.json(result.data, {
      status: result.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Failed to send OneSignal notification.",
      },
      { status: 500 }
    );
  }
}
