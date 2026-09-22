import type { IntegrationProviderId } from "@/lib/dashboard/integrations/types";
import { getIntegrationCatalogItem } from "@/lib/dashboard/integrations/catalog";

export function getIntegrationIconUrl(provider: IntegrationProviderId) {
  const item = getIntegrationCatalogItem(provider);
  return item?.iconUrl ?? "";
}
