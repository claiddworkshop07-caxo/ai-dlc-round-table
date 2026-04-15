"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LendingFormProps {
  equipmentId: string;
  equipmentName: string;
}

export function LendingForm({ equipmentId, equipmentName }: LendingFormProps) {
  const router = useRouter();
  const [borrowerName, setBorrowerName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // デフォルト返却予定日: 7日後
  const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/lending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId,
          borrowerName,
          dueDate: dueDate || defaultDueDate,
          memo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "An error occurred");
      }

      router.push(`/scan/${equipmentId}/done?action=lend`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-muted/60 p-3 text-sm">
        <p className="font-medium">Equipment to Borrow</p>
        <p className="text-muted-foreground">{equipmentName}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="borrowerName">Borrower Name *</Label>
        <Input
          id="borrowerName"
          value={borrowerName}
          onChange={(e) => setBorrowerName(e.target.value)}
          placeholder="e.g. John Smith"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate || defaultDueDate}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">Notes (optional)</Label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Remarks, purpose, etc."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={2}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Processing..." : "Borrow"}
      </Button>
    </form>
  );
}
