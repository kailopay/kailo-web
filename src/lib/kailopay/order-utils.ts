import { formatIdr } from "@/lib/ramp-format";
import type { Order, OrderStatus } from "./types";

const OFFRAMP_STATUSES = new Set<OrderStatus>([
  "asset_pending",
  "asset_received",
  "asset_invalid",
  "retirement_processing",
  "withdrawal_processing",
  "retirement_failed",
  "withdrawal_failed",
]);

export function isOfframpStatus(status: OrderStatus): boolean {
  return OFFRAMP_STATUSES.has(status);
}

export function isOfframpOrder(
  order: Pick<Order, "status" | "direction" | "checkout" | "deposit_transaction_hash" | "payout">,
): boolean {
  if (order.direction === "offramp") {
    return true;
  }
  if (isOfframpStatus(order.status)) {
    return true;
  }
  if (order.deposit_transaction_hash) {
    return true;
  }
  return Boolean(order.payout);
}

export function hasDepositInstructions(
  order: Pick<Order, "stellar_destination">,
): boolean {
  const account = order.stellar_destination.account.trim();
  const memo = order.stellar_destination.memo?.trim() ?? "";
  return account.length > 0 && memo.length > 0;
}

export function mergeOrderUpdates(previous: Order | null, next: Order): Order {
  if (!previous) {
    return next;
  }

  if (hasDepositInstructions(next) || !hasDepositInstructions(previous)) {
    return next;
  }

  return {
    ...next,
    stellar_destination: previous.stellar_destination,
  };
}

export function offrampProgressMessage(order: Order): string {
  switch (order.status) {
    case "asset_received":
      return "Your XLM deposit was detected. Processing your sell order.";
    case "retirement_processing":
      return "Your deposit is confirmed. Retiring XLM on Stellar testnet.";
    case "withdrawal_processing":
      return "Retirement is complete. Waiting for the sandbox payout step to finish.";
    case "completed":
      if (order.payout) {
        return order.payout.disclosure;
      }
      return `Your sell is complete. You receive Rp ${formatIdr(Number(order.fiat.amount_minor))}.`;
    default:
      return "We will update this page automatically when your order moves forward.";
  }
}
