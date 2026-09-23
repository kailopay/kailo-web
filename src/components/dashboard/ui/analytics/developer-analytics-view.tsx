"use client";

import { DashboardAnalyticsPageLoading } from "@/components/dashboard/ui/layout/dashboard-page-loading";
import { Button, DateRangePicker } from "@dub/ui";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";
import { ChartSection } from "./chart-section";
import type { MetricTab } from "@/lib/dashboard/analytics/types";
import { StatsGrid } from "./stats-sections";
import { useDeveloperAnalytics } from "./use-developer-analytics";

type DateRangeState = {
  from: Date | undefined;
  to?: Date | undefined;
};

const DATE_PRESETS = [
  {
    id: "24h",
    label: "Last 24 hours",
    dateRange: {
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(new Date()),
    },
  },
  {
    id: "7d",
    label: "Last 7 days",
    dateRange: {
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date()),
    },
  },
  {
    id: "30d",
    label: "Last 30 days",
    dateRange: {
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date()),
    },
  },
  {
    id: "90d",
    label: "Last 90 days",
    dateRange: {
      from: startOfDay(subDays(new Date(), 90)),
      to: endOfDay(new Date()),
    },
  },
];

export function DeveloperAnalyticsView({
  bucket = "day",
}: {
  bucket?: "hour" | "day" | "week";
}) {
  const [selectedTab, setSelectedTab] = useState<MetricTab>("volume");
  const [dateRange, setDateRange] = useState<DateRangeState>(
    DATE_PRESETS[2].dateRange,
  );
  const [presetId, setPresetId] = useState<string | undefined>("30d");

  const { data, error, isLoading, reload } = useDeveloperAnalytics(dateRange, bucket);

  if (isLoading && !data) {
    return <DashboardAnalyticsPageLoading />;
  }

  return (
    <div className="space-y-5">
      <div className="flex w-full items-center">
        <DateRangePicker
          className="w-full min-[550px]:w-fit"
          align="start"
          presets={DATE_PRESETS}
          presetId={presetId}
          value={dateRange}
          onChange={(range, preset) => {
            if (preset) {
              setPresetId(preset.id);
              setDateRange(preset.dateRange);
              return;
            }

            if (!range?.from || !range?.to) return;

            setPresetId(undefined);
            setDateRange({ from: range.from, to: range.to });
          }}
        />
      </div>

      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <Button
            type="button"
            variant="secondary"
            text="Retry"
            className="h-8"
            onClick={reload}
          />
        </div>
      ) : null}

      <ChartSection
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        analytics={data}
        isLoading={isLoading}
        volumeFormat="idr-minor"
        volumeLabel="Gross IDR"
        paymentsLabel="Orders"
      />
      <StatsGrid analytics={data} />
    </div>
  );
}
