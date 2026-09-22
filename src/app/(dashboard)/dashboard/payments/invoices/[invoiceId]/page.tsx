import { InvoiceDetailPanel } from "@/components/dashboard/payments/invoice-detail-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const organization = await getDashboardOrganization();
  const { invoiceId } = await params;

  return (
    <InvoiceDetailPanel organizationId={organization.id} invoiceId={invoiceId} />
  );
}
