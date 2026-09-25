"use client";

import Link from "next/link";
import { useCallback } from "react";
import { AlertBlock } from "@/components/dashboard/shared/alert-block";
import { DeveloperAnalyticsView } from "@/components/dashboard/ui/analytics/developer-analytics-view";
import { DeveloperOrdersTable } from "@/components/dashboard/ui/developers/developer-orders-table";
import { DashboardAnalyticsPageLoading } from "@/components/dashboard/ui/layout/dashboard-page-loading";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import { developerErrorMessage } from "@/lib/kailopay/developer/access";
import { getDeveloperOverview } from "@/lib/kailopay/developer/dashboard";
import { Button } from "@dub/ui";

export function DeveloperOverviewPanel() {
  const fetchOverview = useCallback(async () => getDeveloperOverview(), []);
  const { data, error, isLoading, reload } = useAsyncData(fetchOverview, []);

  if (isLoading && !data) {
    return <DashboardAnalyticsPageLoading />;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <AlertBlock type="error">
          {error ? developerErrorMessage(error) : "Unable to load overview"}
        </AlertBlock>
        <Button type="button" variant="secondary" text="Retry" onClick={reload} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DeveloperAnalyticsView />

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-neutral-900">Recent orders</h2>
          <Link
            href="/dashboard/developers/orders"
            className="text-sm font-medium text-neutral-600 underline"
          >
            View all
          </Link>
        </div>
        <DeveloperOrdersTable orders={data.recent_orders} isLoading={false} />
      </section>
    </div>
  );
}
