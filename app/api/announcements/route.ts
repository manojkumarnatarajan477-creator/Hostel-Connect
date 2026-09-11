import { NextRequest, NextResponse } from "next/server";
import {
  loadAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "@/lib/announcementsDb";
import { CreateAnnouncementInput } from "@/types/announcement";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const block = searchParams.get("block");

    let items = loadAnnouncements();

    if (category && category !== "ALL") {
      items = items.filter(
        (a) => a.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (block && block !== "ALL") {
      items = items.filter(
        (a) =>
          !a.target_block ||
          a.target_block === "All Blocks" ||
          a.target_block.toLowerCase() === block.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load announcements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateAnnouncementInput;

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Announcement title is required." },
        { status: 400 }
      );
    }

    if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: "Announcement content is required." },
        { status: 400 }
      );
    }

    const created = createAnnouncement({
      title: body.title,
      content: body.content,
      category: body.category || "General Notice",
      is_pinned: Boolean(body.is_pinned),
      target_block: body.target_block || "All Blocks",
      author_id: body.author_id,
      author_name: body.author_name,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: "Announcement successfully published to all student portals.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Announcement ID is required for deletion." },
        { status: 400 }
      );
    }

    const deleted = deleteAnnouncement(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Announcement not found or already removed." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Announcement successfully deleted.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
