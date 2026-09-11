import Link from "next/link";
import { GraduationCap, ShieldCheck, ArrowRight, Building2, UserPlus } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white relative">
      <div className="relative z-10 max-w-2xl text-center space-y-6 py-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
          <Building2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>Campus Residence Management • Official Launch Edition</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          HostelConnect
          <span className="block text-2xl sm:text-3xl font-semibold text-indigo-400 mt-2">
            Campus Residence Portal
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          Integrated residential operations connecting students and wardens. Submit leave applications, file room maintenance tickets, view weekly mess timetables, and track parcel deliveries.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
          >
            <UserPlus className="h-4 w-4 text-indigo-400" />
            <span>New Resident Registration</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-left">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>Resident Services</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Check daily meal menus, submit digital leave passes, raise room repair complaints, and retrieve parcel pickup OTPs.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Warden Administration</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Publish weekly mess menus, review digital leave applications in real time, oversee medical alerts, and broadcast campus notices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
