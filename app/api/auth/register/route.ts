import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/usersDb";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, room_number, email, password, role } = body;

    // Validation
    if (!full_name || typeof full_name !== "string" || !full_name.trim()) {
      return NextResponse.json(
        { success: false, error: "Full Name is required." },
        { status: 400 }
      );
    }

    if (!room_number || typeof room_number !== "string" || !room_number.trim()) {
      return NextResponse.json(
        { success: false, error: "Room Number is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid Email ID is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Register user in persistent DB
    const user = registerUser({
      full_name,
      room_number,
      email,
      password,
      role,
    });

    // If Supabase is configured, sync to Supabase
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        await supabase.from("users").upsert({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          room_number: user.room_number,
          block: user.block,
        });
      } catch (sbErr) {
        console.warn("Supabase user sync notice:", sbErr);
      }
    }

    // Return sanitized profile (exclude password_hash)
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      room_number: user.room_number,
      block: user.block,
      role: user.role,
      created_at: user.created_at,
    };

    const response = NextResponse.json({
      success: true,
      message: "Account successfully registered!",
      data: sanitizedUser,
    });

    // Set role cookie
    response.cookies.set("hc_role", user.role, {
      path: "/",
      maxAge: 86400 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register user." },
      { status: 400 }
    );
  }
}
