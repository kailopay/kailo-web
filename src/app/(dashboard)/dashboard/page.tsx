import { DeveloperAccessGate } from "@/components/dashboard/developers/developer-access-gate";
import { DeveloperOverviewPanel } from "@/components/dashboard/developers/developer-overview-panel";

export default function DashboardPage() {
  return (
    <DeveloperAccessGate>
      <DeveloperOverviewPanel />
    </DeveloperAccessGate>
  );
}
