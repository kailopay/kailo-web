import { DeveloperAccessGate } from "@/components/dashboard/developers/developer-access-gate";
import { WebhooksListPanel } from "@/components/dashboard/developers/webhooks-list-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function WebhooksPage() {
  const organization = await getDashboardOrganization();
  return (
    <DeveloperAccessGate>
      <WebhooksListPanel organizationId={organization.id} />
    </DeveloperAccessGate>
  );
}
