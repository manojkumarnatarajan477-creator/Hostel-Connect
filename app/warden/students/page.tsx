"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ResidentRecord {
  name: string;
  roll: string;
  room: string;
  block: string;
  course: string;
  phone: string;
  status: string;
}

const DEFAULT_ROSTER: ResidentRecord[] = [
  { name: "Pooja Iyer", roll: "23BME1002", room: "218", block: "Block A", course: "B.Tech Mechanical", phone: "+91 98222 33445", status: "In Campus" },
  { name: "Siddharth N.", roll: "21BCS1099", room: "302", block: "Block A", course: "B.Tech Computer Science", phone: "+91 98333 44556", status: "In Campus" },
  { name: "Divya Krishnan", roll: "22BEC1045", room: "114", block: "Block B", course: "B.Tech Electronics", phone: "+91 98444 55667", status: "Outing Approved" },
  { name: "Vikramaditya S.", roll: "22BCS1180", room: "312", block: "Block B", course: "B.Tech IT", phone: "+91 98111 22334", status: "In Campus" },
];

export default function WardenStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<ResidentRecord[]>(DEFAULT_ROSTER);

  const loadRegisteredStudents = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("hc_registered_users");
      if (stored) {
        const users = JSON.parse(stored);
        const registeredResidents: ResidentRecord[] = users
          .filter((u: any) => u.role === "STUDENT")
          .map((u: any) => ({
            name: u.full_name,
            roll: u.email.split("@")[0].toUpperCase(),
            room: u.room_number || "Room 204",
            block: u.block || "Block A",
            course: "B.Tech Engineering",
            phone: u.email,
            status: "In Campus",
          }));

        if (registeredResidents.length > 0) {
          // Merge avoiding duplicates by roll
          const combined = [...registeredResidents];
          for (const def of DEFAULT_ROSTER) {
            if (!combined.some((c) => c.roll === def.roll || c.name === def.name)) {
              combined.push(def);
            }
          }
          setStudents(combined);
          return;
        }
      }
    } catch (e) {
      console.warn("Error reading registered students:", e);
    }
  };

  useEffect(() => {
    loadRegisteredStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <span>Student Directory & Room Roster</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search student room allocations, institutional email IDs, and enrollment details.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadRegisteredStudents}
          className="text-xs h-9 gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Roster</span>
        </Button>
      </div>

      <div className="w-full sm:w-80">
        <Input
          placeholder="Search by student name, roll number, or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          className="h-9 text-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Registered Residents ({students.length} Total)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="p-3.5 font-semibold">Student Name</th>
                <th className="p-3.5 font-semibold">Student ID / Roll</th>
                <th className="p-3.5 font-semibold">Room & Block</th>
                <th className="p-3.5 font-semibold">Degree Program</th>
                <th className="p-3.5 font-semibold">Contact / Email</th>
                <th className="p-3.5 font-semibold">Campus Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s) => (
                <tr key={s.roll} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{s.name}</td>
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{s.roll}</td>
                  <td className="p-3.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {s.room} • {s.block}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{s.course}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{s.phone}</td>
                  <td className="p-3.5">
                    <Badge variant={s.status === "In Campus" ? "success" : "warning"} className="text-[10px]">
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
