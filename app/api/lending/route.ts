import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { equipment, lendingRecords } from "@/src/schema";
import { and, eq, isNull, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: lendingRecords.id,
      equipmentId: lendingRecords.equipmentId,
      equipmentName: equipment.name,
      borrowerName: lendingRecords.borrowerName,
      borrowedAt: lendingRecords.borrowedAt,
      dueDate: lendingRecords.dueDate,
      returnedAt: lendingRecords.returnedAt,
      memo: lendingRecords.memo,
      status: lendingRecords.status,
    })
    .from(lendingRecords)
    .innerJoin(equipment, eq(lendingRecords.equipmentId, equipment.id))
    .orderBy(desc(lendingRecords.borrowedAt));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { equipmentId, borrowerName, dueDate, memo } = body;

  if (!equipmentId || !borrowerName || !dueDate) {
    return NextResponse.json(
      { error: "equipmentId, borrowerName, dueDate は必須です" },
      { status: 400 }
    );
  }

  // 備品の存在確認
  const [item] = await db
    .select()
    .from(equipment)
    .where(and(eq(equipment.id, equipmentId), isNull(equipment.deletedAt)));

  if (!item) {
    return NextResponse.json({ error: "備品が見つかりません" }, { status: 404 });
  }

  // 貸出中チェック
  if (item.status === "borrowed") {
    return NextResponse.json(
      { error: "この備品は現在貸出中です" },
      { status: 409 }
    );
  }

  // トランザクション: 貸出記録作成 + 備品ステータス更新
  const [record] = await db
    .insert(lendingRecords)
    .values({
      equipmentId,
      borrowerName: borrowerName.trim(),
      dueDate,
      memo: memo?.trim() || null,
    })
    .returning();

  await db
    .update(equipment)
    .set({ status: "borrowed", updatedAt: new Date() })
    .where(eq(equipment.id, equipmentId));

  return NextResponse.json(record, { status: 201 });
}
