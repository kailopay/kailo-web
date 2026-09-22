import { parseUser } from "@/lib/kailopay/auth";
import { KailopayError } from "@/lib/kailopay/http";
import type { UserProfile } from "@/lib/dashboard/users/service";
import { mapKailopayUserToProfile } from "./profile";

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function uploadProfileAvatar(dataUrl: string): Promise<UserProfile> {
  const blob = await dataUrlToBlob(dataUrl);
  const formData = new FormData();
  formData.append("avatar", blob, "avatar.jpg");

  const response = await fetch("/auth/me/avatar", {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new KailopayError(
      "Unable to upload profile picture",
      response.status,
      null,
      response.headers.get("X-Request-ID"),
    );
  }

  const payload: unknown = await response.json();
  return mapKailopayUserToProfile(parseUser(payload));
}

export async function deleteProfileAvatar(): Promise<UserProfile> {
  const response = await fetch("/auth/me/avatar", {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new KailopayError(
      "Unable to remove profile picture",
      response.status,
      null,
      response.headers.get("X-Request-ID"),
    );
  }

  const payload: unknown = await response.json();
  return mapKailopayUserToProfile(parseUser(payload));
}
