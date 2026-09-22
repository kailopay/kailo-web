import { cn } from "@dub/utils";

const SIZE_CONFIG = {
  sm: {
    display: 100,
    frame: "w-full py-4",
  },
  md: {
    display: 176,
    frame: "w-full py-4",
  },
} as const;

type PaymentQrCodeSkeletonProps = {
  size?: "sm" | "md";
  className?: string;
};

export function PaymentQrCodeSkeleton({
  size = "md",
  className,
}: PaymentQrCodeSkeletonProps) {
  const config = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-md border border-neutral-300 bg-white",
        config.frame,
        className,
      )}
      role="status"
      aria-label="Loading QR code"
    >
      <div className="relative z-[1] flex shrink-0 items-center justify-center">
        <div
          className="animate-pulse rounded-sm bg-neutral-200/60"
          style={{ width: config.display, height: config.display }}
        />
      </div>
    </div>
  );
}
