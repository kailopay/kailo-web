import { DeveloperAccessGate } from "@/components/dashboard/developers/developer-access-gate";
import { DeveloperOrdersPanel } from "@/components/dashboard/developers/developer-orders-panel";

export default function DeveloperOrdersPage() {
  return (
    <DeveloperAccessGate>
      <DeveloperOrdersPanel />
    </DeveloperAccessGate>
  );
}
