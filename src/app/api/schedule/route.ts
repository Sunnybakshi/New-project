import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dockScheduleSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dockId = searchParams.get("dockId");

  const schedules = await prisma.dockSchedule.findMany({
    where: dockId ? { dockId } : {},
    orderBy: [{ dockId: "asc" }, { dayOfWeek: "asc" }],
  });

  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = dockScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { dockId, dayOfWeek, openTime, closeTime, slotDurationMins, isActive } = parsed.data;

  const schedule = await prisma.dockSchedule.upsert({
    where: { dockId_dayOfWeek: { dockId, dayOfWeek } },
    update: { openTime, closeTime, slotDurationMins, isActive },
    create: { dockId, dayOfWeek, openTime, closeTime, slotDurationMins, isActive },
  });

  return NextResponse.json(schedule, { status: 201 });
}
