import { DiscordIntegrationPanel } from "@/components/dashboard/integrations/discord-integration-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function DiscordIntegrationPage() {
  const organization = await getDashboardOrganization();
  return <DiscordIntegrationPanel organizationId={organization.id} />;
}
