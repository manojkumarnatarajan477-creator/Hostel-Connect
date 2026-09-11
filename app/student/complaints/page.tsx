"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, Plus, RefreshCw, EyeOff, CheckCircle2, Clock, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ComplaintForm } from "@/components/complaints/ComplaintForm";
import { Complaint } from "@/types/complaint";

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch("/api/complaints");
      const json = await res.json();
      if (json.success && json.data) {
        setComplaints(json.data);
      }
    } catch (err) {
      console.warn("Student complaints fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 4000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const filtered = filter === "ALL" ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-rose-600" />
            <span>Room & Facility Complaints</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Report electrical, plumbing, carpentry, or cleanliness tickets. Anonymous submissions supported.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComplaints}
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
            <span>File Complaint</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === st
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
            }`}
          >
            {st.replace("_", " ")} ({st === "ALL" ? complaints.length : complaints.filter((c) => c.status === st).length})
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Maintenance Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No complaint records found.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.category}
                    </Badge>
                    <Badge
                      variant={
                        item.priority === "EMERGENCY"
                          ? "danger"
                          : item.priority === "HIGH"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {item.priority}
                    </Badge>
                    {item.is_anonymous && (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 text-[10px] font-semibold border border-purple-200 dark:border-purple-800">
                        <EyeOff className="h-3 w-3" /> Anonymous
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                    <span>Location: Room {item.room_number} • {item.block}</span>
                    {item.assigned_to && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                        <Wrench className="h-3 w-3" /> Assigned: {item.assigned_to}
                      </span>
                    )}
                    {item.resolution_notes && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Notes: {item.resolution_notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "RESOLVED" ? (
                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Resolved</span>
                    </div>
                  ) : item.status === "IN_PROGRESS" ? (
                    <div className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <Wrench className="h-4 w-4 text-indigo-600 animate-spin" />
                      <span>In Progress</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span>Open / Pending</span>
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
        title="File a Hostel Complaint"
        description="Register a ticket for repairs, cleanliness, or room defects."
        maxWidth="lg"
      >
        <ComplaintForm
          onSuccess={() => {
            fetchComplaints();
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
