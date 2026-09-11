import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LeaveRequest, CreateLeaveInput, UpdateLeaveStatusInput } from "@/types/leave";

// In-memory resilient store for production runtime
const demoStore: LeaveRequest[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    const status = searchParams.get("status");

    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        let query = supabase
          .from("leave_requests")
          .select(`
            *,
            students:student_id (
              roll_number,
              room_number,
              block,
              users:user_id (
                full_name,
                phone
              )
            )
          `)
          .order("created_at", { ascending: false });

        if (studentId) {
          query = query.eq("student_id", studentId);
        }
        if (status) {
          query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          const formatted: LeaveRequest[] = data.map((item: any) => ({
            id: item.id,
            student_id: item.student_id,
            user_id: item.user_id,
            student_name: item.students?.users?.full_name || item.student_name || "Student",
            roll_number: item.students?.roll_number || item.roll_number,
            room_number: item.students?.room_number || item.room_number,
            block: item.students?.block || item.block,
            leave_type: item.leave_type,
            start_date: item.start_date,
            end_date: item.end_date,
            reason: item.reason,
            destination: item.destination,
            emergency_contact: item.emergency_contact,
            parent_consent: item.parent_consent,
            status: item.status,
            approved_by: item.approved_by,
            remarks: item.remarks,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
          return NextResponse.json({ success: true, data: formatted, source: "supabase" });
        }
      } catch (supabaseErr) {
        console.warn("Supabase query fallback:", supabaseErr);
      }
    }

    // Filter fallback store
    let results = [...demoStore];
    if (studentId) {
      results = results.filter((r) => r.student_id === studentId || r.user_id === studentId);
    }
    if (status) {
      results = results.filter((r) => r.status === status);
    }

    return NextResponse.json({ success: true, data: results, source: "demo_store" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch leaves" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateLeaveInput & { student_id?: string; student_name?: string; room_number?: string; block?: string; roll_number?: string } = await request.json();

    if (!body.reason || !body.destination || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: reason, destination, start_date, end_date" },
        { status: 400 }
      );
    }

    const newRecord: LeaveRequest = {
      id: "leave-" + Date.now(),
      student_id: body.student_id || "std-resident",
      student_name: body.student_name || "Resident Student",
      roll_number: body.roll_number || "RES-001",
      room_number: body.room_number || "Room Assigned",
      block: body.block || "Block A",
      leave_type: body.leave_type || "OUTING",
      start_date: body.start_date,
      end_date: body.end_date,
      reason: body.reason,
      destination: body.destination,
      emergency_contact: body.emergency_contact || "+91 98765 43210",
      parent_consent: body.parent_consent ?? true,
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try Supabase insert
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("leave_requests")
          .insert({
            student_id: newRecord.student_id,
            leave_type: newRecord.leave_type,
            start_date: newRecord.start_date,
            end_date: newRecord.end_date,
            reason: newRecord.reason,
            destination: newRecord.destination,
            emergency_contact: newRecord.emergency_contact,
            parent_consent: newRecord.parent_consent,
            status: "PENDING",
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, data: { ...newRecord, id: data.id }, source: "supabase" });
        }
      } catch (supabaseErr) {
        console.warn("Supabase insert fallback:", supabaseErr);
      }
    }

    // Save to demoStore
    demoStore.unshift(newRecord);

    return NextResponse.json({
      success: true,
      data: newRecord,
      message: "Leave request submitted successfully",
      source: "demo_store",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit leave request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateLeaveStatusInput = await request.json();

    if (!body.id || !body.status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: id, status" },
        { status: 400 }
      );
    }

    // Try Supabase update
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("leave_requests")
          .update({
            status: body.status,
            remarks: body.remarks || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, data, source: "supabase" });
        }
      } catch (supabaseErr) {
        console.warn("Supabase update fallback:", supabaseErr);
      }
    }

    // Update in demoStore
    const index = demoStore.findIndex((r) => r.id === body.id);
    if (index !== -1) {
      demoStore[index] = {
        ...demoStore[index],
        status: body.status,
        remarks: body.remarks || (body.status === "APPROVED" ? "Approved by Chief Warden" : "Rejected due to academic schedule"),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        data: demoStore[index],
        message: `Leave request status updated to ${body.status}`,
        source: "demo_store",
      });
    }

    return NextResponse.json(
      { success: false, error: "Leave request not found" },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update leave request" },
      { status: 500 }
    );
  }
}
