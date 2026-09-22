import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFormattedNotificationFields } from "./variables";

test("formats fiat pricing and token payment fields", () => {
  const formatted = buildFormattedNotificationFields({
    pricing_currency: "USD",
    pricing_amount: "10.00",
    quoted_paid_amount: "10.0000000",
    paid_asset: { asset_code: "USDC", issuer_address: "G..." },
    amount: "0.0000001",
  });

  assert.equal(formatted.currency, "USD");
  assert.equal(formatted.currency_label, "US Dollar (USD)");
  assert.equal(formatted.pricing_amount, "$10.00");
  assert.equal(formatted.currency_summary, "$10.00 (US Dollar (USD))");
  assert.equal(formatted.token, "USDC");
  assert.equal(formatted.token_amount, "10");
  assert.equal(formatted.token_payment_line, "10 USDC");
});

test("formats IDR pricing without trailing zeros", () => {
  const formatted = buildFormattedNotificationFields({
    pricing_currency: "IDR",
    pricing_amount: "150000.0000",
    settlement_asset: { asset_code: "USDC", issuer_address: "G..." },
    amount: "0.0000001",
  });

  assert.equal(formatted.currency, "IDR");
  assert.match(formatted.pricing_amount, /150,000/);
  assert.match(formatted.currency_summary, /Rupiah \(IDR\)/);
});

test("falls back to token amount for crypto-only payments", () => {
  const formatted = buildFormattedNotificationFields({
    amount: "25.5000000",
    settlement_asset: { asset_code: "XLM", issuer_address: null },
    paid_asset: { asset_code: "XLM", issuer_address: null },
    quoted_paid_amount: "25.5000000",
  });

  assert.equal(formatted.currency, "");
  assert.equal(formatted.token, "XLM");
  assert.equal(formatted.token_amount, "25.5");
  assert.equal(formatted.currency_summary, "25.5 XLM");
});
