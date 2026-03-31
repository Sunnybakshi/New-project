"use client";

import { useEffect, useState } from "react";
import type { BlackoutDate } from "@prisma/client";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import "react-day-picker/style.css";

export default function BlackoutManager() {
  const [blackouts, setBlackouts] = useState<BlackoutDate[]>([]);
  const [selected, setSelected] = useState<Date | undefined>();
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadBlackouts() {
    const res = await fetch("/api/blackouts");
    const data = await res.json();
    setBlackouts(data);
  }

  useEffect(() => {
    loadBlackouts();
  }, []);

  async function handleAdd() {
    if (!selected) return;
    setSaving(true);
    setError("");

    const dateStr = format(selected, "yyyy-MM-dd");
    const res = await fetch("/api/blackouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr, reason }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || "Failed to add blackout");
    } else {
      setSelected(undefined);
      setReason("");
      loadBlackouts();
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/blackouts/${id}`, { method: "DELETE" });
    loadBlackouts();
  }

  const blackoutDates = blackouts.map((b) => new Date(b.date));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Blackout Date</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            disabled={[{ before: new Date() }]}
            modifiers={{ blackout: blackoutDates }}
            modifiersClassNames={{ blackout: "bg-red-100 text-red-800" }}
          />
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Input
              placeholder="e.g. Holiday, Maintenance"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleAdd} disabled={!selected || saving} className="w-full">
            {saving ? "Adding..." : "Block This Date"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent>
          {blackouts.length === 0 ? (
            <p className="text-sm text-gray-500">No blackout dates set.</p>
          ) : (
            <div className="space-y-2">
              {blackouts.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(b.date), "EEEE, MMMM d, yyyy")}
                    </p>
                    {b.reason && (
                      <p className="text-xs text-gray-500">{b.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(b.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
