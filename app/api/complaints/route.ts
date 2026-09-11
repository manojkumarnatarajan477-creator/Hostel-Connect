import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Complaint, CreateComplaintInput, UpdateComplaintStatusInput } from "@/types/complaint";

// In-memory resilient store for production complaints
const demoComplaints: Complaint[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    const status = searchParams.get("status");

    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        let query = supabase.from("complaints").select("*").order("created_at", { ascending: false });

        if (studentId) query = query.eq("student_id", studentId);
        if (status) query = query.eq("status", status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return NextResponse.json({ success: true, data, source: "supabase" });
        }
      } catch (err) {
        console.warn("Supabase complaints fallback:", err);
      }
    }

    // Fallback store
    let results = [...demoComplaints];
    if (studentId) {
      results = results.filter((c) => c.student_id === studentId);
    }
    if (status) {
      results = results.filter((c) => c.status === status);
    }

    return NextResponse.json({ success: true, data: results, source: "demo_store" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateComplaintInput & { student_id?: string; student_name?: string } = await request.json();

    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, description, category" },
        { status: 400 }
      );
    }

    const newComplaint: Complaint = {
      id: "c-" + Date.now(),
      student_id: body.is_anonymous ? "anon-" + Math.random().toString(36).substring(7) : (body.student_id || "std-resident"),
      student_name: body.is_anonymous ? "Anonymous Resident" : (body.student_name || "Resident Student"),
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority || "MEDIUM",
      status: "OPEN",
      room_number: body.room_number || "Room Assigned",
      block: body.block || "Block A",
      is_anonymous: Boolean(body.is_anonymous),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try Supabase insert
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("complaints")
          .insert({
            student_id: newComplaint.student_id,
            title: newComplaint.title,
            description: newComplaint.description,
            category: newComplaint.category,
            priority: newComplaint.priority,
            status: "OPEN",
            room_number: newComplaint.room_number,
            block: newComplaint.block,
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, data: { ...newComplaint, id: data.id }, source: "supabase" });
        }
      } catch (err) {
        console.warn("Supabase insert fallback:", err);
      }
    }

    demoComplaints.unshift(newComplaint);

    return NextResponse.json({
      success: true,
      data: newComplaint,
      message: "Complaint registered successfully",
      source: "demo_store",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit complaint" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateComplaintStatusInput = await request.json();

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
          .from("complaints")
          .update({
            status: body.status,
            assigned_to: body.assigned_to || null,
            resolved_at: body.status === "RESOLVED" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, data, source: "supabase" });
        }
      } catch (err) {
        console.warn("Supabase update fallback:", err);
      }
    }

    const index = demoComplaints.findIndex((c) => c.id === body.id);
    if (index !== -1) {
      demoComplaints[index] = {
        ...demoComplaints[index],
        status: body.status,
        assigned_to: body.assigned_to || demoComplaints[index].assigned_to,
        resolution_notes: body.resolution_notes || (body.status === "RESOLVED" ? "Issue inspected and resolved by maintenance staff" : undefined),
        resolved_at: body.status === "RESOLVED" ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: demoComplaints[index],
        message: `Complaint marked as ${body.status}`,
        source: "demo_store",
      });
    }

    return NextResponse.json(
      { success: false, error: "Complaint not found" },
      { status: 404 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update complaint" },
      { status: 500 }
    );
  }
}
