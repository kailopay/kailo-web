import type { MemberRole } from "@/lib/dashboard/db/schema";
import { MOCK_ORG_ID, MOCK_USER_ID } from "@/lib/dashboard/mock/data";

export class MembersServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | "forbidden"
      | "not_found"
      | "conflict"
      | "invalid"
      | "expired"
      | "email_mismatch",
  ) {
    super(message);
    this.name = "MembersServiceError";
  }
}

export function assertCanManageTeam(role: MemberRole) {
  if (role !== "owner" && role !== "admin") {
    throw new MembersServiceError("You do not have permission to manage team members", "forbidden");
  }
}

export async function getMembershipForUser(organizationId: string, userId: string) {
  if (organizationId !== MOCK_ORG_ID || userId !== MOCK_USER_ID) {
    return null;
  }

  return {
    id: "mem_demo_001",
    organizationId: MOCK_ORG_ID,
    userId: MOCK_USER_ID,
    role: "owner" as MemberRole,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function listOrganizationMembers(_organizationId: string) {
  return [
    {
      id: "mem_demo_001",
      role: "owner" as MemberRole,
      name: "Ada Lovelace",
      email: "ada@acmepayments.demo",
      image: null,
      joinedAt: new Date(),
    },
  ];
}

export async function listPendingInvites(_organizationId: string) {
  return [];
}
