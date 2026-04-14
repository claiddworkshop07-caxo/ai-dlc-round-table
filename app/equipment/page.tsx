import Link from "next/link";
import { db } from "@/src/db";
import { equipment } from "@/src/schema";
import { isNull, desc } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EquipmentPage() {
  const rows = await db
    .select()
    .from(equipment)
    .where(isNull(equipment.deletedAt))
    .orderBy(desc(equipment.createdAt));

  return (
    <div className="min-h-full bg-muted/40 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">備品一覧</h1>
            <p className="text-sm text-muted-foreground">
              登録されている備品を管理します
            </p>
          </div>
          <Link href="/equipment/new" className={buttonVariants()}>
            + 新規登録
          </Link>
        </div>

        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              備品が登録されていません。「新規登録」から追加してください。
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rows.map((item) => (
              <Link key={item.id} href={`/equipment/${item.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{item.name}</CardTitle>
                        {item.category && (
                          <CardDescription>{item.category}</CardDescription>
                        )}
                      </div>
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
                    {item.location && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        保管場所: {item.location}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="pt-4">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            ← トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
