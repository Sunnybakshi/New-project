"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentCard from "./AppointmentCard";
import type { AppointmentWithRelations } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function CarrierDashboard() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        toast({ title: "Appointment cancelled" });
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
        );
      } else {
        const data = await res.json();
        toast({
          title: "Failed to cancel",
          description: data.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setCancellingId(null);
    }
  }

  const now = new Date();

  function getDateFromAppointment(appt: AppointmentWithRelations): Date {
    const dateStr = new Date(appt.date).toISOString().split("T")[0];
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = appt.startTime.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  const upcoming = appointments.filter(
    (a) =>
      getDateFromAppointment(a) >= now &&
      a.status !== "CANCELLED" &&
      a.status !== "REJECTED"
  );
  const past = appointments.filter(
    (a) =>
      getDateFromAppointment(a) < now ||
      a.status === "CANCELLED" ||
      a.status === "REJECTED" ||
      a.status === "COMPLETED" ||
      a.status === "NO_SHOW"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading appointments...
      </div>
    );
  }

  function AppointmentList({
    items,
    emptyMessage,
  }: {
    items: AppointmentWithRelations[];
    emptyMessage: string;
  }) {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {items.map((appt) => (
          <div key={appt.id} className="relative">
            <AppointmentCard
              appointment={appt}
              onCancel={handleCancel}
              cancelling={cancellingId === appt.id}
            />
            {/* Invisible overlay for navigation — only covers non-button area */}
            <Link
              href={`/appointments/${appt.id}`}
              className="absolute inset-0 z-0"
              aria-label={`View appointment at ${appt.dock.name}`}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {appointments.length} total appointment{appointments.length !== 1 ? "s" : ""}
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
        >
          + Book a new slot
        </Link>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <AppointmentList
            items={upcoming}
            emptyMessage="No upcoming appointments. Book a slot to get started!"
          />
        </TabsContent>

        <TabsContent value="past">
          <AppointmentList
            items={past}
            emptyMessage="No past appointments."
          />
        </TabsContent>

        <TabsContent value="all">
          <AppointmentList
            items={appointments}
            emptyMessage="No appointments found."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
