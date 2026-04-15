import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { equipment, lendingRecords } from "@/src/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ lendingId: string }> };

export async function PUT(_req: NextRequest, { params }: Params) {
  const { lendingId } = await params;

  const [record] = await db
    .select()
    .from(lendingRecords)
    .where(eq(lendingRecords.id, lendingId));

  if (!record) {
    return NextResponse.json({ error: "Lending record not found" }, { status: 404 });
  }

  if (record.status === "returned") {
    return NextResponse.json({ error: "Already returned" }, { status: 409 });
  }

  const [updated] = await db
    .update(lendingRecords)
    .set({ status: "returned", returnedAt: new Date() })
    .where(eq(lendingRecords.id, lendingId))
    .returning();

  await db
    .update(equipment)
    .set({ status: "available", updatedAt: new Date() })
    .where(eq(equipment.id, record.equipmentId));

  return NextResponse.json(updated);
}
