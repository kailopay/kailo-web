import { createAuthRoute } from "@/lib/kailopay/create-auth-route";

export const { GET } = createAuthRoute("/auth/google/login", ["GET"]);
