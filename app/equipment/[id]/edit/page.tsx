import { notFound } from "next/navigation";
import { db } from "@/src/db";
import { equipment } from "@/src/schema";
import { and, eq, isNull } from "drizzle-orm";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditEquipmentPage({ params }: Props) {
  const { id } = await params;

  const [item] = await db
    .select()
    .from(equipment)
    .where(and(eq(equipment.id, id), isNull(equipment.deletedAt)));

  if (!item) notFound();

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/40 px-4 py-16">
      <EquipmentForm
        mode="edit"
        defaultValues={{
          id: item.id,
          name: item.name,
          category: item.category ?? "",
          description: item.description ?? "",
          location: item.location ?? "",
        }}
      />
    </div>
  );
}
