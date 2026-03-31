import type {
  Appointment,
  AppointmentStatus,
  Dock,
  DockSchedule,
  LoadType,
  Role,
  User,
} from "@prisma/client";

export type { AppointmentStatus, LoadType, Role };

export type SlotOption = {
  dockId: string;
  dockName: string;
  startTime: string;
  endTime: string;
};

export type AppointmentWithRelations = Appointment & {
  dock: Dock;
  carrier: Pick<User, "id" | "name" | "email" | "company" | "phone">;
};

export type DockWithSchedules = Dock & {
  schedules: DockSchedule[];
};

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export const STATUS_CALENDAR_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "#eab308",
  CONFIRMED: "#22c55e",
  REJECTED: "#ef4444",
  CANCELLED: "#9ca3af",
  NO_SHOW: "#f97316",
  COMPLETED: "#3b82f6",
};
