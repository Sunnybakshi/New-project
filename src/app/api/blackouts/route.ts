import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blackoutDateSchema } from "@/lib/validations";
import { parseDateParam } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const blackouts = await prisma.blackoutDate.findMany({
    where:
      from && to
        ? {
            date: {
              gte: parseDateParam(from),
              lte: parseDateParam(to),
            },
          }
        : {},
    orderBy: { date: "asc" },
  });

  return NextResponse.json(blackouts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = blackoutDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const dateValue = parseDateParam(parsed.data.date);

  const existing = await prisma.blackoutDate.findUnique({ where: { date: dateValue } });
  if (existing) {
    return NextResponse.json({ error: "Date already blacked out" }, { status: 409 });
  }

  const blackout = await prisma.blackoutDate.create({
    data: { date: dateValue, reason: parsed.data.reason },
  });

  return NextResponse.json(blackout, { status: 201 });
}
