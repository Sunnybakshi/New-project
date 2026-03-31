import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Truck } from "lucide-react";
import type { AppointmentWithRelations } from "@/types";
import { STATUS_COLORS } from "@/types";
import { formatTimeDisplay } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
}

export default function AppointmentCard({
  appointment,
  onCancel,
  cancelling,
}: AppointmentCardProps) {
  const dateStr = new Date(appointment.date).toISOString().split("T")[0];
  const [year, month, day] = dateStr.split("-").map(Number);
  const displayDate = new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const canCancel =
    onCancel &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED");

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">
                {appointment.dock.name}
              </h3>
              <Badge className={STATUS_COLORS[appointment.status]}>
                {appointment.status.charAt(0) + appointment.status.slice(1).toLowerCase()}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{displayDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {formatTimeDisplay(appointment.startTime)} – {formatTimeDisplay(appointment.endTime)}
                </span>
              </div>
              {appointment.truckLicense && (
                <div className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  <span>{appointment.truckLicense}</span>
                </div>
              )}
            </div>

            {appointment.loadType && (
              <div className="text-xs text-gray-500">
                Load type: <span className="font-medium">{appointment.loadType}</span>
                {appointment.poNumber && (
                  <> &bull; PO: <span className="font-medium">{appointment.poNumber}</span></>
                )}
              </div>
            )}
          </div>

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel(appointment.id);
              }}
              disabled={cancelling}
              className="relative z-10 shrink-0 text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
