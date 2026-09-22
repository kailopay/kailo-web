import { isRecord, KailopayError, kailopayFetch, stringField } from "./http";
import type { User } from "./types";

export function parseUser(payload: unknown): User {
  if (!isRecord(payload) || !isRecord(payload.user)) {
    throw new KailopayError(
      "Unexpected response from server. Try again.",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }
  const user = payload.user;
  const parsed: User = {
    id: stringField(user, "id"),
    display_name: stringField(user, "display_name"),
    email: stringField(user, "email"),
    email_verified: user.email_verified === true,
    developer_enabled: user.developer_enabled === true,
  };
  if (typeof user.avatar_url === "string") {
    parsed.avatar_url = user.avatar_url;
  }
  return parsed;
}

export async function getMe(): Promise<User> {
  return parseUser(await kailopayFetch("/auth/me"));
}

export async function login(email: string, password: string): Promise<User> {
  return parseUser(
    await kailopayFetch("/auth/login", {
      body: { email, password },
    }),
  );
}

export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  const body =
    displayName === undefined || displayName.trim() === ""
      ? { email, password }
      : { email, password, display_name: displayName.trim() };
  return parseUser(await kailopayFetch("/auth/register", { body }));
}

export async function logout(): Promise<void> {
  await kailopayFetch("/auth/logout", { method: "POST" });
}

export async function updateProfile(input: {
  display_name?: string;
  developer_enabled?: boolean;
}): Promise<User> {
  return parseUser(
    await kailopayFetch("/auth/me", {
      method: "PATCH",
      body: input,
    }),
  );
}

export async function signOutAndRedirect(path = "/login"): Promise<void> {
  try {
    await logout();
  } finally {
    window.location.assign(path);
  }
}

export async function verifyEmail(token: string): Promise<User> {
  return parseUser(await kailopayFetch("/auth/email/verify", { body: { token } }));
}

export async function resendVerification(email: string): Promise<void> {
  await kailopayFetch("/auth/email/resend", { body: { email } });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await kailopayFetch("/auth/password/forgot", { body: { email } });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await kailopayFetch("/auth/password/reset", {
    body: { token, new_password: newPassword },
  });
}

export {
  GOOGLE_AUTH_POPUP_MESSAGE,
  isGoogleAuthPopupWindow,
  openGoogleLoginPopup,
} from "./google-auth-popup";

export async function isGoogleLoginAvailable(): Promise<boolean> {
  try {
    const response = await fetch("/auth/google/login", {
      method: "GET",
      redirect: "manual",
      credentials: "include",
    });
    return response.status === 302 || response.type === "opaqueredirect";
  } catch {
    return false;
  }
}
