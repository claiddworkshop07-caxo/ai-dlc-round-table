import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { equipment, lendingRecords } from "@/src/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  // 貸出記録の確認
  const [record] = await db
    .select()
    .from(lendingRecords)
    .where(eq(lendingRecords.id, id));

  if (!record) {
    return NextResponse.json({ error: "貸出記録が見つかりません" }, { status: 404 });
  }

  if (record.status === "returned") {
    return NextResponse.json(
      { error: "この貸出記録はすでに返却済みです" },
      { status: 409 }
    );
  }

  // 貸出記録を返却済みに更新
  const [updated] = await db
    .update(lendingRecords)
    .set({ status: "returned", returnedAt: new Date() })
    .where(eq(lendingRecords.id, id))
    .returning();

  // 備品ステータスを利用可能に戻す
  await db
    .update(equipment)
    .set({ status: "available", updatedAt: new Date() })
    .where(eq(equipment.id, record.equipmentId));

  return NextResponse.json(updated);
}
