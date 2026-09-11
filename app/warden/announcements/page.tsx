"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Pin,
  Search,
  CheckCircle2,
  RefreshCw,
  Building2,
  Clock,
  User,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { AnnouncementItem } from "@/types/announcement";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  "ALL",
  "General Notice",
  "Maintenance",
  "Curfew & Security",
  "Mess Committee",
  "Health & Medical",
  "Academic & Events",
];

export default function WardenAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General Notice");
  const [targetBlock, setTargetBlock] = useState("All Blocks");
  const [isPinned, setIsPinned] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAnnouncements(json.data);
        }
      }
    } catch (err) {
      console.warn("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 5000);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          target_block: targetBlock,
          is_pinned: isPinned,
          author_name: user?.full_name || "Chief Warden",
          author_id: user?.id || "warden-admin",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnnouncements((prev) => [json.data, ...prev.filter((a) => a.id !== json.data.id)]);
        setIsModalOpen(false);
        setTitle("");
        setContent("");
        setIsPinned(false);
        setStatusMessage("Official announcement published and saved to memory!");
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        alert(json.error || "Failed to publish notice");
      }
    } catch (err) {
      console.error("Create notice error:", err);
      alert("Network error publishing notice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice? It will be removed from all student dashboards.")) {
      return;
    }

    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setStatusMessage("Notice removed successfully.");
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        alert(json.error || "Failed to delete notice");
      }
    } catch (err) {
      console.error("Delete notice error:", err);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" ||
        a.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [announcements, searchQuery, selectedCategory]);

  const pinnedCount = announcements.filter((a) => a.is_pinned).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner / Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-indigo-600" />
            <span>Broadcast Announcements Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish official circulars and notices stored in memory across all resident dashboards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAnnouncements}
            className="text-xs h-9 gap-1"
            title="Refresh feed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-500 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Notice</span>
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Circulars</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{announcements.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Pinned Notices</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{pinnedCount}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Active Audience</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">All Residents</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search circulars by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat === "ALL" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Official Published Notices</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredAnnouncements.length} of {announcements.length} notices
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading circulars...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Megaphone className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No announcements found
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || selectedCategory !== "ALL"
                  ? "Try resetting your filter or search keyword."
                  : "Click 'Publish Notice' above to broadcast your first announcement to students."}
              </p>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {ann.title}
                    </span>
                    {ann.is_pinned && (
                      <Badge variant="default" className="text-[10px] py-0.5 bg-indigo-600 text-white flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        <span>PINNED</span>
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px] py-0.5">
                      {ann.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0.5 text-slate-500 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{ann.target_block || "All Blocks"}</span>
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{ann.time || "Recently"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{ann.author_name || "Chief Warden"}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteNotice(ann.id)}
                    className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 border-rose-200 dark:border-rose-900 gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official Announcement"
        description="Broadcast circular to all student resident dashboards and mobile notifications."
        size="md"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <Input
            label="Notice Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Hostel Wi-Fi Maintenance Notice"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
              >
                <option value="General Notice">General Notice</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Mess Committee">Mess Committee</option>
                <option value="Curfew & Security">Curfew & Security</option>
                <option value="Health & Medical">Health & Medical</option>
                <option value="Academic & Events">Academic & Events</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Block
              </label>
              <select
                value={targetBlock}
                onChange={(e) => setTargetBlock(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
              >
                <option value="All Blocks">All Blocks</option>
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="modal-pinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="modal-pinned" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              Pin notice to top of student dashboards
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notice Content *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter full details, timings, guidelines, and actions expected from residents..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold"
            >
              <Megaphone className="h-4 w-4 mr-1.5" />
              <span>{submitting ? "Publishing..." : "Broadcast Notice"}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
