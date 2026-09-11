"use client";

import { useAuth } from "./useAuth";

export function useUser() {
  const { user, role, loading } = useAuth();

  return {
    user,
    role,
    loading,
    isStudent: role === "STUDENT",
    isWarden: role === "WARDEN",
  };
}
