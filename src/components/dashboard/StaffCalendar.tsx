"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";
import type { AppointmentWithRelations } from "@/types";
import { STATUS_CALENDAR_COLORS } from "@/types";
import type { AppointmentStatus } from "@/types";

const STATUS_OPTIONS: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "NO_SHOW",
  "COMPLETED",
];

export default function StaffCalendar() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered =
    statusFilter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === statusFilter);

  const events = filtered.map((appt) => {
    const dateStr = new Date(appt.date).toISOString().split("T")[0];
    return {
      id: appt.id,
      title: `${appt.dock.name} — ${appt.carrier.name}`,
      start: `${dateStr}T${appt.startTime}:00`,
      end: `${dateStr}T${appt.endTime}:00`,
      backgroundColor: STATUS_CALENDAR_COLORS[appt.status],
      borderColor: STATUS_CALENDAR_COLORS[appt.status],
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="ALL">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 ml-auto">
          {STATUS_OPTIONS.map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: STATUS_CALENDAR_COLORS[s] }}
              />
              <span className="text-xs text-gray-600">
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={(info) => {
            router.push(`/appointments/${info.event.id}`);
          }}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator
        />
      </div>
    </div>
  );
}
