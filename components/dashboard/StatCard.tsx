import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "success" | "warning" | "danger";
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple" | "blue";
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = "default",
  color = "indigo",
  onClick,
  className,
}: StatCardProps) {
  const colorMap = {
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md",
        onClick && "cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-[0.99]",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {value}
              </h4>
              {badgeText && (
                <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shrink-0", colorMap[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
