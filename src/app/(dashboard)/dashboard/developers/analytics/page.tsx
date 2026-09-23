import { DeveloperAccessGate } from "@/components/dashboard/developers/developer-access-gate";
import { DeveloperAnalyticsPanel } from "@/components/dashboard/developers/developer-analytics-panel";

export default function DeveloperAnalyticsPage() {
  return (
    <DeveloperAccessGate>
      <DeveloperAnalyticsPanel />
    </DeveloperAccessGate>
  );
}
