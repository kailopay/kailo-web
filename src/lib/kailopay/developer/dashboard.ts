import {
  isRecord,
  kailopayFetch,
  KailopayError,
  numberField,
  optionalStringField,
  stringField,
} from "@/lib/kailopay/http";
import { buildDeveloperQuery, defaultDeveloperRange } from "./query";
import type {
  DeveloperAnalyticsResponse,
  DeveloperFilters,
  DeveloperOrder,
  DeveloperOrdersResponse,
  DeveloperOverview,
  DeveloperRevenueEntriesResponse,
  DeveloperRevenueEntry,
  DeveloperRevenueSummary,
} from "./types";

function malformed(what: string): KailopayError {
  return new KailopayError(`Malformed payload: ${what}`, 0, "MALFORMED_RESPONSE", null);
}

function parseDeveloperOrder(value: unknown): DeveloperOrder {
  if (!isRecord(value)) throw malformed("developer order");
  const order: DeveloperOrder = {
    id: stringField(value, "id"),
    client_id: stringField(value, "client_id"),
    client_name: stringField(value, "client_name"),
    environment: stringField(value, "environment"),
    direction: stringField(value, "direction") as DeveloperOrder["direction"],
    status: stringField(value, "status"),
    currency: stringField(value, "currency"),
    fiat_amount_minor: stringField(value, "fiat_amount_minor"),
    asset_amount: stringField(value, "asset_amount"),
    asset_amount_stroops: stringField(value, "asset_amount_stroops"),
    payment_method: stringField(value, "payment_method"),
    gateway_provider: stringField(value, "gateway_provider"),
    gateway_reference: stringField(value, "gateway_reference"),
    stellar_intent_id: stringField(value, "stellar_intent_id"),
    stellar_transaction_hash: stringField(value, "stellar_transaction_hash"),
    sep24_transaction_id: stringField(value, "sep24_transaction_id"),
    quote_id: stringField(value, "quote_id"),
    wallet_account: stringField(value, "wallet_account"),
    payout_reference: stringField(value, "payout_reference"),
    payout_simulated: value.payout_simulated === true,
    latest_event_type: stringField(value, "latest_event_type"),
    latest_transition_at: stringField(value, "latest_transition_at"),
    created_at: stringField(value, "created_at"),
    updated_at: stringField(value, "updated_at"),
  };
  const payoutDisclosure = optionalStringField(value, "payout_disclosure");
  if (payoutDisclosure !== undefined) order.payout_disclosure = payoutDisclosure;
  const completedAt = value.completed_at;
  if (completedAt === null) order.completed_at = null;
  else if (typeof completedAt === "string") order.completed_at = completedAt;
  const failureCode = optionalStringField(value, "failure_code");
  if (failureCode !== undefined) order.failure_code = failureCode;
  return order;
}

function parseOverview(payload: unknown): DeveloperOverview {
  if (!isRecord(payload)) throw malformed("developer overview");
  const recentOrders = Array.isArray(payload.recent_orders)
    ? payload.recent_orders.map(parseDeveloperOrder)
    : [];
  return {
    environment: stringField(payload, "environment"),
    network: stringField(payload, "network"),
    from: stringField(payload, "from"),
    to: stringField(payload, "to"),
    total_orders: numberField(payload, "total_orders"),
    active_orders: numberField(payload, "active_orders"),
    completed_orders: numberField(payload, "completed_orders"),
    failed_orders: numberField(payload, "failed_orders"),
    buy_orders: numberField(payload, "buy_orders"),
    sell_orders: numberField(payload, "sell_orders"),
    gross_idr_minor: stringField(payload, "gross_idr_minor"),
    asset_volume: stringField(payload, "asset_volume"),
    fee_idr_minor: stringField(payload, "fee_idr_minor"),
    net_idr_minor: stringField(payload, "net_idr_minor"),
    success_rate: numberField(payload, "success_rate"),
    average_completion_seconds: numberField(payload, "average_completion_seconds"),
    pending_webhook_deliveries: numberField(payload, "pending_webhook_deliveries"),
    exhausted_webhook_deliveries: numberField(payload, "exhausted_webhook_deliveries"),
    recent_orders: recentOrders,
  };
}

function parseAnalytics(payload: unknown): DeveloperAnalyticsResponse {
  if (!isRecord(payload)) throw malformed("developer analytics");
  const bucket = stringField(payload, "bucket");
  if (bucket !== "hour" && bucket !== "day" && bucket !== "week") {
    throw malformed("developer analytics bucket");
  }
  const buckets = Array.isArray(payload.buckets)
    ? payload.buckets.map((row) => {
        if (!isRecord(row)) throw malformed("analytics bucket");
        const paymentMethods = isRecord(row.payment_methods)
          ? Object.fromEntries(
              Object.entries(row.payment_methods).map(([key, value]) => [
                key,
                typeof value === "number" ? value : 0,
              ]),
            )
          : {};
        return {
          start: stringField(row, "start"),
          end: stringField(row, "end"),
          orders: numberField(row, "orders"),
          buy_orders: numberField(row, "buy_orders"),
          sell_orders: numberField(row, "sell_orders"),
          gross_idr_minor: stringField(row, "gross_idr_minor"),
          asset_volume: stringField(row, "asset_volume"),
          fee_idr_minor: stringField(row, "fee_idr_minor"),
          net_idr_minor: stringField(row, "net_idr_minor"),
          completed_orders: numberField(row, "completed_orders"),
          failed_orders: numberField(row, "failed_orders"),
          average_completion_seconds: numberField(row, "average_completion_seconds"),
          payment_methods: paymentMethods,
          webhook_delivered: numberField(row, "webhook_delivered"),
          webhook_retried: numberField(row, "webhook_retried"),
          webhook_exhausted: numberField(row, "webhook_exhausted"),
        };
      })
    : [];
  return {
    environment: stringField(payload, "environment"),
    network: stringField(payload, "network"),
    from: stringField(payload, "from"),
    to: stringField(payload, "to"),
    bucket,
    buckets,
  };
}

function parseRevenueSummary(payload: unknown): DeveloperRevenueSummary {
  if (!isRecord(payload)) throw malformed("developer revenue summary");
  return {
    environment: stringField(payload, "environment"),
    network: stringField(payload, "network"),
    from: stringField(payload, "from"),
    to: stringField(payload, "to"),
    gross_idr_minor: stringField(payload, "gross_idr_minor"),
    fee_idr_minor: stringField(payload, "fee_idr_minor"),
    platform_revenue_minor: stringField(payload, "platform_revenue_minor"),
    developer_revenue_minor: stringField(payload, "developer_revenue_minor"),
    net_idr_minor: stringField(payload, "net_idr_minor"),
    entry_count: numberField(payload, "entry_count"),
    simulated: payload.simulated === true,
    disclosure: stringField(payload, "disclosure"),
  };
}

function parseRevenueEntry(value: unknown): DeveloperRevenueEntry {
  if (!isRecord(value)) throw malformed("developer revenue entry");
  return {
    order_id: stringField(value, "order_id"),
    client_id: stringField(value, "client_id"),
    direction: stringField(value, "direction") as DeveloperRevenueEntry["direction"],
    created_at: stringField(value, "created_at"),
    gross_idr_minor: stringField(value, "gross_idr_minor"),
    fee_idr_minor: stringField(value, "fee_idr_minor"),
    platform_revenue_minor: stringField(value, "platform_revenue_minor"),
    developer_revenue_minor: stringField(value, "developer_revenue_minor"),
    net_idr_minor: stringField(value, "net_idr_minor"),
    asset_amount: stringField(value, "asset_amount"),
    asset_amount_stroops: stringField(value, "asset_amount_stroops"),
    fee_currency: stringField(value, "fee_currency"),
    fee_policy_version: stringField(value, "fee_policy_version"),
    source: stringField(value, "source"),
    simulated: value.simulated === true,
  };
}

function parseRevenueEntries(payload: unknown): DeveloperRevenueEntriesResponse {
  if (!isRecord(payload)) throw malformed("developer revenue entries");
  const entries = Array.isArray(payload.entries)
    ? payload.entries.map(parseRevenueEntry)
    : [];
  const pagingId = payload.paging_id;
  return {
    entries,
    paging_id: pagingId === null || typeof pagingId === "string" ? pagingId : null,
  };
}

function parseOrders(payload: unknown): DeveloperOrdersResponse {
  if (!isRecord(payload)) throw malformed("developer orders");
  const orders = Array.isArray(payload.orders)
    ? payload.orders.map(parseDeveloperOrder)
    : [];
  const pagingId = payload.paging_id;
  return {
    orders,
    paging_id: pagingId === null || typeof pagingId === "string" ? pagingId : null,
  };
}

export async function getDeveloperOverview(
  filters: DeveloperFilters = {},
): Promise<DeveloperOverview> {
  const range = defaultDeveloperRange();
  const payload = await kailopayFetch(
    `/v1/developer/overview${buildDeveloperQuery({
      from: filters.from ?? range.from,
      to: filters.to ?? range.to,
      client_id: filters.client_id,
      currency: filters.currency,
    })}`,
  );
  return parseOverview(payload);
}

export async function getDeveloperAnalytics(
  filters: DeveloperFilters & { bucket?: "hour" | "day" | "week" } = {},
): Promise<DeveloperAnalyticsResponse> {
  const range = defaultDeveloperRange();
  const payload = await kailopayFetch(
    `/v1/developer/analytics${buildDeveloperQuery({
      from: filters.from ?? range.from,
      to: filters.to ?? range.to,
      client_id: filters.client_id,
      currency: filters.currency,
      direction: filters.direction,
      status: filters.status,
      payment_method: filters.payment_method,
      bucket: filters.bucket ?? "day",
    })}`,
  );
  return parseAnalytics(payload);
}

export async function getDeveloperRevenueSummary(
  filters: DeveloperFilters = {},
): Promise<DeveloperRevenueSummary> {
  const range = defaultDeveloperRange();
  const payload = await kailopayFetch(
    `/v1/developer/revenue/summary${buildDeveloperQuery({
      from: filters.from ?? range.from,
      to: filters.to ?? range.to,
      client_id: filters.client_id,
      currency: filters.currency,
    })}`,
  );
  return parseRevenueSummary(payload);
}

export async function listDeveloperRevenueEntries(
  filters: DeveloperFilters = {},
): Promise<DeveloperRevenueEntriesResponse> {
  const range = defaultDeveloperRange();
  const payload = await kailopayFetch(
    `/v1/developer/revenue/entries${buildDeveloperQuery({
      from: filters.from ?? range.from,
      to: filters.to ?? range.to,
      client_id: filters.client_id,
      currency: filters.currency,
      limit: filters.limit ?? 20,
      paging_id: filters.paging_id,
    })}`,
  );
  return parseRevenueEntries(payload);
}

export async function listDeveloperOrders(
  filters: DeveloperFilters = {},
): Promise<DeveloperOrdersResponse> {
  const range = defaultDeveloperRange();
  const payload = await kailopayFetch(
    `/v1/developer/orders${buildDeveloperQuery({
      from: filters.from ?? range.from,
      to: filters.to ?? range.to,
      client_id: filters.client_id,
      currency: filters.currency,
      direction: filters.direction,
      status: filters.status,
      payment_method: filters.payment_method,
      limit: filters.limit ?? 20,
      paging_id: filters.paging_id,
    })}`,
  );
  return parseOrders(payload);
}

export { parseDeveloperOrder };
