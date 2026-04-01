import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAppointmentSchema } from "@/lib/validations";
import { sendStatusChangeEmail } from "@/lib/email";
import type { AppointmentWithRelations } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      dock: true,
      carrier: {
        select: { id: true, name: true, email: true, company: true, phone: true },
      },
    },
  });

  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = session.user.role === "STAFF";
  const isOwner = appointment.carrierId === session.user.id;

  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(appointment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = session.user.role === "STAFF";
  const isOwner = appointment.carrierId === session.user.id;

  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Carriers can only cancel their own future appointments
  if (!isStaff) {
    if (parsed.data.status !== "CANCELLED") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const now = new Date();
    const apptDate = new Date(appointment.date);
    if (apptDate < now) {
      return NextResponse.json({ error: "Cannot cancel past appointments" }, { status: 400 });
    }
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return NextResponse.json({ error: "Appointment cannot be cancelled" }, { status: 400 });
    }
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: parsed.data,
    include: {
      dock: true,
      carrier: {
        select: { id: true, name: true, email: true, company: true, phone: true },
      },
    },
  });

  // Send email notification non-blocking
  if (parsed.data.status) {
    sendStatusChangeEmail(updated as AppointmentWithRelations).catch(console.error);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.appointment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
