import { TeamMembersPanel } from "@/components/dashboard/settings/team-members-panel";
import {
  getDashboardOrganization,
  getDashboardUserId,
} from "@/lib/dashboard/dashboard/get-organization";
import { getMembershipForUser } from "@/lib/dashboard/organizations/members";
import { redirect } from "next/navigation";

export default async function TeamMembersPage() {
  const [organization, userId] = await Promise.all([
    getDashboardOrganization(),
    getDashboardUserId(),
  ]);

  const membership = await getMembershipForUser(organization.id, userId);

  if (!membership) {
    redirect("/onboarding");
  }

  return (
    <TeamMembersPanel
      organizationId={organization.id}
      viewerRole={membership.role}
      viewerUserId={userId}
    />
  );
}
