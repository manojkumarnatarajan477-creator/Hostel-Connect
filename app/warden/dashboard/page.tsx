"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Megaphone,
  UtensilsCrossed,
  Upload,
  Plus,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldCheck,
  Flame,
  Check,
  X,
  FileText,
  AlertTriangle,
  PlaneTakeoff,
  Package,
  Trash2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LeaveRequest } from "@/types/leave";
import { Complaint } from "@/types/complaint";
import { MedicalRequest } from "@/types/medical";
import { Parcel } from "@/types/parcel";
import { WeeklyMenuData } from "@/types/mess";
import { AnnouncementItem } from "@/types/announcement";
import { useAuth } from "@/hooks/useAuth";

export default function WardenDashboardPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [medicalList, setMedicalList] = useState<MedicalRequest[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [menuData, setMenuData] = useState<WeeklyMenuData | null>(null);
  const [loading, setLoading] = useState(true);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Announcement Modal State
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceCategory, setAnnounceCategory] = useState("General Notice");
  const [announceContent, setAnnounceContent] = useState("");
  const [announceBlock, setAnnounceBlock] = useState("All Blocks");
  const [isAnnouncePinned, setIsAnnouncePinned] = useState(false);

  // Reject Confirmation State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Curfew restrictions in effect");

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  const fetchWardenData = useCallback(async () => {
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

      const [lJson, cJson, mJson, pJson, messJson, annJson] = await Promise.all([
        safeFetch("/api/leave"),
        safeFetch("/api/complaints"),
        safeFetch("/api/requests?type=medical"),
        safeFetch("/api/parcels"),
        safeFetch("/api/mess"),
        safeFetch("/api/announcements"),
      ]);

      if (lJson?.success && lJson?.data) setLeaves(lJson.data);
      if (cJson?.success && cJson?.data) setComplaints(cJson.data);
      if (mJson?.success && mJson?.data) setMedicalList(mJson.data);
      if (pJson?.success && pJson?.data) setParcels(pJson.data);
      if (messJson?.success && messJson?.data) setMenuData(messJson.data);
      if (annJson?.success && Array.isArray(annJson?.data)) setAnnouncements(annJson.data);
    } catch (err) {
      console.warn("Warden dashboard fetch note:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWardenData();
    const interval = setInterval(fetchWardenData, 4000);
    return () => clearInterval(interval);
  }, [fetchWardenData]);

  // Handle Approve
  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "APPROVED",
          remarks: "Approved by Chief Warden Office. Gate pass validated.",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage(`Leave request #${id.slice(-4)} has been approved!`);
        fetchWardenData();
      }
    } catch (err) {
      console.warn("Status update error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open confirmation for reject
  const handlePromptReject = (id: string) => {
    setRejectTargetId(id);
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectTargetId) return;
    setActionLoadingId(rejectTargetId);
    setRejectModalOpen(false);
    try {
      const res = await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectTargetId,
          status: "REJECTED",
          remarks: rejectReason || "Rejected: curfew regulations",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage(`Leave request #${rejectTargetId.slice(-4)} was rejected.`);
        fetchWardenData();
      }
    } catch (err) {
      console.warn("Reject leave error:", err);
    } finally {
      setActionLoadingId(null);
      setRejectTargetId(null);
    }
  };

  // Add Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) return;

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announceTitle.trim(),
          category: announceCategory,
          content: announceContent.trim(),
          target_block: announceBlock,
          is_pinned: isAnnouncePinned,
          author_name: user?.full_name || "Chief Warden",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncements((prev) => [json.data, ...prev.filter((a) => a.id !== json.data.id)]);
        setIsAnnounceModalOpen(false);
        setAnnounceTitle("");
        setAnnounceContent("");
        setIsAnnouncePinned(false);
        setStatusMessage("Announcement published & saved to memory for all residents!");
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        alert(json.error || "Failed to publish announcement");
      }
    } catch (err) {
      console.error("Announcement creation error:", err);
    }
  };

  const handleDeleteAnnouncement = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this announcement?")) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setStatusMessage("Announcement removed successfully.");
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error("Delete announcement error:", err);
    }
  };

  // Computed metrics
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  const pendingComplaints = complaints.filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED");
  const resolvedComplaints = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
  const emergencyMedical = medicalList.filter((m) => m.urgency === "CRITICAL_EMERGENCY" && m.status === "PENDING");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Status Alert */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Warden Operations Console
            </h1>
            <Badge variant="success" className="text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {user?.full_name || "Chief Warden Office"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.room_number || "Warden Office A-G01"} • {user?.block || "Block A & Block B Management"} • {user?.email || "Campus Staff Account"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWardenData}
            className="text-xs h-9 gap-1.5"
            title="Refresh database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Records</span>
          </Button>
        </div>
      </div>

      {/* EMERGENCY MEDICAL FLAG (High Visibility Alert) */}
      {emergencyMedical.length > 0 ? (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-100">
                  Critical Medical Emergency Alert ({emergencyMedical.length} Active)
                </span>
                <Badge variant="danger" className="text-[10px]">
                  Immediate Doctor Dispatch
                </Badge>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-200 mt-0.5 font-medium">
                {emergencyMedical[0].student_name} (Room {emergencyMedical[0].room_number}): {emergencyMedical[0].symptoms}
              </p>
            </div>
          </div>
          <Link href="/warden/medical">
            <Button size="sm" variant="danger" className="text-xs shrink-0 shadow-md">
              Respond to Medical Alert &rarr;
            </Button>
          </Link>
        </div>
      ) : null}

      {/* 5 CORE MANAGEMENT METRICS (Exactly as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Students */}
        <Link href="/warden/students">
          <StatCard
            title="Total Students"
            value="420"
            subtitle="Block A: 210 • Block B: 210"
            icon={Users}
            color="indigo"
            badgeText="Enrolled"
          />
        </Link>

        {/* 2. Pending Complaints */}
        <Link href="/warden/complaints">
          <StatCard
            title="Pending Complaints"
            value={pendingComplaints.length}
            subtitle={pendingComplaints.length > 0 ? "Awaiting staff repair" : "All repairs cleared"}
            icon={AlertCircle}
            color="rose"
            badgeText={pendingComplaints.length > 0 ? "Action Needed" : "Zero"}
          />
        </Link>

        {/* 3. Resolved Complaints */}
        <Link href="/warden/complaints">
          <StatCard
            title="Resolved Complaints"
            value={resolvedComplaints.length}
            subtitle="Closed tickets this cycle"
            icon={CheckCircle2}
            color="emerald"
            badgeText="Completed"
          />
        </Link>

        {/* 4. Recent Announcements */}
        <Link href="/warden/announcements">
          <StatCard
            title="Announcements"
            value={announcements.length}
            subtitle="Active student broadcasts"
            icon={Megaphone}
            color="purple"
            badgeText="Live"
          />
        </Link>

        {/* 5. Current Mess Menu */}
        <Link href="/warden/mess">
          <StatCard
            title="Mess Menu Schedule"
            value="Active"
            subtitle={
              menuData?.updated_at
                ? `Updated ${new Date(menuData.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Saveetha Menu Active"
            }
            icon={UtensilsCrossed}
            color="amber"
            badgeText="7 Days"
          />
        </Link>
      </div>

      {/* QUICK ACTIONS TOOLBAR (Exactly as requested) */}
      <Card className="border-indigo-100 bg-linear-to-r from-indigo-50/50 via-white to-purple-50/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>Management Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Quick Action 1: Upload Mess Menu */}
            <Link
              href="/warden/mess"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 transition-all hover:shadow-md group text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  Upload Mess Menu
                </div>
                <div className="text-[10px] text-slate-400">PDF / Image or Manual</div>
              </div>
            </Link>

            {/* Quick Action 2: Add Announcement */}
            <button
              type="button"
              onClick={() => setIsAnnounceModalOpen(true)}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 transition-all hover:shadow-md group text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  Add Announcement
                </div>
                <div className="text-[10px] text-slate-400">Broadcast notice</div>
              </div>
            </button>

            {/* Quick Action 3: View Complaints */}
            <Link
              href="/warden/complaints"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 transition-all hover:shadow-md group text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  View Complaints
                </div>
                <div className="text-[10px] text-slate-400">{pendingComplaints.length} pending repairs</div>
              </div>
            </Link>

            {/* Quick Action 4: Manage Students */}
            <Link
              href="/warden/students"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 transition-all hover:shadow-md group text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  Manage Students
                </div>
                <div className="text-[10px] text-slate-400">Rosters & room search</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* PENDING ACTIONS SECTION (Visually highlighted) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pending Leave Requests */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="h-5 w-5 text-indigo-600" />
                <div>
                  <CardTitle className="text-base">Pending Student Leave Passes</CardTitle>
                  <p className="text-xs text-slate-500">
                    Approve or Reject with 1-click. Reflected live on student app.
                  </p>
                </div>
              </div>

              <Badge variant={pendingLeaves.length > 0 ? "warning" : "success"}>
                {pendingLeaves.length} Awaiting Decision
              </Badge>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {pendingLeaves.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    All leave applications cleared!
                  </p>
                  <p className="text-xs text-slate-400">
                    No pending student gate passes awaiting decision.
                  </p>
                </div>
              ) : (
                pendingLeaves.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {request.student_name || "Student"}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({request.roll_number || "22BCE1045"})
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          Room {request.room_number || "204"} • {request.block || "Block A"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {request.leave_type}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Destination: <span className="text-slate-900 dark:text-white">{request.destination}</span>
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Reason: &ldquo;{request.reason}&rdquo;
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Dates: {request.start_date} &rarr; {request.end_date}
                        </span>
                        <span>Contact: {request.emergency_contact || "N/A"}</span>
                        {request.parent_consent && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Parent Informed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={actionLoadingId === request.id}
                        isLoading={actionLoadingId === request.id}
                        onClick={() => handleApprove(request.id)}
                        className="text-xs h-9 px-3.5 gap-1 shadow-xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        disabled={actionLoadingId === request.id}
                        onClick={() => handlePromptReject(request.id)}
                        className="text-xs h-9 px-3.5 gap-1 shadow-xs"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Current Mess Menu Preview & Announcements summary */}
        <div className="space-y-6">
          {/* Current Mess Menu Card */}
          <Card className="border-amber-200 dark:border-amber-900/50 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-sm font-bold">Active Mess Schedule</CardTitle>
              </div>
              <Link href="/warden/mess">
                <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                  <span>Manage</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {menuData?.title || "Saveetha Academic Hostel Menu"}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                • 7 Days fully configured (Breakfast, Lunch, Snacks, Dinner)
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                • Last updated:{" "}
                {menuData?.updated_at
                  ? new Date(menuData.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Active"}
              </p>
              <Link href="/warden/mess" className="block pt-1">
                <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs h-8 gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Replace / Upload New Menu</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Broadcasts summary */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle className="text-sm font-bold">Broadcast Notices</CardTitle>
                  <p className="text-[11px] text-slate-500">Live synchronized with student portals</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAnnounceModalOpen(true)}
                className="text-xs h-7 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-80 overflow-y-auto">
              {announcements.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  No announcements published yet. Click &ldquo;+ New&rdquo; to broadcast.
                </div>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className="p-3.5 space-y-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {a.title}
                        </span>
                        {a.is_pinned && (
                          <Badge variant="default" className="text-[9px] py-0 bg-indigo-600 text-white">
                            PINNED
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[9px] py-0">
                          {a.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-400">{a.time}</span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAnnouncement(a.id, e)}
                          title="Delete notice"
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{a.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Announcement Modal */}
      <Modal
        isOpen={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        title="Broadcast Announcement"
        description="Publish official notice directly to student dashboards and mobile feeds."
        size="md"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <Input
            label="Notice Title"
            value={announceTitle}
            onChange={(e) => setAnnounceTitle(e.target.value)}
            placeholder="e.g. Hostels Wi-Fi Maintenance Notice"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={announceCategory}
                onChange={(e) => setAnnounceCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
              >
                <option value="General Notice">General Notice</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Mess Committee">Mess Committee</option>
                <option value="Curfew & Security">Curfew & Security</option>
                <option value="Health & Medical">Health & Medical</option>
                <option value="Academic & Events">Academic & Events</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Block
              </label>
              <select
                value={announceBlock}
                onChange={(e) => setAnnounceBlock(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
              >
                <option value="All Blocks">All Blocks</option>
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="dash-pinned"
              checked={isAnnouncePinned}
              onChange={(e) => setIsAnnouncePinned(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="dash-pinned" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              Pin notice to top of student dashboards
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notice Content
            </label>
            <textarea
              rows={3}
              value={announceContent}
              onChange={(e) => setAnnounceContent(e.target.value)}
              placeholder="Enter message details for residents..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAnnounceModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold">
              <Megaphone className="h-4 w-4 mr-1.5" />
              <span>Publish Notice</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal before Rejecting Leave */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Confirm Leave Rejection"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200">
              <p className="font-bold">Are you sure you want to reject this leave application?</p>
              <p className="mt-1 text-[11px] text-rose-800 dark:text-rose-300">
                The student&apos;s digital gate pass will be revoked and marked as REJECTED.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rejection Reason (will be visible to student):
            </label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Curfew restrictions / Pending parent consent"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmReject} className="text-xs font-semibold">
              <X className="h-4 w-4 mr-1.5" />
              <span>Confirm Rejection</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
