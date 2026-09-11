"use client";

import React from "react";
import Link from "next/link";
import { Bell, Menu, LogOut, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserRole } from "@/types/auth";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  role: UserRole;
  onOpenMobileNav?: () => void;
}

export function Navbar({ role, onOpenMobileNav }: NavbarProps) {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  const displayName = user?.full_name || (role === "STUDENT" ? "Student Resident" : "Chief Warden");
  const displayRoom = user?.room_number
    ? user.room_number.toLowerCase().includes("room") || user.room_number.toLowerCase().includes("office")
      ? user.room_number
      : `Room ${user.room_number}`
    : role === "STUDENT"
    ? "Room Assigned"
    : "Warden Desk";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant={role === "STUDENT" ? "default" : "success"}>
            {role === "STUDENT" ? "Resident Account" : "Warden Access"}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {user?.block || "Hostel Block A"} • {displayRoom}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {role === "STUDENT" && (
          <Link
            href="/student/ai"
            className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hostel AI</span>
          </Link>
        )}

        {/* Light / Dark Mode Switcher */}
        <ThemeToggle />

        <Link
          href={role === "STUDENT" ? "/student/notifications" : "#"}
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
            {initials || (role === "STUDENT" ? "ST" : "WD")}
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-500 capitalize">{displayRoom}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              const { signOut } = await import("@/lib/auth");
              await signOut();
              window.location.href = "/login";
            }}
            className="ml-1 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
