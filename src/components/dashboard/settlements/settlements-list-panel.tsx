"use client";

import { useMemo } from "react";
import { SettlementsTable } from "@/components/dashboard/ui/settlements/settlements-table";
import { useSetDashboardPageHeader } from "@/components/dashboard/ui/layout/dashboard-page-header-context";
import type { Organization } from "@/lib/dashboard/db/schema";

export function SettlementsListPanel({
  organizationId,
  environment,
}: {
  organizationId: string;
  environment: Organization["environment"];
}) {
  const headerOverride = useMemo(
    () => ({
      titleInfo: {
        title:
          "Cross-asset invoice payments converted into your settlement asset on-chain.",
        href: "/dashboard/developers/documentation",
      },
    }),
    [],
  );

  useSetDashboardPageHeader(headerOverride);

  return (
    <SettlementsTable organizationId={organizationId} environment={environment} />
  );
}
