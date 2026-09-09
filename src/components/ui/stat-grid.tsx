import type { StatItem } from "@/content/landing";
import { cn } from "@/lib/cn";

type StatGridProps = {
  items: StatItem[];
};

export function StatGrid({ items }: StatGridProps) {
  return (
    <div className="grid grid-cols-2 border-y border-ink/[0.11] md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "border-ink/[0.11] py-[34px] px-[26px]",
            item.className,
          )}
        >
          <div className="font-display text-[38px] font-bold leading-none tracking-[-0.035em] text-ink [font-stretch:110%]">
            {item.value}
          </div>
          <div className="mt-2.5 text-[13px] text-[#6B7683]">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
