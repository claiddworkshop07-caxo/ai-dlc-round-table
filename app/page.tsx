import Link from "next/link";
import { db } from "@/src/db";
import { equipment, lendingRecords } from "@/src/schema";
import { and, eq, isNull } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 貸出中の備品一覧（lending_records JOIN equipment）
  const activeLendings = await db
    .select({
      lendingId: lendingRecords.id,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      category: equipment.category,
      borrowerName: lendingRecords.borrowerName,
      dueDate: lendingRecords.dueDate,
      borrowedAt: lendingRecords.borrowedAt,
    })
    .from(lendingRecords)
    .innerJoin(equipment, eq(lendingRecords.equipmentId, equipment.id))
    .where(
      and(
        eq(lendingRecords.status, "active"),
        isNull(equipment.deletedAt)
      )
    );

  const today = new Date().toISOString().slice(0, 10);
  const overdue = activeLendings.filter((r) => r.dueDate < today);

  return (
    <div className="min-h-full bg-muted/40 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">On Loan</p>
              <p className="text-3xl font-bold">{activeLendings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Overdue</p>
              <p className={`text-3xl font-bold ${overdue.length > 0 ? "text-destructive" : ""}`}>
                {overdue.length}
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="flex h-full items-center justify-center gap-3 pt-4">
              <Link href="/scan" className={buttonVariants({ size: "sm" })}>
                📷 Scan
              </Link>
              <Link href="/equipment" className={buttonVariants({ variant: "outline", size: "sm" })}>
                📦 Equipment
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 期限超過アラート */}
        {overdue.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="mb-2 font-medium text-destructive">
              ⚠ Overdue: {overdue.length} item(s)
            </p>
            <ul className="space-y-1 text-sm text-destructive">
              {overdue.map((r) => (
                <li key={r.lendingId}>
                  "{r.equipmentName}" — {r.borrowerName} (Due: {r.dueDate})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 貸出中一覧 */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Equipment On Loan</h2>
            <Link
              href="/history"
              className="text-sm text-primary hover:underline"
            >
              View History →
            </Link>
          </div>

          {activeLendings.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No equipment is currently on loan
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeLendings.map((r) => {
                const isOverdue = r.dueDate < today;
                return (
                  <Link key={r.lendingId} href={`/scan/${r.equipmentId}`}>
                    <Card className="cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {r.equipmentName}
                            </CardTitle>
                            {r.category && (
                              <CardDescription>{r.category}</CardDescription>
                            )}
                          </div>
                          {isOverdue && (
                            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                          <span>Borrower: {r.borrowerName}</span>
                          <span
                            className={isOverdue ? "font-medium text-destructive" : ""}
                          >
                            Due: {r.dueDate}
                          </span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
