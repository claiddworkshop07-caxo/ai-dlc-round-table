import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { equipment } from "@/src/schema";
import { isNull, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(equipment)
    .where(isNull(equipment.deletedAt))
    .orderBy(desc(equipment.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, category, description, location } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const [row] = await db
    .insert(equipment)
    .values({
      name: name.trim(),
      category: category?.trim() || null,
      description: description?.trim() || null,
      location: location?.trim() || null,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
