import React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function StudentNotificationsPage() {
  const notifications = [
    {
      id: "1",
      title: "Leave Request Approved",
      message: "Your outing request for Sept 12 has been approved by Chief Warden.",
      type: "SUCCESS",
      time: "10 mins ago",
    },
    {
      id: "2",
      title: "Parcel Received at Desk",
      message: "Amazon parcel ready for pickup with OTP 4821.",
      type: "INFO",
      time: "1 hour ago",
    },
    {
      id: "3",
      title: "Wi-Fi Maintenance Tonight",
      message: "Network upgrades scheduled on Block A between 01:00 AM - 03:00 AM.",
      type: "ALERT",
      time: "3 hours ago",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-600" />
            <span>Notification Feed</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates regarding your leaves, complaints, and campus notices.
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          <CheckCheck className="h-3.5 w-3.5" />
          <span>Mark All As Read</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</span>
                  <Badge variant={n.type === "SUCCESS" ? "success" : n.type === "ALERT" ? "warning" : "default"} className="text-[10px]">
                    {n.type}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
                <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
