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
            {isLend ? "Lending Complete" : "Return Complete"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isLend
              ? "Lending has been recorded. Please scan the QR code again when returning."
              : "Return has been recorded. Thank you for using this service."}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/scan"
              className={buttonVariants()}
            >
              Scan Again
            </Link>
            <Link
              href={`/equipment/${id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              View Equipment Details
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
