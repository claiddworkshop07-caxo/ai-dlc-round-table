import { db } from "@/src/db";
import { equipment, lendingRecords } from "@/src/schema";
import { eq } from "drizzle-orm";
import { ForceReturnButton } from "@/components/admin/ForceReturnButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const borrowed = await db
    .select({
      lendingId: lendingRecords.id,
      borrowerName: lendingRecords.borrowerName,
      borrowedAt: lendingRecords.borrowedAt,
      dueDate: lendingRecords.dueDate,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      category: equipment.category,
    })
    .from(lendingRecords)
    .innerJoin(equipment, eq(lendingRecords.equipmentId, equipment.id))
    .where(eq(lendingRecords.status, "active"))
    .orderBy(lendingRecords.borrowedAt);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage currently borrowed equipment. Use Force Return to close a lending record immediately.
        </p>
      </div>

      {borrowed.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground text-sm">
          No equipment is currently borrowed.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{borrowed.length} item(s) currently borrowed</p>
          <div className="divide-y rounded-lg border">
            {borrowed.map((row) => {
              const isOverdue = new Date(row.dueDate) < new Date(new Date().toDateString());
              return (
                <div
                  key={row.lendingId}
                  className="flex items-center justify-between gap-4 px-4 py-4"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-medium truncate">{row.equipmentName}</p>
                    {row.category && (
                      <p className="text-xs text-muted-foreground">{row.category}</p>
                    )}
                    <p className="text-sm">
                      <span className="text-muted-foreground">Borrower: </span>
                      {row.borrowerName}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Due: </span>
                      <span className={isOverdue ? "text-destructive font-medium" : ""}>
                        {row.dueDate}
                        {isOverdue && " ⚠ Overdue"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Borrowed: {new Date(row.borrowedAt).toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <ForceReturnButton
                      lendingId={row.lendingId}
                      equipmentName={row.equipmentName}
                      borrowerName={row.borrowerName}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
