"use client";

import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stableOnCancel = useCallback(onCancel, [onCancel]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  // Sync Escape key close with React state
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    el.addEventListener("close", stableOnCancel);
    return () => el.removeEventListener("close", stableOnCancel);
  }, [stableOnCancel]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      className="rounded-lg border bg-background p-6 shadow-lg backdrop:bg-black/50 w-full max-w-sm"
    >
      <h2 id="confirm-title" className="text-base font-semibold">
        {title}
      </h2>
      <p id="confirm-desc" className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
