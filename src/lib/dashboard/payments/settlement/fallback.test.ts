import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatSettlementFallbackNotice,
  isPaidAssetSettlementFallback,
  resolveSettlementFallback,
} from "@/lib/dashboard/payments/settlement/fallback";

const usdc = { asset_code: "USDC", issuer_address: "GISSUER" };
const xlm = { asset_code: "XLM", issuer_address: null };

test("detects legacy paid-asset fallback from quoted USDC amounts", () => {
  const payment = {
    paid_asset: xlm,
    settlement_asset: usdc,
    status: "completed",
    received_amount: "11.5311659",
    merchant_settlement_amount: "1.9800000",
    quoted_settlement_amount: "2.0000000",
    metadata: null,
  };

  assert.equal(isPaidAssetSettlementFallback(payment), true);

  const fallback = resolveSettlementFallback(payment);
  assert.equal(fallback?.actualMerchantAmount, "11.4158543");
  assert.equal(fallback?.quotedMerchantAmount, "1.9800000");
});

test("uses metadata amounts when settlement fallback is recorded", () => {
  const payment = {
    paid_asset: xlm,
    settlement_asset: usdc,
    status: "completed",
    received_amount: "11.5311659",
    merchant_settlement_amount: "11.4158542",
    quoted_settlement_amount: "2.0000000",
    metadata: {
      settlement_mode: "paid_asset_fallback",
      quoted_merchant_settlement_amount: "1.9800000",
      settlement_fallback_reason: "No liquidity path",
    },
  };

  const fallback = resolveSettlementFallback(payment);
  assert.equal(fallback?.actualMerchantAmount, "11.4158542");
  assert.match(
    formatSettlementFallbackNotice(fallback!),
    /Quoted settlement was 1\.9800000 USDC/,
  );
});
