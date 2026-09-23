import { createAuthRoute } from "@/lib/kailopay/create-auth-route";

export const { GET, POST } = createAuthRoute("/auth", ["GET", "POST"]);
