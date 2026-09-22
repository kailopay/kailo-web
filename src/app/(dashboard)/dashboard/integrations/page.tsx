import { IntegrationsListPanel } from "@/components/dashboard/integrations/integrations-list-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function IntegrationsPage() {
  const organization = await getDashboardOrganization();
  return <IntegrationsListPanel organizationId={organization.id} />;
}
