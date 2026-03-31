import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date query param is required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const slots = await getAvailableSlots(date);
  return NextResponse.json(slots);
}
