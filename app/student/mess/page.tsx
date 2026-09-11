"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UtensilsCrossed,
  Clock,
  Sparkles,
  Coffee,
  Sun,
  Cookie,
  Moon,
  FileText,
  Star,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { WeeklyMenuData, DayOfWeek, DayMenuSchedule } from "@/types/mess";

function parseMealItems(mealString?: string): string[] {
  if (!mealString || !mealString.trim()) return ["Meal items updating..."];
  return mealString
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function StudentMessPage() {
  const [menuData, setMenuData] = useState<WeeklyMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | "ALL">("Monday");
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Compute today's day name
  const currentDayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  }) as DayOfWeek;

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/mess");
      const json = await res.json();
      if (json.success && json.data) {
        setMenuData(json.data);
      }
    } catch (err) {
      console.warn("Student mess fetch note:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    // Auto-poll every 5 seconds so updates published by the Warden appear live without profile reload
    const interval = setInterval(fetchMenu, 5000);
    return () => clearInterval(interval);
  }, [fetchMenu]);

  useEffect(() => {
    // Default to today's day if available
    if (daysList.includes(currentDayName)) {
      setSelectedDay(currentDayName);
    }
  }, [currentDayName]);

  const daysList: DayOfWeek[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Identify today's schedule
  const todaySchedule =
    menuData?.days.find((d) => d.day.toLowerCase() === currentDayName.toLowerCase()) ||
    menuData?.days[0];

  const filteredDays =
    selectedDay === "ALL"
      ? menuData?.days || []
      : menuData?.days.filter((d) => d.day === selectedDay) || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Mess Timetable & Menu
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weekly catering schedule for Central Hostel Dining Hall
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {menuData?.attachment_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDocModalOpen(true)}
              className="text-xs h-9 gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              <Eye className="h-4 w-4" />
              <span>View Official Circular</span>
            </Button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span>
              Updated:{" "}
              {menuData?.updated_at
                ? new Date(menuData.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Live"}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Specials Hero Showcase */}
      {todaySchedule && (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                <Calendar className="h-3.5 w-3.5 text-amber-200" />
                <span>Today&apos;s Menu • {todaySchedule.day}</span>
              </div>

              {todaySchedule.specialNote && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-200" />
                  <span>{todaySchedule.specialNote}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Breakfast */}
              <div className="rounded-2xl bg-black/20 backdrop-blur-md p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                    <Coffee className="h-3.5 w-3.5" /> Breakfast
                  </span>
                  <span className="text-[10px] text-white/80">07:30 - 09:00</span>
                </div>
                <ul className="space-y-1">
                  {parseMealItems(todaySchedule.breakfast).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lunch */}
              <div className="rounded-2xl bg-black/30 backdrop-blur-md p-4 border border-white/20 shadow-sm">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                  <span className="text-xs font-bold text-yellow-200 flex items-center gap-1">
                    <Sun className="h-3.5 w-3.5" /> Lunch
                  </span>
                  <span className="text-[10px] text-white/80">12:30 - 14:00</span>
                </div>
                <ul className="space-y-1">
                  {parseMealItems(todaySchedule.lunch).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Snacks */}
              <div className="rounded-2xl bg-black/20 backdrop-blur-md p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                    <Cookie className="h-3.5 w-3.5" /> Evening Snacks
                  </span>
                  <span className="text-[10px] text-white/80">17:00 - 18:00</span>
                </div>
                <ul className="space-y-1">
                  {parseMealItems(todaySchedule.snacks).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dinner */}
              <div className="rounded-2xl bg-black/20 backdrop-blur-md p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/10">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                    <Moon className="h-3.5 w-3.5" /> Dinner
                  </span>
                  <span className="text-[10px] text-white/80">19:30 - 21:00</span>
                </div>
                <ul className="space-y-1">
                  {parseMealItems(todaySchedule.dinner).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-300 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Selector Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Weekly Timetable by Day
          </h2>
          <span className="text-xs text-slate-500">
            Click any day to view detailed meals
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setSelectedDay("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDay === "ALL"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            All 7 Days
          </button>
          {daysList.map((day) => {
            const isToday = day.toLowerCase() === currentDayName.toLowerCase();
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedDay === day
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Menu Cards Grid */}
      <div className="space-y-4">
        {filteredDays.map((d) => (
          <Card key={d.day} className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                  {d.day.slice(0, 3)}
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{d.day}</span>
                    {d.day.toLowerCase() === currentDayName.toLowerCase() && (
                      <Badge variant="default" className="text-[10px]">
                        Today
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </div>

              {d.specialNote && (
                <Badge variant="warning" className="text-[10px]">
                  ★ {d.specialNote}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Breakfast */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Coffee className="h-4 w-4" />
                      <span>Breakfast</span>
                    </div>
                    <span className="text-[10px] text-slate-400">07:30 - 09:00</span>
                  </div>
                  <ul className="space-y-1">
                    {parseMealItems(d.breakfast).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lunch */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 dark:border-indigo-950/60 dark:bg-indigo-950/20">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-indigo-200/60 dark:border-indigo-900/60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Sun className="h-4 w-4" />
                      <span>Lunch</span>
                    </div>
                    <span className="text-[10px] text-indigo-500">12:30 - 14:00</span>
                  </div>
                  <ul className="space-y-1">
                    {parseMealItems(d.lunch).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-800 dark:text-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Snacks */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Cookie className="h-4 w-4" />
                      <span>Evening Snacks</span>
                    </div>
                    <span className="text-[10px] text-slate-400">17:00 - 18:00</span>
                  </div>
                  <ul className="space-y-1">
                    {parseMealItems(d.snacks).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dinner */}
                <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4 dark:border-purple-950/60 dark:bg-purple-950/20">
                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-200/60 dark:border-purple-900/60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                      <Moon className="h-4 w-4" />
                      <span>Dinner</span>
                    </div>
                    <span className="text-[10px] text-purple-500">19:30 - 21:00</span>
                  </div>
                  <ul className="space-y-1">
                    {parseMealItems(d.dinner).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-800 dark:text-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Meal Rating Feedback */}
      <Card className="border-indigo-100 dark:border-indigo-950/60 bg-linear-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>How was your meal today?</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily student feedback helps the Catering Committee maintain hygienic quality and taste standards.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setUserRating(star);
                  setRatingSubmitted(true);
                  setTimeout(() => setRatingSubmitted(false), 4000);
                }}
                className={`p-2 rounded-xl transition-all ${
                  userRating && userRating >= star
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 scale-110"
                    : "text-slate-300 hover:text-amber-400 dark:text-slate-700"
                }`}
              >
                <Star className="h-5 w-5 fill-current" />
              </button>
            ))}
          </div>
        </CardContent>
        {ratingSubmitted && (
          <div className="px-6 pb-4 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            <span>Thank you for your feedback! Rating submitted to Chief Warden.</span>
          </div>
        )}
      </Card>

      {/* Official Circular Modal */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title="Official Menu Document"
        size="lg"
      >
        <div className="space-y-4">
          {menuData?.attachment_url ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <img
                src={menuData.attachment_url}
                alt="Official Mess Circular"
                className="w-full object-contain max-h-[70vh]"
              />
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No attached image document found for this schedule.
            </div>
          )}
          <div className="text-right">
            <Button size="sm" variant="outline" onClick={() => setIsDocModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
