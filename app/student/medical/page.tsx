"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HeartPulse, PhoneCall, AlertTriangle, Plus, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { MedicalRequest, MedicalUrgency } from "@/types/medical";
import { useAuth } from "@/hooks/useAuth";

export default function StudentMedicalPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MedicalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const [formData, setFormData] = useState({
    symptoms: "",
    urgency: "ROUTINE" as MedicalUrgency,
    room_number: "204",
    block: "Block A",
  });

  const fetchMedical = useCallback(async () => {
    try {
      const res = await fetch("/api/requests?type=medical");
      const json = await res.json();
      if (json.success && json.data) {
        setRequests(json.data);
      }
    } catch (err) {
      console.warn("Failed to load medical requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedical();
    const interval = setInterval(fetchMedical, 4000);
    return () => clearInterval(interval);
  }, [fetchMedical]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests?type=medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          student_id: user?.id || "std-resident",
          student_name: user?.full_name || "Resident Student",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFormData({ symptoms: "", urgency: "ROUTINE", room_number: "204", block: "Block A" });
        fetchMedical();
      }
    } catch (err) {
      console.warn("Submit medical request error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriggerSOS = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/requests?type=medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user?.id || "std-resident",
          student_name: user?.full_name || "Resident Student",
          room_number: user?.room_number || "Room Assigned",
          block: user?.block || "Block A",
          symptoms: "CRITICAL SOS: Emergency room medical alert triggered by student!",
          urgency: "CRITICAL_EMERGENCY",
        }),
      });
      setSosSent(true);
      fetchMedical();
      setTimeout(() => setSosSent(false), 5000);
    } catch (err) {
      console.warn("Trigger SOS error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-rose-600" />
            <span>Hostel Dispensary & Emergency Health</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Request dispensary attendance, medicine delivery to room, or alert warden for urgent hospitalization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Request Assistance</span>
          </Button>

          <Button
            onClick={handleTriggerSOS}
            disabled={submitting}
            size="sm"
            variant="danger"
            className="text-xs h-9 gap-1.5 shadow-md shadow-rose-600/20 animate-pulse"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{sosSent ? "SOS Alert Sent!" : "Emergency SOS"}</span>
          </Button>
        </div>
      </div>

      {sosSent && (
        <div className="p-4 rounded-2xl bg-rose-600 text-white text-xs font-semibold flex items-center gap-3 shadow-lg shadow-rose-600/30">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Urgent Medical Alert Dispatched!</p>
            <p className="text-rose-100 font-normal">
              Chief Warden console and Campus Ambulance (+91 99887 76655) have received your room coordinates (Room 204, Block A).
            </p>
          </div>
        </div>
      )}

      {/* Emergency Contact Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-rose-900 dark:text-rose-200 flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-rose-600" />
              <span>Campus Ambulance Hotline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-rose-800 dark:text-rose-300">
              Direct emergency line to Campus Medical Center 24/7.
            </p>
            <a href="tel:+919988776655" className="inline-block">
              <Button variant="danger" size="sm" className="text-xs gap-1.5">
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Call +91 99887 76655</span>
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hostel Dispensary Timings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Location:</span> Ground Floor Admin Wing, Block A</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Doctor on Duty:</span> Dr. R. Iyer (MBBS, MD)</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Hours:</span> 08:00 AM - 08:00 PM (Emergency nurse 24/7)</p>
          </CardContent>
        </Card>
      </div>

      {/* Medical Requests Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Health Requests Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {requests.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No active medical requests logged.
            </div>
          ) : (
            requests.map((item) => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.symptoms}
                    </span>
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
                  </div>
                  <p className="text-xs text-slate-500">
                    Location: Room {item.room_number} • {item.block}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Doctor&apos;s Note: {item.notes} ({item.attended_by})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "ATTENDED" || item.status === "RESOLVED" ? (
                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{item.status}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse">
                      <Clock className="h-4 w-4 text-rose-600" />
                      <span>Awaiting Medic</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal for Routine Medical Request */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request Medical Assistance"
        description="Notify the campus doctor and warden office of symptoms."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Symptoms / Health Issue
            </label>
            <textarea
              rows={3}
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="e.g., Severe fever, stomach pain, dizziness, sprain..."
              className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            />
          </div>

          <Dropdown
            label="Urgency Level"
            options={[
              { label: "Routine (Headache, Mild Cold, Bandage)", value: "ROUTINE" },
              { label: "Moderate (Persistent Fever, Nausea)", value: "MODERATE" },
              { label: "Critical Emergency (Fainting, Severe Injury)", value: "CRITICAL_EMERGENCY" },
            ]}
            value={formData.urgency}
            onChange={(val) => setFormData({ ...formData, urgency: val as MedicalUrgency })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Room Number"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              required
            />
            <Input
              label="Hostel Block"
              value={formData.block}
              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Submit Medical Alert
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
