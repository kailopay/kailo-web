import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveGrossSettlementAmount,
  resolveMerchantSettlementAmount,
  resolvePaidAssetFallbackSettlementAmounts,
  resolvePlatformFeeAmount,
  resolveSettlementAmounts,
} from "@/lib/dashboard/payments/settlement/amounts";
import type { Payment } from "@/lib/dashboard/db/schema";

function paymentFixture(
  overrides: Partial<Payment> = {},
): Payment {
  return {
    id: "pay-id",
    publicId: "pay_test",
    organizationId: "org",
    environment: "sandbox",
    amount: "10.0000000",
    quotedSettlementAmount: "10.0000000",
    platformFeeAmount: "0.1000000",
    merchantSettlementAmount: "9.9000000",
    settlementAsset: "USDC",
    settlementAssetIssuer: "GISSUER",
    status: "pending",
    paymentFlow: "zk_shielded",
    receivingAddress: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Payment;
}

test("resolveSettlementAmounts applies the same 1% platform fee as escrow", () => {
  const payment = paymentFixture();
  const amounts = resolveSettlementAmounts(payment);

  assert.equal(amounts.gross, "10.0000000");
  assert.equal(amounts.platformFee, "0.1000000");
  assert.equal(amounts.merchantNet, "9.9000000");
});

test("resolveSettlementAmounts derives fee amounts when missing", () => {
  const payment = paymentFixture({
    platformFeeAmount: "0",
    merchantSettlementAmount: null,
  });

  assert.equal(resolvePlatformFeeAmount(payment), "0.1000000");
  assert.equal(resolveMerchantSettlementAmount(payment), "9.9000000");
});

test("resolvePaidAssetFallbackSettlementAmounts applies platform fee to received amount", () => {
  const amounts = resolvePaidAssetFallbackSettlementAmounts("11.0311354");

  assert.equal(amounts.gross, "11.0311354");
  assert.equal(amounts.platformFee, "0.1103113");
  assert.equal(amounts.merchantNet, "10.9208241");
});

test("resolveGrossSettlementAmount rejects paid amount for cross-asset settlement", () => {
  const payment = paymentFixture({
    amount: "2.0000000",
    quotedPaidAmount: "2.0000000",
    quotedSettlementAmount: null,
    paidAsset: "USDC",
    paidAssetIssuer: "GISSUER",
    settlementAsset: "XLM",
    settlementAssetIssuer: null,
  });

  assert.throws(
    () => resolveGrossSettlementAmount(payment),
    /Settlement quote is missing/,
  );
});

test("resolveGrossSettlementAmount uses quoted settlement when present", () => {
  const payment = paymentFixture({
    quotedSettlementAmount: "10.5000000",
    paidAsset: "USDC",
    settlementAsset: "XLM",
  });

  assert.equal(resolveGrossSettlementAmount(payment), "10.5000000");
});
