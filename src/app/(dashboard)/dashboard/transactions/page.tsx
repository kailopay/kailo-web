import { TransactionsListPanel } from "@/components/dashboard/transactions/transactions-list-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function TransactionsPage() {
  const organization = await getDashboardOrganization();

  return (
    <TransactionsListPanel
      organizationId={organization.id}
      environment={organization.environment}
    />
  );
}
