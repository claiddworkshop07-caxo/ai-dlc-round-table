"use client";

import { useEffect, useState } from "react";

interface QRCodeDisplayProps {
  equipmentId: string;
  equipmentName: string;
}

export function QRCodeDisplay({ equipmentId, equipmentName }: QRCodeDisplayProps) {
  const [scanUrl, setScanUrl] = useState<string>("");

  useEffect(() => {
    setScanUrl(`${window.location.origin}/scan/${equipmentId}`);
  }, [equipmentId]);

  const qrApiUrl = scanUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanUrl)}`
    : null;

  function handleDownload() {
    if (!qrApiUrl) return;
    const link = document.createElement("a");
    link.href = qrApiUrl;
    link.download = `qr_${equipmentName}.png`;
    link.click();
  }

  if (!scanUrl) {
    return (
      <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        生成中...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrApiUrl!}
        alt={`QRコード: ${equipmentName}`}
        width={200}
        height={200}
        className="rounded-lg border bg-white p-2"
      />
      <p className="text-xs text-muted-foreground break-all max-w-[220px] text-center">
        {scanUrl}
      </p>
      <button
        onClick={handleDownload}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted transition-colors"
      >
        QRコードをダウンロード
      </button>
    </div>
  );
}
