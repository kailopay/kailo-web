import { ApiKeysListPanel } from "@/components/dashboard/developers/api-keys-list-panel";
import { DeveloperAccessGate } from "@/components/dashboard/developers/developer-access-gate";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function ApiKeysPage() {
  const organization = await getDashboardOrganization();
  return (
    <DeveloperAccessGate>
      <ApiKeysListPanel organizationId={organization.id} />
    </DeveloperAccessGate>
  );
}
