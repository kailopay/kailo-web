"use client";

import { useMemo, useState } from "react";

import {
  PAYMENT_METHODS,
  RAMP_FEE_BPS,
  RAMP_RATES_IDR,
  TOKEN_META,
  type CryptoToken,
  type PaymentMethod,
  type RampMode,
} from "@/content/individuals";
import { cn } from "@/lib/cn";
import {
  formatCrypto,
  formatDecimalInput,
  formatIdr,
  formatIntegerInput,
  parseAmountInput,
  parseIntegerInput,
} from "@/lib/ramp-format";
import { SelectChevronIcon } from "../ui/icons";

type AssetCode = CryptoToken | "IDR";

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M19.4 13.5a7.4 7.4 0 00.1-3l2-1.2-2-3.5-2.3 1a7.5 7.5 0 00-2.6-1.5l-.4-2.4H9.8l-.4 2.4a7.5 7.5 0 00-2.6 1.5l-2.3-1-2 3.5 2 1.2a7.4 7.4 0 000 3l-2 1.2 2 3.5 2.3-1a7.5 7.5 0 002.6 1.5l.4 2.4h4.4l.4-2.4a7.5 7.5 0 002.6-1.5l2.3 1 2-3.5-2-1.2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AssetSelect({
  value,
  options,
  onChange,
  disabled = false,
}: {
  value: AssetCode;
  options: AssetCode[];
  onChange: (value: AssetCode) => void;
  disabled?: boolean;
}) {
  const meta = TOKEN_META[value];
  const canChange = !disabled && options.length > 1;

  return (
    <div className="relative shrink-0">
      <div className="flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-white px-2.5 py-2">
        <img
          src={meta.icon}
          alt=""
          className="block h-6 w-6 rounded-full object-cover"
        />
        <span className="text-[13px] font-semibold text-ink">{meta.symbol}</span>
        {canChange && <SelectChevronIcon />}
      </div>
      {canChange && (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as AssetCode)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="Select asset"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {TOKEN_META[option].symbol}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function PaymentMethodSelect({
  methods,
  value,
  onChange,
}: {
  methods: PaymentMethod[];
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = methods.find((method) => method.id === value) ?? methods[0];

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/[0.08] bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={selected.icon}
            alt=""
            className="block h-7 w-7 flex-none rounded-md object-contain"
          />
          <div className="min-w-0 text-left">
            <div className="text-[14px] font-semibold text-ink">{selected.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-muted">
              <ClockIcon />
              <span>{selected.eta}</span>
            </div>
          </div>
        </div>
        <SelectChevronIcon />
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Payment method"
      >
        {methods.map((method) => (
          <option key={method.id} value={method.id}>
            {method.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RampWidget() {
  const [mode, setMode] = useState<RampMode>("buy");
  const [payAmount, setPayAmount] = useState("100.000");
  const [payAsset, setPayAsset] = useState<AssetCode>("IDR");
  const [receiveAsset, setReceiveAsset] = useState<AssetCode>("XLM");
  const [paymentMethodId, setPaymentMethodId] = useState("qris");
  const [showFeeDetails, setShowFeeDetails] = useState(false);

  const availablePaymentMethods = PAYMENT_METHODS.filter((method) =>
    method.modes.includes(mode),
  );
  const activePaymentMethod =
    availablePaymentMethods.find((method) => method.id === paymentMethodId) ??
    availablePaymentMethods[0];

  const payOptions: AssetCode[] = mode === "buy" ? ["IDR"] : ["XLM", "USDC"];
  const receiveOptions: AssetCode[] = mode === "buy" ? ["XLM", "USDC"] : ["IDR"];

  const payNumeric =
    payAsset === "IDR" ? parseIntegerInput(payAmount) : parseAmountInput(payAmount);

  const estimate = useMemo(() => {
    const payValue = payNumeric;
    if (!payValue) {
      return { receiveAmount: 0, rateLabel: "", feeAmount: 0 };
    }

    if (mode === "buy") {
      const token = receiveAsset as CryptoToken;
      const rate = RAMP_RATES_IDR[token];
      const feeAmount = (payValue * RAMP_FEE_BPS) / 10_000;
      const netIdr = payValue - feeAmount;
      const receiveAmount = netIdr / rate;

      return {
        receiveAmount,
        rateLabel: `1 ${token} ≈ Rp ${formatIdr(rate)}`,
        feeAmount,
      };
    }

    const token = payAsset as CryptoToken;
    const rate = RAMP_RATES_IDR[token];
    const grossIdr = payValue * rate;
    const feeAmount = (grossIdr * RAMP_FEE_BPS) / 10_000;
    const receiveAmount = grossIdr - feeAmount;

    return {
      receiveAmount,
      rateLabel: `1 ${token} ≈ Rp ${formatIdr(rate)}`,
      feeAmount,
    };
  }, [mode, payNumeric, payAsset, receiveAsset]);

  const receiveDisplay =
    mode === "buy"
      ? formatCrypto(estimate.receiveAmount, receiveAsset === "USDC" ? 2 : 2)
      : formatIdr(estimate.receiveAmount);

  const activeToken =
    mode === "buy" ? (receiveAsset as CryptoToken) : (payAsset as CryptoToken);

  function setRampMode(next: RampMode) {
    if (next === mode) return;

    if (next === "buy") {
      setPayAsset("IDR");
      setReceiveAsset("XLM");
      setPayAmount("100.000");
      setPaymentMethodId("qris");
    } else {
      setPayAsset("XLM");
      setReceiveAsset("IDR");
      setPayAmount("30");
      setPaymentMethodId("bca_va");
    }

    setMode(next);
    setShowFeeDetails(false);
  }

  function handlePayAmountChange(raw: string) {
    if (payAsset === "IDR") {
      setPayAmount(formatIntegerInput(raw));
      return;
    }

    const maxDecimals = payAsset === "USDC" ? 2 : 7;
    setPayAmount(formatDecimalInput(raw, maxDecimals));
  }

  return (
    <div className="ramp-widget-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-paper-warm-2 p-1 text-[13px] font-medium">
          {(
            [
              { id: "buy" as const, label: "Buy" },
              { id: "sell" as const, label: "Sell" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRampMode(tab.id)}
              className={cn(
                "rounded-full px-4 py-1.5 transition-colors",
                mode === tab.id
                  ? "bg-white text-ink shadow-card-soft"
                  : "text-ink-body hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-paper-warm-2 hover:text-ink"
        >
          <GearIcon />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-[#F4F4F2]">
        <div className="px-4 pb-4 pt-4">
          <div className="mb-2 text-left text-[13px] text-ink-muted">You pay</div>
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              inputMode={payAsset === "IDR" ? "numeric" : "decimal"}
              value={payAmount}
              onChange={(event) => handlePayAmountChange(event.target.value)}
              placeholder="0"
              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              aria-label="You pay"
            />
            <AssetSelect
              value={payAsset}
              options={payOptions}
              onChange={(asset) => {
                setPayAsset(asset);
                if (asset === "IDR") {
                  setPayAmount(formatIntegerInput(payAmount));
                } else {
                  setPayAmount(
                    formatDecimalInput(
                      payAmount,
                      asset === "USDC" ? 2 : 7,
                    ),
                  );
                }
              }}
              disabled={mode === "buy"}
            />
          </div>
        </div>

        <div className="border-t border-ink/[0.08]" />

        <div className="px-4 pb-4 pt-4">
          <div className="mb-2 text-left text-[13px] text-ink-muted">
            You receive (estimate)
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="min-w-0 flex-1 font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink"
              aria-live="polite"
            >
              {receiveDisplay}
            </div>
            <AssetSelect
              value={receiveAsset}
              options={receiveOptions}
              onChange={setReceiveAsset}
              disabled={mode === "sell"}
            />
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-3 px-1 text-[12px] text-ink-muted">
        <span>{estimate.rateLabel || `1 ${activeToken} ≈ Rp 0`}</span>
        <span className="inline-flex items-center gap-1.5">
          <GlobeIcon />
          Stellar Network
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-left text-[13px] font-medium text-ink-body">
          Payment Method
        </div>
        <PaymentMethodSelect
          methods={availablePaymentMethods}
          value={activePaymentMethod.id}
          onChange={setPaymentMethodId}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-ink-body">Inclusive of fees</span>
          <button
            type="button"
            onClick={() => setShowFeeDetails((open) => !open)}
            className="inline-flex items-center gap-1 font-medium text-ink transition-colors hover:text-action"
          >
            Details
            <span
              className={cn(
                "inline-block transition-transform",
                showFeeDetails && "rotate-180",
              )}
            >
              <SelectChevronIcon />
            </span>
          </button>
        </div>

        {showFeeDetails && (
          <div className="mt-2.5 rounded-xl bg-paper-warm-2 px-4 py-3 text-[12px] leading-[1.6] text-ink-body">
            <div className="flex items-center justify-between gap-3">
              <span>Service fee ({RAMP_FEE_BPS / 100}%)</span>
              <span className="font-medium text-ink">
                {estimate.feeAmount
                  ? `Rp ${formatIdr(estimate.feeAmount)}`
                  : "Rp 0"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span>Network fee</span>
              <span className="font-medium text-ink">Included</span>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-full bg-action py-4 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#4A4DE0]"
      >
        {mode === "buy" ? "Buy now" : "Sell now"}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-ink-muted">
        <span>Powered by</span>
        <img src="/logo-full.png" alt="KailoPay" className="h-4 w-auto opacity-80" />
      </div>
    </div>
  );
}
