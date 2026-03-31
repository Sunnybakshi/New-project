"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { AppointmentWithRelations } from "@/types";
import { STATUS_COLORS } from "@/types";
import type { AppointmentStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { formatTimeDisplay } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, Truck, User, Package } from "lucide-react";
import Link from "next/link";

interface AppointmentDetailViewProps {
  id: string;
}

const STAFF_ACTIONS: { label: string; status: AppointmentStatus; variant: "default" | "destructive" | "outline" | "secondary" }[] = [
  { label: "Confirm", status: "CONFIRMED", variant: "default" },
  { label: "Reject", status: "REJECTED", variant: "destructive" },
  { label: "Mark No-Show", status: "NO_SHOW", variant: "outline" },
  { label: "Complete", status: "COMPLETED", variant: "secondary" },
];

export default function AppointmentDetailView({ id }: AppointmentDetailViewProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  async function fetchAppointment() {
    try {
      const res = await fetch(`/api/appointments/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setAppointment(data);
    } catch {
      toast({ title: "Appointment not found", variant: "destructive" });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: AppointmentStatus) {
    if (!appointment) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update");
      }
      const updated = await res.json();
      setAppointment(updated);
      toast({ title: `Appointment ${status.toLowerCase()}` });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading appointment...
      </div>
    );
  }

  if (!appointment) return null;

  const role = session?.user?.role;
  const dateStr = new Date(appointment.date).toISOString().split("T")[0];
  const [year, month, day] = dateStr.split("-").map(Number);
  const displayDate = new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const appointmentDateTime = new Date(year, month - 1, day, ...appointment.endTime.split(":").map(Number) as [number, number]);
  const isPast = appointmentDateTime < new Date();
  const canCancel =
    role === "CARRIER" &&
    !isPast &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED");

  const availableStaffActions = STAFF_ACTIONS.filter((a) => a.status !== appointment.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Appointment Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{appointment.dock.name}</CardTitle>
            <Badge className={STATUS_COLORS[appointment.status]}>
              {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{displayDate}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <span>
                {formatTimeDisplay(appointment.startTime)} – {formatTimeDisplay(appointment.endTime)}
              </span>
            </div>
            {appointment.carrier.name && (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{appointment.carrier.name}</span>
              </div>
            )}
            {appointment.carrier.company && (
              <div className="flex items-center gap-2 text-gray-700">
                <Package className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{appointment.carrier.company}</span>
              </div>
            )}
            {appointment.truckLicense && (
              <div className="flex items-center gap-2 text-gray-700">
                <Truck className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{appointment.truckLicense}</span>
              </div>
            )}
          </div>

          <Separator />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Load Type</dt>
            <dd className="font-medium">{appointment.loadType}</dd>

            {appointment.poNumber && (
              <>
                <dt className="text-gray-500">PO Number</dt>
                <dd className="font-medium">{appointment.poNumber}</dd>
              </>
            )}
            {appointment.driverName && (
              <>
                <dt className="text-gray-500">Driver</dt>
                <dd className="font-medium">{appointment.driverName}</dd>
              </>
            )}
            {appointment.carrier.email && (
              <>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium">{appointment.carrier.email}</dd>
              </>
            )}
            {appointment.carrier.phone && (
              <>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium">{appointment.carrier.phone}</dd>
              </>
            )}
          </dl>

          {appointment.notes && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-gray-500 mb-1 font-medium">Notes</p>
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            </>
          )}

          {/* Action buttons */}
          {(role === "STAFF" || canCancel) && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {role === "STAFF" &&
                  availableStaffActions.map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      size="sm"
                      disabled={updating}
                      onClick={() => updateStatus(action.status)}
                    >
                      {action.label}
                    </Button>
                  ))}
                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updating}
                    onClick={() => updateStatus("CANCELLED")}
                    className="text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Cancel Appointment
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
