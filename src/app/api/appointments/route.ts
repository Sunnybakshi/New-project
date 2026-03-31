import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "@/lib/validations";
import { parseDateParam } from "@/lib/utils";
import { sendAppointmentConfirmation } from "@/lib/email";
import type { AppointmentWithRelations } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const status = searchParams.get("status");
  const dockId = searchParams.get("dockId");

  const isStaff = session.user.role === "STAFF";

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(isStaff ? {} : { carrierId: session.user.id }),
      ...(dateParam ? { date: parseDateParam(dateParam) } : {}),
      ...(status ? { status: status as never } : {}),
      ...(dockId ? { dockId } : {}),
    },
    include: {
      dock: true,
      carrier: {
        select: { id: true, name: true, email: true, company: true, phone: true },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "CARRIER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { dockId, date: dateStr, startTime, endTime, loadType, poNumber, notes, truckLicense, driverName } = parsed.data;
  const dateValue = parseDateParam(dateStr);

  // Race condition guard — re-validate server-side
  const existing = await prisma.appointment.findFirst({
    where: {
      dockId,
      date: dateValue,
      startTime,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Slot is no longer available" }, { status: 409 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      dockId,
      carrierId: session.user.id,
      date: dateValue,
      startTime,
      endTime,
      loadType,
      poNumber,
      notes,
      truckLicense,
      driverName,
      status: "PENDING",
    },
    include: {
      dock: true,
      carrier: {
        select: { id: true, name: true, email: true, company: true, phone: true },
      },
    },
  });

  // Send email non-blocking
  sendAppointmentConfirmation(appointment as AppointmentWithRelations).catch(console.error);

  return NextResponse.json(appointment, { status: 201 });
}
