import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/kailopay/session";

const API_ORIGIN = process.env.API_ORIGIN ?? "https://api.kailopay.com";

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const session = request.cookies.get(SESSION_COOKIE_NAME);
  if (!session?.value) {
    return false;
  }

  try {
    const response = await fetch(`${API_ORIGIN}/auth/me`, {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${session.value}`,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const authenticated = await hasValidSession(request);
    if (!authenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
