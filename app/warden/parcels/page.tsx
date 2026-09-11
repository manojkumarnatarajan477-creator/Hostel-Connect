"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Package, Plus, RefreshCw, Check, Search, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { Parcel } from "@/types/parcel";

export default function WardenParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    recipient_name: "",
    room_number: "",
    block: "Block A",
    courier_service: "Amazon India",
    tracking_number: "",
  });

  const fetchParcels = useCallback(async () => {
    try {
      const res = await fetch("/api/parcels");
      const json = await res.json();
      if (json.success && json.data) {
        setParcels(json.data);
      }
    } catch (err) {
      console.warn("Warden parcels fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParcels();
    const interval = setInterval(fetchParcels, 4000);
    return () => clearInterval(interval);
  }, [fetchParcels]);

  const handleCreateParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFormData({
          recipient_name: "",
          room_number: "",
          block: "Block A",
          courier_service: "Amazon India",
          tracking_number: "",
        });
        fetchParcels();
      }
    } catch (err) {
      console.warn("Create parcel error:", err);
    }
  };

  const handleVerifyDelivery = async (id: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/parcels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "COLLECTED" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchParcels();
      }
    } catch (err) {
      console.warn("Verify delivery error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = parcels.filter(
    (p) =>
      p.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.courier_service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-600" />
            <span>Security Reception Parcel Desk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log inward couriers, issue instant OTP notifications to students, and confirm delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchParcels}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Log Inward Parcel</span>
          </Button>
        </div>
      </div>

      <div className="w-full sm:w-72">
        <Input
          placeholder="Search recipient or room..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4 text-slate-400" />}
          className="h-9 text-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logged Courier Parcels ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No parcels currently in log. Click &quot;Log Inward Parcel&quot; to add one.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.recipient_name}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      Room {item.room_number} • {item.block}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {item.courier_service}
                    </Badge>
                    <Badge
                      variant={item.status === "COLLECTED" ? "success" : "warning"}
                      className="text-[10px]"
                    >
                      {item.status === "COLLECTED" ? "Handed Over" : "Ready for Pickup"}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 font-mono">
                    Tracking No: {item.tracking_number}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Student OTP: {item.otp_code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== "COLLECTED" ? (
                    <Button
                      size="sm"
                      variant="success"
                      isLoading={actionLoadingId === item.id}
                      onClick={() => handleVerifyDelivery(item.id)}
                      className="text-xs h-9 px-3.5 gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Verify & Deliver</span>
                    </Button>
                  ) : (
                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      <span>Delivered</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Inward Courier Package"
        description="Records incoming shipment at the reception desk and creates a pickup OTP."
      >
        <form onSubmit={handleCreateParcel} className="space-y-4">
          <Input
            label="Student Name"
            value={formData.recipient_name}
            onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Room Number"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              required
            />
            <Input
              label="Block"
              value={formData.block}
              onChange={(e) => setFormData({ ...formData, block: e.target.value })}
              required
            />
          </div>

          <Dropdown
            label="Courier Service"
            options={[
              { label: "Amazon Logistics", value: "Amazon India" },
              { label: "BlueDart Express", value: "BlueDart Express" },
              { label: "Delhivery", value: "Delhivery" },
              { label: "DTDC", value: "DTDC" },
              { label: "India Post Speed Post", value: "India Post" },
            ]}
            value={formData.courier_service}
            onChange={(val) => setFormData({ ...formData, courier_service: val })}
          />

          <Input
            label="AWB / Tracking Number (Optional)"
            placeholder="e.g., AWB-99881122"
            value={formData.tracking_number}
            onChange={(e) => setFormData({ ...formData, tracking_number: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Log Package & Send OTP
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
