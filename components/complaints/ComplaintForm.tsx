"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { ComplaintCategory, ComplaintPriority, CreateComplaintInput } from "@/types/complaint";
import { useAuth } from "@/hooks/useAuth";

interface ComplaintFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ComplaintForm({ onSuccess, onCancel }: ComplaintFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateComplaintInput>({
    title: "",
    description: "",
    category: "ELECTRICAL",
    priority: "MEDIUM",
    room_number: user?.room_number || "Room Assigned",
    block: user?.block || "Block A",
    is_anonymous: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categoryOptions = [
    { label: "Electrical (Lights, Fan, Switch, Geyser)", value: "ELECTRICAL" },
    { label: "Plumbing (Taps, Drainage, Flush, Leakage)", value: "PLUMBING" },
    { label: "Carpentry (Door lock, Bed, Chair, Cupboard)", value: "CARPENTRY" },
    { label: "Cleanliness & Sanitation (Corridor, Washroom)", value: "CLEANLINESS" },
    { label: "Internet / Wi-Fi Access Point", value: "INTERNET" },
    { label: "Noise / Ragging / Other Hostel Issue", value: "OTHER" },
  ];

  const priorityOptions = [
    { label: "Low Priority (Routine)", value: "LOW" },
    { label: "Medium Priority (Normal)", value: "MEDIUM" },
    { label: "High Priority (Urgent)", value: "HIGH" },
    { label: "Emergency (Safety Hazard)", value: "EMERGENCY" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title.trim()) {
      setError("Please enter a short title for the complaint.");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Please provide details of the problem.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          student_id: formData.is_anonymous ? undefined : (user?.id || "std-current"),
          student_name: formData.is_anonymous ? "Anonymous Resident" : (user?.full_name || "Resident Student"),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit complaint.");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint.");
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
          Complaint Ticket Registered!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          {formData.is_anonymous
            ? "Your complaint has been submitted anonymously. Staff cannot see your identity."
            : "Your complaint has been assigned to the hostel maintenance desk for inspection."}
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

      <Input
        label="Issue Summary / Subject"
        placeholder="e.g., Geyser not heating water in bathroom"
        value={formData.title}
        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Dropdown
          label="Category"
          options={categoryOptions}
          value={formData.category}
          onChange={(val) => setFormData((prev) => ({ ...prev, category: val as ComplaintCategory }))}
        />
        <Dropdown
          label="Urgency Level"
          options={priorityOptions}
          value={formData.priority}
          onChange={(val) => setFormData((prev) => ({ ...prev, priority: val as ComplaintPriority }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Room Number"
          value={formData.room_number}
          onChange={(e) => setFormData((prev) => ({ ...prev, room_number: e.target.value }))}
          required
        />
        <Input
          label="Hostel Block"
          value={formData.block}
          onChange={(e) => setFormData((prev) => ({ ...prev, block: e.target.value }))}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Detailed Description
        </label>
        <textarea
          rows={3}
          className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          placeholder="Describe the defect, location inside room, or timeline..."
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      {/* Anonymous Variant Checkbox */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="pt-0.5">
          <input
            id="is_anonymous"
            type="checkbox"
            checked={formData.is_anonymous}
            onChange={(e) => setFormData((prev) => ({ ...prev, is_anonymous: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <label htmlFor="is_anonymous" className="text-xs cursor-pointer select-none">
          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <EyeOff className="h-3.5 w-3.5 text-indigo-500" />
            Submit Anonymously
          </span>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Hides your name and identity from other residents and public lists (recommended for noise or disciplinary reports).
          </p>
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
          <span>Register Ticket</span>
        </Button>
      </div>
    </form>
  );
}
