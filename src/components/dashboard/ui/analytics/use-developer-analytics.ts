"use client";

import { useCallback } from "react";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import { adaptDeveloperAnalytics } from "@/lib/kailopay/developer/adapt-analytics";
import { developerErrorMessage } from "@/lib/kailopay/developer/access";
import { getDeveloperAnalytics } from "@/lib/kailopay/developer/dashboard";
import type { DashboardAnalytics } from "@/lib/dashboard/analytics/types";

type DateRangeState = {
  from: Date | undefined;
  to?: Date | undefined;
};

export function useDeveloperAnalytics(
  dateRange: DateRangeState,
  bucket: "hour" | "day" | "week" = "day",
) {
  const fetchAnalytics = useCallback(async (): Promise<DashboardAnalytics | null> => {
    if (!dateRange.from || !dateRange.to) {
      return null;
    }

    try {
      const response = await getDeveloperAnalytics({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        bucket,
      });
      return adaptDeveloperAnalytics(response);
    } catch (error) {
      throw new Error(developerErrorMessage(error));
    }
  }, [bucket, dateRange.from, dateRange.to]);

  return useAsyncData(fetchAnalytics, [dateRange.from, dateRange.to, bucket]);
}
