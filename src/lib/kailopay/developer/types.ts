export type DeveloperFilters = {
  client_id?: string;
  from?: string;
  to?: string;
  currency?: string;
  direction?: "onramp" | "offramp";
  status?: string;
  payment_method?: string;
  limit?: number;
  paging_id?: string;
};

export type DeveloperOrder = {
  id: string;
  client_id: string;
  client_name: string;
  environment: string;
  direction: "onramp" | "offramp";
  status: string;
  currency: string;
  fiat_amount_minor: string;
  asset_amount: string;
  asset_amount_stroops: string;
  payment_method: string;
  gateway_provider: string;
  gateway_reference: string;
  stellar_intent_id: string;
  stellar_transaction_hash: string;
  sep24_transaction_id: string;
  quote_id: string;
  wallet_account: string;
  payout_reference: string;
  payout_simulated: boolean;
  payout_disclosure?: string;
  latest_event_type: string;
  latest_transition_at: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  failure_code?: string;
};

export type DeveloperOverview = {
  environment: string;
  network: string;
  from: string;
  to: string;
  total_orders: number;
  active_orders: number;
  completed_orders: number;
  failed_orders: number;
  buy_orders: number;
  sell_orders: number;
  gross_idr_minor: string;
  asset_volume: string;
  fee_idr_minor: string;
  net_idr_minor: string;
  success_rate: number;
  average_completion_seconds: number;
  pending_webhook_deliveries: number;
  exhausted_webhook_deliveries: number;
  recent_orders: DeveloperOrder[];
};

export type DeveloperAnalyticsBucket = {
  start: string;
  end: string;
  orders: number;
  buy_orders: number;
  sell_orders: number;
  gross_idr_minor: string;
  asset_volume: string;
  fee_idr_minor: string;
  net_idr_minor: string;
  completed_orders: number;
  failed_orders: number;
  average_completion_seconds: number;
  payment_methods: Record<string, number>;
  webhook_delivered: number;
  webhook_retried: number;
  webhook_exhausted: number;
};

export type DeveloperAnalyticsResponse = {
  environment: string;
  network: string;
  from: string;
  to: string;
  bucket: "hour" | "day" | "week";
  buckets: DeveloperAnalyticsBucket[];
};

export type DeveloperRevenueSummary = {
  environment: string;
  network: string;
  from: string;
  to: string;
  gross_idr_minor: string;
  fee_idr_minor: string;
  platform_revenue_minor: string;
  developer_revenue_minor: string;
  net_idr_minor: string;
  entry_count: number;
  simulated: boolean;
  disclosure: string;
};

export type DeveloperRevenueEntry = {
  order_id: string;
  client_id: string;
  direction: "onramp" | "offramp";
  created_at: string;
  gross_idr_minor: string;
  fee_idr_minor: string;
  platform_revenue_minor: string;
  developer_revenue_minor: string;
  net_idr_minor: string;
  asset_amount: string;
  asset_amount_stroops: string;
  fee_currency: string;
  fee_policy_version: string;
  source: string;
  simulated: boolean;
};

export type DeveloperRevenueEntriesResponse = {
  entries: DeveloperRevenueEntry[];
  paging_id: string | null;
};

export type DeveloperOrdersResponse = {
  orders: DeveloperOrder[];
  paging_id: string | null;
};

export type DeveloperWallet = {
  id: string;
  user_id: string;
  client_id?: string;
  network: string;
  wallet_account: string;
  label: string;
  is_primary: boolean;
  verification_method: "sep10";
  verified_at: string;
  status: "active" | "revoked";
  revoked_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type WebhookDeliveryStatus =
  | "in_flight"
  | "delivered"
  | "retry_scheduled"
  | "failed"
  | "exhausted"
  | "superseded";

export type WebhookDelivery = {
  id: string;
  event_id: string;
  endpoint_id: string;
  event_type: string;
  attempt_number: number;
  status: WebhookDeliveryStatus;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  http_status: number | null;
  duration_millis: number | null;
  safe_error: string | null;
  next_attempt_at: string | null;
  created_at: string;
};

export type WebhookDeliveriesResponse = {
  deliveries: WebhookDelivery[];
  paging_id: string | null;
};

export type WebhookQueuedResponse = {
  status: "queued";
  event_id: string;
  outbox_id: string;
};
