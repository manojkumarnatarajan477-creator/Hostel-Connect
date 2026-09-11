"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HelpCircle, Plus, RefreshCw, CheckCircle2, Clock, MapPin, Tag, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { LostFoundItem } from "@/types/request";
import { useAuth } from "@/hooks/useAuth";

export default function StudentRequestsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    item_type: "LOST" as "LOST" | "FOUND",
    category: "Electronics",
    location: "",
    description: "",
    contact_info: user?.full_name ? `${user.full_name} • ${user.room_number || "Room Assigned"}` : "",
  });

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/requests?type=lost_found");
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data);
      }
    } catch (err) {
      console.warn("Student requests fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 4000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests?type=lost_found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFormData({
          title: "",
          item_type: "LOST",
          category: "Electronics",
          location: "",
          description: "",
          contact_info: user?.full_name ? `${user.full_name} • ${user.room_number || "Room Assigned"}` : "",
        });
        fetchItems();
      }
    } catch (err) {
      console.warn("Post lost/found item error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await fetch("/api/requests?type=lost_found", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "CLAIMED" }),
      });
      fetchItems();
    } catch (err) {
      console.warn("Claim item error:", err);
    }
  };

  const filtered = items.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "LOST" || filter === "FOUND") return item.item_type === filter;
    return item.status === filter;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-600" />
            <span>Campus Lost & Found Bulletin Board</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Report lost possessions or submit items you recovered in campus corridors and study rooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchItems}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Report Item</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "LOST", "FOUND", "OPEN", "CLAIMED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === st
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
            }`}
          >
            {st} ({st === "ALL" ? items.length : items.filter((i) => i.item_type === st || i.status === st).length})
          </button>
        ))}
      </div>

      {/* Bulletin Board List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Notices ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No items reported under filter &quot;{filter}&quot;.
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
                    <Badge variant={item.status === "OPEN" ? "warning" : "default"} className="text-[10px]">
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
                      {item.contact_info}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "OPEN" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleClaim(item.id)}
                      className="text-xs h-8 px-3"
                    >
                      <span>Mark Claimed</span>
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Claimed / Returned</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal to Report Lost/Found Item */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report Lost or Found Item"
        description="Publish a notice on the campus bulletin to help return the article."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Dropdown
            label="Notice Type"
            options={[
              { label: "I Lost an Item (Looking for it)", value: "LOST" },
              { label: "I Found an Item (Safe keeping)", value: "FOUND" },
            ]}
            value={formData.item_type}
            onChange={(val) => setFormData({ ...formData, item_type: val as "LOST" | "FOUND" })}
          />

          <Input
            label="Item Title"
            placeholder="e.g., Blue Titan Smartwatch, Casio fx-991ES, Room Keys"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Dropdown
              label="Category"
              options={[
                { label: "Electronics & Gadgets", value: "Electronics" },
                { label: "ID Cards / Wallet / Keys", value: "Personal" },
                { label: "Study Materials / Books", value: "Study Material" },
                { label: "Clothing / Bags", value: "Clothing" },
                { label: "Other Items", value: "Other" },
              ]}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
            />

            <Input
              label="Approx. Location"
              placeholder="e.g., Reading Room, Mess Hall, Court 2"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description & Identifying Marks
            </label>
            <textarea
              rows={3}
              placeholder="Color, brand, special stickers, condition..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="flex w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              required
            />
          </div>

          <Input
            label="Contact Info / Safe Location"
            value={formData.contact_info}
            onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Post Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
