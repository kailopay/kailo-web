import { eq } from "drizzle-orm";
import { db } from "@/lib/dashboard/db";
import { customers, payments, type Payment } from "@/lib/dashboard/db/schema";
import { serializePayment } from "@/lib/dashboard/payments/service";
import { dispatchWebhookEvent } from "@/lib/dashboard/webhooks/delivery";

export async function finalizeCompletedPayment(
  payment: Payment,
  input: {
    settlementTxHash: string;
    zkNullifier?: string;
    zkWithdrawTxHash?: string;
    receivedAmount?: string | null;
    paidAssetCode?: string | null;
    paidAssetIssuer?: string | null;
  },
) {
  const [updated] = await db
    .update(payments)
    .set({
      status: "completed",
      settlementTxHash: input.settlementTxHash,
      txHash: input.settlementTxHash,
      zkNullifier: input.zkNullifier ?? payment.zkNullifier,
      zkWithdrawTxHash: input.zkWithdrawTxHash ?? input.settlementTxHash,
      receivedAmount: input.receivedAmount ?? payment.receivedAmount,
      paidAsset: input.paidAssetCode ?? payment.paidAsset,
      paidAssetIssuer: input.paidAssetIssuer ?? payment.paidAssetIssuer,
      confirmedAt: new Date(),
      updatedAt: new Date(),
      blockchainStatus: "confirmed",
    })
    .where(eq(payments.id, payment.id))
    .returning();

  if (!updated) {
    throw new Error("Payment not found");
  }

  const customerPublicId = updated.customerId
    ? (
        await db
          .select({ publicId: customers.publicId })
          .from(customers)
          .where(eq(customers.id, updated.customerId))
          .limit(1)
      )[0]?.publicId ?? null
    : null;

  await dispatchWebhookEvent({
    organizationId: updated.organizationId,
    environment: updated.environment,
    event: "payment.completed",
    payload: serializePayment(updated, { customerPublicId }),
  });

  const { syncCheckoutSessionWithPayment } = await import(
    "@/lib/dashboard/checkout-sessions/service"
  );
  await syncCheckoutSessionWithPayment(updated);

  const { syncInvoiceWithPayment } = await import("@/lib/dashboard/invoices/service");
  await syncInvoiceWithPayment(updated);

  return updated;
}
