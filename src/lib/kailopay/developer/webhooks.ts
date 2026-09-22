import type { WebhookEndpointRow } from "@/lib/dashboard/webhooks/types";
import { apiErrorMessage } from "@/lib/kailopay/errors";
import { isRecord, KailopayError, kailopayFetch } from "@/lib/kailopay/http";

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
  const endpoints = await listWebhookEndpoints();
  const endpoint = endpoints.find((item) => item.id === id);
  if (!endpoint) {
    throw new KailopayError("Webhook endpoint not found", 404, null, null);
  }
  return endpoint;
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

export function webhookErrorMessage(error: unknown): string {
  if (error instanceof KailopayError) {
    return apiErrorMessage(error);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Try again.";
}
