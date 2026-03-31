import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STAFF", "CARRIER"]).default("CARRIER"),
  company: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const dockSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const dockScheduleSchema = z.object({
  dockId: z.string().min(1),
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  slotDurationMins: z.number().int().min(15).max(480),
  isActive: z.boolean().default(true),
});

export const blackoutDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  reason: z.string().optional(),
});

export const createAppointmentSchema = z.object({
  dockId: z.string().min(1, "Dock is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  loadType: z.enum(["INBOUND", "OUTBOUND", "BOTH"]).default("INBOUND"),
  poNumber: z.string().optional(),
  notes: z.string().optional(),
  truckLicense: z.string().optional(),
  driverName: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "REJECTED",
      "CANCELLED",
      "NO_SHOW",
      "COMPLETED",
    ])
    .optional(),
  notes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DockInput = z.infer<typeof dockSchema>;
export type DockScheduleInput = z.infer<typeof dockScheduleSchema>;
export type BlackoutDateInput = z.infer<typeof blackoutDateSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
