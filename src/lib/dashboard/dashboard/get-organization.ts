import { MOCK_ORGANIZATION } from "@/lib/dashboard/mock/data";
import { getServerSession } from "@/lib/kailopay/session";

export async function getDashboardUserId() {
  const session = await getServerSession();
  return session?.id ?? null;
}

export async function getDashboardOrganization() {
  return MOCK_ORGANIZATION;
}
