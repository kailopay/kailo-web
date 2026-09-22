import {
  calculateMerchantSettlementAmount,
  calculatePlatformFeeAmount,
} from "@/constants/dashboard/payments/defaults";
import type { AllowedAssetRef } from "@/lib/dashboard/payments/types";

export const SETTLEMENT_MODE_PAID_ASSET_FALLBACK = "paid_asset_fallback";

export const SETTLEMENT_FALLBACK_TYPE_LABEL = "Unconverted";

export type PaymentSettlementMetadata = Record<string, string> | null | undefined;

export type PaymentSettlementFallbackContext = {
  paid_asset: AllowedAssetRef | null;
  settlement_asset: AllowedAssetRef;
  status: string;
  received_amount?: string | null;
  merchant_settlement_amount?: string | null;
  quoted_settlement_amount?: string | null;
  platform_fee_amount?: string | null;
  metadata?: PaymentSettlementMetadata;
};

export type ResolvedSettlementFallback = {
  isFallback: boolean;
  actualMerchantAmount: string | null;
  actualAsset: AllowedAssetRef;
  quotedMerchantAmount: string | null;
  quotedAsset: AllowedAssetRef;
  reason: string | null;
};

function paidAssetCode(payment: PaymentSettlementFallbackContext) {
  return payment.paid_asset?.asset_code ?? payment.settlement_asset.asset_code;
}

function assetsDiffer(payment: PaymentSettlementFallbackContext) {
  const paid = payment.paid_asset?.asset_code;
  const settlement = payment.settlement_asset.asset_code;

  return Boolean(paid && paid !== settlement);
}

function isQuotedSettlementMerchantAmount(payment: PaymentSettlementFallbackContext) {
  if (!payment.quoted_settlement_amount || !payment.merchant_settlement_amount) {
    return false;
  }

  const expected = calculateMerchantSettlementAmount(
    payment.quoted_settlement_amount,
  );

  return payment.merchant_settlement_amount === expected;
}

export function isPaidAssetSettlementFallback(
  payment: PaymentSettlementFallbackContext,
) {
  if (payment.metadata?.settlement_mode === SETTLEMENT_MODE_PAID_ASSET_FALLBACK) {
    return true;
  }

  if (payment.status !== "completed" || !assetsDiffer(payment)) {
    return false;
  }

  if (!payment.received_amount || !payment.merchant_settlement_amount) {
    return false;
  }

  const received = Number(payment.received_amount);
  const merchant = Number(payment.merchant_settlement_amount);

  if (!Number.isFinite(received) || !Number.isFinite(merchant)) {
    return false;
  }

  // Legacy rows still store the quoted USDC net while the merchant was paid in XLM.
  return received > merchant && isQuotedSettlementMerchantAmount(payment);
}

export function resolveSettlementFallback(
  payment: PaymentSettlementFallbackContext,
): ResolvedSettlementFallback | null {
  if (!isPaidAssetSettlementFallback(payment) || !payment.paid_asset) {
    return null;
  }

  const receivedAmount = payment.received_amount;
  const actualMerchantAmount =
    payment.metadata?.settlement_mode === SETTLEMENT_MODE_PAID_ASSET_FALLBACK
      ? (payment.merchant_settlement_amount ?? null)
      : receivedAmount
        ? calculateMerchantSettlementAmount(receivedAmount)
        : null;

  const quotedMerchantAmount =
    payment.metadata?.quoted_merchant_settlement_amount ??
    (payment.quoted_settlement_amount
      ? calculateMerchantSettlementAmount(payment.quoted_settlement_amount)
      : payment.merchant_settlement_amount ?? null);

  return {
    isFallback: true,
    actualMerchantAmount,
    actualAsset: payment.paid_asset,
    quotedMerchantAmount,
    quotedAsset: payment.settlement_asset,
    reason: payment.metadata?.settlement_fallback_reason ?? null,
  };
}

export function buildPaidAssetFallbackMetadata(input: {
  reason: string;
  quotedSettlementAmount: string | null;
  quotedMerchantSettlementAmount: string;
  quotedSettlementAsset: string;
  receivedAmount: string;
}) {
  const amounts = {
    gross: input.receivedAmount,
    platformFee: calculatePlatformFeeAmount(input.receivedAmount),
    merchantNet: calculateMerchantSettlementAmount(input.receivedAmount),
  };

  return {
    settlement_mode: SETTLEMENT_MODE_PAID_ASSET_FALLBACK,
    settlement_fallback_reason: input.reason.slice(0, 500),
    quoted_settlement_amount: input.quotedSettlementAmount ?? "",
    quoted_merchant_settlement_amount: input.quotedMerchantSettlementAmount,
    quoted_settlement_asset: input.quotedSettlementAsset,
    settled_merchant_amount: amounts.merchantNet,
    settled_platform_fee_amount: amounts.platformFee,
    settled_gross_amount: amounts.gross,
  } satisfies Record<string, string>;
}

export function formatSettlementFallbackNotice(
  fallback: ResolvedSettlementFallback,
) {
  const quoted =
    fallback.quotedMerchantAmount && fallback.quotedAsset
      ? `${fallback.quotedMerchantAmount} ${fallback.quotedAsset.asset_code}`
      : null;
  const actual =
    fallback.actualMerchantAmount && fallback.actualAsset
      ? `${fallback.actualMerchantAmount} ${fallback.actualAsset.asset_code}`
      : null;

  const conversionNote = quoted
    ? `Quoted settlement was ${quoted}, but on-chain conversion to ${fallback.quotedAsset.asset_code} was unavailable at settlement time.`
    : `On-chain conversion to ${fallback.quotedAsset.asset_code} was unavailable at settlement time.`;

  const payoutNote = actual
    ? `The merchant was settled in ${actual} instead.`
    : "The merchant was settled in the payment asset instead.";

  return `${conversionNote} ${payoutNote}`;
}
