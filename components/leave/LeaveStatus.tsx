import React from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { LeaveStatus as LeaveStatusType } from "@/types/leave";
import { cn } from "@/lib/utils";

interface LeaveStatusProps {
  status: LeaveStatusType;
  remarks?: string | null;
  className?: string;
  showIcon?: boolean;
}

export function LeaveStatus({
  status,
  remarks,
  className,
  showIcon = true,
}: LeaveStatusProps) {
  const config = {
    PENDING: {
      label: "Pending Verification",
      icon: Clock,
      badgeStyle: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
      iconStyle: "text-amber-600 animate-spin",
    },
    APPROVED: {
      label: "Gate Pass Active",
      icon: CheckCircle2,
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      iconStyle: "text-emerald-600",
    },
    REJECTED: {
      label: "Request Rejected",
      icon: XCircle,
      badgeStyle: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
      iconStyle: "text-rose-600",
    },
    CANCELLED: {
      label: "Cancelled",
      icon: AlertCircle,
      badgeStyle: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      iconStyle: "text-slate-500",
    },
  };

  const item = config[status] || config.PENDING;
  const Icon = item.icon;

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold select-none",
          item.badgeStyle
        )}
      >
        {showIcon && <Icon className={cn("h-3.5 w-3.5 shrink-0", item.iconStyle)} />}
        <span>{item.label}</span>
      </div>
      {remarks && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
          {remarks}
        </span>
      )}
    </div>
  );
}
