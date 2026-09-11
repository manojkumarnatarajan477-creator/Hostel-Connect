import React from "react";
import { Megaphone, Pin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category?: string;
  is_pinned?: boolean;
  created_at?: string;
  target_block?: string;
}

export interface AnnouncementCardProps {
  announcements: AnnouncementItem[];
  className?: string;
}

export function AnnouncementCard({
  announcements,
  className,
}: AnnouncementCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Megaphone className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Official Announcements
          </h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          Live Broadcast
        </Badge>
      </div>

      <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
        {announcements.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No announcements broadcasted today.
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className="p-5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.is_pinned && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    {item.category && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {item.created_at && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{item.created_at}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
