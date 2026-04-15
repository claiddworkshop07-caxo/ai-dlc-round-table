"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteButtonProps {
  equipmentId: string;
  equipmentName: string;
}

export function DeleteButton({ equipmentId, equipmentName }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setConfirmOpen(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/equipment/${equipmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      router.push("/equipment");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant="destructive"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
      >
        {loading ? "Deleting..." : "Delete"}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Equipment"
        description={`Are you sure you want to delete "${equipmentName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
