"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Megaphone,
  PlaneTakeoff,
  AlertCircle,
  Package,
  Sparkles,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  Coffee,
  Sun,
  Cookie,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Bell,
  X,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LeaveForm } from "@/components/leave/LeaveForm";
import { LeaveStatus } from "@/components/leave/LeaveStatus";
import { LeaveRequest } from "@/types/leave";
import { Complaint } from "@/types/complaint";
import { Parcel } from "@/types/parcel";
import { WeeklyMenuData, DayOfWeek } from "@/types/mess";
import { AnnouncementItem } from "@/types/announcement";
import { useAuth } from "@/hooks/useAuth";

const DAYS_LIST: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Helper to parse comma-separated meal strings into clean, separate dish items
function parseMealItems(mealString?: string): string[] {
  if (!mealString || !mealString.trim()) return ["Meal details updating..."];
  return mealString
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [menuData, setMenuData] = useState<WeeklyMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmToast, setConfirmToast] = useState<string | null>(null);

  // Today's day name
  const currentDayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  }) as DayOfWeek;

  // Selected day for the dashboard mess preview (defaults to today)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(currentDayName);

  // Sync selected day when current day initializes
  useEffect(() => {
    if (DAYS_LIST.includes(currentDayName)) {
      setSelectedDay(currentDayName);
    }
  }, [currentDayName]);

  // Live Official Hostel announcements
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const safeFetch = async (url: string) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      };

      const [leaveJson, compJson, parcelJson, messJson, annJson] = await Promise.all([
        safeFetch("/api/leave"),
        safeFetch("/api/complaints"),
        safeFetch("/api/parcels"),
        safeFetch("/api/mess"),
        safeFetch("/api/announcements"),
      ]);

      if (leaveJson?.success && leaveJson?.data) setLeaveRequests(leaveJson.data);
      if (compJson?.success && compJson?.data) setComplaints(compJson.data);
      if (parcelJson?.success && parcelJson?.data) setParcels(parcelJson.data);
      if (messJson?.success && messJson?.data) setMenuData(messJson.data);
      if (annJson?.success && Array.isArray(annJson?.data)) setAnnouncements(annJson.data);
    } catch (err) {
      console.warn("Dashboard fetch note:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Live synchronization with database updates every 4 seconds
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Resolve menu for selected day
  const displayedMenu =
    menuData?.days.find((d) => d.day.toLowerCase() === selectedDay.toLowerCase()) ||
    menuData?.days.find((d) => d.day.toLowerCase() === currentDayName.toLowerCase()) ||
    menuData?.days[0];

  const pendingLeaves = leaveRequests.filter((l) => l.status === "PENDING");
  const pendingParcels = parcels.filter((p) => p.status !== "COLLECTED");

  // Dynamic user details
  const residentName = user?.full_name || "Resident Student";
  const residentRoom = user?.room_number
    ? user.room_number.toLowerCase().includes("room")
      ? user.room_number
      : `Room ${user.room_number}`
    : "Room Assigned";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Action Toast Feedback */}
      {confirmToast && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{confirmToast}</span>
          </div>
          <button onClick={() => setConfirmToast(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Resident Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Resident Dashboard
            </h1>
            <Badge variant="default" className="text-xs bg-indigo-600 text-white font-medium">
              {residentName} • {residentRoom}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.block || "Hostel Block A"} • {user?.email || "Enrolled Campus Resident"}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="text-xs h-9 gap-1.5"
            title="Synchronize records"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>

          <Button
            onClick={() => setLeaveModalOpen(true)}
            className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Apply Leave</span>
          </Button>

          <Link href="/student/ai">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-9 gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-slate-800"
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>Hostel AI</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. MESS MENU CARD (ITEMIZED LIST FORMAT - NO PARAGRAPHS) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Mess Timetable • {selectedDay}
                </h2>
                {selectedDay === currentDayName ? (
                  <Badge variant="success" className="text-[10px] py-0 px-2">
                    Today
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] py-0 px-2">
                    Schedule Preview
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                  Central Dining Hall
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {menuData?.title || "Official Academic Hostel Schedule"} • Real-time synchronized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/student/mess"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 shrink-0"
            >
              <span>Full 7-Day Timetable</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Day Selector Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-5 border-b border-slate-100 dark:border-slate-800/60 scrollbar-none">
          {DAYS_LIST.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = currentDayName === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-white text-indigo-700"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 4 Distinct Meal Cards: Breakfast, Lunch, Snacks, Dinner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Breakfast */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Coffee className="h-4 w-4 text-amber-600" />
                  <span>Breakfast</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  07:30 - 09:00
                </span>
              </div>

              {/* Itemized list of menu items */}
              <ul className="space-y-1.5">
                {parseMealItems(displayedMenu?.breakfast).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lunch */}
          <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-indigo-200/60 dark:border-indigo-900/60">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sun className="h-4 w-4 text-indigo-600" />
                  <span>Lunch</span>
                </span>
                <span className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  12:30 - 14:00
                </span>
              </div>

              {/* Itemized list of menu items */}
              <ul className="space-y-1.5">
                {parseMealItems(displayedMenu?.lunch).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-indigo-950 dark:text-indigo-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <span className="leading-snug font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Snacks */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Cookie className="h-4 w-4 text-emerald-600" />
                  <span>Evening Snacks</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  17:00 - 18:00
                </span>
              </div>

              {/* Itemized list of menu items */}
              <ul className="space-y-1.5">
                {parseMealItems(displayedMenu?.snacks).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dinner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Moon className="h-4 w-4 text-purple-600" />
                  <span>Dinner</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  19:30 - 21:00
                </span>
              </div>

              {/* Itemized list of menu items */}
              <ul className="space-y-1.5">
                {parseMealItems(displayedMenu?.dinner).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL HOSTEL ANNOUNCEMENTS */}
      <Card id="announcements" className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base">Hostel Official Announcements</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {announcements.length} Active Circulars
          </Badge>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No official announcements broadcasted at this time. Check back later.
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {ann.title}
                    </span>
                    {ann.is_pinned && (
                      <Badge variant="default" className="text-[9px] py-0 bg-indigo-600 text-white">
                        PINNED
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[9px] py-0">
                      {ann.category}
                    </Badge>
                    {ann.target_block && ann.target_block !== "All Blocks" && (
                      <Badge variant="secondary" className="text-[9px] py-0">
                        {ann.target_block}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>
                <div className="flex sm:flex-col sm:items-end justify-between items-center text-[11px] text-slate-400 shrink-0 gap-1">
                  <span className="font-medium text-slate-500 dark:text-slate-400">{ann.time || "Recently"}</span>
                  {ann.author_name && (
                    <span className="text-[10px] text-slate-400">{ann.author_name}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 3. LEAVE APPLICATIONS & MAINTENANCE COMPLAINTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Requests Tracker */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <PlaneTakeoff className="h-5 w-5 text-indigo-600" />
              <div>
                <CardTitle className="text-base">My Leave Applications</CardTitle>
                <p className="text-xs text-slate-500">Live synchronized with Warden desk</p>
              </div>
            </div>

            <Button size="sm" onClick={() => setLeaveModalOpen(true)} className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500">
              + Apply Leave
            </Button>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No leave requests filed yet. Click &quot;+ Apply Leave&quot; above to submit.
              </div>
            ) : (
              leaveRequests.slice(0, 3).map((leave) => (
                <div key={leave.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {leave.destination}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {leave.leave_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {leave.reason}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      <span>Dates: {leave.start_date} &rarr; {leave.end_date}</span>
                    </div>
                  </div>

                  <LeaveStatus status={leave.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Complaints Tracker */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              <div>
                <CardTitle className="text-base">Maintenance Complaints</CardTitle>
                <p className="text-xs text-slate-500">Track electrical, water & room repairs</p>
              </div>
            </div>

            <Link href="/student/complaints">
              <Button variant="outline" size="sm" className="text-xs h-8">
                File / View All
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active complaints registered. All hostel facilities operational!
              </div>
            ) : (
              complaints.slice(0, 3).map((comp) => (
                <div key={comp.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {comp.title}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {comp.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Room {comp.room_number} • {comp.description}
                    </p>
                  </div>

                  <Badge
                    variant={
                      comp.status === "RESOLVED"
                        ? "success"
                        : comp.status === "IN_PROGRESS"
                        ? "default"
                        : "warning"
                    }
                    className="text-[10px] shrink-0"
                  >
                    {comp.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. ESSENTIAL CAMPUS LOGISTICS & QUICK SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Curfew & Entry Info */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-2">
            <Clock className="h-4 w-4" />
            <span>Hostel Gate Curfew</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            10:00 PM Sharp
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Turnstiles log student ID swipes. Approved outing pass required for entry after curfew.
          </p>
        </div>

        {/* Parcels OTP Shortcut */}
        <Link href="/student/parcels" className="block">
          <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 transition-all">
            <div className="flex items-center justify-between text-indigo-600 font-bold text-xs mb-2">
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Parcels at Reception</span>
              </span>
              {pendingParcels.length > 0 && (
                <Badge variant="default" className="text-[9px] bg-indigo-600">
                  {pendingParcels.length} Ready
                </Badge>
              )}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {pendingParcels.length > 0
                ? `Pickup OTP: ${pendingParcels[0].otp_code}`
                : "No Pending Packages"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Show OTP and Student ID card at Block A reception counter.
            </p>
          </div>
        </Link>

        {/* Medical Room & Emergency SOS Shortcut */}
        <Link href="/student/medical" className="block">
          <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-800 transition-all">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Hostel Dispensary & SOS</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              24/7 Medical Care
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Tap to request doctor visit or trigger immediate campus emergency SOS alert.
            </p>
          </div>
        </Link>
      </div>

      {/* Leave Application Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Submit Leave / Outing Application"
        description="Fill out departure and destination details for Chief Warden review."
        size="lg"
      >
        <LeaveForm
          onSuccess={() => {
            fetchDashboardData();
            setLeaveModalOpen(false);
            setConfirmToast("Leave request submitted successfully! Pending Chief Warden approval.");
          }}
          onCancel={() => setLeaveModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
