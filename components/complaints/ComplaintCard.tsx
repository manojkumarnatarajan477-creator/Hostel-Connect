import React from "react";
import { EyeOff, MapPin, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ComplaintStatus } from "./ComplaintStatus";
import { Complaint } from "@/types/complaint";

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-sm font-bold">{complaint.title}</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {complaint.category}
            </Badge>
            <Badge
              variant={
                complaint.priority === "EMERGENCY"
                  ? "danger"
                  : complaint.priority === "HIGH"
                  ? "warning"
                  : "secondary"
              }
              className="text-[10px]"
            >
              {complaint.priority}
            </Badge>
            {complaint.is_anonymous && (
              <span className="inline-flex items-center gap-1 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 text-[10px] font-semibold border border-purple-200 dark:border-purple-800">
                <EyeOff className="h-3 w-3" /> Anonymous
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span>Room {complaint.room_number} • {complaint.block}</span>
            {complaint.student_name && !complaint.is_anonymous && (
              <span>• By: {complaint.student_name}</span>
            )}
          </div>
        </div>

        <ComplaintStatus
          status={complaint.status}
          assignedTo={complaint.assigned_to}
        />
      </CardHeader>

      <CardContent className="pt-0 space-y-2">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {complaint.description}
        </p>

        {complaint.resolution_notes && (
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
            Resolution: {complaint.resolution_notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
