import { MOCK_ORGANIZATION } from "@/lib/dashboard/mock/data";

export const ACTIVE_ORGANIZATION_COOKIE = "kailopay_active_org";

export async function getActiveOrganizationIdFromCookie() {
  return MOCK_ORGANIZATION.id;
}

export async function setActiveOrganizationCookie(_organizationId: string) {
  // no-op in demo mode
}

export async function clearActiveOrganizationCookie() {
  // no-op in demo mode
}

export async function getActiveOrganizationForUser(_userId: string) {
  return MOCK_ORGANIZATION;
}
