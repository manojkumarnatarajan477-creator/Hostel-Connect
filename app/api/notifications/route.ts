import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "notif-1",
        title: "Leave Status Updated",
        message: "Your leave application has been processed by Chief Warden.",
        type: "SUCCESS",
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
  });
}
