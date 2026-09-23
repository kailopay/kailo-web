import type {
  AnalyticsBreakdownItem,
  DashboardAnalytics,
} from "@/lib/dashboard/analytics/types";
import type {
  DeveloperAnalyticsResponse,
  DeveloperOverview,
} from "@/lib/kailopay/developer/types";

function parseMinor(value: string): number {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return 0;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : 0;
}

function aggregatePaymentMethods(
  buckets: DeveloperAnalyticsResponse["buckets"],
): AnalyticsBreakdownItem[] {
  const totals = new Map<string, number>();
  for (const bucket of buckets) {
    for (const [method, count] of Object.entries(bucket.payment_methods)) {
      totals.set(method, (totals.get(method) ?? 0) + count);
    }
  }
  return Array.from(totals.entries())
    .map(([key, value]) => ({ key, label: key, value }))
    .sort((a, b) => b.value - a.value);
}

export function adaptDeveloperAnalytics(
  response: DeveloperAnalyticsResponse,
): DashboardAnalytics {
  const timeseries = response.buckets.map((bucket) => {
    const completed = bucket.completed_orders;
    const failed = bucket.failed_orders;
    const decided = completed + failed;
    return {
      date: bucket.start,
      volume: parseMinor(bucket.gross_idr_minor),
      payments: bucket.orders,
      successRate:
        decided > 0 ? Math.round((completed / decided) * 1000) / 10 : 0,
    };
  });

  const volume = timeseries.reduce((sum, point) => sum + point.volume, 0);
  const payments = timeseries.reduce((sum, point) => sum + point.payments, 0);
  const completed = response.buckets.reduce(
    (sum, bucket) => sum + bucket.completed_orders,
    0,
  );
  const failed = response.buckets.reduce(
    (sum, bucket) => sum + bucket.failed_orders,
    0,
  );
  const decided = completed + failed;

  return {
    totals: {
      volume,
      payments,
      successRate: decided > 0 ? Math.round((completed / decided) * 1000) / 10 : 0,
    },
    timeseries,
    breakdowns: {
      paymentMethods: aggregatePaymentMethods(response.buckets),
      assets: [],
      status: [
        { key: "completed", label: "Completed", value: completed },
        { key: "failed", label: "Failed", value: failed },
      ],
      customers: [],
    },
  };
}

export function adaptDeveloperOverviewToAnalytics(
  overview: DeveloperOverview,
): DashboardAnalytics {
  const successRate = Math.round(overview.success_rate * 1000) / 10;

  return {
    totals: {
      volume: parseMinor(overview.gross_idr_minor),
      payments: overview.total_orders,
      successRate,
    },
    timeseries: [],
    breakdowns: {
      paymentMethods: [],
      assets: [],
      status: [
        { key: "completed", label: "Completed", value: overview.completed_orders },
        { key: "failed", label: "Failed", value: overview.failed_orders },
        { key: "active", label: "Active", value: overview.active_orders },
      ],
      customers: [],
    },
  };
}
