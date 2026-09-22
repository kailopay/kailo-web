"use client";

import { useEffect, useRef, useState } from "react";

import { apiPaymentMethodForId } from "@/content/individuals";
import {
  rampErrorMessage,
  shouldRedirectToAuth,
  shouldRedirectToKYC,
} from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";
import {
  createOfframp,
  createOnramp,
  formatXlmAmount,
  paymentLinkForCheckout,
} from "@/lib/kailopay/orders";
import {
  buildPayoutDestinationToken,
  payoutBankById,
  sanitizeAccountNumber,
} from "@/lib/kailopay/payout-destination";
import { savePendingOrderId } from "@/lib/kailopay/storage";
import { useQuotePreview } from "@/lib/kailopay/use-quote-preview";
import type { Order, RampDraft } from "@/lib/kailopay/types";
import { formatIdr, parseAmountInput, parseIntegerInput } from "@/lib/ramp-format";
import { PrimaryButton } from "../../ui/primary-button";
import { RampOrderSummary } from "../ramp-order-summary";
import { RampStepLoading } from "../ramp-step-loading";
import type { RampHeaderConfig } from "../ramp-step-header";

type PaymentStepProps = {
  draft: RampDraft;
  autoSubmit?: boolean;
  onOrderCreated: (order: Order) => void;
  onReconciliation: (orderId: string, requestId: string | null) => void;
  onNeedAuth: () => void;
  onNeedKYC: () => void;
  onHeaderChange?: (config: RampHeaderConfig) => void;
};

export function PaymentStep({
  draft,
  autoSubmit = false,
  onOrderCreated,
  onReconciliation,
  onNeedAuth,
  onNeedKYC,
  onHeaderChange,
}: PaymentStepProps) {
  const [submitting, setSubmitting] = useState(autoSubmit);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const submittedRef = useRef(false);

  const isBuy = draft.mode === "buy";
  const payNumeric = isBuy
    ? parseIntegerInput(draft.payAmount)
    : parseAmountInput(draft.payAmount);

  const { receiveAmount } = useQuotePreview("sell", isBuy ? 0 : payNumeric);

  async function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);
    setRequestId(null);

    try {
      if (isBuy) {
        const order = await createOnramp({
          idempotencyKey: draft.idempotencyKey,
          amountMinor: String(payNumeric),
          paymentMethod: apiPaymentMethodForId(draft.paymentMethodId),
          destinationAccount: draft.stellarAccount.trim(),
          memo: draft.memo.trim() === "" ? null : draft.memo.trim(),
        });

        savePendingOrderId(order.id);
        const paymentLink = paymentLinkForCheckout(order.checkout);
        if (paymentLink) {
          window.open(paymentLink, "_blank", "noopener,noreferrer");
          onOrderCreated(order);
          return;
        }
        onOrderCreated(order);
        return;
      }

      const destinationToken =
        draft.payoutDestination.trim() ||
        buildPayoutDestinationToken({
          bankId: draft.payoutBankId,
          accountNumber: draft.payoutAccountNumber,
          accountName: draft.payoutAccountName,
        });

      const order = await createOfframp({
        idempotencyKey: draft.idempotencyKey,
        assetAmount: formatXlmAmount(payNumeric),
        destinationToken,
      });
      savePendingOrderId(order.id);
      onOrderCreated(order);
    } catch (caught) {
      if (shouldRedirectToAuth(caught)) {
        onNeedAuth();
        return;
      }
      if (shouldRedirectToKYC(caught)) {
        onNeedKYC();
        return;
      }
      if (caught instanceof KailopayError && caught.status === 202 && caught.orderId) {
        savePendingOrderId(caught.orderId);
        onReconciliation(caught.orderId, caught.requestId);
        return;
      }
      if (caught instanceof KailopayError) {
        setError(rampErrorMessage(caught));
        setRequestId(caught.requestId);
      } else {
        setError("Could not create order. Try again.");
      }
    } finally {
      setSubmitting(false);
      submittedRef.current = false;
    }
  }

  useEffect(() => {
    if (autoSubmit) {
      void handleSubmit();
    }
  }, [autoSubmit]);

  useEffect(() => {
    if (!onHeaderChange) return;
    if (autoSubmit && submitting && !error) {
      onHeaderChange({
        title: isBuy ? "Preparing checkout" : "Creating your sell order",
      });
      return;
    }
    onHeaderChange({
      title: isBuy ? "Review and confirm" : "Confirm your sell order",
    });
  }, [autoSubmit, submitting, error, isBuy, onHeaderChange]);

  if (isBuy) {
    if (autoSubmit && submitting && !error) {
      return (
        <div>
          <p className="text-[13px] text-ink-muted">
            Locking your rate and opening secure payment...
          </p>
        </div>
      );
    }

    return (
      <div>
        <p className="text-[13px] text-ink-body">
          Payment opens in a new tab after confirming. Keep this page open to track your order.
        </p>

        <div className="mt-4 space-y-2 rounded-xl bg-paper-warm-2 px-4 py-3 text-[13px] text-ink-body">
          <div className="flex justify-between gap-3">
            <span>You pay</span>
            <span className="font-semibold text-ink">Rp {formatIdr(payNumeric)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Destination</span>
            <span className="max-w-[200px] truncate font-mono text-[11px] text-ink">
              {draft.stellarAccount}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-3">
            <p className="ramp-error-message">{error}</p>
            {requestId && (
              <p className="mt-1 font-mono text-[11px] text-ink-muted">Ref: {requestId}</p>
            )}
          </div>
        )}

        {!autoSubmit && (
          <PrimaryButton
            className="mt-5"
            onClick={() => void handleSubmit()}
            loading={submitting}
            loadingLabel="Creating order..."
          >
            Buy now
          </PrimaryButton>
        )}

        {autoSubmit && error && (
          <PrimaryButton className="mt-5" onClick={() => void handleSubmit()}>
            Try again
          </PrimaryButton>
        )}
      </div>
    );
  }

  if (autoSubmit && submitting && !error) {
    return (
      <RampStepLoading message="Locking your rate and generating deposit instructions..." />
    );
  }

  return (
    <div>
      <p className="text-[13px] text-ink-body">
        After confirming, send the exact XLM amount from your wallet to the deposit address on the
        next screen.
      </p>

      <RampOrderSummary
        className="mt-4"
        rows={[
          { label: "You pay", value: `${draft.payAmount} XLM` },
          { label: "You receive", value: `Rp ${formatIdr(Math.round(receiveAmount))}` },
          {
            label: "Bank",
            value: payoutBankById(draft.payoutBankId)?.name ?? draft.payoutBankId,
          },
          {
            label: "Account",
            value: sanitizeAccountNumber(draft.payoutAccountNumber),
            mono: true,
          },
          { label: "Account name", value: draft.payoutAccountName.trim() },
        ]}
      />

      {error && (
        <div className="mt-3">
          <p className="ramp-error-message">{error}</p>
          {requestId && (
            <p className="mt-1 font-mono text-[11px] text-ink-muted">Ref: {requestId}</p>
          )}
        </div>
      )}

      {!autoSubmit && (
        <PrimaryButton
          className="mt-5"
          onClick={() => void handleSubmit()}
          loading={submitting}
          loadingLabel="Creating sell order..."
        >
          Sell now
        </PrimaryButton>
      )}

      {autoSubmit && error && (
        <PrimaryButton className="mt-5" onClick={() => void handleSubmit()}>
          Try again
        </PrimaryButton>
      )}
    </div>
  );
}
