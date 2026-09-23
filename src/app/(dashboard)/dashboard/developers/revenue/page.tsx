import { DeveloperAccessGate } from "@/components/dashboard/developers/developer-access-gate";
import { DeveloperRevenuePanel } from "@/components/dashboard/developers/developer-revenue-panel";

export default function DeveloperRevenuePage() {
  return (
    <DeveloperAccessGate>
      <DeveloperRevenuePanel />
    </DeveloperAccessGate>
  );
}
