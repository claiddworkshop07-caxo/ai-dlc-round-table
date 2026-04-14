"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ReturnConfirmProps {
  lendingId: string;
  equipmentId: string;
  equipmentName: string;
  borrowerName: string;
  dueDate: string;
}

export function ReturnConfirm({
  lendingId,
  equipmentId,
  equipmentName,
  borrowerName,
  dueDate,
}: ReturnConfirmProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOverdue = new Date(dueDate) < new Date(new Date().toDateString());

  async function handleReturn() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lending/${lendingId}/return`, {
        method: "PUT",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "エラーが発生しました");
      }

      router.push(`/scan/${equipmentId}/done?action=return`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/60 p-4 space-y-2 text-sm">
        <p className="font-medium">返却する備品</p>
        <p className="text-muted-foreground">{equipmentName}</p>
        <div className="border-t pt-2 mt-2">
          <p>
            <span className="text-muted-foreground">借用者: </span>
            {borrowerName}
          </p>
          <p>
            <span className="text-muted-foreground">返却予定日: </span>
            <span className={isOverdue ? "text-destructive font-medium" : ""}>
              {dueDate}
              {isOverdue && " ⚠ 期限超過"}
            </span>
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleReturn}
        disabled={loading}
        className="w-full"
      >
        {loading ? "処理中..." : "返却する"}
      </Button>
    </div>
  );
}
