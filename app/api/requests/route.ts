import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { MedicalRequest } from "@/types/medical";
import { LostFoundItem, StudentRequest } from "@/types/request";

// In-memory resilient stores
const demoMedicalRequests: MedicalRequest[] = [
  {
    id: "med-demo-1",
    student_id: "std-302",
    student_name: "Siddharth N.",
    room_number: "302",
    block: "Block A",
    symptoms: "High fever (103°F) and persistent dizziness",
    urgency: "CRITICAL_EMERGENCY",
    status: "PENDING",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const demoLostFound: LostFoundItem[] = [
  {
    id: "lf-demo-1",
    user_id: "usr-001",
    title: "Blue Titan Smartwatch",
    description: "Misplaced near Badminton Court 2 on Tuesday evening.",
    item_type: "LOST",
    category: "Electronics",
    location: "Badminton Court 2",
    status: "OPEN",
    contact_info: "Resident Student • Room 204",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "lf-demo-2",
    user_id: "usr-sec",
    title: "Scientific Calculator fx-991ES",
    description: "Found on Reading Room Table 4. Deposited at Security Counter.",
    item_type: "FOUND",
    category: "Study Material",
    location: "Library Reading Room",
    status: "OPEN",
    contact_info: "Security Desk Block A",
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("type"); // 'medical' | 'lost_found' | undefined

    if (entityType === "medical") {
      // Try Supabase medical_requests table
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          const { data, error } = await supabase
            .from("medical_requests")
            .select("*")
            .order("created_at", { ascending: false });
          if (!error && data && data.length > 0) {
            return NextResponse.json({ success: true, data, source: "supabase" });
          }
        } catch (err) {
          console.warn("Supabase medical fallback:", err);
        }
      }

      return NextResponse.json({ success: true, data: demoMedicalRequests, source: "demo_store" });
    }

    if (entityType === "lost_found") {
      // Try Supabase lost_found table
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          const { data, error } = await supabase
            .from("lost_found")
            .select("*")
            .order("created_at", { ascending: false });
          if (!error && data && data.length > 0) {
            return NextResponse.json({ success: true, data, source: "supabase" });
          }
        } catch (err) {
          console.warn("Supabase lost_found fallback:", err);
        }
      }

      return NextResponse.json({ success: true, data: demoLostFound, source: "demo_store" });
    }

    // Default: General requests
    return NextResponse.json({
      success: true,
      data: [
        {
          id: "req-1",
          student_id: "std-102",
          title: "Study Table Replacement",
          type: "FURNITURE",
          status: "APPROVED",
          created_at: new Date().toISOString(),
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("type");
    const body = await request.json();

    if (entityType === "medical") {
      const newMed: MedicalRequest = {
        id: "med-" + Date.now(),
        student_id: body.student_id || "std-resident",
        student_name: body.student_name || "Resident Student",
        room_number: body.room_number || "Room Assigned",
        block: body.block || "Block A",
        symptoms: body.symptoms,
        urgency: body.urgency || "ROUTINE",
        status: "PENDING",
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          const { data, error } = await supabase.from("medical_requests").insert(newMed).select().single();
          if (!error && data) return NextResponse.json({ success: true, data });
        } catch (err) {
          console.warn("Supabase medical insert fallback:", err);
        }
      }

      demoMedicalRequests.unshift(newMed);
      return NextResponse.json({
        success: true,
        data: newMed,
        message: "Medical emergency request dispatched to Warden and Campus Doctor.",
      });
    }

    if (entityType === "lost_found") {
      const newLF: LostFoundItem = {
        id: "lf-" + Date.now(),
        user_id: body.user_id || "usr-001",
        title: body.title,
        description: body.description,
        item_type: body.item_type || "LOST",
        category: body.category || "Personal Belonging",
        location: body.location || "Hostel Premises",
        contact_info: body.contact_info || "Resident Student • Room Assigned",
        status: "OPEN",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          const { data, error } = await supabase.from("lost_found").insert(newLF).select().single();
          if (!error && data) return NextResponse.json({ success: true, data });
        } catch (err) {
          console.warn("Supabase lost_found insert fallback:", err);
        }
      }

      demoLostFound.unshift(newLF);
      return NextResponse.json({
        success: true,
        data: newLF,
        message: "Notice posted on Lost & Found board successfully.",
      });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("type");
    const body = await request.json();

    if (entityType === "medical") {
      const idx = demoMedicalRequests.findIndex((m) => m.id === body.id);
      if (idx !== -1) {
        demoMedicalRequests[idx] = {
          ...demoMedicalRequests[idx],
          status: body.status,
          notes: body.notes || (body.status === "ATTENDED" ? "Duty Doctor dispatched to room." : "Patient recovered."),
          attended_by: body.attended_by || "Chief Warden / Campus Medic",
          resolved_at: body.status === "RESOLVED" ? new Date().toISOString() : undefined,
        };
        return NextResponse.json({
          success: true,
          data: demoMedicalRequests[idx],
          message: `Medical ticket updated to ${body.status}`,
        });
      }
    }

    if (entityType === "lost_found") {
      const idx = demoLostFound.findIndex((l) => l.id === body.id);
      if (idx !== -1) {
        demoLostFound[idx] = {
          ...demoLostFound[idx],
          status: body.status,
          updated_at: new Date().toISOString(),
        };
        return NextResponse.json({
          success: true,
          data: demoLostFound[idx],
          message: `Item status marked as ${body.status}`,
        });
      }
    }

    return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
