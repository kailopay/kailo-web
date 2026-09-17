"use client";

import { useState } from "react";

import { STELLAR_ACCOUNT_PATTERN } from "@/content/individuals";
import {
  buildPayoutDestinationToken,
  sanitizeAccountNumber,
  validatePayoutBankDetails,
} from "@/lib/kailopay/payout-destination";
import type { RampDraft } from "@/lib/kailopay/types";
import { PrimaryButton } from "../../ui/primary-button";
import { RampBankSelect } from "../ramp-bank-select";

type AddressStepProps = {
  draft: RampDraft;
  onChange: (patch: Partial<RampDraft>) => void;
  onContinue: () => void;
};

export function AddressStep({ draft, onChange, onContinue }: AddressStepProps) {
  const [error, setError] = useState<string | null>(null);
  const isBuy = draft.mode === "buy";

  function handleContinue() {
    if (isBuy) {
      const account = draft.stellarAccount.trim();
      if (!STELLAR_ACCOUNT_PATTERN.test(account)) {
        setError("Enter a valid Stellar address starting with G (56 characters).");
        return;
      }
      if (draft.memo.trim().length > 28) {
        setError("Memo must be 28 characters or fewer.");
        return;
      }
    } else {
      const validationError = validatePayoutBankDetails({
        bankId: draft.payoutBankId,
        accountNumber: draft.payoutAccountNumber,
        accountName: draft.payoutAccountName,
      });
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        const payoutDestination = buildPayoutDestinationToken({
          bankId: draft.payoutBankId,
          accountNumber: draft.payoutAccountNumber,
          accountName: draft.payoutAccountName,
        });
        onChange({ payoutDestination });
      } catch {
        setError("Could not save payout details. Check your entries and try again.");
        return;
      }
    }
    setError(null);
    onContinue();
  }

  return (
    <div>
      <p className="text-[13px] leading-relaxed text-ink-body">
        {isBuy
          ? "Enter your Stellar testnet wallet address. XLM will be sent here after payment."
          : "Add the bank account where you want to receive IDR."}
      </p>

      {isBuy ? (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-body">
              Stellar address
            </label>
            <input
              type="text"
              value={draft.stellarAccount}
              onChange={(event) => {
                onChange({ stellarAccount: event.target.value });
                setError(null);
              }}
              placeholder="Enter your stellar address"
              className="ramp-input font-mono text-[13px]"
              spellCheck={false}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-body">
              Memo <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={draft.memo}
              onChange={(event) => {
                onChange({ memo: event.target.value });
                setError(null);
              }}
              placeholder="Optional memo"
              maxLength={28}
              className="ramp-input"
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-body">Bank</label>
            <RampBankSelect
              value={draft.payoutBankId}
              onChange={(payoutBankId) => {
                onChange({ payoutBankId });
                setError(null);
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-body">
              Account number
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={draft.payoutAccountNumber}
              onChange={(event) => {
                onChange({ payoutAccountNumber: sanitizeAccountNumber(event.target.value) });
                setError(null);
              }}
              placeholder="1234567890"
              className="ramp-input font-mono text-[13px]"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-body">
              Account holder name
            </label>
            <input
              type="text"
              value={draft.payoutAccountName}
              onChange={(event) => {
                onChange({ payoutAccountName: event.target.value });
                setError(null);
              }}
              placeholder="As shown on your bank account"
              maxLength={100}
              className="ramp-input text-[13px]"
              autoComplete="name"
            />
          </div>
        </div>
      )}

      {error && <p className="ramp-error-message">{error}</p>}

      <PrimaryButton className="mt-5" onClick={handleContinue}>
        Continue
      </PrimaryButton>
    </div>
  );
}
