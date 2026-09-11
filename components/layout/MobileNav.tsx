"use client";

import React from "react";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { UserRole } from "@/types/auth";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

export function MobileNav({ isOpen, onClose, role }: MobileNavProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 flex max-w-full">
        <div className="relative w-72">
          <Sidebar role={role} className="w-full h-full shadow-2xl" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
