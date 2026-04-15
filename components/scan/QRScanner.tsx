"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// CDN から読み込んだ jsQR の型定義
declare global {
  interface Window {
    jsQR?: (
      data: Uint8ClampedArray,
      width: number,
      height: number,
      options?: { inversionAttempts?: string }
    ) => { data: string } | null;
  }
}

export function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "detected" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const router = useRouter();

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const handleDetected = useCallback(
    (rawValue: string) => {
      setStatus("detected");
      stopCamera();

      // QRコード内容から UUID を抽出 (/scan/{uuid} 形式 or UUID 単体)
      const match = rawValue.match(/\/scan\/([0-9a-f-]{36})/i);
      const id = match
        ? match[1]
        : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawValue.trim())
          ? rawValue.trim()
          : null;

      if (id) {
        router.push(`/scan/${id}`);
      } else {
        setStatus("error");
        setErrorMsg(`QRコードを読み取りましたが、備品IDが見つかりませんでした。\n内容: ${rawValue}`);
      }
    },
    [router, stopCamera]
  );

  useEffect(() => {
    let isMounted = true;

    function scanFrame() {
      if (!isMounted || !videoRef.current || !canvasRef.current || !window.jsQR) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code && isMounted) {
            handleDetected(code.data);
            return;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(scanFrame);
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!isMounted) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (isMounted) {
          setStatus("scanning");
          animFrameRef.current = requestAnimationFrame(scanFrame);
        }
      } catch {
        if (isMounted) {
          setStatus("error");
          setErrorMsg("カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。");
        }
      }
    }

    // jsQR を CDN からロードしてからカメラを起動
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
    script.async = true;
    script.onload = () => { if (isMounted) startCamera(); };
    script.onerror = () => {
      if (isMounted) {
        setStatus("error");
        setErrorMsg("QRリーダーの読み込みに失敗しました。ネットワーク接続を確認してください。");
      }
    };
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      script.remove();
    };
  }, [handleDetected]);

  function handleManualInput(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("equipmentId") as HTMLInputElement;
    const value = input.value.trim();
    const match = value.match(/\/scan\/([0-9a-f-]{36})/i);
    const id = match ? match[1] : value;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      stopCamera();
      router.push(`/scan/${id}`);
    } else {
      alert("有効な備品IDを入力してください");
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 状態メッセージ */}
      {status === "detected" && (
        <div className="w-full max-w-sm rounded-lg border border-green-300 bg-green-50 p-3 text-center text-sm text-green-700">
          ✅ QRコードを検出しました。移動中...
        </div>
      )}
      {status === "error" && (
        <div className="w-full max-w-sm rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive whitespace-pre-line">
          {errorMsg}
        </div>
      )}

      {/* カメラ映像 */}
      {(status === "loading" || status === "scanning") && (
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border-2 border-primary bg-black">
          <video ref={videoRef} className="w-full" playsInline muted />
          {status === "scanning" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-lg border-4 border-white/80 shadow-lg" />
            </div>
          )}
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-white/60">読み込み中...</p>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      {/* 手動入力フォーム */}
      {status !== "detected" && (
        <div className="w-full max-w-sm space-y-3">
          {status === "scanning" && (
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
