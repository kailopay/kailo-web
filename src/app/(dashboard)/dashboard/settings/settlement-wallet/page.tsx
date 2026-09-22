import { SettlementWalletPanel } from "@/components/dashboard/wallet/settlement-wallet-panel";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";
import { getSettlementWallet } from "@/lib/dashboard/organizations/settlement-wallet";

export default async function SettlementWalletPage() {
  const organization = await getDashboardOrganization();

  const wallet = await getSettlementWallet(
    organization.id,
    organization.environment,
  );

  return (
    <SettlementWalletPanel
      organizationId={organization.id}
      environment={organization.environment}
      initialAddress={wallet?.stellarAddress ?? null}
    />
  );
}
