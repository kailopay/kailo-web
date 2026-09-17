"use client";

type RampViewTransitionProps = {
  viewKey: string;
  children: React.ReactNode;
  className?: string;
};

export function RampViewTransition({
  viewKey,
  children,
  className,
}: RampViewTransitionProps) {
  return (
    <div
      key={viewKey}
      className={["ramp-view-transition", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
