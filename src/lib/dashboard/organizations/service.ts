import {
  MOCK_ORGANIZATION,
} from "@/lib/dashboard/mock/data";

export async function getOrganizationsForUser(_userId: string) {
  return [MOCK_ORGANIZATION];
}

export async function userHasOrganization(_userId: string) {
  return true;
}
