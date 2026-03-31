import { prisma } from "./prisma";
import { formatTime, parseTime, parseDateParam } from "./utils";
import type { SlotOption } from "@/types";

export async function getAvailableSlots(dateStr: string): Promise<SlotOption[]> {
  const targetDate = parseDateParam(dateStr);
  const dayOfWeek = targetDate.getUTCDay();

  // Check if date is blacked out
  const blackout = await prisma.blackoutDate.findFirst({
    where: { date: targetDate },
  });
  if (blackout) return [];

  // Fetch active dock schedules for this day
  const schedules = await prisma.dockSchedule.findMany({
    where: {
      dayOfWeek,
      isActive: true,
      dock: { isActive: true },
    },
    include: { dock: true },
  });

  if (schedules.length === 0) return [];

  // Fetch already-booked slots for this date
  const booked = await prisma.appointment.findMany({
    where: {
      date: targetDate,
      dockId: { in: schedules.map((s) => s.dockId) },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { dockId: true, startTime: true },
  });

  const bookedSet = new Set(booked.map((b) => `${b.dockId}:${b.startTime}`));

  // Generate and filter slots
  return schedules.flatMap((schedule) =>
    generateTimeSlots(
      schedule.openTime,
      schedule.closeTime,
      schedule.slotDurationMins
    )
      .filter((slot) => !bookedSet.has(`${schedule.dockId}:${slot.start}`))
      .map((slot) => ({
        dockId: schedule.dockId,
        dockName: schedule.dock.name,
        startTime: slot.start,
        endTime: slot.end,
      }))
  );
}

function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMins: number
): Array<{ start: string; end: string }> {
  const slots: Array<{ start: string; end: string }> = [];
  let current = parseTime(openTime);
  const end = parseTime(closeTime);

  while (current + durationMins <= end) {
    slots.push({
      start: formatTime(current),
      end: formatTime(current + durationMins),
    });
    current += durationMins;
  }

  return slots;
}
