import assert from "node:assert/strict";
import { test } from "node:test";
import type { Payment } from "@/lib/dashboard/db/schema";
import {
  ESCROW_DEPOSIT_CHANNEL_KEY,
  isContractEscrowDeposit,
  withEscrowDepositChannel,
} from "@/lib/dashboard/payments/settlement/deposit-tracking";

function paymentFixture(
  metadata: Payment["metadata"] = {},
): Payment {
  return {
    id: "pay-id",
    publicId: "pay_test",
    organizationId: "org",
    environment: "sandbox",
    amount: "10.0000000",
    status: "deposit_received",
    paymentFlow: "escrow",
    receivingAddress: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata,
  } as Payment;
}

test("isContractEscrowDeposit only returns true for contract channel", () => {
  assert.equal(isContractEscrowDeposit(paymentFixture()), false);
  assert.equal(
    isContractEscrowDeposit(
      paymentFixture({ [ESCROW_DEPOSIT_CHANNEL_KEY]: "classic" }),
    ),
    false,
  );
  assert.equal(
    isContractEscrowDeposit(
      paymentFixture({ [ESCROW_DEPOSIT_CHANNEL_KEY]: "contract" }),
    ),
    true,
  );
});

test("withEscrowDepositChannel stores channel in metadata", () => {
  assert.deepEqual(withEscrowDepositChannel(undefined, "classic"), {
    [ESCROW_DEPOSIT_CHANNEL_KEY]: "classic",
  });
});
