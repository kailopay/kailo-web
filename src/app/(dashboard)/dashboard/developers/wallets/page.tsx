import { DeveloperAccessGate } from "@/components/dashboard/developers/developer-access-gate";
import { DeveloperWalletsPanel } from "@/components/dashboard/developers/developer-wallets-panel";

export default function DeveloperWalletsPage() {
  return (
    <DeveloperAccessGate>
      <DeveloperWalletsPanel />
    </DeveloperAccessGate>
  );
}
