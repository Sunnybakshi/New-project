"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import type { BlackoutDate } from "@prisma/client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "react-day-picker/style.css";

interface StepPickDateProps {
  onDateSelected: (date: string) => void;
}

export default function StepPickDate({ onDateSelected }: StepPickDateProps) {
  const [blackouts, setBlackouts] = useState<Date[]>([]);

  useEffect(() => {
    fetch("/api/blackouts")
      .then((r) => r.json())
      .then((data: BlackoutDate[]) =>
        setBlackouts(data.map((b) => new Date(b.date)))
      );
  }, []);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    onDateSelected(format(date, "yyyy-MM-dd"));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pick an Appointment Date</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <DayPicker
          mode="single"
          onSelect={handleSelect}
          disabled={[
            { before: today },
            ...blackouts,
          ]}
          modifiers={{ blackout: blackouts }}
          modifiersClassNames={{ blackout: "line-through opacity-50" }}
        />
      </CardContent>
    </Card>
  );
}
