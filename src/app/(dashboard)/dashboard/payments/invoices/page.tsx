import { redirect } from "next/navigation";
import { getPaymentsHubHref } from "@/lib/dashboard/navigation/payments-tabs";

export default function InvoicesPage() {
  redirect(getPaymentsHubHref("invoices"));
}
