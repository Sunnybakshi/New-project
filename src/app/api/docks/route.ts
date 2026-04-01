import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dockSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = session.user.role === "STAFF";
  const docks = await prisma.dock.findMany({
    where: isStaff ? {} : { isActive: true },
    include: { schedules: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(docks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = dockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const dock = await prisma.dock.create({ data: parsed.data });
  return NextResponse.json(dock, { status: 201 });
}
