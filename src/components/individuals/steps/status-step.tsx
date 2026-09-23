"use client";

import { useCallback, useEffect, useState } from "react";

import { rampErrorMessage, shouldRedirectToAuth } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";
import {
  hasDepositInstructions,
  isOfframpOrder,
  mergeOrderUpdates,
  offrampProgressMessage,
} from "@/lib/kailopay/order-utils";
import { getOrder, isTerminalStatus, paymentLinkForCheckout } from "@/lib/kailopay/orders";
import type { Order, OrderStatus } from "@/lib/kailopay/types";
import { formatIdr, formatXlmDisplay } from "@/lib/ramp-format";
import { PrimaryButton } from "../../ui/primary-button";
import { SecondaryButton } from "../../ui/secondary-button";
import { RampCopyButton } from "../ramp-copy-button";
import { RampDepositInstructions } from "../ramp-deposit-instructions";
import { RampOrderSummary } from "../ramp-order-summary";
import type { RampHeaderConfig } from "../ramp-step-header";

type StatusStepProps = {
  orderId: string;
  initialOrder?: Order | null;
  onNewTransaction: () => void;
  onNeedAuth: () => void;
  notice?: string;
  onHeaderChange?: (config: RampHeaderConfig) => void;
};

const STATUS_LABELS: Record<string, string> = {
  created: "Order created",
  payment_pending: "Waiting for payment",
  payment_confirmed: "Payment confirmed",
  stellar_processing: "Sending XLM",
  completed: "Completed",
  expired: "Expired",
  payment_failed: "Payment failed",
  stellar_failed: "Transfer failed",
  cancelled: "Cancelled",
  asset_pending: "Waiting for your XLM deposit",
  asset_received: "Deposit received",
  asset_invalid: "Invalid deposit",
  retirement_processing: "Processing your sell",
  withdrawal_processing: "Processing payout",
  retirement_failed: "Processing failed",
  withdrawal_failed: "Withdrawal failed",
};

function isOfframpFailure(status: OrderStatus): boolean {
  return ["asset_invalid", "retirement_failed", "withdrawal_failed", "expired", "cancelled"].includes(
    status,
  );
}

export function StatusStep({
  orderId,
  initialOrder = null,
  onNewTransaction,
  onNeedAuth,
  notice,
  onHeaderChange,
}: StatusStepProps) {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const fresh = await getOrder(orderId);
      setOrder((current) => mergeOrderUpdates(current, fresh));
      setError(null);
      return fresh;
    } catch (caught) {
      if (shouldRedirectToAuth(caught)) {
        onNeedAuth();
        return null;
      }
      if (caught instanceof KailopayError) {
        setError(rampErrorMessage(caught));
      } else {
        setError("Could not load order status.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId, onNeedAuth]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (!onHeaderChange) return;
    if (loading && !order) {
      onHeaderChange({ title: "Order status" });
      return;
    }
    if (!order) {
      onHeaderChange({ title: "Order status" });
      return;
    }

    if (!isOfframpOrder(order)) {
      onHeaderChange({
        title:
          order.status === "completed" ? "Transaction complete" : "Transaction in progress",
      });
      return;
    }

    if (order.status === "completed") {
      onHeaderChange({ title: "Sell complete" });
      return;
    }
    if (order.status === "asset_pending") {
      onHeaderChange({ title: "Send your XLM" });
      return;
    }
    if (isOfframpFailure(order.status)) {
      onHeaderChange({ title: "Sell could not be completed" });
      return;
    }

    onHeaderChange({ title: "Processing your sell" });
  }, [loading, order, onHeaderChange]);

  useEffect(() => {
    if (!order || isTerminalStatus(order.status)) return;

    const interval = setInterval(() => {
      void fetchOrder();
    }, 4000);

    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  if (loading && !order) {
    return <p className="text-sm text-ink-muted">Loading order status...</p>;
  }

  if (!order) {
    return (
      <div>
        <p className="ramp-error-message">{error ?? "Order not found."}</p>
        <button
          type="button"
          onClick={onNewTransaction}
          className="mt-4 text-[13px] font-medium text-action hover:underline"
        >
          Start new transaction
        </button>
      </div>
    );
  }

  if (!isOfframpOrder(order)) {
    const paymentLink = paymentLinkForCheckout(order.checkout);

    return (
      <div>
        {notice && <p className="mb-4 text-[13px] text-amber-700">{notice}</p>}

        <div className="rounded-xl bg-paper-warm-2 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-body">Status</span>
            <span className="text-[13px] font-semibold text-ink">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-body">Order ID</span>
            <span className="max-w-[180px] truncate font-mono text-[11px] text-ink">{order.id}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-body">You pay</span>
            <span className="text-[13px] font-semibold text-ink">
              Rp {formatIdr(Number(order.fiat.amount_minor))}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-body">You receive</span>
            <span className="text-[13px] font-semibold text-ink">
              {formatXlmDisplay(order.asset.amount)} XLM
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[13px] text-ink-body">Rate</span>
            <span className="text-[13px] text-ink">
              1 XLM = Rp {formatIdr(Number(order.quote.adjusted_rate))}
            </span>
          </div>
        </div>

        {paymentLink && order.status === "payment_pending" && (
          <PrimaryButton
            className="mt-4"
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            size="md"
          >
            Open payment page
          </PrimaryButton>
        )}

        {order.stellar_transaction_hash && (
          <div className="mt-4 min-w-0 rounded-xl bg-paper-warm-2 px-4 py-3">
            <p className="text-[13px] text-ink-body">Stellar transaction</p>
            <p className="ramp-mono-break mt-1 text-[11px]">{order.stellar_transaction_hash}</p>
          </div>
        )}

        {error && <p className="mt-3 ramp-error-message">{error}</p>}

        <SecondaryButton className="mt-5" onClick={onNewTransaction}>
          New transaction
        </SecondaryButton>
      </div>
    );
  }

  if (order.status === "asset_pending") {
    return (
      <div>
        {notice && <p className="mb-4 text-[13px] text-amber-700">{notice}</p>}

        <RampDepositInstructions
          amount={order.asset.amount}
          account={order.stellar_destination.account}
          memo={order.stellar_destination.memo}
          expiresAt={order.quote.expires_at}
          onRetry={() => void fetchOrder()}
        />

        <RampOrderSummary
          className="mt-4"
          rows={[
            { label: "You receive", value: `Rp ${formatIdr(Number(order.fiat.amount_minor))}` },
            { label: "Rate", value: `1 XLM = Rp ${formatIdr(Number(order.quote.adjusted_rate))}` },
          ]}
        />

        {!hasDepositInstructions(order) && error ? (
          <p className="mt-3 ramp-error-message">{error}</p>
        ) : null}

        <SecondaryButton className="mt-5" onClick={onNewTransaction}>
          New transaction
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div>
      {notice && <p className="mb-4 text-[13px] text-amber-700">{notice}</p>}

      <div className="rounded-xl bg-paper-warm-2 px-4 py-3">
        <p className="text-[13px] font-semibold text-ink">
          {STATUS_LABELS[order.status] ?? order.status}
        </p>
        <p className="mt-2 text-[12px] text-ink-body">{offrampProgressMessage(order)}</p>

        <RampOrderSummary
          embedded
          className="mt-4"
          rows={[
            { label: "You paid", value: `${formatXlmDisplay(order.asset.amount)} XLM` },
            { label: "You receive", value: `Rp ${formatIdr(Number(order.fiat.amount_minor))}` },
          ]}
        />

        {order.deposit_transaction_hash ? (
          <div className="mt-4 min-w-0">
            <p className="text-[13px] text-ink-body">Your deposit transaction</p>
            <div className="flex items-start gap-3">
              <p className="ramp-mono-break min-w-0 flex-1 text-[11px] text-ink">
                {order.deposit_transaction_hash}
              </p>
              <RampCopyButton value={order.deposit_transaction_hash} label="deposit transaction" />
            </div>
          </div>
        ) : null}

        {order.stellar_transaction_hash ? (
          <div className="mt-4 min-w-0">
            <p className="text-[13px] text-ink-body">Retirement transaction</p>
            <p className="ramp-mono-break mt-1 text-[11px] text-ink">{order.stellar_transaction_hash}</p>
          </div>
        ) : null}

        {order.payout ? (
          <div className="mt-4">
            <p className="text-[13px] font-medium text-ink">Payout reference</p>
            <p className="mt-1 font-mono text-[12px] text-ink">{order.payout.reference}</p>
            {order.payout.disclosure ? (
              <p className="mt-2 text-[12px] leading-relaxed text-ink-body">{order.payout.disclosure}</p>
            ) : null}
          </div>
        ) : null}

        {isOfframpFailure(order.status) && order.failure_code ? (
          <p className="mt-4 text-[12px] text-ink-body">
            Reason: <span className="font-mono">{order.failure_code}</span>
          </p>
        ) : null}
      </div>

      {error && <p className="mt-3 ramp-error-message">{error}</p>}

      <SecondaryButton className="mt-5" onClick={onNewTransaction}>
        New transaction
      </SecondaryButton>
    </div>
  );
}
