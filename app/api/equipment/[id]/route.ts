import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { equipment, lendingRecords } from "@/src/schema";
import { eq, and, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(equipment)
    .where(and(eq(equipment.id, id), isNull(equipment.deletedAt)));

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { name, category, description, location } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const [row] = await db
    .update(equipment)
    .set({
      name: name.trim(),
      category: category?.trim() || null,
      description: description?.trim() || null,
      location: location?.trim() || null,
      updatedAt: new Date(),
    })
    .where(and(eq(equipment.id, id), isNull(equipment.deletedAt)))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  // 貸出中かチェック
  const activeLending = await db
    .select({ id: lendingRecords.id })
    .from(lendingRecords)
    .where(
      and(
        eq(lendingRecords.equipmentId, id),
        eq(lendingRecords.status, "active")
      )
    )
    .limit(1);

  if (activeLending.length > 0) {
    return NextResponse.json(
      { error: "この備品は現在貸出中のため削除できません" },
      { status: 409 }
    );
  }

  const [row] = await db
    .update(equipment)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(equipment.id, id), isNull(equipment.deletedAt)))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
