import type { AllowedAsset } from "@/lib/dashboard/assets/types";
import { assetsMatch } from "@/lib/dashboard/assets/types";
import { STABLECOIN_FIAT_MAP } from "@/constants/dashboard/pricing/quotes";

export type CheckoutQuoteLike = {
  pricing_amount: string;
  pricing_currency: string;
  paid_asset: AllowedAsset;
  paid_amount: string;
  expires_at: string;
};

export function isQuoteStillValid(quote: { expires_at: string }) {
  return new Date(quote.expires_at).getTime() > Date.now() + 1500;
}

export function isStablecoinPeggedToCurrency(assetCode: string, currency: string) {
  return STABLECOIN_FIAT_MAP[assetCode] === currency;
}

export function validatePaymentQuote(
  quote: CheckoutQuoteLike,
  expected: {
    pricingAmount: string;
    pricingCurrency: string;
    paidAsset: AllowedAsset;
  },
) {
  if (quote.pricing_amount !== expected.pricingAmount) {
    throw new Error("Quote pricing amount mismatch");
  }

  if (quote.pricing_currency !== expected.pricingCurrency) {
    throw new Error("Quote pricing currency mismatch");
  }

  if (!assetsMatch(quote.paid_asset, expected.paidAsset)) {
    throw new Error("Quote paid asset mismatch");
  }

  if (quote.paid_amount === expected.pricingAmount && !isStablecoinPeggedToCurrency(expected.paidAsset.asset_code, expected.pricingCurrency)) {
    throw new Error("Quote amount looks invalid for this asset");
  }
}

export function resolveCheckoutDisplayAmount(input: { hasPricing: boolean; paymentAmount: string; paymentPaidAsset: AllowedAsset | null; quotedPaidAmount: string | null; selectedPaidAsset: AllowedAsset | null; quote: CheckoutQuoteLike | null }): string | null {
  if (!input.hasPricing) {
    return input.paymentAmount;
  }

  if (input.quote?.paid_amount && input.selectedPaidAsset && assetsMatch(input.quote.paid_asset, input.selectedPaidAsset)) {
    return input.quote.paid_amount;
  }

  if (input.quotedPaidAmount && input.paymentPaidAsset && input.selectedPaidAsset && assetsMatch(input.paymentPaidAsset, input.selectedPaidAsset)) {
    return input.quotedPaidAmount;
  }

  return null;
}

export function isCheckoutQuoteReady(input: { hasPricing: boolean; selectedPaidAsset: AllowedAsset | null; quote: CheckoutQuoteLike | null; quoteExpired: boolean; isLoadingQuote: boolean; isRefreshingRate: boolean }) {
  if (!input.hasPricing) {
    return true;
  }

  if (!input.selectedPaidAsset || !input.quote?.paid_amount) {
    return false;
  }

  if (!assetsMatch(input.quote.paid_asset, input.selectedPaidAsset)) {
    return false;
  }

  if (input.quoteExpired) {
    return false;
  }

  if (input.isLoadingQuote) {
    return false;
  }

  if (input.isRefreshingRate) {
    return isQuoteStillValid(input.quote);
  }

  return true;
}
