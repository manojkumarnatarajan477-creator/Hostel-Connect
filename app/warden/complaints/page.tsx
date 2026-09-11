"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, Check, Wrench, RefreshCw, EyeOff, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Complaint } from "@/types/complaint";

export default function WardenComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch("/api/complaints");
      const json = await res.json();
      if (json.success && json.data) {
        setComplaints(json.data);
      }
    } catch (err) {
      console.warn("Warden complaints fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 4000);
    return () => clearInterval(interval);
  }, [fetchComplaints]);

  const handleUpdateStatus = async (id: string, status: "IN_PROGRESS" | "RESOLVED", assigned_to?: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          assigned_to: assigned_to || (status === "IN_PROGRESS" ? "Hostel Maintenance Staff" : undefined),
          resolution_notes: status === "RESOLVED" ? "Repairs verified by Warden office." : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchComplaints();
      }
    } catch (err) {
      console.warn("Error updating complaint:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchesFilter = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch =
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.room_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-rose-600" />
            <span>Hostel Maintenance & Complaints Oversight</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch maintenance staff, resolve student tickets, and respect anonymous submissions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchComplaints}
          className="text-xs h-9 gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search complaints or rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            className="h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complaints Docket ({filtered.length})</CardTitle>
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
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
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
                    {item.is_anonymous ? (
                      <span className="inline-flex items-center gap-1 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 text-[10px] font-semibold border border-purple-200 dark:border-purple-800">
                        <EyeOff className="h-3 w-3" /> Anonymous Resident
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">
                        By: {item.student_name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                    <span>Room {item.room_number} • {item.block}</span>
                    {item.assigned_to && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Assigned: {item.assigned_to}
                      </span>
                    )}
                    {item.resolution_notes && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Notes: {item.resolution_notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={actionLoadingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, "IN_PROGRESS", "Duty Maintenance Tech")}
                      className="text-xs h-9 px-3 gap-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Start Repair</span>
                    </Button>
                  )}

                  {item.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      variant="success"
                      isLoading={actionLoadingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                      className="text-xs h-9 px-3 gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark Resolved</span>
                    </Button>
                  )}

                  {item.status === "RESOLVED" && (
                    <Badge variant="success" className="text-xs">
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
