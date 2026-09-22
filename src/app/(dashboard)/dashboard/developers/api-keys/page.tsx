import { ApiKeysListPanel } from "@/components/dashboard/developers/api-keys-list-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function ApiKeysPage() {
  const organization = await getDashboardOrganization();
  return <ApiKeysListPanel organizationId={organization.id} />;
}
