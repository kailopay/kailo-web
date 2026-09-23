"use client";

import { buildStellarPaymentUri } from "@/lib/kailopay/stellar-payment-uri";
import { formatXlmDisplay } from "@/lib/ramp-format";
import { RampCopyButton } from "./ramp-copy-button";
import { RampPaymentQr } from "./ramp-payment-qr";

type RampDepositInstructionsProps = {
  amount: string;
  account: string;
  memo: string | null;
  expiresAt?: string | null;
  onRetry?: () => void;
};

function formatExpiry(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function RampDepositInstructions({
  amount,
  account,
  memo,
  expiresAt,
  onRetry,
}: RampDepositInstructionsProps) {
  const trimmedAccount = account.trim();
  const trimmedMemo = memo?.trim() ?? "";
  const hasAccount = trimmedAccount.length > 0;
  const hasMemo = trimmedMemo.length > 0;

  if (!hasAccount || !hasMemo) {
    return (
      <div className="ramp-deposit-instructions ramp-deposit-instructions--error">
        <p className="text-[13px] font-medium text-ink">Deposit instructions unavailable</p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-body">
          We could not load the deposit address or memo from the backend yet. Refresh this page or
          try again in a moment.
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 text-[12px] font-medium text-action hover:underline"
          >
            Reload deposit instructions
          </button>
        ) : null}
      </div>
    );
  }

  const paymentUri = buildStellarPaymentUri({
    destination: trimmedAccount,
    amount,
    memo: trimmedMemo,
  });

  return (
    <div className="ramp-deposit-instructions">
      <RampPaymentQr value={paymentUri} />

      <div className="mt-5">
        <div className="ramp-deposit-field">
          <p className="text-[12px] text-ink-muted">Amount</p>
          <div className="flex items-start gap-3">
            <p className="min-w-0 flex-1 text-[13px] font-medium text-ink">
              <span className="font-mono">{formatXlmDisplay(amount)}</span> XLM
            </p>
            <RampCopyButton value={amount.trim()} label="amount" />
          </div>
        </div>

        <div className="ramp-deposit-field">
          <p className="text-[12px] text-ink-muted">Deposit address</p>
          <div className="flex items-start gap-3">
            <p className="ramp-mono-break min-w-0 flex-1 text-[12px] text-ink">{trimmedAccount}</p>
            <RampCopyButton value={trimmedAccount} label="address" />
          </div>
        </div>

        <div className="ramp-deposit-field">
          <p className="text-[12px] font-medium text-ink">Memo (required)</p>
          <div className="flex items-start gap-3">
            <p className="min-w-0 flex-1 break-all font-mono text-[12px] text-ink">{trimmedMemo}</p>
            <RampCopyButton value={trimmedMemo} label="memo" />
          </div>
        </div>
      </div>

      {expiresAt ? (
        <p className="mt-6 text-center text-[12px] font-medium text-action">
          Deposit before {formatExpiry(expiresAt)}
        </p>
      ) : null}
    </div>
  );
}
