"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Package, ShieldCheck, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Parcel } from "@/types/parcel";

export default function StudentParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParcels = useCallback(async () => {
    try {
      const res = await fetch("/api/parcels");
      const json = await res.json();
      if (json.success && json.data) {
        setParcels(json.data);
      }
    } catch (err) {
      console.warn("Student parcels fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParcels();
    const interval = setInterval(fetchParcels, 4000);
    return () => clearInterval(interval);
  }, [fetchParcels]);

  const pendingPickups = parcels.filter((p) => p.status !== "COLLECTED");
  const collected = parcels.filter((p) => p.status === "COLLECTED");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            <span>Parcel Deliveries & Desk Pickups</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Incoming couriers logged at the main gate reception. Show your OTP to security to collect your package.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchParcels}
          className="text-xs h-9 gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Highlight Active OTP Pickups */}
      {pendingPickups.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>Ready for Pickup at Reception Desk ({pendingPickups.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingPickups.map((p) => (
              <Card
                key={p.id}
                className="border-indigo-200 bg-indigo-50/40 dark:border-indigo-900 dark:bg-indigo-950/20 p-5 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="default" className="text-[10px] mb-1.5">
                      {p.courier_service}
                    </Badge>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {p.recipient_name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {p.tracking_number}
                    </p>
                  </div>
                  <Badge variant="warning">Ready</Badge>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-900 p-3.5 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                      Verification Pickup OTP
                    </span>
                    <span className="text-2xl font-black font-mono tracking-widest text-indigo-600 dark:text-indigo-400">
                      {p.otp_code}
                    </span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Location: Security Gate A Counter • Please present student ID & OTP.
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historical Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Collected Package History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {collected.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No past collected packages on record.
            </div>
          ) : (
            collected.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between opacity-80">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {p.courier_service}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.tracking_number}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Delivered to {p.recipient_name} • Room {p.room_number}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Collected</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
