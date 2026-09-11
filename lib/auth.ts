import { createClient, isSupabaseConfigured } from "./supabase/client";
import { UserProfile, UserRole } from "@/types/auth";

export const DEFAULT_WARDEN_USER: UserProfile = {
  id: "usr-warden-001",
  email: "warden@campus.edu",
  full_name: "Dr. K. Raman (Chief Warden)",
  room_number: "Warden Office A-G01",
  block: "Block A",
  role: "WARDEN",
  created_at: new Date().toISOString(),
};

/**
 * Resolves user profile and role from local registered users or identifier
 */
export function resolveUserAccount(identifier: string): UserProfile {
  const cleanId = identifier.trim().toLowerCase();

  // 1. Check local registered user cache
  if (typeof window !== "undefined") {
    try {
      const storedList = localStorage.getItem("hc_registered_users");
      if (storedList) {
        const users = JSON.parse(storedList) as UserProfile[];
        const match = users.find(
          (u) =>
            u.email.toLowerCase() === cleanId ||
            u.id.toLowerCase() === cleanId
        );
        if (match) return match;
      }
    } catch (e) {
      console.warn("User resolution cache read error:", e);
    }
  }

  // 2. Staff / Warden identification
  if (
    cleanId.includes("warden") ||
    cleanId.includes("admin") ||
    cleanId === "w-101" ||
    cleanId === "warden01"
  ) {
    return DEFAULT_WARDEN_USER;
  }

  // 3. Fallback generic resident profile based on credentials entered
  const nameFromEmail = cleanId.split("@")[0].replace(/[._0-9]/g, " ").trim();
  const capitalized = nameFromEmail
    ? nameFromEmail
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Resident Student";

  return {
    id: `usr-${Date.now()}`,
    email: cleanId.includes("@") ? cleanId : `${cleanId}@campus.edu`,
    full_name: capitalized,
    room_number: "Room Assigned",
    block: "Block A",
    role: "STUDENT",
    created_at: new Date().toISOString(),
  };
}

export function setActiveSession(user: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    document.cookie = `hc_role=${user.role}; path=/; max-age=${86400 * 7}; SameSite=Lax`;
    localStorage.setItem("hc_session_user", JSON.stringify(user));

    // Also update or add to hc_registered_users cache
    const existing = localStorage.getItem("hc_registered_users");
    let users: UserProfile[] = existing ? JSON.parse(existing) : [];
    const idx = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem("hc_registered_users", JSON.stringify(users));
  } catch (e) {
    console.warn("Session storage note:", e);
  }
}

export function getActiveSession(): { user: UserProfile | null; role: UserRole | null } {
  if (typeof window === "undefined") return { user: null, role: null };
  try {
    // Check localStorage first
    const stored = localStorage.getItem("hc_session_user");
    if (stored) {
      const parsed = JSON.parse(stored) as UserProfile;
      return { user: parsed, role: parsed.role };
    }

    // Fall back to cookie
    const cookies = document.cookie.split("; ");
    const roleCookie = cookies.find((c) => c.startsWith("hc_role="));
    if (roleCookie) {
      const role = roleCookie.split("=")[1] as UserRole;
      return {
        user: role === "WARDEN" ? DEFAULT_WARDEN_USER : null,
        role,
      };
    }
  } catch (e) {
    console.warn("Session read note:", e);
  }
  return { user: null, role: null };
}

export function clearActiveSession() {
  if (typeof window === "undefined") return;
  try {
    document.cookie = "hc_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("hc_session_user");
  } catch (e) {
    console.warn("Session clear note:", e);
  }
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    const { user } = getActiveSession();
    return user;
  }

  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    const { user: fallbackUser } = getActiveSession();
    return fallbackUser;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      role: (user.user_metadata?.role as UserRole) || "STUDENT",
      room_number: user.user_metadata?.room_number || "Room 204",
    };
  }

  return profile as UserProfile;
}

export async function signOut() {
  clearActiveSession();
  if (!isSupabaseConfigured()) {
    return { error: null };
  }
  const supabase = createClient();
  return await supabase.auth.signOut();
}
