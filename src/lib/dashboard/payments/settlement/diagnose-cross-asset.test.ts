import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifySettlementFailure,
  type CrossAssetSettlementDiagnosis,
} from "@/lib/dashboard/payments/settlement/diagnose-cross-asset";

function diagnosisFixture(
  overrides: Partial<CrossAssetSettlementDiagnosis> = {},
): CrossAssetSettlementDiagnosis {
  return {
    merchantSettlementAmount: "1.9800000",
    sendMax: "11.5896812",
    pathPayment: {
      available: false,
      bestSourceAmount: null,
      path: [],
      error: "No liquidity path from XLM to USDC",
    },
    operatorBalances: {
      paidAsset: "12.5000000 XLM",
      settlementAsset: "0.8700000 USDC",
    },
    directSettlement: {
      possible: false,
      reason: "Operator needs at least 1.9800000 USDC",
    },
    pathBuild: {
      ok: false,
      error: "No liquidity path from XLM to USDC",
    },
    expectedOutcome: "paid_asset_fallback",
    summary:
      "Settlement falls back to paid asset because: no XLM→USDC path on Horizon; operator USDC balance (0.87) is below merchant amount (1.98).",
    ...overrides,
  };
}

test("classifySettlementFailure detects liquidity errors", () => {
  assert.equal(
    classifySettlementFailure(new Error("No liquidity path from XLM to USDC")),
    "no_path",
  );
  assert.equal(
    classifySettlementFailure(new Error("op_too_few_offers")),
    "liquidity",
  );
});

test("paid asset fallback scenario matches XLM pay / USDC settle pattern", () => {
  const diagnosis = diagnosisFixture();

  assert.equal(diagnosis.expectedOutcome, "paid_asset_fallback");
  assert.equal(diagnosis.directSettlement.possible, false);
  assert.equal(diagnosis.pathPayment.available, false);
  assert.match(diagnosis.summary, /falls back to paid asset/);
});
