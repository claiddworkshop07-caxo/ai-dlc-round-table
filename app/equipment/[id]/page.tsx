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
import { Separator } from "@/components/ui/separator";
import { QRCodeDisplay } from "@/components/equipment/QRCodeDisplay";
import { DeleteButton } from "@/components/equipment/DeleteButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EquipmentDetailPage({ params }: Props) {
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

  return (
    <div className="min-h-full bg-muted/40 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/equipment"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ← Back to List
          </Link>
          <h1 className="text-xl font-semibold">{item.name}</h1>
        </div>

        {/* 備品情報 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>Equipment Details</CardTitle>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.status === "available"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status === "available" ? "Available" : "On Loan"}
              </span>
            </div>
            {item.category && (
              <CardDescription>Category: {item.category}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {item.location && (
              <div>
                <p className="text-xs text-muted-foreground">Storage Location</p>
                <p className="text-sm">{item.location}</p>
              </div>
            )}
            {item.description && (
              <div>
                <p className="text-xs text-muted-foreground">Description / Notes</p>
                <p className="text-sm whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Equipment ID</p>
              <p className="font-mono text-xs text-muted-foreground">{item.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Registered Date</p>
              <p className="text-sm">
                {new Date(item.createdAt).toLocaleDateString("en-US")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 現在の貸出状況 */}
        {lending && (
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-700">Currently On Loan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Borrower</p>
                <p className="text-sm font-medium">{lending.borrowerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Date</p>
                <p className="text-sm">{lending.dueDate}</p>
              </div>
              {lending.memo && (
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{lending.memo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* QRコード */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <CardDescription>
              Scan with a smartphone to open the lending / return page
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <QRCodeDisplay equipmentId={item.id} equipmentName={item.name} />
          </CardContent>
        </Card>

        {/* 操作ボタン */}
        <Separator />
        <div className="flex items-center justify-between">
          <Link
            href={`/equipment/${item.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Edit
          </Link>
          <DeleteButton equipmentId={item.id} equipmentName={item.name} />
        </div>
      </div>
    </div>
  );
}
