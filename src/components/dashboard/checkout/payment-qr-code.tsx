"use client";

import { ClientOnly, ShimmerDots } from "@dub/ui";
import { cn } from "@dub/utils";
import { AnimatePresence, motion } from "motion/react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

const XLM_LOGO = "/marketing/logos/xlm.svg";

// Matches landing page QR center logo layout (viewBox 0 0 29 29).
const QR_CENTER_PLATE = {
  centerX: (10.9 + 7.35 / 2) / 29,
  centerY: (10.9 + 7.2 / 2) / 29,
  radius: 7.35 / 2 / 29,
} as const;

const QR_CENTER_LOGO = {
  x: 11.375 / 29,
  y: 11.375 / 29,
  size: 6.25 / 29,
} as const;

type PaymentQrCodeProps = {
  value: string;
  size?: "sm" | "md";
  className?: string;
  showLogo?: boolean;
};

const SIZE_CONFIG = {
  sm: {
    display: 100,
    frame: "w-full py-4",
  },
  md: {
    display: 200,
    frame: "w-full py-4",
  },
} as const;

function getRenderScale() {
  if (typeof window === "undefined") {
    return 4;
  }

  return Math.max(4, Math.ceil(window.devicePixelRatio) * 2);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load logo"));
    image.src = url;
  });
}

function fillCircle(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
) {
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.closePath();
  context.fill();
}

async function renderQrCanvas({
  canvas,
  payUri,
  logoUrl,
  displaySize,
  showLogo,
}: {
  canvas: HTMLCanvasElement;
  payUri: string;
  logoUrl: string;
  displaySize: number;
  showLogo: boolean;
}) {
  const scale = getRenderScale();
  const renderSize = displaySize * scale;

  canvas.width = renderSize;
  canvas.height = renderSize;

  await QRCode.toCanvas(canvas, payUri, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: renderSize,
    color: {
      dark: "#171717",
      light: "#ffffff",
    },
  });

  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";

  if (!showLogo) {
    return false;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return false;
  }

  const plateCenterX = renderSize * QR_CENTER_PLATE.centerX;
  const plateCenterY = renderSize * QR_CENTER_PLATE.centerY;
  const plateRadius = renderSize * QR_CENTER_PLATE.radius;

  context.fillStyle = "#ffffff";
  fillCircle(context, plateCenterX, plateCenterY, plateRadius);

  try {
    const logo = await loadImage(logoUrl);
    const logoX = renderSize * QR_CENTER_LOGO.x;
    const logoY = renderSize * QR_CENTER_LOGO.y;
    const logoSize = renderSize * QR_CENTER_LOGO.size;
    context.drawImage(logo, logoX, logoY, logoSize, logoSize);
    return true;
  } catch {
    return false;
  }
}

function QrLogoOverlay({ logoUrl }: { logoUrl: string }) {
  return (
    <motion.div
      key={logoUrl}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute inset-0"
    >
      <div
        className="absolute rounded-full bg-white"
        style={{
          left: `${(QR_CENTER_PLATE.centerX - QR_CENTER_PLATE.radius) * 100}%`,
          top: `${(QR_CENTER_PLATE.centerY - QR_CENTER_PLATE.radius) * 100}%`,
          width: `${QR_CENTER_PLATE.radius * 2 * 100}%`,
          height: `${QR_CENTER_PLATE.radius * 2 * 100}%`,
        }}
        aria-hidden
      />
      <img
        src={logoUrl}
        alt=""
        aria-hidden
        className="absolute object-fill"
        style={{
          left: `${QR_CENTER_LOGO.x * 100}%`,
          top: `${QR_CENTER_LOGO.y * 100}%`,
          width: `${QR_CENTER_LOGO.size * 100}%`,
          height: `${QR_CENTER_LOGO.size * 100}%`,
        }}
      />
    </motion.div>
  );
}

export function PaymentQrCode({
  value,
  size = "md",
  className,
  showLogo = true,
}: PaymentQrCodeProps) {
  const config = SIZE_CONFIG[size];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [useLogoOverlay, setUseLogoOverlay] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value.trim()) {
      setIsReady(false);
      setUseLogoOverlay(false);
      return;
    }

    let cancelled = false;
    setIsReady(false);
    setUseLogoOverlay(false);

    renderQrCanvas({
      canvas,
      payUri: value,
      logoUrl: XLM_LOGO,
      displaySize: config.display,
      showLogo,
    })
      .then((logoComposited) => {
        if (!cancelled) {
          setUseLogoOverlay(showLogo && !logoComposited);
          setIsReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUseLogoOverlay(showLogo);
          setIsReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [config.display, showLogo, value]);

  if (!value.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-md border border-neutral-300 bg-white",
        config.frame,
        className,
      )}
    >
      <ClientOnly>
        <div className="absolute inset-0 overflow-hidden rounded-md">
          <ShimmerDots className="opacity-30" />
        </div>
      </ClientOnly>

      <div className="relative z-[1] flex shrink-0 items-center justify-center">
        <div
          className="relative aspect-square shrink-0 overflow-hidden"
          style={{ width: config.display, height: config.display }}
        >
          <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{
              opacity: isReady ? 1 : 0,
              scale: isReady ? 1 : 0.985,
            }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="block h-full w-full [image-rendering:crisp-edges] [image-rendering:-webkit-optimize-contrast]"
            aria-label="Stellar payment QR code"
            role="img"
          />

          {!isReady ? (
            <div className="absolute inset-0 animate-pulse rounded-sm bg-neutral-100" />
          ) : null}

          <AnimatePresence mode="wait">
            {isReady && useLogoOverlay ? <QrLogoOverlay logoUrl={XLM_LOGO} /> : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
