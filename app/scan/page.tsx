import { QRScanner } from "@/components/scan/QRScanner";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function ScanPage() {
  return (
    <div className="min-h-full bg-muted/40 px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ← 戻る
          </Link>
          <h1 className="text-xl font-semibold">QRコードをスキャン</h1>
        </div>
        <QRScanner />
      </div>
    </div>
  );
}
