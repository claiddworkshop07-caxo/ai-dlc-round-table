"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  equipmentId: string;
  equipmentName: string;
}

export function DeleteButton({ equipmentId, equipmentName }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`「${equipmentName}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/equipment/${equipmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "削除に失敗しました");
      }
      router.push("/equipment");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant="destructive"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? "削除中..." : "削除する"}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
