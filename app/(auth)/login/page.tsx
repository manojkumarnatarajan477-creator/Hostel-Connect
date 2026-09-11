"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Home,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { setActiveSession } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  // Mode: "signin" for returning users, "register" for first-time onboarding
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");

  // Sign In state
  const [signinIdentifier, setSigninIdentifier] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  // Registration state
  const [regRole, setRegRole] = useState<"STUDENT" | "WARDEN">("STUDENT");
  const [regFullName, setRegFullName] = useState("");
  const [regRoomNumber, setRegRoomNumber] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle Returning User Sign In (Supports both Students & Wardens)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!signinIdentifier.trim()) {
      setErrorMessage("Please enter your registered Email ID or Staff/Student ID.");
      return;
    }

    if (!signinPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // 1. If Supabase Auth is configured, attempt Supabase authentication
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: signinIdentifier.includes("@")
            ? signinIdentifier.trim()
            : `${signinIdentifier.trim()}@campus.edu`,
          password: signinPassword,
        });

        if (error) {
          console.warn("Supabase auth notice:", error.message);
        }

        if (data?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          const resolvedUser = {
            id: data.user.id,
            email: data.user.email || signinIdentifier,
            full_name: profile?.full_name || data.user.user_metadata?.full_name || "Resident",
            room_number: profile?.room_number || "Room 204",
            block: profile?.block || "Block A",
            role: profile?.role || "STUDENT",
            created_at: data.user.created_at,
          };

          setActiveSession(resolvedUser);
          if (resolvedUser.role === "WARDEN") {
            router.push("/warden/dashboard");
          } else {
            router.push("/student/dashboard");
          }
          return;
        }
      }

      // 2. Query persistent server auth API
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: signinIdentifier.trim(),
          password: signinPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.notRegistered) {
          setErrorMessage(
            "Account not found. If this is your first time logging in, please select 'First-Time Registration' above."
          );
        } else {
          setErrorMessage(json.error || "Invalid credentials. Please verify and try again.");
        }
        return;
      }

      const user = json.data;
      setActiveSession(user);

      // Automatic redirection based strictly on authenticated user's account role
      if (user.role === "WARDEN") {
        router.push("/warden/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setErrorMessage("Unable to connect to the authentication service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle First-Time User Registration (Student or Warden)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!regFullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!regRoomNumber.trim()) {
      setErrorMessage(
        regRole === "STUDENT"
          ? "Please enter your assigned room number (e.g. 204 or Block B-312)."
          : "Please enter your office location or assigned block (e.g. Office A-G01)."
      );
      return;
    }

    if (!regEmail.trim() || !regEmail.includes("@")) {
      setErrorMessage("Please provide a valid institutional Email ID.");
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: regFullName.trim(),
          room_number: regRoomNumber.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Failed to register account.");
        return;
      }

      const registeredUser = json.data;
      setActiveSession(registeredUser);
      setSuccessMessage(
        registeredUser.role === "WARDEN"
          ? "Warden account created! Redirecting to Warden Console..."
          : "Student account created! Redirecting to Resident Dashboard..."
      );

      setTimeout(() => {
        if (registeredUser.role === "WARDEN") {
          router.push("/warden/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }, 600);
    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorMessage("Network error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative transition-colors">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xl transition-colors">
        {/* Brand Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg shadow-md shadow-indigo-600/30">
            HC
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            HostelConnect
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official Campus Residence Portal
          </p>
        </div>

        {/* Tab Switcher: Sign In vs First-Time Registration */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 mb-5 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode("signin");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authMode === "signin"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("register");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              authMode === "register"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            First-Time Registration
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM (Both Student & Warden) */}
        {authMode === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <Input
              label="Email ID or Staff/Student ID"
              type="text"
              placeholder="e.g. resident@campus.edu or warden@campus.edu"
              value={signinIdentifier}
              onChange={(e) => {
                setSigninIdentifier(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              leftIcon={<Mail className="h-4 w-4" />}
              className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={signinPassword}
              onChange={(e) => {
                setSigninPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              className="bg-slate-950/60 border-slate-800 text-white"
              required
            />

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 mt-2"
              isLoading={loading}
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-400 text-center">
              Student accounts redirect to the Resident Portal. Warden accounts redirect to the Warden Operations Console.
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setErrorMessage("");
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                New user? Register as Student or Warden &rarr;
              </button>
            </div>
          </form>
        ) : (
          /* 2. FIRST-TIME REGISTRATION FORM (Student OR Warden) */
          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Role Selection Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegRole("STUDENT");
                    setErrorMessage("");
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    regRole === "STUDENT"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Student Resident</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegRole("WARDEN");
                    setErrorMessage("");
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    regRole === "WARDEN"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Hostel Warden</span>
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200">
              {regRole === "STUDENT"
                ? "Register your room details to create your verified student resident profile."
                : "Register staff credentials to access the Chief Warden management operations console."}
            </div>

            <Input
              label={regRole === "STUDENT" ? "Full Name" : "Warden / Staff Full Name"}
              type="text"
              placeholder={regRole === "STUDENT" ? "e.g. Ananya Verma" : "e.g. Dr. K. Raman"}
              value={regFullName}
              onChange={(e) => {
                setRegFullName(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              leftIcon={<User className="h-4 w-4" />}
              className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
              required
            />

            <Input
              label={
                regRole === "STUDENT"
                  ? "Assigned Room Number"
                  : "Office Room / Assigned Block"
              }
              type="text"
              placeholder={
                regRole === "STUDENT"
                  ? "e.g. 204 or Block B-312"
                  : "e.g. Warden Office A-G01 or Block A & B"
              }
              value={regRoomNumber}
              onChange={(e) => {
                setRegRoomNumber(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              leftIcon={<Home className="h-4 w-4" />}
              className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
              required
            />

            <Input
              label={regRole === "STUDENT" ? "Student Email ID" : "Official Warden Email ID"}
              type="email"
              placeholder={
                regRole === "STUDENT"
                  ? "e.g. student@campus.edu"
                  : "e.g. warden@campus.edu or staff.warden@campus.edu"
              }
              value={regEmail}
              onChange={(e) => {
                setRegEmail(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              leftIcon={<Mail className="h-4 w-4" />}
              className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
              required
            />

            <Input
              label="Create Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={regPassword}
              onChange={(e) => {
                setRegPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              className="bg-slate-950/60 border-slate-800 text-white"
              required
            />

            <Button
              type="submit"
              className="w-full h-10 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 mt-2"
              isLoading={loading}
            >
              <span>
                {regRole === "STUDENT"
                  ? "Create Resident Account & Enter"
                  : "Create Warden Account & Enter"}
              </span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setErrorMessage("");
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Already registered? Sign in here &rarr;
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
