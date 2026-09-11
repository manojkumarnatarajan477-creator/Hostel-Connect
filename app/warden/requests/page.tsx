"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle, Check, RefreshCw, MapPin, Phone, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { LostFoundItem } from "@/types/request";

export default function WardenRequestsPage() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/requests?type=lost_found");
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      }
    } catch (err) {
      console.warn("Warden requests fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 4000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  const handleResolve = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/requests?type=lost_found", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "RESOLVED" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      }
    } catch (err) {
      console.warn("Resolve lost/found error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-600" />
            <span>Student Requests & Lost/Found Oversight</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor reported student lost possessions, articles deposited at reception, and confirm handovers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchItems}
          className="text-xs h-9 gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Board</span>
        </Button>
      </div>

      <div className="w-full sm:w-72">
        <Input
          placeholder="Search items or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          className="h-9 text-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lost & Found Inventory ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No notices on the board currently.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={item.item_type === "LOST" ? "danger" : "success"} className="text-[10px]">
                      {item.item_type}
                    </Badge>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.category}
                    </Badge>
                    <Badge
                      variant={
                        item.status === "RESOLVED"
                          ? "success"
                          : item.status === "CLAIMED"
                          ? "default"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location: {item.location}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                      <Phone className="h-3 w-3" />
                      Contact: {item.contact_info}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== "RESOLVED" ? (
                    <Button
                      size="sm"
                      variant="success"
                      isLoading={actionLoadingId === item.id}
                      onClick={() => handleResolve(item.id)}
                      className="text-xs h-9 px-3 gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirm Return</span>
                    </Button>
                  ) : (
                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      <span>Closed</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
