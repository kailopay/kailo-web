import { SmoothSkeleton } from "@/components/dashboard/ui/shared/smooth-skeleton";
import { cn } from "@dub/utils";
import type { CSSProperties, ReactNode } from "react";

export function DeveloperSummaryStats({
  stats,
  isLoading = false,
}: {
  stats: { label: string; value: ReactNode }[];
  isLoading?: boolean;
}) {
  return (
    <div className="@container/stats">
      <div
        className={cn(
          "@xs/stats:grid-cols-[repeat(var(--cols),1fr)] grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200",
        )}
        style={{ "--cols": stats.length } as CSSProperties}
      >
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col bg-white p-3">
            <span className="text-xs text-neutral-500">{label}</span>
            {isLoading ? (
              <SmoothSkeleton className="mt-1 h-5 w-16" />
            ) : (
              <span className="text-content-emphasis mt-1 text-sm font-medium">{value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
