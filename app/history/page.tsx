import Link from "next/link";
import { db } from "@/src/db";
import { equipment, lendingRecords } from "@/src/schema";
import { eq, desc } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const rows = await db
    .select({
      lendingId: lendingRecords.id,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      category: equipment.category,
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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-full bg-muted/40 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ← Dashboard
          </Link>
          <h1 className="text-xl font-semibold">Lending History</h1>
        </div>

        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No lending history found
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => {
              const isActive = r.status === "active";
              const isOverdue = isActive && r.dueDate < today;

              return (
                <Link key={r.lendingId} href={`/equipment/${r.equipmentId}`}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {r.equipmentName}
                          {r.category && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              {r.category}
                            </span>
                          )}
                        </CardTitle>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isOverdue
                              ? "bg-destructive/10 text-destructive"
                              : isActive
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isOverdue ? "Overdue" : isActive ? "On Loan" : "Returned"}
                        </span>
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>Borrower: {r.borrowerName}</span>
                        <span>
                          Borrowed:{" "}
                          {new Date(r.borrowedAt).toLocaleDateString("en-US")}
                        </span>
                        <span
                          className={isOverdue ? "font-medium text-destructive" : ""}
                        >
                          Due: {r.dueDate}
                        </span>
                        {r.returnedAt && (
                          <span>
                            Returned:{" "}
                            {new Date(r.returnedAt).toLocaleDateString("en-US")}
                          </span>
                        )}
                      </div>
                      {r.memo && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Notes: {r.memo}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
