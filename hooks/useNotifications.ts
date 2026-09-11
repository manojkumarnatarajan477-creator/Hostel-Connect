"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "INFO" | "ALERT" | "SUCCESS" | "WARNING";
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    if (!isSupabaseConfigured()) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setNotifications(data.data);
            setUnreadCount(data.data.filter((n: NotificationItem) => !n.is_read).length);
          }
        })
        .catch((err) => {
          console.warn("Notification fallback fetch:", err);
        });
      return;
    }

    const supabase = createClient();

    async function fetchNotifications() {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setNotifications(data as NotificationItem[]);
          setUnreadCount(data.filter((n: NotificationItem) => !n.is_read).length);
        }
      } catch (err) {
        console.warn("Notifications error:", err);
      }
    }

    fetchNotifications();

    // Subscribe to realtime updates if available
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationItem, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { notifications, unreadCount };
}
