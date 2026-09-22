import { formatAmountWithUnit } from "@/lib/dashboard/format/amount";
import {
  formatSettlementFallbackNotice,
  isPaidAssetSettlementFallback,
  resolveSettlementFallback,
} from "@/lib/dashboard/payments/settlement/fallback";
import {
  formatAssetAmount,
  formatAssetRef,
  type CheckoutSessionRow,
  type InvoiceRow,
  type PaymentLinkRow,
  type PaymentRow,
} from "@/lib/dashboard/payments/types";
import { formatInvoiceStatusLabel, getInvoiceDisplayStatus } from "@/lib/dashboard/invoices/status";

export function getPaymentStatusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "pending":
      return "pending" as const;
    case "failed":
    case "expired":
      return "error" as const;
    default:
      return "neutral" as const;
  }
}

export function isConfidentialPayment(
  payment: Pick<PaymentRow, "payment_flow">,
) {
  return payment.payment_flow === "zk_shielded";
}

export const CONFIDENTIAL_PAYER_LABEL = "Confidential payer";

export const CONFIDENTIAL_PAYER_DESCRIPTION =
  "Payer identity is not recorded for this payment.";

export function formatPayerDisplay(payment: PaymentRow) {
  if (isConfidentialPayment(payment)) {
    return CONFIDENTIAL_PAYER_LABEL;
  }

  if (payment.payer_address) {
    return `${payment.payer_address.slice(0, 8)}...${payment.payer_address.slice(-4)}`;
  }

  return "-";
}

export function formatSourceType(sourceType?: string) {
  switch (sourceType) {
    case "checkout_session":
      return "Checkout";
    case "payment_link":
      return "Payment link";
    case "invoice":
      return "Invoice";
    case "direct":
      return "API";
    default:
      return sourceType ?? "-";
  }
}

const PAYMENT_RECEIVED_STATUSES = new Set([
  "completed",
  "deposit_received",
  "settling",
  "settlement_failed",
  "refunding",
  "refunded",
]);

export function paymentHasReceivedFunds(payment: PaymentRow) {
  return PAYMENT_RECEIVED_STATUSES.has(payment.status);
}

export function getPaidAmountValue(payment: PaymentRow): string | null {
  if (payment.received_amount) {
    return payment.received_amount;
  }

  if (!paymentHasReceivedFunds(payment)) {
    return null;
  }

  return payment.quoted_paid_amount ?? payment.amount;
}

export function getPaidAsset(payment: PaymentRow) {
  return payment.paid_asset ?? payment.settlement_asset;
}

export function formatPaidAmount(payment: PaymentRow) {
  const amount = getPaidAmountValue(payment);

  if (!amount) {
    return "-";
  }

  return formatAssetAmount(amount, getPaidAsset(payment));
}

export function getMerchantSettlementAmount(payment: PaymentRow) {
  return payment.merchant_settlement_amount ?? null;
}

export function getSettlementFallback(payment: PaymentRow) {
  return resolveSettlementFallback(payment);
}

export function formatSettlementFallbackMessage(payment: PaymentRow) {
  const fallback = resolveSettlementFallback(payment);

  if (!fallback) {
    return null;
  }

  return formatSettlementFallbackNotice(fallback);
}

export function formatMerchantSettlementAmount(payment: PaymentRow) {
  const display = getMerchantSettlementDisplay(payment);

  if (!display) {
    return "-";
  }

  return formatAssetAmount(display.amount, display.asset);
}

export function getMerchantSettlementDisplay(payment: PaymentRow): {
  amount: string;
  asset: PaymentRow["settlement_asset"];
} | null {
  const fallback = resolveSettlementFallback(payment);

  if (fallback?.actualMerchantAmount) {
    return {
      amount: fallback.actualMerchantAmount,
      asset: fallback.actualAsset,
    };
  }

  if (payment.merchant_settlement_amount) {
    return {
      amount: payment.merchant_settlement_amount,
      asset: payment.settlement_asset,
    };
  }

  return null;
}

export function formatQuotedMerchantSettlementAmount(payment: PaymentRow) {
  const fallback = resolveSettlementFallback(payment);

  if (fallback?.quotedMerchantAmount) {
    return formatAssetAmount(
      fallback.quotedMerchantAmount,
      fallback.quotedAsset,
    );
  }

  if (payment.merchant_settlement_amount) {
    return formatAssetAmount(
      payment.merchant_settlement_amount,
      payment.settlement_asset,
    );
  }

  return "-";
}

export function hasSettlementFallback(payment: PaymentRow) {
  return isPaidAssetSettlementFallback(payment);
}

export function formatPlatformFeeAmount(payment: PaymentRow) {
  const fee = payment.platform_fee_amount;

  if (!fee || Number(fee) <= 0) {
    return "-";
  }

  const asset = hasSettlementFallback(payment)
    ? (payment.paid_asset ?? payment.settlement_asset)
    : payment.settlement_asset;

  return formatAssetAmount(fee, asset);
}

export function formatGrossSettlementAmount(payment: PaymentRow) {
  if (payment.quoted_settlement_amount) {
    return formatAssetAmount(
      payment.quoted_settlement_amount,
      payment.settlement_asset,
    );
  }

  return "-";
}

export function hasDistinctGrossSettlementQuote(payment: PaymentRow) {
  if (!payment.quoted_settlement_amount || !payment.merchant_settlement_amount) {
    return false;
  }

  return payment.quoted_settlement_amount !== payment.merchant_settlement_amount;
}

export function formatSettlementTarget(payment: PaymentRow) {
  if (payment.pricing_amount && payment.pricing_currency) {
    return formatAmountWithUnit(payment.pricing_amount, payment.pricing_currency);
  }

  return formatGrossSettlementAmount(payment);
}

export function formatSettlementAmount(payment: PaymentRow) {
  return formatMerchantSettlementAmount(payment);
}

export function formatInvoiceTotal(payment: PaymentRow) {
  if (payment.pricing_amount && payment.pricing_currency) {
    return formatAmountWithUnit(payment.pricing_amount, payment.pricing_currency);
  }

  return "-";
}

export function formatAllowedAssets(payment: PaymentRow) {
  const codes = payment.allowed_assets.map((asset) => asset.asset_code);
  return codes.length > 0 ? codes.join(", ") : "-";
}

export function formatPaidAsset(payment: PaymentRow) {
  return formatAssetRef(payment.paid_asset ?? payment.settlement_asset);
}

export function getCheckoutSessionStatusVariant(status: string) {
  switch (status) {
    case "complete":
    case "completed":
      return "success" as const;
    case "open":
      return "pending" as const;
    case "expired":
      return "error" as const;
    default:
      return "neutral" as const;
  }
}

export function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case "paid":
      return "success" as const;
    case "open":
      return "pending" as const;
    case "overdue":
      return "error" as const;
    case "void":
      return "error" as const;
    default:
      return "neutral" as const;
  }
}

export function getInvoiceRowStatusVariant(invoice: InvoiceRow) {
  return getInvoiceStatusVariant(getInvoiceDisplayStatus(invoice));
}

export function getInvoiceRowStatusLabel(invoice: InvoiceRow) {
  return formatInvoiceStatusLabel(getInvoiceDisplayStatus(invoice));
}

export function getPaymentLinkStatusVariant(active: boolean) {
  return active ? ("success" as const) : ("neutral" as const);
}

export function formatCheckoutSessionAmount(session: CheckoutSessionRow) {
  if (!session.amount) {
    return "-";
  }

  return formatAssetAmount(session.amount, session.settlement_asset);
}

export function formatPaymentLinkAmount(link: PaymentLinkRow) {
  if (link.currency_code) {
    return formatAmountWithUnit(link.amount, link.currency_code);
  }

  return formatAssetAmount(link.amount, link.settlement_asset);
}

export function formatInvoiceAmount(invoice: InvoiceRow) {
  return formatAmountWithUnit(invoice.amount, invoice.currency_code);
}
