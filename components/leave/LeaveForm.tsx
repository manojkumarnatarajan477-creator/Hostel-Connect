"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { LeaveType, CreateLeaveInput } from "@/types/leave";
import { useAuth } from "@/hooks/useAuth";

interface LeaveFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LeaveForm({ onSuccess, onCancel }: LeaveFormProps) {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [formData, setFormData] = useState<CreateLeaveInput>({
    leave_type: "OUTING",
    start_date: today,
    end_date: tomorrow,
    reason: "",
    destination: "",
    emergency_contact: "+91 98765 43210",
    parent_consent: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const leaveTypeOptions = [
    { label: "Day Outing / Local Visit", value: "OUTING" },
    { label: "Home Visit / Vacation", value: "HOME_VISIT" },
    { label: "Medical Leave", value: "MEDICAL_LEAVE" },
    { label: "Other Official Purpose", value: "OTHER" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.reason.trim()) {
      setError("Please specify the reason for your leave request.");
      setLoading(false);
      return;
    }

    if (!formData.destination.trim()) {
      setError("Please enter your travel destination / address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          student_id: user?.id || "std-current",
          student_name: user?.full_name || "Resident Student",
          roll_number: user?.email?.split("@")[0] || "RES-001",
          room_number: user?.room_number || "Room Assigned",
          block: user?.block || "Block A",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit leave request.");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Leave Request Submitted!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Your request has been routed to the Chief Warden. You will be notified
          as soon as it is reviewed.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Dropdown
        label="Leave Type"
        options={leaveTypeOptions}
        value={formData.leave_type}
        onChange={(val) => setFormData((prev) => ({ ...prev, leave_type: val as LeaveType }))}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Departure Date"
          type="date"
          value={formData.start_date}
          min={today}
          onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
          required
        />
        <Input
          label="Return Date"
          type="date"
          value={formData.end_date}
          min={formData.start_date || today}
          onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
          required
        />
      </div>

      <Input
        label="Destination / Place of Stay"
        placeholder="e.g., Home address, Indiranagar, Bangalore"
        value={formData.destination}
        onChange={(e) => setFormData((prev) => ({ ...prev, destination: e.target.value }))}
        required
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Detailed Reason
        </label>
        <textarea
          rows={3}
          className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          placeholder="State the purpose of leave clearly for warden review..."
          value={formData.reason}
          onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
          required
        />
      </div>

      <Input
        label="Emergency Contact Phone"
        placeholder="+91 98765 43210"
        value={formData.emergency_contact}
        onChange={(e) => setFormData((prev) => ({ ...prev, emergency_contact: e.target.value }))}
      />

      <div className="flex items-center gap-2 pt-1">
        <input
          id="parent_consent"
          type="checkbox"
          checked={formData.parent_consent}
          onChange={(e) => setFormData((prev) => ({ ...prev, parent_consent: e.target.checked }))}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="parent_consent" className="text-xs text-slate-600 dark:text-slate-400">
          I confirm that my parents/guardians are fully informed of this travel.
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={loading} className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          <span>Submit Request</span>
        </Button>
      </div>
    </form>
  );
}
