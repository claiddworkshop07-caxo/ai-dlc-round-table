import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/src/db";
import { equipment, lendingRecords } from "@/src/schema";
import { and, eq, isNull } from "drizzle-orm";
import { Button } from "@/components/ui/button";
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
          <Button asChild variant="outline" size="sm">
            <Link href="/equipment">← 一覧に戻る</Link>
          </Button>
          <h1 className="text-xl font-semibold">{item.name}</h1>
        </div>

        {/* 備品情報 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>備品情報</CardTitle>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  item.status === "available"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status === "available" ? "利用可能" : "貸出中"}
              </span>
            </div>
            {item.category && (
              <CardDescription>カテゴリ: {item.category}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {item.location && (
              <div>
                <p className="text-xs text-muted-foreground">保管場所</p>
                <p className="text-sm">{item.location}</p>
              </div>
            )}
            {item.description && (
              <div>
                <p className="text-xs text-muted-foreground">説明・特記事項</p>
                <p className="text-sm whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">備品ID</p>
              <p className="font-mono text-xs text-muted-foreground">{item.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">登録日</p>
              <p className="text-sm">
                {new Date(item.createdAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 現在の貸出状況 */}
        {lending && (
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-700">現在貸出中</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">借用者</p>
                <p className="text-sm font-medium">{lending.borrowerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">返却予定日</p>
                <p className="text-sm">{lending.dueDate}</p>
              </div>
              {lending.memo && (
                <div>
                  <p className="text-xs text-muted-foreground">メモ</p>
                  <p className="text-sm">{lending.memo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* QRコード */}
        <Card>
          <CardHeader>
            <CardTitle>QRコード</CardTitle>
            <CardDescription>
              スマートフォンで読み取ると貸出・返却ページに遷移します
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <QRCodeDisplay equipmentId={item.id} equipmentName={item.name} />
          </CardContent>
        </Card>

        {/* 操作ボタン */}
        <Separator />
        <div className="flex items-center justify-between">
          <Button asChild variant="outline">
            <Link href={`/equipment/${item.id}/edit`}>編集する</Link>
          </Button>
          <DeleteButton equipmentId={item.id} equipmentName={item.name} />
        </div>
      </div>
    </div>
  );
}
