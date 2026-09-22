import assert from "node:assert/strict";
import { test } from "node:test";
import { isCheckoutQuoteReady, resolveCheckoutDisplayAmount, validatePaymentQuote } from "@/lib/dashboard/checkout/quote-validation";

const usdc = { asset_code: "USDC", issuer_address: "GISSUER" };
const xlm = { asset_code: "XLM", issuer_address: null };

test("resolveCheckoutDisplayAmount prefers quote for selected asset", () => {
  const amount = resolveCheckoutDisplayAmount({
    hasPricing: true,
    paymentAmount: "2.0000000",
    paymentPaidAsset: usdc,
    quotedPaidAmount: "2.0000000",
    selectedPaidAsset: xlm,
    quote: {
      pricing_amount: "2.00",
      pricing_currency: "USD",
      paid_asset: xlm,
      paid_amount: "8.1234567",
      expires_at: new Date(Date.now() + 60_000).toISOString(),
    },
  });

  assert.equal(amount, "8.1234567");
});

test("resolveCheckoutDisplayAmount ignores stale server quote for other asset", () => {
  const amount = resolveCheckoutDisplayAmount({
    hasPricing: true,
    paymentAmount: "2.0000000",
    paymentPaidAsset: usdc,
    quotedPaidAmount: "2.0000000",
    selectedPaidAsset: xlm,
    quote: null,
  });

  assert.equal(amount, null);
});

test("resolveCheckoutDisplayAmount uses server quote when asset matches", () => {
  const amount = resolveCheckoutDisplayAmount({
    hasPricing: true,
    paymentAmount: "2.0000000",
    paymentPaidAsset: usdc,
    quotedPaidAmount: "2.0000000",
    selectedPaidAsset: usdc,
    quote: null,
  });

  assert.equal(amount, "2.0000000");
});

test("validatePaymentQuote rejects suspicious 1:1 non-stablecoin quote", () => {
  assert.throws(() =>
    validatePaymentQuote(
      {
        pricing_amount: "2.00",
        pricing_currency: "USD",
        paid_asset: xlm,
        paid_amount: "2.00",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      {
        pricingAmount: "2.00",
        pricingCurrency: "USD",
        paidAsset: xlm,
      },
    ),
  );
});

test("isCheckoutQuoteReady waits for selected asset quote", () => {
  assert.equal(
    isCheckoutQuoteReady({
      hasPricing: true,
      selectedPaidAsset: xlm,
      quote: {
        pricing_amount: "2.00",
        pricing_currency: "USD",
        paid_asset: usdc,
        paid_amount: "2.0000000",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      quoteExpired: false,
      isLoadingQuote: false,
      isRefreshingRate: false,
    }),
    false,
  );
});
