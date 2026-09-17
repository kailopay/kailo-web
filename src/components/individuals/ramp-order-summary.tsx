"use client";

type RampOrderSummaryRow = {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
};

type RampOrderSummaryProps = {
  rows: RampOrderSummaryRow[];
  className?: string;
};

export function RampOrderSummary({ rows, className }: RampOrderSummaryProps) {
  return (
    <div
      className={["space-y-2 rounded-xl bg-paper-warm-2 px-4 py-3 text-[13px] text-ink-body", className]
        .filter(Boolean)
        .join(" ")}
    >
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-3">
          <span>{row.label}</span>
          <span
            className={[
              "font-semibold text-ink",
              row.mono ? "font-mono text-[11px]" : "text-[13px]",
              row.truncate ? "max-w-[200px] truncate" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
