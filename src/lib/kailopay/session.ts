import { cookies } from "next/headers";

import { parseUser } from "./auth";
import { KailopayError, kailopayFetch } from "./http";
import type { User } from "./types";

export const SESSION_COOKIE_NAME = "kailopay_session";

export async function getServerSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (!session?.value) {
    return null;
  }

  const origin = process.env.API_ORIGIN ?? "https://api.kailopay.com";

  try {
    const response = await fetch(`${origin}/auth/me`, {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${session.value}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();
    return parseUser(payload);
  } catch {
    return null;
  }
}

export async function getServerSessionViaProxy(): Promise<User | null> {
  try {
    return parseUser(await kailopayFetch("/auth/me"));
  } catch (error) {
    if (error instanceof KailopayError && error.status === 401) {
      return null;
    }
    throw error;
  }
}
