import React from "react";
import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple";
  badge?: string;
}

export function QuickAction({
  title,
  description,
  href,
  icon: Icon,
  color = "indigo",
  badge,
}: QuickActionProps) {
  const iconColorStyles = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white",
  };

  return (
    <Link
      href={href}
      className="group relative flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 active:scale-[0.99]"
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
          iconColorStyles[color]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h4>
          {badge && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
          {description}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 self-center text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-indigo-500 dark:text-slate-600" />
    </Link>
  );
}
