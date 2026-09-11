"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function WardenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <RoleGuard allowedRole="WARDEN">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* Desktop Sidebar */}
        <Sidebar role="WARDEN" className="hidden lg:flex shrink-0" />

        {/* Mobile Drawer */}
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          role="WARDEN"
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Navbar
            role="WARDEN"
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
