import { eq } from "drizzle-orm";
import { db } from "@/lib/dashboard/db";
import { paymentLinks, type Payment } from "@/lib/dashboard/db/schema";
import {
  hasCustomerCollection,
  normalizePaymentLinkCustomerCollection,
  type PaymentLinkCustomerCollection,
} from "@/lib/dashboard/payment-links/types";

export type CheckoutPaymentLinkContext = {
  customerCollection: PaymentLinkCustomerCollection | null;
  merchantMemo: string | null;
};

export async function getCheckoutPaymentLinkContext(
  payment: Pick<Payment, "paymentLinkId">,
): Promise<CheckoutPaymentLinkContext> {
  if (!payment.paymentLinkId) {
    return {
      customerCollection: null,
      merchantMemo: null,
    };
  }

  const link = await db
    .select({
      customerCollection: paymentLinks.customerCollection,
      description: paymentLinks.description,
    })
    .from(paymentLinks)
    .where(eq(paymentLinks.id, payment.paymentLinkId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!link) {
    return {
      customerCollection: null,
      merchantMemo: null,
    };
  }

  const collection = normalizePaymentLinkCustomerCollection(link.customerCollection);

  return {
    customerCollection: hasCustomerCollection(collection) ? collection : null,
    merchantMemo: link.description?.trim() || null,
  };
}
