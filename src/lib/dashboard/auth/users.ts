import { MOCK_USER } from "@/lib/dashboard/mock/data";

export async function findUserByEmail(_email: string) {
  return MOCK_USER;
}
