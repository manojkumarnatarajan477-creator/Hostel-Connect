"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { ShieldAlert, Loader2 } from "lucide-react";

interface RoleGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { role, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // If unauthenticated, redirect to login
    if (!role) {
      router.replace("/login");
      return;
    }

    // If role mismatch:
    if (role !== allowedRole) {
      if (role === "STUDENT" && allowedRole === "WARDEN") {
        console.warn("Restricted access: Student redirected away from warden console.");
        router.replace("/student/dashboard");
      } else if (role === "WARDEN" && allowedRole === "STUDENT") {
        console.warn("Restricted access: Warden redirected away from student portal.");
        router.replace("/warden/dashboard");
      }
    }
  }, [role, loading, allowedRole, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // If role is mismatched, show brief security transition state
  if (role && role !== allowedRole) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/60 dark:bg-amber-950/40">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 mb-3">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-amber-900 dark:text-amber-100">
            Role Authorization Required
          </h2>
          <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
            This area is restricted to {allowedRole.toLowerCase()} accounts. Redirecting you to your designated portal...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
