import type { WebhookEndpointRow } from "@/lib/dashboard/webhooks/types";
import { apiErrorMessage } from "@/lib/kailopay/errors";
import { isRecord, KailopayError, kailopayFetch } from "@/lib/kailopay/http";
import type {
  WebhookDeliveriesResponse,
  WebhookDelivery,
  WebhookDeliveryStatus,
  WebhookQueuedResponse,
} from "./types";

export const BACKEND_WEBHOOK_EVENT_TYPES = [
  "order.created",
  "order.payment_pending",
  "order.payment_confirmed",
  "order.asset_received",
  "order.processing",
  "order.completed",
  "order.failed",
  "order.expired",
] as const;

type BackendWebhookEndpoint = {
  id: string;
  url: string;
  status: "active" | "disabled";
  event_types: string[];
  created_at: string;
  disabled_at?: string | null;
};

function mapWebhookEndpoint(row: BackendWebhookEndpoint): WebhookEndpointRow {
  return {
    id: row.id,
    url: row.url,
    events: row.event_types,
    enabled: row.status === "active" ? 1 : 0,
    createdAt: row.created_at,
  };
}

function parseWebhookList(payload: unknown): WebhookEndpointRow[] {
  if (!isRecord(payload) || !Array.isArray(payload.endpoints)) {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }
  return payload.endpoints.map((row) =>
    mapWebhookEndpoint(row as BackendWebhookEndpoint),
  );
}

export async function listWebhookEndpoints(): Promise<WebhookEndpointRow[]> {
  return parseWebhookList(await kailopayFetch("/v1/webhook-endpoints"));
}

export async function getWebhookEndpoint(id: string): Promise<WebhookEndpointRow> {
  const payload = await kailopayFetch(`/v1/webhook-endpoints/${encodeURIComponent(id)}`);
  if (!isRecord(payload) || !isRecord(payload.endpoint)) {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }
  return mapWebhookEndpoint(payload.endpoint as BackendWebhookEndpoint);
}

export async function createWebhookEndpoint(input: {
  url: string;
  events: string[];
}): Promise<{ id: string; secret: string }> {
  const body: { url: string; event_types?: string[] } = {
    url: input.url.trim(),
  };

  if (input.events.length > 0) {
    body.event_types = input.events;
  }

  const payload = await kailopayFetch("/v1/webhook-endpoints", { body });

  if (
    !isRecord(payload) ||
    !isRecord(payload.endpoint) ||
    typeof payload.endpoint.id !== "string" ||
    typeof payload.secret !== "string"
  ) {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }

  return { id: payload.endpoint.id, secret: payload.secret };
}

export async function disableWebhookEndpoint(id: string): Promise<void> {
  await kailopayFetch(`/v1/webhook-endpoints/${id}`, { method: "DELETE" });
}

export async function queueWebhookTest(id: string): Promise<WebhookQueuedResponse> {
  const payload = await kailopayFetch(`/v1/webhook-endpoints/${encodeURIComponent(id)}/test`, {
    method: "POST",
  });
  if (
    !isRecord(payload) ||
    payload.status !== "queued" ||
    typeof payload.event_id !== "string" ||
    typeof payload.outbox_id !== "string"
  ) {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }
  return {
    status: "queued",
    event_id: payload.event_id,
    outbox_id: payload.outbox_id,
  };
}

function parseWebhookDelivery(value: unknown): WebhookDelivery {
  if (!isRecord(value)) {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }
  const status = value.status;
  if (typeof status !== "string") {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }
  return {
    id: String(value.id),
    event_id: String(value.event_id),
    endpoint_id: String(value.endpoint_id),
    event_type: String(value.event_type),
    attempt_number: typeof value.attempt_number === "number" ? value.attempt_number : 1,
    status: status as WebhookDeliveryStatus,
    scheduled_at: String(value.scheduled_at),
    started_at: typeof value.started_at === "string" ? value.started_at : null,
    completed_at: typeof value.completed_at === "string" ? value.completed_at : null,
    http_status: typeof value.http_status === "number" ? value.http_status : null,
    duration_millis:
      typeof value.duration_millis === "number" ? value.duration_millis : null,
    safe_error: typeof value.safe_error === "string" ? value.safe_error : null,
    next_attempt_at:
      typeof value.next_attempt_at === "string" ? value.next_attempt_at : null,
    created_at: String(value.created_at),
  };
}

export async function listWebhookDeliveries(filters: {
  endpointId?: string;
  eventId?: string;
  status?: WebhookDeliveryStatus;
  from?: string;
  to?: string;
  limit?: number;
  pagingId?: string;
} = {}): Promise<WebhookDeliveriesResponse> {
  const params = new URLSearchParams();
  if (filters.endpointId) params.set("endpoint_id", filters.endpointId);
  if (filters.eventId) params.set("event_id", filters.eventId);
  if (filters.status) params.set("status", filters.status);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.pagingId) params.set("paging_id", filters.pagingId);

  const query = params.toString();
  const payload = await kailopayFetch(
    `/v1/webhook-deliveries${query ? `?${query}` : ""}`,
  );
  if (!isRecord(payload) || !Array.isArray(payload.deliveries)) {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }
  const pagingId = payload.paging_id;
  return {
    deliveries: payload.deliveries.map(parseWebhookDelivery),
    paging_id: pagingId === null || typeof pagingId === "string" ? pagingId : null,
  };
}

export async function replayWebhookDelivery(id: string): Promise<void> {
  await kailopayFetch(`/v1/webhook-deliveries/${encodeURIComponent(id)}/replay`, {
    method: "POST",
  });
}

export function canReplayWebhookDelivery(delivery: Pick<WebhookDelivery, "status">): boolean {
  return delivery.status === "exhausted";
}

export function webhookErrorMessage(error: unknown): string {
  if (error instanceof KailopayError) {
    return apiErrorMessage(error);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Try again.";
}
