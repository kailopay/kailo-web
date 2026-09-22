"use client";

import { buildStellarPaymentUri } from "@/lib/kailopay/stellar-payment-uri";
import { RampCopyButton } from "./ramp-copy-button";
import { RampPaymentQr } from "./ramp-payment-qr";

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

  const paymentUri = buildStellarPaymentUri({ destination: account, amount, memo });

  return (
    <div className="ramp-deposit-instructions">
      <RampPaymentQr value={paymentUri} />

      <p className="mt-4 text-center text-[13px] font-medium text-ink">
        Send exactly <span className="font-mono">{amount} XLM</span>
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[12px] text-ink-muted">Deposit address</p>
          <p className="ramp-mono-break mt-1 text-[12px] text-ink">{account}</p>
          <RampCopyButton value={account} label="address" className="mt-1" />
        </div>

        {memo ? (
          <div>
            <p className="text-[12px] font-medium text-ink">Memo (required)</p>
            <p className="mt-1 font-mono text-[12px] text-ink">{memo}</p>
            <RampCopyButton value={memo} label="memo" className="mt-1" />
          </div>
        ) : null}
      </div>

      {expiresAt ? (
        <p className="mt-4 text-center text-[12px] text-ink-muted">
          Deposit before {formatExpiry(expiresAt)}
        </p>
      ) : null}
    </div>
  );
}
