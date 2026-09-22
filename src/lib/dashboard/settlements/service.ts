import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/dashboard/db";
import { invoices, payments, type Organization } from "@/lib/dashboard/db/schema";
import { serializePaymentAssets } from "@/lib/dashboard/assets/serialize";
import type { SettlementConversionRow } from "@/lib/dashboard/payments/types";
import { resolvePaymentSettlementTxHash } from "@/lib/dashboard/payments/settlement/tx-hash";
import {
  isPaidAssetSettlementFallback,
  resolveSettlementFallback,
} from "@/lib/dashboard/payments/settlement/fallback";

export type SettlementSortOrder = "asc" | "desc";

export type ListSettlementsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  conversionType?: "path" | "direct";
  sortOrder?: SettlementSortOrder;
};

function isSettlementDashboardRow(payment: typeof payments.$inferSelect) {
  if (payment.metadata?.manual === "true") {
    return false;
  }

  if (!resolvePaymentSettlementTxHash(payment)) {
    return false;
  }

  if (payment.paymentFlow === "zk_shielded") {
    return true;
  }

  if (!payment.paidAsset) {
    return false;
  }

  return (
    payment.paidAsset !== payment.settlementAsset ||
    Boolean(payment.quotedSettlementAmount)
  );
}

function mapSettlementRow(
  payment: typeof payments.$inferSelect,
  invoiceMap: Map<string, string>,
): SettlementConversionRow {
  const assets = serializePaymentAssets(payment);
  const settlementTxHash = resolvePaymentSettlementTxHash(payment);
  const settlementFallback = isPaidAssetSettlementFallback({
    paid_asset: assets.paid_asset,
    settlement_asset: assets.settlement_asset,
    status: payment.status,
    received_amount: payment.receivedAmount,
    merchant_settlement_amount: payment.merchantSettlementAmount,
    quoted_settlement_amount: payment.quotedSettlementAmount,
    platform_fee_amount: payment.platformFeeAmount,
    metadata: payment.metadata,
  });
  const fallback = settlementFallback
    ? resolveSettlementFallback({
        paid_asset: assets.paid_asset,
        settlement_asset: assets.settlement_asset,
        status: payment.status,
        received_amount: payment.receivedAmount,
        merchant_settlement_amount: payment.merchantSettlementAmount,
        quoted_settlement_amount: payment.quotedSettlementAmount,
        platform_fee_amount: payment.platformFeeAmount,
        metadata: payment.metadata,
      })
    : null;
  const merchantSettlementAmount = fallback?.actualMerchantAmount
    ?? payment.merchantSettlementAmount;
  const merchantSettlementAsset = fallback?.actualAsset ?? assets.settlement_asset;

  return {
    payment_id: payment.publicId,
    invoice_id: payment.invoiceId
      ? (invoiceMap.get(payment.invoiceId) ?? null)
      : null,
    paid_asset: assets.paid_asset,
    quoted_paid_amount: payment.quotedPaidAmount ?? payment.amount,
    settlement_asset: merchantSettlementAsset,
    quoted_settlement_amount:
      payment.quotedSettlementAmount ??
      (payment.pricingCurrency && payment.pricingAmount ? null : payment.amount),
    platform_fee_amount: payment.platformFeeAmount,
    merchant_settlement_amount: merchantSettlementAmount,
    pricing_amount: payment.pricingAmount,
    pricing_currency: payment.pricingCurrency,
    quote_rate: payment.quoteRate,
    settlement_quote_rate: payment.settlementQuoteRate,
    tx_hash: settlementTxHash,
    confirmed_at: payment.confirmedAt?.toISOString() ?? null,
    converted_on_chain:
      !settlementFallback &&
      payment.paymentFlow !== "zk_shielded" &&
      payment.paidAsset !== payment.settlementAsset &&
      Boolean(payment.quotedSettlementAmount),
    settlement_fallback: settlementFallback,
  };
}

async function loadSettlementRows(
  organizationId: string,
  environment: Organization["environment"],
  limit = 500,
) {
  const completed = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.organizationId, organizationId),
        eq(payments.environment, environment),
        eq(payments.status, "completed"),
      ),
    )
    .orderBy(desc(payments.confirmedAt))
    .limit(limit);

  const filtered = completed.filter(isSettlementDashboardRow);

  const invoiceIds = filtered
    .map((payment) => payment.invoiceId)
    .filter((id): id is string => Boolean(id));

  const invoiceRows =
    invoiceIds.length > 0
      ? await db
          .select({ id: invoices.id, publicId: invoices.publicId })
          .from(invoices)
          .where(inArray(invoices.id, invoiceIds))
      : [];

  const invoiceMap = new Map(
    invoiceRows.map((row) => [row.id, row.publicId] as const),
  );

  return filtered.map((payment) => mapSettlementRow(payment, invoiceMap));
}

export async function listSettlementConversions(
  organizationId: string,
  environment: Organization["environment"],
  limit = 100,
) {
  const rows = await loadSettlementRows(organizationId, environment, limit);
  return rows.slice(0, limit);
}

export async function listSettlementConversionsPaginated(
  organizationId: string,
  environment: Organization["environment"],
  query: ListSettlementsQuery = {},
) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
  const search = query.search?.trim().toLowerCase();
  const sortOrder = query.sortOrder ?? "desc";

  let rows = await loadSettlementRows(organizationId, environment);

  if (search) {
    rows = rows.filter(
      (row) =>
        row.payment_id.toLowerCase().includes(search) ||
        row.tx_hash?.toLowerCase().includes(search) ||
        row.invoice_id?.toLowerCase().includes(search),
    );
  }

  if (query.conversionType === "path") {
    rows = rows.filter((row) => row.converted_on_chain);
  } else if (query.conversionType === "direct") {
    rows = rows.filter((row) => !row.converted_on_chain);
  }

  rows.sort((a, b) => {
    const aTime = a.confirmed_at ? new Date(a.confirmed_at).getTime() : 0;
    const bTime = b.confirmed_at ? new Date(b.confirmed_at).getTime() : 0;
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });

  const total = rows.length;
  const offset = (page - 1) * pageSize;

  return {
    settlements: rows.slice(offset, offset + pageSize),
    total,
  };
}
