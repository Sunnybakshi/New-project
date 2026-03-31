"use client";

import { useEffect, useState } from "react";
import type { SlotOption } from "@/types";
import { formatTimeDisplay, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StepPickSlotProps {
  date: string;
  onSlotSelected: (slot: SlotOption) => void;
  onBack: () => void;
}

type GroupedSlots = Record<string, SlotOption[]>;

export default function StepPickSlot({ date, onSlotSelected, onBack }: StepPickSlotProps) {
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SlotOption | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((data: SlotOption[]) => {
        setSlots(data);
        setLoading(false);
      });
  }, [date]);

  const grouped: GroupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.dockName]) acc[slot.dockName] = [];
    acc[slot.dockName].push(slot);
    return acc;
  }, {} as GroupedSlots);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Available Slots — {formatDate(date)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading available slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No slots available on this date. Please pick a different date.
          </p>
        ) : (
          Object.entries(grouped).map(([dockName, dockSlots]) => (
            <div key={dockName}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{dockName}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {dockSlots.map((slot) => {
                  const isSelected =
                    selected?.dockId === slot.dockId &&
                    selected?.startTime === slot.startTime;
                  return (
                    <button
                      key={`${slot.dockId}-${slot.startTime}`}
                      onClick={() => setSelected(slot)}
                      className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {formatTimeDisplay(slot.startTime)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            disabled={!selected}
            onClick={() => selected && onSlotSelected(selected)}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
