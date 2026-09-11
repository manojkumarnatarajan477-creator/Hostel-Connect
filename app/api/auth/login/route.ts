import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, findUserByEmail } from "@/lib/usersDb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, identifier, password } = body;

    const idToUse = email || identifier;
    if (!idToUse || typeof idToUse !== "string" || !idToUse.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your Email or Student/Staff ID." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your password." },
        { status: 400 }
      );
    }

    const result = verifyCredentials(idToUse, password);
    if (!result.success || !result.user) {
      const userExists = !!findUserByEmail(idToUse);
      return NextResponse.json(
        {
          success: false,
          notRegistered: !userExists,
          error: result.error || "Invalid login credentials.",
        },
        { status: 401 }
      );
    }

    const sanitizedUser = {
      id: result.user.id,
      email: result.user.email,
      full_name: result.user.full_name,
      room_number: result.user.room_number,
      block: result.user.block,
      role: result.user.role,
      created_at: result.user.created_at,
    };

    const response = NextResponse.json({
      success: true,
      message: "Login successful!",
      data: sanitizedUser,
    });

    // Set role cookie
    response.cookies.set("hc_role", result.user.role, {
      path: "/",
      maxAge: 86400 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process login." },
      { status: 500 }
    );
  }
}
