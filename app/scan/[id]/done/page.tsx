import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string }>;
};

export default async function DonePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { action } = await searchParams;
  const isLend = action === "lend";

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/40 px-4 py-16">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl">
            {isLend ? "📤" : "📥"}
          </div>
          <CardTitle className="text-green-700">
            {isLend ? "貸出完了" : "返却完了"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isLend
              ? "貸出を記録しました。返却の際は再度QRコードをスキャンしてください。"
              : "返却を記録しました。ご利用ありがとうございました。"}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/scan"
              className={buttonVariants()}
            >
              続けてスキャン
            </Link>
            <Link
              href={`/equipment/${id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              備品詳細を見る
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
