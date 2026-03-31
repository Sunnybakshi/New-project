"use client";

import { useEffect, useState } from "react";
import type { Dock, DockSchedule } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAY_NAMES } from "@/types";

type DayConfig = {
  isActive: boolean;
  openTime: string;
  closeTime: string;
  slotDurationMins: number;
};

const DEFAULT_DAY: DayConfig = {
  isActive: false,
  openTime: "08:00",
  closeTime: "17:00",
  slotDurationMins: 60,
};

export default function ScheduleForm() {
  const [docks, setDocks] = useState<Dock[]>([]);
  const [selectedDockId, setSelectedDockId] = useState<string>("");
  const [days, setDays] = useState<DayConfig[]>(
    Array.from({ length: 7 }, () => ({ ...DEFAULT_DAY }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/docks").then((r) => r.json()).then(setDocks);
  }, []);

  useEffect(() => {
    if (!selectedDockId) return;

    fetch(`/api/schedule?dockId=${selectedDockId}`)
      .then((r) => r.json())
      .then((schedules: DockSchedule[]) => {
        const newDays = Array.from({ length: 7 }, (_, i): DayConfig => {
          const s = schedules.find((sc) => sc.dayOfWeek === i);
          if (s) {
            return {
              isActive: s.isActive,
              openTime: s.openTime,
              closeTime: s.closeTime,
              slotDurationMins: s.slotDurationMins,
            };
          }
          return { ...DEFAULT_DAY };
        });
        setDays(newDays);
      });
  }, [selectedDockId]);

  function updateDay(index: number, field: keyof DayConfig, value: boolean | string | number) {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSave() {
    if (!selectedDockId) return;
    setSaving(true);

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const day = days[dayOfWeek];
      await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dockId: selectedDockId,
          dayOfWeek,
          openTime: day.openTime,
          closeTime: day.closeTime,
          slotDurationMins: day.slotDurationMins,
          isActive: day.isActive,
        }),
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Dock</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedDockId}
            onChange={(e) => setSelectedDockId(e.target.value)}
          >
            <option value="">-- Select a dock --</option>
            {docks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedDockId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DAY_NAMES.map((dayName, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center py-2 border-b last:border-0">
                  <div className="col-span-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`day-${index}`}
                      checked={days[index].isActive}
                      onChange={(e) => updateDay(index, "isActive", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`day-${index}`} className="text-sm font-medium">
                      {dayName}
                    </label>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="time"
                      value={days[index].openTime}
                      disabled={!days[index].isActive}
                      onChange={(e) => updateDay(index, "openTime", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="time"
                      value={days[index].closeTime}
                      disabled={!days[index].isActive}
                      onChange={(e) => updateDay(index, "closeTime", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={days[index].slotDurationMins}
                      disabled={!days[index].isActive}
                      onChange={(e) =>
                        updateDay(index, "slotDurationMins", Number(e.target.value))
                      }
                      className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                      <option value={120}>120 min</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Schedule"}
              </Button>
              {saved && <span className="text-sm text-green-600">Schedule saved!</span>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
