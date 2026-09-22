import { ProfileSettingsPanel } from "@/components/dashboard/settings/profile-settings-panel";
import { getDashboardUserId } from "@/lib/dashboard/dashboard/get-organization";
import { getUserProfile } from "@/lib/dashboard/users/service";
import { redirect } from "next/navigation";

export default async function ProfileSettingsPage() {
  const userId = await getDashboardUserId();
  if (!userId) {
    redirect("/login?next=/dashboard/settings/profile");
  }

  const user = await getUserProfile(userId);
  if (!user) {
    redirect("/login?next=/dashboard/settings/profile");
  }

  return <ProfileSettingsPanel key={user.updatedAt.toString()} user={user} />;
}
