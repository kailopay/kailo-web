import { eq } from "drizzle-orm";
import { db } from "@/lib/dashboard/db";
import { payments, type Payment } from "@/lib/dashboard/db/schema";
import type { CctpBurnSubmissionInput } from "@/lib/dashboard/cctp/types";

export const CCTP_METADATA_KEYS = {
  channel: "escrow_deposit_channel",
  sourceChain: "cctp_source_chain",
  sourceDomain: "cctp_source_domain",
  burnTxHash: "cctp_burn_tx_hash",
  sourcePayer: "cctp_source_payer",
  totalBurnAmount: "cctp_total_burn_amount",
  feeAmount: "cctp_fee_amount",
  bridgeFee: "cctp_bridge_fee",
  attestationStatus: "cctp_attestation_status",
  transferMode: "cctp_transfer_mode",
  phase: "cctp_phase",
} as const;

export function isCctpPayment(payment: Payment) {
  return payment.metadata?.[CCTP_METADATA_KEYS.channel] === "cctp";
}

export async function recordCctpBurnSubmission(
  payment: Payment,
  input: CctpBurnSubmissionInput,
) {
  const metadata = {
    ...(payment.metadata ?? {}),
    [CCTP_METADATA_KEYS.channel]: "cctp",
    [CCTP_METADATA_KEYS.sourceChain]: input.sourceChainId,
    [CCTP_METADATA_KEYS.sourceDomain]: input.quote.sourceDomain.toString(),
    [CCTP_METADATA_KEYS.burnTxHash]: input.burnTxHash,
    ...(input.payerAddress
      ? { [CCTP_METADATA_KEYS.sourcePayer]: input.payerAddress }
      : {}),
    [CCTP_METADATA_KEYS.totalBurnAmount]: input.quote.totalBurnAmount,
    [CCTP_METADATA_KEYS.feeAmount]: input.quote.cctpFeeAmount,
    [CCTP_METADATA_KEYS.bridgeFee]: input.quote.bridgeFeeAmount,
    [CCTP_METADATA_KEYS.attestationStatus]: "pending",
    [CCTP_METADATA_KEYS.transferMode]: input.quote.transferMode,
    [CCTP_METADATA_KEYS.phase]: "attestation_pending",
  };

  const [updated] = await db
    .update(payments)
    .set({
      metadata,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id))
    .returning();

  return updated;
}
