import React from "react";
import { Clock, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import { ComplaintStatus as ComplaintStatusType } from "@/types/complaint";
import { cn } from "@/lib/utils";

interface ComplaintStatusProps {
  status: ComplaintStatusType;
  assignedTo?: string | null;
  className?: string;
}

export function ComplaintStatus({
  status,
  assignedTo,
  className,
}: ComplaintStatusProps) {
  const config = {
    OPEN: {
      label: "Open / Pending",
      icon: Clock,
      badgeStyle: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
      iconStyle: "text-amber-600",
    },
    IN_PROGRESS: {
      label: "In Progress",
      icon: Wrench,
      badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
      iconStyle: "text-indigo-600 animate-spin",
    },
    RESOLVED: {
      label: "Resolved",
      icon: CheckCircle2,
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      iconStyle: "text-emerald-600",
    },
    CLOSED: {
      label: "Closed",
      icon: AlertCircle,
      badgeStyle: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      iconStyle: "text-slate-500",
    },
  };

  const item = config[status] || config.OPEN;
  const Icon = item.icon;

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold select-none",
          item.badgeStyle
        )}
      >
        <Icon className={cn("h-3.5 w-3.5 shrink-0", item.iconStyle)} />
        <span>{item.label}</span>
      </div>
      {assignedTo && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
          Tech: {assignedTo}
        </span>
      )}
    </div>
  );
}
