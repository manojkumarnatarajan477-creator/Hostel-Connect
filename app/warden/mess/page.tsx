"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UtensilsCrossed,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Eye,
  Calendar,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Edit3,
  X,
  FileUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { WeeklyMenuData, DayMenuSchedule, DayOfWeek } from "@/types/mess";

export default function WardenMessPage() {
  const [menuData, setMenuData] = useState<WeeklyMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | "ALL">("Monday");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"FILE_UPLOAD" | "MANUAL_ENTRY">("FILE_UPLOAD");

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const [menuTitle, setMenuTitle] = useState("");
  const [menuNotes, setMenuNotes] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual entry state
  const [manualDay, setManualDay] = useState<DayOfWeek>("Monday");
  const [manualMeals, setManualMeals] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/mess");
      const json = await res.json();
      if (json.success && json.data) {
        setMenuData(json.data);
      }
    } catch (err) {
      console.warn("Warden mess fetch note:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // When opening manual edit for a specific day
  const handleOpenDayEdit = (daySchedule: DayMenuSchedule) => {
    setManualDay(daySchedule.day);
    setManualMeals({
      breakfast: daySchedule.breakfast,
      lunch: daySchedule.lunch,
      snacks: daySchedule.snacks,
      dinner: daySchedule.dinner,
    });
    setActiveTab("MANUAL_ENTRY");
    setIsUploadModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        url: reader.result as string,
        type: file.type,
      });
      if (!menuTitle) {
        setMenuTitle(`Hostel Mess Menu (${file.name.replace(/\.[^/.]+$/, "")})`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenConfirm = () => {
    if (activeTab === "FILE_UPLOAD" && !uploadedFile) {
      alert("Please select an image or PDF file to upload first.");
      return;
    }
    if (activeTab === "MANUAL_ENTRY" && !manualMeals.lunch && !manualMeals.dinner) {
      alert("Please enter at least lunch or dinner items.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmPublish = async () => {
    setIsSubmitting(true);
    try {
      let payload: any = {
        title: menuTitle || menuData?.title || "Hostel Academic Mess Menu",
        notes: menuNotes || menuData?.notes,
        source: activeTab === "FILE_UPLOAD" ? "PDF_UPLOAD" : "MANUAL_ENTRY",
        updated_by: "Chief Warden Office",
      };

      if (activeTab === "FILE_UPLOAD" && uploadedFile) {
        payload.attachment_name = uploadedFile.name;
        payload.attachment_url = uploadedFile.url;
      } else if (activeTab === "MANUAL_ENTRY") {
        payload.dayToUpdate = manualDay;
        payload.meals = manualMeals;
      }

      const res = await fetch("/api/mess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMenuData(json.data);
        setIsConfirmOpen(false);
        setIsUploadModalOpen(false);
        setUploadedFile(null);
        setToastMessage("Mess menu successfully updated! Students will now see the latest schedule.");
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        alert("Failed to update menu: " + json.error);
      }
    } catch (err) {
      console.warn("Publish menu error:", err);
      alert("An unexpected error occurred while saving the menu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysList: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const filteredDays =
    selectedDay === "ALL"
      ? menuData?.days || []
      : menuData?.days.filter((d) => d.day === selectedDay) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Mess Menu & Catering Oversight
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official weekly dining hall timetable • Published to all student portals
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMenu}
            className="text-xs h-9 gap-1.5"
            title="Refresh menu data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>

          <Button
            onClick={() => {
              setMenuTitle(menuData?.title || "");
              setMenuNotes(menuData?.notes || "");
              setIsUploadModalOpen(true);
            }}
            className="text-xs h-9 gap-2 bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-md shadow-indigo-600/20"
          >
            <Upload className="h-4 w-4" />
            <span>Upload / Update Menu</span>
          </Button>
        </div>
      </div>

      {/* Current Menu Status Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default" className="text-[10px] bg-indigo-600">
                Active Weekly Menu
              </Badge>
              {menuData?.source && (
                <Badge variant="outline" className="text-[10px]">
                  {menuData.source === "PDF_UPLOAD" ? "PDF Document Verified" : "Direct Entry"}
                </Badge>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {menuData?.title || "Academic Hostel Weekly Menu"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Last Updated:{" "}
                {menuData?.updated_at
                  ? new Date(menuData.updated_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Just now"}
              </span>
              <span>• Updated by: {menuData?.updated_by || "Chief Warden"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {menuData?.attachment_name && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="truncate max-w-[160px]">{menuData.attachment_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        <button
          onClick={() => setSelectedDay("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedDay === "ALL"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          View Full Week
        </button>
        {daysList.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDay === day
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Day Schedule Cards */}
      <div className="space-y-4">
        {filteredDays.map((dayItem) => (
          <Card key={dayItem.day} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                  {dayItem.day.slice(0, 3)}
                </div>
                <div>
                  <CardTitle className="text-base">{dayItem.day}&apos;s Meal Schedule</CardTitle>
                  {dayItem.specialNote && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      ★ {dayItem.specialNote}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDayEdit(dayItem)}
                className="text-xs h-8 gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Day</span>
              </Button>
            </CardHeader>

            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Breakfast */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Coffee className="h-4 w-4" />
                      <span>Breakfast</span>
                    </div>
                    <span className="text-[10px] text-slate-400">07:30 - 09:00</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {dayItem.breakfast}
                  </p>
                </div>

                {/* Lunch */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 dark:border-indigo-950/60 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Sun className="h-4 w-4" />
                      <span>Lunch</span>
                    </div>
                    <span className="text-[10px] text-indigo-500">12:30 - 14:00</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {dayItem.lunch}
                  </p>
                </div>

                {/* Snacks */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Cookie className="h-4 w-4" />
                      <span>Evening Snacks</span>
                    </div>
                    <span className="text-[10px] text-slate-400">17:00 - 18:00</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {dayItem.snacks}
                  </p>
                </div>

                {/* Dinner */}
                <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4 dark:border-purple-950/60 dark:bg-purple-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                      <Moon className="h-4 w-4" />
                      <span>Dinner</span>
                    </div>
                    <span className="text-[10px] text-purple-500">19:30 - 21:00</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {dayItem.dinner}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload & Update Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload or Update Mess Menu"
        size="lg"
      >
        <div className="space-y-5">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("FILE_UPLOAD")}
              className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "FILE_UPLOAD"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <FileUp className="h-4 w-4" />
              <span>Upload Image / PDF Menu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("MANUAL_ENTRY")}
              className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === "MANUAL_ENTRY"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <Edit3 className="h-4 w-4" />
              <span>Day-by-Day Meal Editor</span>
            </button>
          </div>

          {/* Mode 1: File Upload */}
          {activeTab === "FILE_UPLOAD" && (
            <div className="space-y-4">
              <Input
                label="Menu Title / Academic Cycle"
                value={menuTitle}
                onChange={(e) => setMenuTitle(e.target.value)}
                placeholder="e.g. Saveetha Academic Hostel Menu - Current Term"
              />

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  id="menu-file-input"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="menu-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to browse or drop Menu Document / Photo
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports high-resolution JPG, PNG, or PDF circulars
                  </p>
                </label>
              </div>

              {/* Upload Preview if file selected */}
              {uploadedFile && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {uploadedFile.name}
                      </span>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      Ready for Publish
                    </Badge>
                  </div>

                  {uploadedFile.type.startsWith("image/") && (
                    <div className="max-h-48 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <img
                        src={uploadedFile.url}
                        alt="Uploaded Menu Preview"
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <Input
                label="Special Dietary / Sourcing Notes (Optional)"
                value={menuNotes}
                onChange={(e) => setMenuNotes(e.target.value)}
                placeholder="e.g. Pure cow milk served for breakfast; Halal chicken sourced daily."
              />
            </div>
          )}

          {/* Mode 2: Manual Day Editor */}
          {activeTab === "MANUAL_ENTRY" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Day to Edit
                </label>
                <select
                  value={manualDay}
                  onChange={(e) => {
                    const newDay = e.target.value as DayOfWeek;
                    setManualDay(newDay);
                    const found = menuData?.days.find((d) => d.day === newDay);
                    if (found) {
                      setManualMeals({
                        breakfast: found.breakfast,
                        lunch: found.lunch,
                        snacks: found.snacks,
                        dinner: found.dinner,
                      });
                    }
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                >
                  {daysList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ☕ Breakfast Menu (07:30 - 09:00)
                </label>
                <textarea
                  rows={2}
                  value={manualMeals.breakfast}
                  onChange={(e) => setManualMeals({ ...manualMeals, breakfast: e.target.value })}
                  placeholder="e.g. Masala Dosa, Sambar, Coconut Chutney, Tea"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  🍲 Lunch Menu (12:30 - 14:00)
                </label>
                <textarea
                  rows={2}
                  value={manualMeals.lunch}
                  onChange={(e) => setManualMeals({ ...manualMeals, lunch: e.target.value })}
                  placeholder="e.g. Steamed Rice, Paneer Butter Masala, Dal Tadka, Curd"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  🥪 Evening Snacks (17:00 - 18:00)
                </label>
                <textarea
                  rows={2}
                  value={manualMeals.snacks}
                  onChange={(e) => setManualMeals({ ...manualMeals, snacks: e.target.value })}
                  placeholder="e.g. Keerai Bonda, Chai, Coffee"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  🍛 Dinner Menu (19:30 - 21:00)
                </label>
                <textarea
                  rows={2}
                  value={manualMeals.dinner}
                  onChange={(e) => setManualMeals({ ...manualMeals, dinner: e.target.value })}
                  placeholder="e.g. Chappathi, Chicken Chettinad Gravy, Steamed Rice, Rasam"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleOpenConfirm}
              className="bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              <span>Review & Confirm</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Menu Publish"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold">Are you sure you want to update the weekly mess menu?</p>
              <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
                This will immediately overwrite the active dining timetable for all enrolled hostel residents.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p>• Action: {activeTab === "FILE_UPLOAD" ? "Publish uploaded file document" : `Update meals for ${manualDay}`}</p>
            <p>• Operator: Chief Warden Office</p>
            <p>• Live synchronization: Immediate without requiring student reload</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              size="sm"
              isLoading={isSubmitting}
              onClick={handleConfirmPublish}
              className="bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              <span>Confirm & Publish Menu</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
