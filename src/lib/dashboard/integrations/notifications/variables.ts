import {
  formatAmountWithUnit,
  formatTokenAmount,
  formatTokenWithAsset,
} from "@/lib/dashboard/format/amount";
import { getInvoiceCurrency } from "@/lib/dashboard/invoices/currencies";

function readString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function readAssetCode(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  if (!value || typeof value !== "object" || !("asset_code" in value)) {
    return "";
  }

  const assetCode = (value as { asset_code?: unknown }).asset_code;
  return typeof assetCode === "string" ? assetCode : "";
}

function resolveTokenAmount(payload: Record<string, unknown>) {
  return (
    readString(payload, "received_amount") ||
    readString(payload, "quoted_paid_amount") ||
    ""
  );
}

export function buildFormattedNotificationFields(
  payload: Record<string, unknown>,
) {
  const pricingCurrency = readString(payload, "pricing_currency").trim();
  const pricingAmountRaw = readString(payload, "pricing_amount").trim();
  const token =
    readAssetCode(payload, "paid_asset") ||
    readAssetCode(payload, "settlement_asset");
  const tokenAmountRaw = resolveTokenAmount(payload);
  const stellarAmountRaw = readString(payload, "amount").trim();

  const currencyLabel = pricingCurrency
    ? (getInvoiceCurrency(pricingCurrency)?.label ?? pricingCurrency)
    : "";

  const pricingAmount =
    pricingAmountRaw && pricingCurrency
      ? formatAmountWithUnit(pricingAmountRaw, pricingCurrency)
      : "";

  const tokenAmount = tokenAmountRaw
    ? token
      ? formatTokenAmount(tokenAmountRaw)
      : formatTokenAmount(tokenAmountRaw)
    : "";

  const tokenAmountWithAsset =
    tokenAmountRaw && token
      ? formatTokenWithAsset(tokenAmountRaw, token)
      : tokenAmount;

  const amount =
    pricingAmount ||
    tokenAmountWithAsset ||
    (stellarAmountRaw && token
      ? formatTokenWithAsset(stellarAmountRaw, token)
      : stellarAmountRaw
        ? formatTokenAmount(stellarAmountRaw)
        : "");

  const currencySummary =
    pricingAmount && currencyLabel
      ? `${pricingAmount} (${currencyLabel})`
      : pricingAmount && pricingCurrency
        ? `${pricingAmount} ${pricingCurrency}`
        : tokenAmountWithAsset || amount;

  const tokenPaymentLine =
    tokenAmount && token ? `${tokenAmount} ${token}` : tokenAmountWithAsset;

  return {
    currency: pricingCurrency,
    currency_label: currencyLabel,
    currency_summary: currencySummary,
    pricing_amount: pricingAmount,
    pricing_amount_raw: pricingAmountRaw,
    token,
    token_amount: tokenAmount,
    token_amount_with_asset: tokenAmountWithAsset,
    token_payment_line: tokenPaymentLine,
    amount,
  };
}
