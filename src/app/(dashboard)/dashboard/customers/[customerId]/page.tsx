import { CustomerDetailPanel } from "@/components/dashboard/customers/customer-detail-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const organization = await getDashboardOrganization();
  const { customerId } = await params;

  return (
    <CustomerDetailPanel
      organizationId={organization.id}
      customerId={customerId}
    />
  );
}
