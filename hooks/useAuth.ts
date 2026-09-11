"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserProfile, UserRole } from "@/types/auth";
import { getActiveSession } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const { user: sessionUser, role: sessionRole } = getActiveSession();
      if (sessionUser) {
        setUser(sessionUser);
        setRole(sessionUser.role);
      } else if (sessionRole) {
        setRole(sessionRole);
      }
      setLoading(false);
      return;
    }

    const supabase = createClient();

    async function loadUser() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();

          if (profile) {
            setUser(profile);
            setRole(profile.role);
          } else {
            const fallback: UserProfile = {
              id: authUser.id,
              email: authUser.email || "",
              full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
              role: (authUser.user_metadata?.role as UserRole) || "STUDENT",
            };
            setUser(fallback);
            setRole(fallback.role);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.warn("Auth fetch fallback:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
          setRole(null);
          setLoading(false);
        } else {
          loadUser();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading, isAuthenticated: !!user };
}
