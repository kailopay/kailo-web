import { cn } from "@/lib/cn";

type MarqueeRowProps = {
  direction: "left" | "right";
  children: React.ReactNode;
  className?: string;
  /** Animation duration in seconds. */
  duration?: number;
  /** Animation delay in seconds (negative values offset the start position). */
  delay?: number;
};

export function MarqueeRow({
  direction,
  children,
  className,
  duration,
  delay,
}: MarqueeRowProps) {
  const animationName = direction === "left" ? "mqL" : "mqR";
  const resolvedDuration = duration ?? (direction === "left" ? 96 : 78);

  return (
    <div
      className={cn(
        "flex w-max gap-[18px]",
        direction === "left" && "mb-[18px]",
        "motion-reduce:[animation-play-state:paused]",
        className,
      )}
      style={{
        animation: `${animationName} ${resolvedDuration}s linear infinite`,
        animationDelay: delay !== undefined ? `${delay}s` : undefined,
      }}
    >
      {children}
      {children}
      {children}
    </div>
  );
}
