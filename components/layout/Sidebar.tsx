"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  PlaneTakeoff,
  AlertCircle,
  HelpCircle,
  Package,
  HeartPulse,
  Bell,
  Sparkles,
  Megaphone,
  Users,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

interface SidebarProps {
  role: UserRole;
  className?: string;
}

export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();

  const studentNavItems: NavItem[] = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Leave Requests", href: "/student/leave", icon: PlaneTakeoff },
    { label: "Complaints", href: "/student/complaints", icon: AlertCircle },
    { label: "Mess & Menu", href: "/student/mess", icon: UtensilsCrossed },
    { label: "Requests & Lost/Found", href: "/student/requests", icon: HelpCircle },
    { label: "Parcels", href: "/student/parcels", icon: Package },
    { label: "Medical Emergency", href: "/student/medical", icon: HeartPulse },
    { label: "Notifications", href: "/student/notifications", icon: Bell },
    { label: "Hostel AI Assistant", href: "/student/ai", icon: Sparkles, highlight: true },
  ];

  const wardenNavItems: NavItem[] = [
    { label: "Overview Dashboard", href: "/warden/dashboard", icon: LayoutDashboard },
    { label: "Leave Requests", href: "/warden/leave", icon: PlaneTakeoff },
    { label: "Complaints & Issues", href: "/warden/complaints", icon: AlertCircle },
    { label: "Student Requests", href: "/warden/requests", icon: HelpCircle },
    { label: "Mess Oversight", href: "/warden/mess", icon: UtensilsCrossed },
    { label: "Parcels Counter", href: "/warden/parcels", icon: Package },
    { label: "Medical Requests", href: "/warden/medical", icon: HeartPulse },
    { label: "Announcements", href: "/warden/announcements", icon: Megaphone },
    { label: "Students Roster", href: "/warden/students", icon: Users },
  ];

  const navItems: NavItem[] = role === "STUDENT" ? studentNavItems : wardenNavItems;

  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-screen",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
          HC
        </div>
        <div>
          <span className="font-bold text-white tracking-tight">HostelConnect</span>
          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            2.0
          </span>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
            {role === "STUDENT" ? (
              <>
                <GraduationCap className="h-3 w-3 text-indigo-400" />
                <span>Student Portal</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>Warden Portal</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80",
                item.highlight && !isActive && "text-indigo-400 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/40"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                  isActive
                    ? "text-white"
                    : item.highlight
                    ? "text-indigo-400"
                    : "text-slate-400 group-hover:text-slate-200"
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-950/50 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-300">Campus Network Active</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v2.0</span>
        </div>
      </div>
    </aside>
  );
}
