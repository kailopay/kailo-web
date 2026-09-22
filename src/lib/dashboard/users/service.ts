import {
  fetchDashboardProfile,
  mapKailopayUserToProfile,
  updateDashboardDisplayName,
} from "@/lib/kailopay/developer/profile";
import { getServerSession } from "@/lib/kailopay/session";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  authProvider: "credentials" | "google";
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getUserProfile(_userId?: string) {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  return mapKailopayUserToProfile(session);
}

export async function getUserProfileClient() {
  return fetchDashboardProfile();
}

export async function updateUserProfile(
  _userId: string,
  input: { name?: string; image?: string | null },
) {
  if (input.name !== undefined) {
    return updateDashboardDisplayName(input.name);
  }
  return fetchDashboardProfile();
}
