import type { Payment } from "@/lib/dashboard/db/schema";
import { getCheckoutPaymentLinkContext } from "@/lib/dashboard/checkout/payment-link-context";
import type { PaymentLinkCustomerCollection } from "@/lib/dashboard/payment-links/types";

export async function getCheckoutCustomerCollection(
  payment: Pick<Payment, "paymentLinkId">,
): Promise<PaymentLinkCustomerCollection | null> {
  const { customerCollection } = await getCheckoutPaymentLinkContext(payment);
  return customerCollection;
}
