"use client";

import React from "react";
import { Sparkles, Clock, UtensilsCrossed, ShieldAlert, Package, BookOpen } from "lucide-react";
import { ChatWindow } from "@/components/ai/ChatWindow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function StudentAIPage() {
  const knowledgeHighlights = [
    {
      title: "Gate Curfew",
      desc: "10:00 PM weekdays • 10:30 PM weekends",
      icon: Clock,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/60",
    },
    {
      title: "Central Mess",
      desc: "Breakfast 07:30 • Lunch 12:30 • Dinner 19:30",
      icon: UtensilsCrossed,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60",
    },
    {
      title: "Campus Ambulance",
      desc: "+91 99887 76655 • 24/7 on-call dispatch",
      icon: ShieldAlert,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/60",
    },
    {
      title: "Security Counter",
      desc: "Parcel pickup with OTP: 09:00 AM - 09:00 PM",
      icon: Package,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/60",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-600" />
              <span>Hostel AI Assistant</span>
            </h1>
            <Badge variant="default" className="text-[10px]">
              ai_knowledge Module
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Instant guidance on campus policies, dining timetables, medical protocols, and gate rules. Isolated from private records.
          </p>
        </div>
      </div>

      {/* Grid: Quick Knowledge Highlights + Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Quick Info Cards */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Verified Guidelines
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {knowledgeHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="p-4 space-y-2 border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </Card>
              );
            })}
          </div>

          <Card className="p-4 bg-slate-900 text-white border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <BookOpen className="h-4 w-4" />
              <span>Privacy Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This assistant strictly accesses public regulations in <code className="text-indigo-300 font-mono text-[10px]">ai_knowledge</code>. Personal tickets and confidential files are never exposed.
            </p>
          </Card>
        </div>

        {/* Right Column: Chat Window Component */}
        <div className="lg:col-span-3">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
