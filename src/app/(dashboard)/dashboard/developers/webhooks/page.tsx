import { WebhooksListPanel } from "@/components/dashboard/developers/webhooks-list-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function WebhooksPage() {
  const organization = await getDashboardOrganization();
  return <WebhooksListPanel organizationId={organization.id} />;
}
