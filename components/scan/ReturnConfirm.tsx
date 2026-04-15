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
        throw new Error(data.error ?? "An error occurred");
      }

      router.push(`/scan/${equipmentId}/done?action=return`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/60 p-4 space-y-2 text-sm">
        <p className="font-medium">Equipment to Return</p>
        <p className="text-muted-foreground">{equipmentName}</p>
        <div className="border-t pt-2 mt-2">
          <p>
            <span className="text-muted-foreground">Borrower: </span>
            {borrowerName}
          </p>
          <p>
            <span className="text-muted-foreground">Due Date: </span>
            <span className={isOverdue ? "text-destructive font-medium" : ""}>
              {dueDate}
              {isOverdue && " ⚠ Overdue"}
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
        {loading ? "Processing..." : "Return"}
      </Button>
    </div>
  );
}
