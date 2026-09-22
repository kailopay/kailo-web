import { getPublicEnv } from "@/lib/dashboard/runtime/public-env";

export function getDocsUrl() {
  return getPublicEnv().docsUrl;
}

export function getDocsQuickstartUrl() {
  return `${getDocsUrl()}/quickstart`;
}
