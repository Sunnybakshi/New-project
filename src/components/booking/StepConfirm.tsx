"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingState } from "./BookingWizard";
import { formatDate, formatTimeDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepConfirmProps {
  booking: BookingState;
  onUpdate: (updates: Partial<BookingState>) => void;
  onBack: () => void;
}

export default function StepConfirm({ booking, onUpdate, onBack }: StepConfirmProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!booking.date || !booking.dockId || !booking.startTime || !booking.endTime) return;

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dockId: booking.dockId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        loadType: booking.loadType,
        poNumber: booking.poNumber || undefined,
        notes: booking.notes || undefined,
        truckLicense: booking.truckLicense || undefined,
        driverName: booking.driverName || undefined,
      }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to book appointment");
      setSubmitting(false);
      return;
    }

    const data = await res.json();
    router.push(`/appointments/${data.id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Confirm Appointment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-gray-500">Dock</span>
            <span className="font-medium">{booking.dockName}</span>
            <span className="text-gray-500">Date</span>
            <span className="font-medium">{booking.date ? formatDate(booking.date) : ""}</span>
            <span className="text-gray-500">Time</span>
            <span className="font-medium">
              {booking.startTime && booking.endTime
                ? `${formatTimeDisplay(booking.startTime)} – ${formatTimeDisplay(booking.endTime)}`
                : ""}
            </span>
          </div>
        </div>

        {/* Additional details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Load Type</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={booking.loadType}
              onChange={(e) => onUpdate({ loadType: e.target.value as "INBOUND" | "OUTBOUND" | "BOTH" })}
            >
              <option value="INBOUND">Inbound</option>
              <option value="OUTBOUND">Outbound</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>PO Number</Label>
            <Input
              placeholder="e.g. PO-12345"
              value={booking.poNumber}
              onChange={(e) => onUpdate({ poNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Driver Name</Label>
            <Input
              placeholder="Driver's name"
              value={booking.driverName}
              onChange={(e) => onUpdate({ driverName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Truck License Plate</Label>
            <Input
              placeholder="e.g. ABC-1234"
              value={booking.truckLicense}
              onChange={(e) => onUpdate({ truckLicense: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              placeholder="Any special instructions"
              value={booking.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} disabled={submitting}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
