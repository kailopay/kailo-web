"use client";

import { useCallback, useMemo } from "react";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import { INTEGRATION_CATALOG } from "@/lib/dashboard/integrations/catalog";
import type { IntegrationListItem } from "@/lib/dashboard/integrations/types";
import { IntegrationCard } from "@/components/dashboard/ui/integrations/integration-card";
import { IntegrationPlaceholder } from "@/components/dashboard/ui/integrations/integration-placeholder";

function buildCatalogFallback(): IntegrationListItem[] {
  return INTEGRATION_CATALOG.map((item) => ({
    ...item,
    integration: null,
  }));
}

function IntegrationSection({
  title,
  items,
}: {
  title: string;
  items: IntegrationListItem[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-neutral-700">{title}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item) => (
          <IntegrationCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function IntegrationsList({
  organizationId,
  refreshKey = 0,
}: {
  organizationId: string;
  refreshKey?: number;
}) {
  const catalogFallback = useMemo(() => buildCatalogFallback(), []);

  const fetchIntegrations = useCallback(async () => {
    const response = await fetch(`/api/organizations/${organizationId}/integrations`);
    const data = (await response.json()) as {
      integrations?: IntegrationListItem[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load integrations");
    }

    return data.integrations ?? [];
  }, [organizationId]);

  const { data: integrations, error, isLoading } = useAsyncData(
    fetchIntegrations,
    [organizationId, refreshKey],
  );

  const items = integrations ?? (error ? catalogFallback : []);
  const commerceItems = items.filter((item) => item.category === "commerce");
  const notificationItems = items.filter(
    (item) => item.category === "notifications",
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {catalogFallback.map((item) => (
            <IntegrationPlaceholder key={item.id} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <IntegrationSection title="Commerce" items={commerceItems} />
      <IntegrationSection title="Notifications" items={notificationItems} />
    </div>
  );
}
