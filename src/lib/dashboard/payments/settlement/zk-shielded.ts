import { eq } from "drizzle-orm";
import { db } from "@/lib/dashboard/db";
import { organizations, payments, type Organization, type Payment } from "@/lib/dashboard/db/schema";
import type { AllowedAsset } from "@/lib/dashboard/assets/types";
import { findAllowedAsset, resolveAllowedAsset } from "@/lib/dashboard/assets/types";
import {
  needsPaymentQuoteRefresh,
  refreshPaymentQuote,
} from "@/lib/dashboard/payments/quote-service";
import { serializePayment, setPaymentPaidAsset } from "@/lib/dashboard/payments/service";
import {
  resolveGrossSettlementAmount,
  resolveSettlementAmounts,
} from "@/lib/dashboard/payments/settlement/amounts";
import { finalizeCompletedPayment } from "@/lib/dashboard/payments/settlement/finalize";
import {
  amountToShieldedStroops,
  assertPrivatePaymentsAllowed,
  getShieldedPoolConfig,
  hashPaymentPublicId,
  hashStellarAddress,
  isShieldedPoolConfigured,
  stroopsToDecimalString,
} from "@/lib/dashboard/zk/shielded-config";
import { registerShieldedPaymentIntentOnContract } from "@/lib/dashboard/soroban/shielded-pool-contract";

function resolveShieldedAmountStroops(payment: Payment) {
  const { gross } = resolveSettlementAmounts(payment);
  return amountToShieldedStroops(gross);
}

export async function registerShieldedPaymentIntent(payment: Payment) {
  const config = getShieldedPoolConfig(payment.environment);
  const paymentIdHash = hashPaymentPublicId(payment.publicId);

  await registerShieldedPaymentIntentOnContract(payment);

  await db
    .update(payments)
    .set({
      paymentAuthorizationHash: paymentIdHash,
      shieldedPoolContractId: config.contractId,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));
}

export async function optInPrivatePayment(
  payment: Payment,
  options?: { paidAsset?: AllowedAsset }
) {
  if (payment.paymentFlow === "zk_shielded") {
    return payment;
  }

  if (payment.paymentFlow !== "escrow") {
    throw new Error("Private payment is only available for escrow checkout");
  }

  if (payment.status !== "pending") {
    throw new Error("Payment is no longer available for private checkout");
  }

  let activePayment = payment;

  if (payment.pricingAmount && payment.pricingCurrency) {
    const paidAsset = options?.paidAsset;
    if (!paidAsset) {
      throw new Error("Select a payment asset before paying privately");
    }

    const match = findAllowedAsset(
      payment.allowedAssets ?? [],
      paidAsset.asset_code,
      paidAsset.issuer_address,
      payment.environment
    );

    if (!match) {
      throw new Error("Selected asset is not allowed for this payment");
    }

    const canonicalPaidAsset = resolveAllowedAsset(match, payment.environment);

    if (
      needsPaymentQuoteRefresh(payment, canonicalPaidAsset) ||
      !payment.quotedSettlementAmount
    ) {
      const refreshed = await refreshPaymentQuote(payment, canonicalPaidAsset);
      activePayment = refreshed.payment;
    } else {
      activePayment = await setPaymentPaidAsset(payment, canonicalPaidAsset);
    }

    if (!activePayment.quotedSettlementAmount) {
      throw new Error("Unable to lock checkout quote for private payment");
    }
  }

  if (!isShieldedPoolConfigured(activePayment.environment)) {
    throw new Error("Shielded pool is not configured for this environment");
  }

  const [organization] = await db
    .select({ verificationStatus: organizations.verificationStatus })
    .from(organizations)
    .where(eq(organizations.id, activePayment.organizationId))
    .limit(1);

  assertPrivatePaymentsAllowed({
    environment: activePayment.environment,
    verificationStatus: organization?.verificationStatus ?? "unverified",
  });

  const config = getShieldedPoolConfig(activePayment.environment);
  const paymentIdHash = hashPaymentPublicId(activePayment.publicId);
  const { gross, platformFee, merchantNet } =
    resolveSettlementAmounts(activePayment);

  await registerShieldedPaymentIntentOnContract(activePayment);

  const [updated] = await db
    .update(payments)
    .set({
      paymentFlow: "zk_shielded",
      shieldedPoolContractId: config.contractId,
      sorobanContractId: config.contractId,
      paymentAuthorizationHash: paymentIdHash,
      platformFeeAmount: platformFee,
      merchantSettlementAmount: merchantNet,
      quotedSettlementAmount: gross,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, activePayment.id))
    .returning();

  if (!updated) {
    throw new Error("Payment not found");
  }

  return updated;
}

export async function recordShieldedDeposit(input: {
  payment: Payment;
  depositTxHash: string;
  leafIndex: number;
  merkleRoot: string;
}) {
  const gross = resolveGrossSettlementAmount(input.payment);

  await db
    .update(payments)
    .set({
      zkDepositTxHash: input.depositTxHash,
      zkLeafIndex: input.leafIndex,
      depositTxHash: input.depositTxHash,
      receivedAmount: gross,
      paidAsset: input.payment.paidAsset ?? input.payment.settlementAsset,
      paidAssetIssuer:
        input.payment.paidAssetIssuer ?? input.payment.settlementAssetIssuer,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, input.payment.id));
}

export async function completeShieldedWithdrawal(input: {
  payment: Payment;
  nullifier: string;
  withdrawTxHash: string;
}) {
  return finalizeCompletedPayment(input.payment, {
    settlementTxHash: input.withdrawTxHash,
    zkNullifier: input.nullifier,
    zkWithdrawTxHash: input.withdrawTxHash,
    receivedAmount: resolveGrossSettlementAmount(input.payment),
    paidAssetCode: input.payment.paidAsset ?? input.payment.settlementAsset,
    paidAssetIssuer:
      input.payment.paidAssetIssuer ?? input.payment.settlementAssetIssuer,
  });
}

export function buildShieldedCheckoutMeta(payment: Payment) {
  return {
    payment_id_hash: hashPaymentPublicId(payment.publicId),
    pool_contract_id: payment.shieldedPoolContractId,
    recipient_hash: hashStellarAddress(payment.receivingAddress),
  };
}

export function buildShieldedCheckoutResponse(payment: Payment) {
  const available = isShieldedPoolConfigured(payment.environment);
  const amountStroops = resolveShieldedAmountStroops(payment);
  const amountLabel = stroopsToDecimalString(amountStroops);

  if (!available) {
    return {
      available: false,
      enabled: false,
      payment_id_hash: null,
      pool_contract_id: null,
      recipient_hash: null,
      amount_stroops: null,
      amount_label: null,
    };
  }

  const meta = buildShieldedCheckoutMeta(payment);
  const poolContractId =
    payment.shieldedPoolContractId ??
    getShieldedPoolConfig(payment.environment).contractId;

  return {
    available: true,
    enabled: true,
    payment_id_hash: meta.payment_id_hash,
    pool_contract_id: poolContractId,
    recipient_hash: meta.recipient_hash,
    amount_stroops: amountStroops.toString(),
    amount_label: amountLabel,
  };
}

export function assertZkShieldedPayment(payment: Payment) {
  if (payment.paymentFlow !== "zk_shielded") {
    throw new Error("Payment is not a shielded payment");
  }
}

export function isZkShieldedEnabledForOrg(environment: Organization["environment"]) {
  return isShieldedPoolConfigured(environment);
}
