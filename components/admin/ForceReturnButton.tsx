"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ForceReturnButtonProps {
  lendingId: string;
  equipmentName: string;
  borrowerName: string;
}

export function ForceReturnButton({
  lendingId,
  equipmentName,
  borrowerName,
}: ForceReturnButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleForceReturn() {
    if (
      !confirm(
        `Force return "${equipmentName}" borrowed by ${borrowerName}?\nThis will immediately mark the item as returned.`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/force-return/${lendingId}`, {
        method: "PUT",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to force return");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to force return");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleForceReturn}
        disabled={loading}
      >
        {loading ? "Processing..." : "Force Return"}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
