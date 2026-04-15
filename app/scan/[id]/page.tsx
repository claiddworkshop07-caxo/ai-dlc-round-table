import { notFound } from "next/navigation";
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
import { LendingForm } from "@/components/scan/LendingForm";
import { ReturnConfirm } from "@/components/scan/ReturnConfirm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ScanDetailPage({ params }: Props) {
  const { id } = await params;

  const [item] = await db
    .select()
    .from(equipment)
    .where(and(eq(equipment.id, id), isNull(equipment.deletedAt)));

  if (!item) notFound();

  const activeRecord = await db
    .select()
    .from(lendingRecords)
    .where(
      and(
        eq(lendingRecords.equipmentId, id),
        eq(lendingRecords.status, "active")
      )
    )
    .limit(1);

  const lending = activeRecord[0] ?? null;
  const isAvailable = item.status === "available";

  return (
    <div className="min-h-full bg-muted/40 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/scan"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ← Back to Scan
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>
                {isAvailable ? "Borrow Equipment" : "Return Equipment"}
              </CardTitle>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {isAvailable ? "Available" : "On Loan"}
              </span>
            </div>
            <CardDescription>
              {item.name}
              {item.category && ` / ${item.category}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAvailable ? (
              <LendingForm
                equipmentId={item.id}
                equipmentName={item.name}
              />
            ) : lending ? (
              <ReturnConfirm
                lendingId={lending.id}
                equipmentId={item.id}
                equipmentName={item.name}
                borrowerName={lending.borrowerName}
                dueDate={lending.dueDate}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No lending record found. Please contact an administrator.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
