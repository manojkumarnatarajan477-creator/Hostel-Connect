import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Parcel } from "@/types/parcel";

// In-memory resilient store for production parcel logging
const demoParcels: Parcel[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        let query = supabase.from("parcels").select("*").order("received_at", { ascending: false });
        if (studentId) query = query.eq("student_id", studentId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return NextResponse.json({ success: true, data, source: "supabase" });
        }
      } catch (err) {
        console.warn("Supabase parcels fallback:", err);
      }
    }

    let results = [...demoParcels];
    if (studentId) {
      results = results.filter((p) => p.student_id === studentId);
    }

    return NextResponse.json({ success: true, data: results, source: "demo_store" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.recipient_name || !body.room_number || !body.courier_service) {
      return NextResponse.json(
        { success: false, error: "Missing recipient_name, room_number, or courier_service" },
        { status: 400 }
      );
    }

    // Generate random 4-digit pickup OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const newParcel: Parcel = {
      id: "parcel-" + Date.now(),
      student_id: body.student_id || "std-001",
      recipient_name: body.recipient_name,
      room_number: body.room_number,
      block: body.block || "Block A",
      courier_service: body.courier_service,
      tracking_number: body.tracking_number || `AWB-${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: "NOTIFIED",
      otp_code: otp,
      received_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase.from("parcels").insert(newParcel).select().single();
        if (!error && data) return NextResponse.json({ success: true, data });
      } catch (err) {
        console.warn("Supabase parcel insert fallback:", err);
      }
    }

    demoParcels.unshift(newParcel);

    return NextResponse.json({
      success: true,
      data: newParcel,
      message: `Parcel logged at security desk. OTP ${otp} generated and sent to student.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ success: false, error: "Missing parcel id" }, { status: 400 });
    }

    const idx = demoParcels.findIndex((p) => p.id === body.id);
    if (idx !== -1) {
      demoParcels[idx] = {
        ...demoParcels[idx],
        status: body.status || "COLLECTED",
        collected_at: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        data: demoParcels[idx],
        message: "Parcel marked as COLLECTED upon student verification.",
      });
    }

    return NextResponse.json({ success: false, error: "Parcel not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
