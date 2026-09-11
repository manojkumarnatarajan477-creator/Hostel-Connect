"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PlaneTakeoff, Plus, RefreshCw, Calendar, MapPin, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LeaveForm } from "@/components/leave/LeaveForm";
import { LeaveRequest } from "@/types/leave";

export default function StudentLeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await fetch("/api/leave");
      const json = await res.json();
      if (json.success && json.data) {
        setLeaves(json.data);
      }
    } catch (err) {
      console.warn("Student leaves fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
    const interval = setInterval(fetchLeaves, 4000); // Poll for live judge demo
    return () => clearInterval(interval);
  }, [fetchLeaves]);

  const filteredLeaves = filter === "ALL" ? leaves : leaves.filter((l) => l.status === filter);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PlaneTakeoff className="h-6 w-6 text-indigo-600" />
            <span>Hostel Leave & Outing Applications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Apply for home visits or day outings. Approvals update automatically once verified by the Warden.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeaves}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Apply For Leave</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === st
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
            }`}
          >
            {st} ({st === "ALL" ? leaves.length : leaves.filter((l) => l.status === st).length})
          </button>
        ))}
      </div>

      {/* Leave History List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Applications Record</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLeaves.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No leave applications found matching filter &quot;{filter}&quot;.
            </div>
          ) : (
            filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {leave.destination}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {leave.leave_type}
                    </Badge>
                    <Badge
                      variant={
                        leave.status === "APPROVED"
                          ? "success"
                          : leave.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {leave.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Reason:</span> {leave.reason}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {leave.start_date} to {leave.end_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Applied: {new Date(leave.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {leave.remarks && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Warden Note: {leave.remarks}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {leave.status === "APPROVED" ? (
                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>Gate Pass Active</span>
                    </div>
                  ) : leave.status === "REJECTED" ? (
                    <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <XCircle className="h-4 w-4 text-rose-600" />
                      <span>Request Rejected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="h-4 w-4 text-amber-600 animate-spin" />
                      <span>Pending Verification</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Leave Application"
        description="Submit your leave application for warden approval."
        maxWidth="lg"
      >
        <LeaveForm
          onSuccess={() => {
            fetchLeaves();
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
