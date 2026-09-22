import { createAuthRoute } from "@/lib/kailopay/create-auth-route";

export const { POST } = createAuthRoute("/auth/email/resend", ["POST"]);
