import type { Payment } from "@/lib/dashboard/db/schema";
import { isStellarTransactionHash } from "@/lib/dashboard/stellar/transaction-hash";

type PaymentTxFields = Pick<
  Payment,
  "txHash" | "settlementTxHash" | "zkWithdrawTxHash"
>;

export function resolvePaymentSettlementTxHash(
  payment: PaymentTxFields,
): string | null {
  for (const candidate of [
    payment.txHash,
    payment.settlementTxHash,
    payment.zkWithdrawTxHash,
  ]) {
    if (isStellarTransactionHash(candidate)) {
      return candidate;
    }
  }

  return null;
}
