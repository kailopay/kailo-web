import { SlackIntegrationPanel } from "@/components/dashboard/integrations/slack-integration-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function SlackIntegrationPage() {
  const organization = await getDashboardOrganization();
  return <SlackIntegrationPanel organizationId={organization.id} />;
}
