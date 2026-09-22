"use client";

import { useUpgradeBannerVisibility } from "./upgrade-banner";

export const DASHBOARD_TOP_BANNER_HEIGHT = 48;

export function useEnvironmentBannerVisibility() {
  return { isVisible: false };
}

export function useDashboardTopBannerHeight() {
  const { isVisible: isUpgradeBannerVisible } = useUpgradeBannerVisibility();
  const { isVisible: isEnvironmentBannerVisible } = useEnvironmentBannerVisibility();

  const height =
    (isUpgradeBannerVisible ? DASHBOARD_TOP_BANNER_HEIGHT : 0) +
    (isEnvironmentBannerVisible ? DASHBOARD_TOP_BANNER_HEIGHT : 0);

  return {
    height,
    hasTopBanner: height > 0,
    environmentBannerOffset: isUpgradeBannerVisible ? DASHBOARD_TOP_BANNER_HEIGHT : 0,
  };
}

export function EnvironmentBanner() {
  return null;
}
