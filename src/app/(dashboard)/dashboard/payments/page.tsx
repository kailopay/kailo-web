import { Suspense } from "react";
import { PaymentsHubPanel } from "@/components/dashboard/payments/payments-hub-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function PaymentsPage() {
  const organization = await getDashboardOrganization();

  return (
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading payments...</div>
      }
    >
      <PaymentsHubPanel
        organizationId={organization.id}
        environment={organization.environment}
      />
    </Suspense>
  );
}
