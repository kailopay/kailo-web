import assert from "node:assert/strict";
import { test } from "node:test";
import { amountsWithinSlippage, isAmountUnderpaid } from "@/lib/dashboard/pricing/quotes";

test("amountsWithinSlippage rejects amounts outside symmetric tolerance", () => {
  assert.equal(amountsWithinSlippage("2.0000000", "2.0500000", 50), false);
  assert.equal(amountsWithinSlippage("2.0000000", "2.0090000", 50), true);
});

test("isAmountUnderpaid only flags received amounts below expected tolerance", () => {
  assert.equal(isAmountUnderpaid("2.0000000", "2.0503590", 50), false);
  assert.equal(isAmountUnderpaid("2.0000000", "2.3503590", 50), false);
  assert.equal(isAmountUnderpaid("2.0000000", "1.9900000", 50), false);
  assert.equal(isAmountUnderpaid("2.0000000", "1.9890000", 50), true);
});
