"use client";

import type { Organization } from "@/lib/dashboard/db/schema";
import { PaymentsTable } from "@/components/dashboard/ui/payments/payments-table";

type PaymentsListPanelProps = {
  organizationId: string;
  environment: Organization["environment"];
  embedded?: boolean;
  reloadKey?: number;
};

export function PaymentsListPanel({
  organizationId,
  environment,
  embedded = false,
  reloadKey = 0,
}: PaymentsListPanelProps) {
  return (
    <PaymentsTable
      organizationId={organizationId}
      environment={environment}
      refreshKey={reloadKey}
      embedded={embedded}
    />
  );
}
