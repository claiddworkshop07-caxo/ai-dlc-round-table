"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleForceReturn() {
    setConfirmOpen(false);
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
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
      >
        {loading ? "Processing..." : "Force Return"}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      <ConfirmDialog
        open={confirmOpen}
        title="Force Return"
        description={`Force return "${equipmentName}" borrowed by ${borrowerName}? This will immediately mark the item as returned.`}
        confirmLabel="Force Return"
        onConfirm={handleForceReturn}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
