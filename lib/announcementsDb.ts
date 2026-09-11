import fs from "fs";
import path from "path";
import { AnnouncementItem, CreateAnnouncementInput } from "@/types/announcement";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const DATA_DIR = path.join(process.cwd(), "data");
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, "announcements.json");

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-curfew-001",
    title: "Hostel Gate Curfew & Biometric Sign-in Notice",
    content: "All student residents must be inside the hostel premises by 9:30 PM. Late arrivals will be logged automatically via biometric scanners and escalated to the Chief Warden desk.",
    category: "Curfew & Security",
    is_pinned: true,
    target_block: "All Blocks",
    author_id: "usr-warden-001",
    author_name: "Dr. K. Raman (Chief Warden)",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    time: "3 hours ago",
  },
  {
    id: "ann-wifi-002",
    title: "Hostel Wi-Fi Infrastructure Upgrade & Router Maintenance",
    content: "Scheduled routine maintenance on Block A and Block B primary network switches tonight between 01:00 AM - 03:00 AM. High-speed 5GHz bands will be upgraded.",
    category: "Maintenance",
    is_pinned: true,
    target_block: "All Blocks",
    author_id: "usr-warden-001",
    author_name: "Chief Warden Desk",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    time: "18 hours ago",
  },
  {
    id: "ann-mess-003",
    title: "Weekend Mess Special Dinner Notice",
    content: "Sunday Dum Biryani with Veg Paneer Biryani alternative will be served from 12:30 PM to 02:30 PM in the Central Dining Hall. Please submit any meal preference queries early.",
    category: "Mess Committee",
    is_pinned: false,
    target_block: "All Blocks",
    author_id: "usr-warden-001",
    author_name: "Mess Committee & Warden Office",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    time: "Yesterday",
  },
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn("Could not create data dir:", e);
    }
  }
}

export function loadAnnouncements(): AnnouncementItem[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
      saveAnnouncements(INITIAL_ANNOUNCEMENTS);
      return INITIAL_ANNOUNCEMENTS;
    }
    const raw = fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AnnouncementItem[];
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        ...item,
        time: formatRelativeTime(item.created_at),
      }));
    }
    return INITIAL_ANNOUNCEMENTS;
  } catch (err) {
    console.warn("Failed to load announcements from file, using initial:", err);
    return INITIAL_ANNOUNCEMENTS;
  }
}

export function saveAnnouncements(announcements: AnnouncementItem[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save announcements to file:", err);
  }
}

export function createAnnouncement(input: CreateAnnouncementInput): AnnouncementItem {
  const announcements = loadAnnouncements();

  const nowIso = new Date().toISOString();
  const newAnnouncement: AnnouncementItem = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: input.title.trim(),
    content: input.content.trim(),
    category: input.category || "General Notice",
    is_pinned: Boolean(input.is_pinned),
    target_block: input.target_block || "All Blocks",
    author_id: input.author_id || "warden-admin",
    author_name: input.author_name || "Chief Warden Office",
    created_at: nowIso,
    time: "Just now",
  };

  // If pinned, insert at the very beginning; if unpinned, insert after existing pinned items
  if (newAnnouncement.is_pinned) {
    announcements.unshift(newAnnouncement);
  } else {
    const firstNonPinned = announcements.findIndex((a) => !a.is_pinned);
    if (firstNonPinned === -1) {
      announcements.push(newAnnouncement);
    } else {
      announcements.splice(firstNonPinned, 0, newAnnouncement);
    }
  }

  saveAnnouncements(announcements);

  // Sync to Supabase if configured (async fire-and-forget)
  if (isSupabaseConfigured()) {
    (async () => {
      try {
        const supabase = await createClient();
        await supabase.from("announcements").insert({
          id: newAnnouncement.id.startsWith("ann-") ? undefined : newAnnouncement.id,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          category: newAnnouncement.category,
          is_pinned: newAnnouncement.is_pinned,
          target_block: newAnnouncement.target_block,
          created_at: newAnnouncement.created_at,
        });
      } catch (sbErr) {
        console.warn("Supabase announcement insert notice:", sbErr);
      }
    })();
  }

  return newAnnouncement;
}

export function deleteAnnouncement(id: string): boolean {
  const announcements = loadAnnouncements();
  const filtered = announcements.filter((a) => a.id !== id);

  if (filtered.length !== announcements.length) {
    saveAnnouncements(filtered);

    // Sync deletion to Supabase if configured
    if (isSupabaseConfigured()) {
      (async () => {
        try {
          const supabase = await createClient();
          await supabase.from("announcements").delete().eq("id", id);
        } catch (e) {
          console.warn("Supabase delete notice:", e);
        }
      })();
    }
    return true;
  }
  return false;
}
