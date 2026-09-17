"use client";

import { useState } from "react";

import {
  ORDER_MAX_IDR,
  ORDER_MIN_IDR,
  RAMP_FEE_BPS,
  type RampMode,
} from "@/content/individuals";
import { cn } from "@/lib/cn";
import { useQuotePreview } from "@/lib/kailopay/use-quote-preview";
import type { RampDraft } from "@/lib/kailopay/types";
import {
  formatCrypto,
  formatDecimalInput,
  formatIdr,
  formatIntegerInput,
  parseAmountInput,
  parseIntegerInput,
} from "@/lib/ramp-format";
import { SelectChevronIcon } from "../../ui/icons";
import { PrimaryButton } from "../../ui/primary-button";

type AmountStepProps = {
  draft: RampDraft;
  onChange: (patch: Partial<RampDraft>) => void;
  onContinue: () => void;
};

export function AmountStep({ draft, onChange, onContinue }: AmountStepProps) {
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = draft.mode;

  const payNumeric =
    mode === "buy"
      ? parseIntegerInput(draft.payAmount)
      : parseAmountInput(draft.payAmount);

  const { quote, source, loading, error: quoteError, receiveAmount, feeAmount, rateIdr } =
    useQuotePreview(mode, payNumeric);

  const feeBps = quote && source === "api" ? quote.spread_bps : RAMP_FEE_BPS;
  const isQuoteLoading = loading && Boolean(payNumeric);
  const displayError = error ?? quoteError;

  const receiveDisplay =
    loading && payNumeric
      ? "..."
      : mode === "buy"
        ? formatCrypto(receiveAmount, 4)
        : formatIdr(receiveAmount);

  function setMode(next: RampMode) {
    if (next === mode) return;
    onChange({
      mode: next,
      payAmount: next === "buy" ? "100.000" : "30",
      paymentMethodId: next === "buy" ? "qris" : "bca_va",
      payoutBankId: "bca",
      payoutAccountNumber: "",
      payoutAccountName: "",
      payoutDestination: "",
      idempotencyKey: crypto.randomUUID(),
    });
    setError(null);
  }

  function handleContinue() {
    if (!payNumeric) {
      setError("Enter an amount to continue.");
      return;
    }
    if (mode === "buy" && (payNumeric < ORDER_MIN_IDR || payNumeric > ORDER_MAX_IDR)) {
      setError(`Amount must be between Rp ${formatIdr(ORDER_MIN_IDR)} and Rp ${formatIdr(ORDER_MAX_IDR)}.`);
      return;
    }
    if (mode === "sell") {
      if (!receiveAmount || receiveAmount < ORDER_MIN_IDR || receiveAmount > ORDER_MAX_IDR) {
        setError(
          `Payout must be between Rp ${formatIdr(ORDER_MIN_IDR)} and Rp ${formatIdr(ORDER_MAX_IDR)}.`,
        );
        return;
      }
    }
    if (quoteError) {
      setError(quoteError);
      return;
    }
    setError(null);
    onContinue();
  }

  return (
    <div>
      <div className="mb-4 inline-flex rounded-full bg-paper-warm-2 p-1 text-[13px] font-medium">
        {(["buy", "sell"] as RampMode[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={cn(
              "rounded-full px-4 py-1.5 capitalize transition-colors",
              mode === tab ? "bg-white text-ink shadow-card-soft" : "text-ink-body hover:text-ink",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-[#F4F4F2]">
        <div className="px-4 pb-4 pt-4">
          <div className="mb-2 text-left text-[13px] text-ink-muted">You pay</div>
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              inputMode={mode === "buy" ? "numeric" : "decimal"}
              value={draft.payAmount}
              onChange={(event) => {
                const raw = event.target.value;
                onChange({
                  payAmount:
                    mode === "buy"
                      ? formatIntegerInput(raw)
                      : formatDecimalInput(raw, 7),
                });
                setError(null);
              }}
              placeholder="0"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink shadow-none outline-none ring-0 focus:border-0 focus:shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              aria-label="You pay"
            />
            <div className="flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-white px-2.5 py-2">
              <img
                src={mode === "buy" ? TOKEN_META_IDR.icon : TOKEN_META_XLM.icon}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="text-[13px] font-semibold text-ink">
                {mode === "buy" ? "IDR" : "XLM"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-ink/[0.08]" />

        <div className="px-4 pb-4 pt-4">
          <div className="mb-2 text-left text-[13px] text-ink-muted">You receive</div>
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "min-w-0 flex-1 font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink",
                loading && payNumeric > 0 && "opacity-60",
              )}
              aria-live="polite"
            >
              {receiveDisplay}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-white px-2.5 py-2">
              <img
                src={mode === "buy" ? TOKEN_META_XLM.icon : TOKEN_META_IDR.icon}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="text-[13px] font-semibold text-ink">
                {mode === "buy" ? "XLM" : "IDR"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3.5 px-1 text-[12px] text-ink-muted">
        1 XLM ≈ Rp {rateIdr ? formatIdr(Math.round(rateIdr)) : "—"}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-ink-body">Inclusive of fees</span>
          <button
            type="button"
            onClick={() => setShowFeeDetails((open) => !open)}
            aria-expanded={showFeeDetails}
            className="inline-flex items-center gap-1 font-medium text-ink transition-colors hover:text-action"
          >
            Details
            <span
              className={cn(
                "inline-block transition-transform duration-300 ease-out",
                showFeeDetails && "rotate-180",
              )}
            >
              <SelectChevronIcon />
            </span>
          </button>
        </div>
        <div
          className={cn(
            "ramp-fee-details-panel",
            showFeeDetails ? "is-open" : "is-closed",
          )}
        >
          <div className="ramp-fee-details-panel__inner">
            <div className="mt-2.5 rounded-xl bg-paper-warm-2 px-4 py-3 text-[12px] leading-[1.6] text-ink-body">
              <div className="flex items-center justify-between gap-3">
                <span>Service fee ({feeBps / 100}%)</span>
                <span className="font-medium text-ink">
                  {feeAmount ? `Rp ${formatIdr(Math.round(feeAmount))}` : "Rp 0"}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span>Network fee</span>
                <span className="font-medium text-ink">Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {displayError && <p className="ramp-error-message" role="alert">{displayError}</p>}

      <PrimaryButton
        className="mt-5"
        onClick={handleContinue}
        loading={isQuoteLoading}
        loadingLabel="Fetching quote..."
      >
        Continue
      </PrimaryButton>
    </div>
  );
}

const TOKEN_META_IDR = { icon: "/marketing/indonesia-circle.svg" };
const TOKEN_META_XLM = { icon: "/marketing/tokens/xlm.svg" };
