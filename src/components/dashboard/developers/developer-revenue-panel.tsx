"use client";

import { useCallback, useState } from "react";
import { AlertBlock } from "@/components/dashboard/shared/alert-block";
import { DeveloperRevenueEntriesTable } from "@/components/dashboard/ui/developers/developer-revenue-entries-table";
import { DeveloperSummaryStats } from "@/components/dashboard/ui/developers/developer-summary-stats";
import { DashboardAnalyticsPageLoading } from "@/components/dashboard/ui/layout/dashboard-page-loading";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import { developerErrorMessage } from "@/lib/kailopay/developer/access";
import {
  getDeveloperRevenueSummary,
  listDeveloperRevenueEntries,
} from "@/lib/kailopay/developer/dashboard";
import type { DeveloperRevenueEntry } from "@/lib/kailopay/developer/types";
import { formatIdrMinor } from "@/lib/kailopay/developer/format";
import { Button } from "@dub/ui";

export function DeveloperRevenuePanel() {
  const [pagingId, setPagingId] = useState<string | null>(null);
  const [entries, setEntries] = useState<DeveloperRevenueEntry[]>([]);
  const [nextPagingId, setNextPagingId] = useState<string | null>(null);

  const fetchRevenue = useCallback(async () => {
    const [summary, page] = await Promise.all([
      getDeveloperRevenueSummary(),
      listDeveloperRevenueEntries({ limit: 20, paging_id: pagingId ?? undefined }),
    ]);
    if (pagingId) {
      setEntries((current) => [...current, ...page.entries]);
    } else {
      setEntries(page.entries);
    }
    setNextPagingId(page.paging_id);
    return { summary, page };
  }, [pagingId]);

  const { data, error, isLoading, reload } = useAsyncData(fetchRevenue, [pagingId]);

  if (isLoading && !data && entries.length === 0) {
    return <DashboardAnalyticsPageLoading />;
  }

  return (
    <div className="space-y-5">
      {error ? (
        <div className="space-y-4">
          <AlertBlock type="error">{developerErrorMessage(error)}</AlertBlock>
          <Button
            type="button"
            variant="secondary"
            text="Retry"
            onClick={() => {
              setPagingId(null);
              setEntries([]);
              reload();
            }}
          />
        </div>
      ) : null}

      {data ? (
        <>
          <DeveloperSummaryStats
            stats={[
              { label: "Gross IDR", value: formatIdrMinor(data.summary.gross_idr_minor) },
              { label: "Fees IDR", value: formatIdrMinor(data.summary.fee_idr_minor) },
              {
                label: "Platform revenue",
                value: formatIdrMinor(data.summary.platform_revenue_minor),
              },
              {
                label: "Developer revenue",
                value: formatIdrMinor(data.summary.developer_revenue_minor),
              },
              { label: "Net IDR", value: formatIdrMinor(data.summary.net_idr_minor) },
              { label: "Entries", value: String(data.summary.entry_count) },
            ]}
          />
        </>
      ) : null}

      <DeveloperRevenueEntriesTable
        entries={entries}
        isLoading={isLoading && entries.length === 0}
      />

      {nextPagingId ? (
        <Button
          type="button"
          variant="secondary"
          text="Load more"
          disabled={isLoading}
          onClick={() => setPagingId(nextPagingId)}
        />
      ) : null}
    </div>
  );
}
