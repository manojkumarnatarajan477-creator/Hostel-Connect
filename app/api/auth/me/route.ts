import { NextRequest, NextResponse } from "next/server";
import { findUserById, findUserByEmail } from "@/lib/usersDb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    let user;
    if (id) {
      user = findUserById(id);
    } else if (email) {
      user = findUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        room_number: user.room_number,
        block: user.block,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
