export {
  DEFAULT_APP_URL,
  DEFAULT_DOCS_URL,
  DEFAULT_GITHUB_REPO_URL,
} from "./defaults";

export const DEFAULT_SMTP_PORT = 587;

export const MOBILE_BREAKPOINT_PX = 768;

import { getPublicEnv } from "@/lib/dashboard/runtime/public-env";

export function getAppUrl(): string {
  return getPublicEnv().appUrl.replace(/\/$/, "");
}
