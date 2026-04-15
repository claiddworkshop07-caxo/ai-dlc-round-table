"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// BarcodeDetector は TypeScript の標準型定義に含まれていないため宣言
declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(
    image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<{ rawValue: string; format: string }[]>;
  static getSupportedFormats(): Promise<string[]>;
}

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const detectorRef = useRef<InstanceType<typeof BarcodeDetector> | null>(null);
  const router = useRouter();

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleDetected = useCallback(
    (rawValue: string) => {
      setDetected(true);
      stopCamera();

      // QRコード内容から備品IDを抽出 (/scan/{uuid} 形式 or UUID単体)
      const match = rawValue.match(/\/scan\/([0-9a-f-]{36})/i);
      const id = match ? match[1] : rawValue.trim();

      if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        router.push(`/scan/${id}`);
      } else {
        setError(`QRコードを読み取りましたが、備品IDが見つかりませんでした。\n内容: ${rawValue}`);
        setDetected(false);
      }
    },
    [router, stopCamera]
  );

  useEffect(() => {
    let isMounted = true;

    async function scan() {
      if (!isMounted || !videoRef.current || !detectorRef.current) return;
      const video = videoRef.current;

      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detectorRef.current.detect(video);
          if (barcodes.length > 0 && isMounted) {
            handleDetected(barcodes[0].rawValue);
            return;
          }
        } catch {
          // 検出ループのエラーは無視して継続
        }
      }
      animFrameRef.current = requestAnimationFrame(scan);
    }

    async function init() {
      // BarcodeDetector API サポート確認
      if (!("BarcodeDetector" in window)) {
        if (isMounted) {
          setError(
            "このブラウザはQRコード自動読み取りに対応していません（Chrome推奨）。\n下の入力欄に備品IDを入力してください。"
          );
        }
        return;
      }

      try {
        detectorRef.current = new BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        if (isMounted)
          setError("QRリーダーの初期化に失敗しました。手動入力をご利用ください。");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (isMounted) {
            setScanning(true);
            animFrameRef.current = requestAnimationFrame(scan);
          }
        }
      } catch {
        if (isMounted)
          setError(
            "カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。"
          );
      }
    }

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [handleDetected]);

  function handleManualInput(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("equipmentId") as HTMLInputElement);
    const value = input.value.trim();
    if (!value) return;

    const match = value.match(/\/scan\/([0-9a-f-]{36})/i);
    const id = match ? match[1] : value;

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      stopCamera();
      router.push(`/scan/${id}`);
    } else {
      alert("有効な備品IDを入力してください（例: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）");
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {detected && (
        <div className="w-full max-w-sm rounded-lg border border-green-300 bg-green-50 p-3 text-center text-sm text-green-700">
          ✅ QRコードを検出しました。移動中...
        </div>
      )}

      {error && !detected && (
        <div className="w-full max-w-sm rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive whitespace-pre-line">
          {error}
        </div>
      )}

      {!error && !detected && (
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border-2 border-primary bg-black">
          <video ref={videoRef} className="w-full" playsInline muted />
          {scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-lg border-4 border-white/80 shadow-lg" />
            </div>
          )}
          {!scanning && (
            <div className="flex h-48 items-center justify-center text-sm text-white/60">
              カメラを起動中...
            </div>
          )}
        </div>
      )}

      {!detected && (
        <div className="w-full max-w-sm space-y-4">
          {scanning && (
            <p className="text-center text-sm text-muted-foreground">
              📷 QRコードを白枠内に合わせてください
            </p>
          )}
          <div className="border-t pt-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              または備品IDを直接入力
            </p>
            <form onSubmit={handleManualInput} className="flex gap-2">
              <input
                name="equipmentId"
                placeholder="備品IDまたはスキャンURL"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                移動
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
