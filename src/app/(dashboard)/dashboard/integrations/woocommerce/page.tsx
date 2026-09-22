import { WooCommerceIntegrationPanel } from "@/components/dashboard/integrations/woocommerce-integration-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function WooCommerceIntegrationPage() {
  const organization = await getDashboardOrganization();
  return <WooCommerceIntegrationPanel organizationId={organization.id} />;
}
