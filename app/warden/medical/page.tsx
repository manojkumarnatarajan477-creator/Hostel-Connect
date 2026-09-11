"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HeartPulse, Check, PhoneCall, RefreshCw, Flame, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MedicalRequest } from "@/types/medical";

export default function WardenMedicalPage() {
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/requests?type=medical");
      const json = await res.json();
      if (json.success && json.data) {
        setRequests(json.data);
      }
    } catch (err) {
      console.warn("Failed to load medical records:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 4000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleUpdateStatus = async (id: string, status: "ATTENDED" | "RESOLVED", notes: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/requests?type=medical", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          notes,
          attended_by: "Campus Health Doctor / Chief Warden",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests();
      }
    } catch (err) {
      console.warn("Medical status update error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const emergencyAlerts = requests.filter(
    (r) => r.urgency === "CRITICAL_EMERGENCY" && r.status === "PENDING"
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-600" />
            <span>Hostel Dispensary & Medical Incident Desk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time medical alerts, doctor dispatch queue, and student emergency health logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Incidents</span>
          </Button>
          <a href="tel:+919988776655">
            <Button size="sm" variant="danger" className="text-xs h-9 gap-1.5">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Campus Ambulance Hotline</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Critical Emergency Banner if active */}
      {emergencyAlerts.length > 0 && (
        <div className="rounded-2xl border border-rose-300 bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-100 font-bold text-sm">
            <Flame className="h-5 w-5 text-rose-600 animate-bounce" />
            <span>CRITICAL EMERGENCY ALERTS ({emergencyAlerts.length} Active)</span>
          </div>
          <div className="space-y-2">
            {emergencyAlerts.map((em) => (
              <div
                key={em.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {em.student_name}
                    </span>
                    <Badge variant="danger" className="text-[10px]">
                      Room {em.room_number} • {em.block}
                    </Badge>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-1">
                    Symptoms: {em.symptoms}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  isLoading={actionLoadingId === em.id}
                  onClick={() => handleUpdateStatus(em.id, "ATTENDED", "Doctor dispatched immediately to student room.")}
                  className="text-xs h-9 px-4 gap-1.5 shrink-0"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Dispatch Doctor Now</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Medical Docket */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Medical Incidents & Dispensary Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No medical records reported.
            </div>
          ) : (
            requests.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.student_name}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      Room {item.room_number} • {item.block}
                    </Badge>
                    <Badge
                      variant={
                        item.urgency === "CRITICAL_EMERGENCY"
                          ? "danger"
                          : item.urgency === "MODERATE"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {item.urgency.replace("_", " ")}
                    </Badge>
                    <Badge
                      variant={
                        item.status === "ATTENDED"
                          ? "success"
                          : item.status === "RESOLVED"
                          ? "default"
                          : "danger"
                      }
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Reported Symptoms: {item.symptoms}
                  </p>

                  {item.notes && (
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Action Taken: {item.notes} {item.attended_by && `(${item.attended_by})`}
                    </div>
                  )}
                </div>

                {/* Inline Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={actionLoadingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, "ATTENDED", "Nurse attended and checked vitals.")}
                      className="text-xs h-9 px-3 gap-1 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark Attended</span>
                    </Button>
                  )}

                  {item.status === "ATTENDED" && (
                    <Button
                      size="sm"
                      variant="success"
                      isLoading={actionLoadingId === item.id}
                      onClick={() => handleUpdateStatus(item.id, "RESOLVED", "Student discharged & stable.")}
                      className="text-xs h-9 px-3 gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Close Incident</span>
                    </Button>
                  )}

                  {item.status === "RESOLVED" && (
                    <span className="text-xs text-slate-400 font-medium">Completed</span>
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
