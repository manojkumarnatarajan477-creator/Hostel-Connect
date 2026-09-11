"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PlaneTakeoff, Check, X, RefreshCw, Calendar, Clock, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { LeaveRequest } from "@/types/leave";

export default function WardenLeavePage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await fetch("/api/leave");
      const json = await res.json();
      if (json.success && json.data) {
        setLeaves(json.data);
      }
    } catch (err) {
      console.warn("Warden leaves fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
    const interval = setInterval(fetchLeaves, 5000);
    return () => clearInterval(interval);
  }, [fetchLeaves]);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          remarks: status === "APPROVED" ? "Approved by Chief Warden" : "Rejected: Curfew restrictions",
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchLeaves();
      }
    } catch (err) {
      console.warn("Update leave status error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const matchesFilter = statusFilter === "ALL" || l.status === statusFilter;
    const matchesSearch =
      (l.student_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.destination || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.roll_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PlaneTakeoff className="h-6 w-6 text-indigo-600" />
            <span>Leave Applications Review Desk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review student gate pass requests, approve travel permissions, and view departure history.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLeaves}
          className="text-xs h-9 gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search student or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            className="h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Leave Records ({filteredLeaves.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLeaves.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No leave records found.
            </div>
          ) : (
            filteredLeaves.map((req) => (
              <div
                key={req.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {req.student_name || "Student"}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({req.roll_number || "22BCE1045"})
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      Room {req.room_number || "204"} • {req.block || "Block A"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {req.leave_type}
                    </Badge>
                    <Badge
                      variant={
                        req.status === "APPROVED"
                          ? "success"
                          : req.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Destination: {req.destination}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reason: &ldquo;{req.reason}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {req.start_date} &rarr; {req.end_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Contact: {req.emergency_contact || "N/A"}
                    </span>
                    {req.remarks && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        Remarks: {req.remarks}
                      </span>
                    )}
                  </div>
                </div>

                {req.status === "PENDING" ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="success"
                      isLoading={actionLoadingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                      className="text-xs h-9 px-3 gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={actionLoadingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                      className="text-xs h-9 px-3 gap-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 shrink-0 font-medium">
                    Decision recorded
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
