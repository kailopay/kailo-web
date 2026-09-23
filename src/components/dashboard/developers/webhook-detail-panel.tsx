"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertBlock } from "@/components/dashboard/shared/alert-block";
import { NoWebhookDeliveriesPlaceholder } from "@/components/dashboard/ui/developers/no-webhook-deliveries-placeholder";
import { WebhookAvatar } from "@/components/dashboard/ui/developers/webhook-avatar";
import { WebhookDeliveriesSkeleton } from "@/components/dashboard/ui/developers/webhook-deliveries-skeleton";
import { WebhookDeliveryDetailsSheet } from "@/components/dashboard/ui/developers/webhook-delivery-details-sheet";
import { WebhookDeliveryList } from "@/components/dashboard/ui/developers/webhook-delivery-list";
import { WebhookPlaceholder } from "@/components/dashboard/ui/developers/webhook-placeholder";
import { WebhookStatus } from "@/components/dashboard/ui/developers/webhook-status";
import { useSetDashboardPageHeader } from "@/components/dashboard/ui/layout/dashboard-page-header-context";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import type { WebhookDeliveryRow } from "@/lib/dashboard/webhooks/types";
import { developerErrorMessage } from "@/lib/kailopay/developer/access";
import type { WebhookDelivery } from "@/lib/kailopay/developer/types";
import {
  canReplayWebhookDelivery,
  disableWebhookEndpoint,
  getWebhookEndpoint,
  listWebhookDeliveries,
  queueWebhookTest,
  replayWebhookDelivery,
  webhookErrorMessage,
} from "@/lib/kailopay/developer/webhooks";
import { Button } from "@dub/ui";
import { Trash } from "@dub/ui/icons";

function mapDeliveryRow(delivery: WebhookDelivery): WebhookDeliveryRow {
  return {
    id: delivery.id,
    event: delivery.event_type,
    status: delivery.status,
    responseStatus: delivery.http_status,
    responseBody: delivery.safe_error,
    payload: {
      event_id: delivery.event_id,
      endpoint_id: delivery.endpoint_id,
      attempt_number: delivery.attempt_number,
      scheduled_at: delivery.scheduled_at,
      started_at: delivery.started_at,
      completed_at: delivery.completed_at,
      duration_millis: delivery.duration_millis,
      next_attempt_at: delivery.next_attempt_at,
    },
    attempts: delivery.attempt_number,
    maxAttempts: delivery.attempt_number,
    nextRetryAt: delivery.next_attempt_at,
    lastError: delivery.safe_error,
    createdAt: delivery.created_at,
    deliveredAt: delivery.completed_at,
  };
}

function getWebhookLabel(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function WebhookDetailPanel({ webhookId }: { webhookId: string }) {
  const [pagingId, setPagingId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDeliveryRow[]>([]);
  const [nextPagingId, setNextPagingId] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDeliveryRow | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const fetchEndpoint = useCallback(async () => getWebhookEndpoint(webhookId), [webhookId]);

  const fetchDeliveries = useCallback(async () => {
    const response = await listWebhookDeliveries({
      endpointId: webhookId,
      limit: 20,
      pagingId: pagingId ?? undefined,
    });
    const mapped = response.deliveries.map(mapDeliveryRow);
    if (pagingId) {
      setDeliveries((current) => [...current, ...mapped]);
    } else {
      setDeliveries(mapped);
    }
    setNextPagingId(response.paging_id);
    return response;
  }, [pagingId, webhookId]);

  const {
    data: endpoint,
    error: endpointError,
    isLoading: isEndpointLoading,
  } = useAsyncData(fetchEndpoint, [webhookId]);

  const {
    error: deliveriesError,
    isLoading: isDeliveriesLoading,
    reload: reloadDeliveries,
  } = useAsyncData(fetchDeliveries, [webhookId, pagingId]);

  async function handleSendTest() {
    setIsTesting(true);
    try {
      const queued = await queueWebhookTest(webhookId);
      toast.success(`Test queued (${queued.event_id.slice(0, 8)}…)`);
      setPagingId(null);
      reloadDeliveries();
    } catch (error) {
      toast.error(webhookErrorMessage(error));
    } finally {
      setIsTesting(false);
    }
  }

  async function handleDelete() {
    try {
      await disableWebhookEndpoint(webhookId);
      toast.success("Webhook deleted");
      window.location.assign("/dashboard/developers/webhooks");
    } catch (error) {
      toast.error(webhookErrorMessage(error));
    }
  }

  const headerOverride = useMemo(
    () => ({
      titleInfo: endpoint
        ? {
            title: getWebhookLabel(endpoint.url),
            href: "/dashboard/developers/webhooks",
          }
        : undefined,
      controls: endpoint ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            text="Send test"
            disabled={isTesting || endpoint.enabled !== 1}
            onClick={() => void handleSendTest()}
          />
          <Button
            type="button"
            variant="outline"
            icon={<Trash className="size-4" />}
            text="Delete"
            onClick={() => void handleDelete()}
          />
        </div>
      ) : null,
    }),
    [endpoint, isTesting],
  );

  useSetDashboardPageHeader(headerOverride);

  async function handleReplay(deliveryId: string) {
    try {
      await replayWebhookDelivery(deliveryId);
      toast.success("Replay queued");
      setPagingId(null);
      reloadDeliveries();
    } catch (error) {
      toast.error(webhookErrorMessage(error));
    }
  }

  if (isEndpointLoading) {
    return (
      <div className="space-y-6">
        <WebhookPlaceholder />
        <WebhookDeliveriesSkeleton />
      </div>
    );
  }

  if (endpointError || !endpoint) {
    return (
      <div className="space-y-4">
        <AlertBlock type="error">
          {endpointError ? developerErrorMessage(endpointError) : "Webhook not found"}
        </AlertBlock>
        <Link href="/dashboard/developers/webhooks" className="text-sm underline">
          Back to webhooks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-x-3">
            <div className="flex-shrink-0 rounded-md border border-neutral-200 bg-gradient-to-t from-neutral-100 p-2.5">
              <WebhookAvatar id={endpoint.url} />
            </div>
            <div className="min-w-0 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-neutral-700">
                  {getWebhookLabel(endpoint.url)}
                </span>
                <WebhookStatus endpoint={endpoint} />
              </div>
              <div className="truncate text-sm text-neutral-500">{endpoint.url}</div>
              <p className="mt-1 text-xs text-neutral-400">
                {endpoint.events.length} event type
                {endpoint.events.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-neutral-900">Deliveries</h2>
          <Button
            type="button"
            variant="secondary"
            text="Refresh"
            onClick={() => {
              setPagingId(null);
              reloadDeliveries();
            }}
          />
        </div>

        {deliveriesError ? (
          <AlertBlock type="error">{developerErrorMessage(deliveriesError)}</AlertBlock>
        ) : null}

        {isDeliveriesLoading && deliveries.length === 0 ? (
          <WebhookDeliveriesSkeleton />
        ) : null}

        {!isDeliveriesLoading && deliveries.length === 0 && !deliveriesError ? (
          <NoWebhookDeliveriesPlaceholder />
        ) : null}

        {deliveries.length > 0 ? (
          <>
            <WebhookDeliveryList
              deliveries={deliveries}
              selectedDeliveryId={selectedDelivery?.id}
              onDeliveryClick={(delivery) => {
                setSelectedDelivery(delivery);
                setIsSheetOpen(true);
              }}
            />
            {nextPagingId ? (
              <Button
                type="button"
                variant="secondary"
                text="Load more"
                onClick={() => setPagingId(nextPagingId)}
              />
            ) : null}
          </>
        ) : null}
      </section>

      <WebhookDeliveryDetailsSheet
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        delivery={selectedDelivery}
        onPrevious={undefined}
        onNext={undefined}
        onReplay={
          selectedDelivery && canReplayWebhookDelivery({ status: selectedDelivery.status })
            ? () => void handleReplay(selectedDelivery.id)
            : undefined
        }
      />
    </div>
  );
}
