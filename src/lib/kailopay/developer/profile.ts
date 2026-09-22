import { getMe, updateProfile } from "@/lib/kailopay/auth";
import type { User } from "@/lib/kailopay/types";
import type { UserProfile } from "@/lib/dashboard/users/service";

export function mapKailopayUserToProfile(user: User): UserProfile {
  const now = new Date();
  return {
    id: user.id,
    name: user.display_name,
    email: user.email,
    image: user.avatar_url ?? null,
    authProvider: "credentials",
    emailVerifiedAt: user.email_verified ? now : null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function fetchDashboardProfile(): Promise<UserProfile> {
  return mapKailopayUserToProfile(await getMe());
}

export async function updateDashboardDisplayName(displayName: string): Promise<UserProfile> {
  const user = await updateProfile({ display_name: displayName.trim() });
  return mapKailopayUserToProfile(user);
}

export function avatarUploadUrl(): string {
  return "/auth/me/avatar";
}
