"use client";

import { RampCopyButton } from "./ramp-copy-button";

type RampDepositInstructionsProps = {
  amount: string;
  account: string;
  memo: string | null;
  expiresAt?: string | null;
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
}: RampDepositInstructionsProps) {
  const hasAccount = account.trim().length > 0;

  if (!hasAccount) {
    return (
      <div className="ramp-deposit-instructions ramp-deposit-instructions--error">
        <p className="text-[13px] font-medium text-ink">Deposit instructions unavailable</p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-body">
          Your sell order was created, but the deposit address is missing from the API response.
          Keep your order ID and contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="ramp-deposit-instructions">
      <p className="text-[13px] font-medium text-ink">Send exactly this amount</p>
      <p className="mt-2 font-mono text-[15px] font-semibold text-ink">{amount} XLM</p>
      <RampCopyButton value={amount} label="amount" className="mt-1" />

      <p className="mt-4 text-[13px] text-ink-body">To this Stellar address</p>
      <p className="ramp-mono-break mt-1 text-[12px]">{account}</p>
      <RampCopyButton value={account} label="address" className="mt-1" />

      {memo && (
        <>
          <p className="mt-4 text-[13px] font-medium text-ink">Memo (required)</p>
          <p className="mt-1 font-mono text-[12px] text-ink">{memo}</p>
          <RampCopyButton value={memo} label="memo" className="mt-1" />
        </>
      )}

      {expiresAt && (
        <p className="mt-4 text-[12px] text-ink-muted">
          Deposit before {formatExpiry(expiresAt)}
        </p>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
        Open your Stellar wallet, send the exact XLM amount, and include the memo. Wrong amount or
        missing memo may mark the order as invalid.
      </p>
    </div>
  );
}
