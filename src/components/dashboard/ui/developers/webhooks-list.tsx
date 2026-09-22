"use client";

import { useCallback } from "react";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import {
  listWebhookEndpoints,
  webhookErrorMessage,
} from "@/lib/kailopay/developer/webhooks";
import { WebhookCard } from "@/components/dashboard/ui/developers/webhook-card";
import { WebhookPlaceholder } from "@/components/dashboard/ui/developers/webhook-placeholder";
import { EmptyState } from "@dub/ui";
import { Webhook } from "@dub/ui/icons";

export function WebhooksList({
  organizationId,
  refreshKey = 0,
}: {
  organizationId: string;
  refreshKey?: number;
}) {
  const fetchEndpoints = useCallback(async () => {
    try {
      return await listWebhookEndpoints();
    } catch (error) {
      throw new Error(webhookErrorMessage(error));
    }
  }, []);

  const { data: endpoints, isLoading, reload } = useAsyncData(fetchEndpoints, [
    organizationId,
    refreshKey,
  ]);

  return (
    <div className="grid gap-5">
      <div className="animate-fade-in">
        {!isLoading ? (
          endpoints && endpoints.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {endpoints.map((endpoint) => (
                <WebhookCard
                  key={endpoint.id}
                  endpoint={endpoint}
                  onDeleted={reload}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white py-10">
              <EmptyState
                icon={Webhook}
                title="You haven't set up any webhooks yet."
                description="Webhooks allow you to receive HTTP requests whenever a payment event occurs here."
                learnMore="/dashboard/developers/documentation"
              />
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <WebhookPlaceholder key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
