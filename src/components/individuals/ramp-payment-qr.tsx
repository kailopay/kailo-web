"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

type RampPaymentQrProps = {
  value: string;
  size?: number;
};

export function RampPaymentQr({ value, size = 200 }: RampPaymentQrProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value.trim()) {
      setReady(false);
      return;
    }

    let cancelled = false;
    setReady(false);

    void QRCode.toCanvas(canvas, value, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: size,
      color: {
        dark: "#171717",
        light: "#ffffff",
      },
    })
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [size, value]);

  if (!value.trim()) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div
        className="relative overflow-hidden rounded-xl border border-ink/[0.08] bg-white p-3"
        style={{ width: size + 24, height: size + 24 }}
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          aria-label="Stellar payment QR code"
          role="img"
        />
        {!ready ? <div className="absolute inset-3 animate-pulse rounded-lg bg-paper-warm-2" /> : null}
      </div>
    </div>
  );
}
