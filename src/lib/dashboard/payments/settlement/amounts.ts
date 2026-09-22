import {
  calculateMerchantSettlementAmount,
  calculatePlatformFeeAmount,
} from "@/constants/dashboard/payments/defaults";
import type { Payment } from "@/lib/dashboard/db/schema";

function isCrossAssetPayment(payment: Payment) {
  if (!payment.paidAsset) {
    return false;
  }

  return (
    payment.paidAsset !== payment.settlementAsset ||
    (payment.paidAssetIssuer ?? null) !== (payment.settlementAssetIssuer ?? null)
  );
}

export function resolveGrossSettlementAmount(payment: Payment) {
  if (payment.quotedSettlementAmount) {
    return payment.quotedSettlementAmount;
  }

  if (isCrossAssetPayment(payment)) {
    throw new Error(
      "Settlement quote is missing for cross-asset payment settlement",
    );
  }

  return payment.quotedPaidAmount ?? payment.amount;
}

export function resolvePlatformFeeAmount(payment: Payment) {
  if (payment.platformFeeAmount && Number(payment.platformFeeAmount) > 0) {
    return payment.platformFeeAmount;
  }

  return calculatePlatformFeeAmount(resolveGrossSettlementAmount(payment));
}

export function resolveMerchantSettlementAmount(payment: Payment) {
  if (payment.merchantSettlementAmount) {
    return payment.merchantSettlementAmount;
  }

  return calculateMerchantSettlementAmount(resolveGrossSettlementAmount(payment));
}

export function resolveSettlementAmounts(payment: Payment) {
  const gross = resolveGrossSettlementAmount(payment);
  const platformFee = resolvePlatformFeeAmount(payment);
  const merchantNet = resolveMerchantSettlementAmount(payment);

  return { gross, platformFee, merchantNet };
}

/** Amounts when cross-asset conversion fails and merchant is paid in the deposited asset. */
export function resolvePaidAssetFallbackSettlementAmounts(receivedAmount: string) {
  const gross = receivedAmount;
  const platformFee = calculatePlatformFeeAmount(receivedAmount);
  const merchantNet = calculateMerchantSettlementAmount(receivedAmount);

  return { gross, platformFee, merchantNet };
}

export function settlementAmountToStroops(amount: string) {
  return BigInt(Math.round(Number(amount) * 10_000_000));
}
