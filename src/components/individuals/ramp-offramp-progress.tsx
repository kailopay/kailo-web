"use client";

import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/lib/kailopay/types";

const OFFRAMP_PHASES = [
  { key: "deposit", label: "Send XLM", statuses: ["asset_pending"] as OrderStatus[] },
  {
    key: "received",
    label: "Deposit received",
    statuses: ["asset_received"] as OrderStatus[],
  },
  {
    key: "processing",
    label: "Processing",
    statuses: ["retirement_processing", "withdrawal_processing"] as OrderStatus[],
  },
  { key: "done", label: "Payout", statuses: ["completed"] as OrderStatus[] },
];

function phaseState(
  phaseIndex: number,
  currentIndex: number,
  status: OrderStatus,
): "done" | "current" | "upcoming" | "failed" {
  const failed = ["asset_invalid", "retirement_failed", "withdrawal_failed", "expired", "cancelled"];
  if (failed.includes(status)) {
    if (phaseIndex < currentIndex) return "done";
    if (phaseIndex === currentIndex) return "failed";
    return "upcoming";
  }
  if (phaseIndex < currentIndex) return "done";
  if (phaseIndex === currentIndex) return "current";
  return "upcoming";
}

function currentPhaseIndex(status: OrderStatus): number {
  if (status === "completed") return 3;
  if (status === "withdrawal_processing") return 2;
  if (status === "retirement_processing" || status === "asset_received") return 1;
  if (status === "asset_pending") return 0;
  if (["asset_invalid", "expired"].includes(status)) return 0;
  if (status === "retirement_failed") return 2;
  if (status === "withdrawal_failed") return 3;
  return 0;
}

type RampOfframpProgressProps = {
  status: OrderStatus;
};

export function RampOfframpProgress({ status }: RampOfframpProgressProps) {
  const currentIndex = currentPhaseIndex(status);

  return (
    <ol className="ramp-offramp-progress" aria-label="Sell order progress">
      {OFFRAMP_PHASES.map((phase, index) => {
        const state = phaseState(index, currentIndex, status);
        return (
          <li
            key={phase.key}
            className={cn("ramp-offramp-progress__step", `is-${state}`)}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="ramp-offramp-progress__dot" aria-hidden="true" />
            <span className="ramp-offramp-progress__label">{phase.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
