import { BusinessesPage } from "@/components/dashboard/business/businesses-page";
import { getDashboardUserId } from "@/lib/dashboard/dashboard/get-organization";
import { getOrganizationsForUser } from "@/lib/dashboard/organizations/service";

export default async function DashboardBusinessesPage() {
  const userId = await getDashboardUserId();
  const organizations = await getOrganizationsForUser(userId);

  return <BusinessesPage organizations={organizations} />;
}
