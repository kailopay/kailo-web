import { createAuthRoute } from "@/lib/kailopay/create-auth-route";

export const { GET, PATCH } = createAuthRoute("/auth/me", ["GET", "PATCH"]);
