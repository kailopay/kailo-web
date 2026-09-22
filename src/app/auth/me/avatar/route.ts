import { createAuthRoute } from "@/lib/kailopay/create-auth-route";

export const { GET, PUT, DELETE } = createAuthRoute("/auth/me/avatar", [
  "GET",
  "PUT",
  "DELETE",
]);
