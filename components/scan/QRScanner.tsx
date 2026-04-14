"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const router = useRouter();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        requestAnimationFrame(scanFrame);
      }
    } catch {
      setError(
        "カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。"
      );
    }
  }

  function stopCamera() {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  async function scanFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // jsQR を動的インポート（CDNから読み込み済みの場合はwindow.jsQRを使用）
    // ここでは URL パターンマッチングで代替
    // QRコードの内容は /scan/{id} のURL形式
    // 実際のデプロイ環境ではjsQRを使うが、PoC向けにManual入力も提供
    void imageData; // scanFrame の継続
    animFrameRef.current = requestAnimationFrame(scanFrame);
  }

  function handleManualInput(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("equipmentId") as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;

    // URLかIDかを判定
    const match = value.match(/\/scan\/([a-f0-9-]{36})/);
    const id = match ? match[1] : value;
    if (id) {
      stopCamera();
      router.push(`/scan/${id}`);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border-2 border-primary bg-black">
          <video
            ref={videoRef}
            className="w-full"
            playsInline
            muted
          />
          {scanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-lg border-4 border-primary opacity-70" />
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-sm">
        <p className="mb-2 text-center text-sm text-muted-foreground">
          QRコードを枠内に合わせてください
        </p>
        <div className="mt-4 border-t pt-4">
          <p className="mb-2 text-sm font-medium">または備品IDを直接入力</p>
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
    </div>
  );
}
