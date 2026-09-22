"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreatePaymentMenu } from "@/components/dashboard/payments/create-payment-menu";
import { InvoicesListPanel } from "@/components/dashboard/payments/invoices-list-panel";
import { PaymentLinksListPanel } from "@/components/dashboard/payments/payment-links-list-panel";
import { PaymentsListPanel } from "@/components/dashboard/payments/payments-list-panel";
import type { Organization } from "@/lib/dashboard/db/schema";
import { parsePaymentsTab } from "@/lib/dashboard/navigation/payments-tabs";
import { useSetDashboardPageHeader } from "@/components/dashboard/ui/layout/dashboard-page-header-context";
import { PaymentsTabs } from "@/components/dashboard/ui/payments/payments-tabs";

export function PaymentsHubPanel({
  organizationId,
  environment,
}: {
  organizationId: string;
  environment: Organization["environment"];
}) {
  const searchParams = useSearchParams();
  const activeTab = parsePaymentsTab(searchParams.get("tab"));
  const [reloadKey, setReloadKey] = useState(0);

  const headerOverride = useMemo(
    () => ({
      titleInfo: {
        title:
          "Create and manage payment intents, invoices, and payment links.",
        href: "/dashboard/developers/documentation",
      },
      controls: (
        <CreatePaymentMenu
          organizationId={organizationId}
          onCreated={() => setReloadKey((current) => current + 1)}
        />
      ),
    }),
    [organizationId],
  );

  useSetDashboardPageHeader(headerOverride);

  return (
    <div className="flex flex-col gap-4">
      <PaymentsTabs
        organizationId={organizationId}
        activeTab={activeTab}
        reloadKey={reloadKey}
      />

      <div key={activeTab}>
        {activeTab === "payment-intents" ? (
          <PaymentsListPanel
            organizationId={organizationId}
            environment={environment}
            embedded
            reloadKey={reloadKey}
          />
        ) : null}

        {activeTab === "invoices" ? (
          <InvoicesListPanel
            organizationId={organizationId}
            embedded
            reloadKey={reloadKey}
          />
        ) : null}

        {activeTab === "payment-links" ? (
          <PaymentLinksListPanel
            organizationId={organizationId}
            embedded
            reloadKey={reloadKey}
          />
        ) : null}
      </div>
    </div>
  );
}
