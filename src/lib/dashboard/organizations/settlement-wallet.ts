import type { Organization } from "@/lib/dashboard/db/schema";
import { MOCK_ORGANIZATION } from "@/lib/dashboard/mock/data";

export async function getSettlementWallet(
  _organizationId: string,
  _environment: Organization["environment"],
) {
  return null;
}

export function settlementWalletNotConfiguredMessage(
  environment: Organization["environment"],
) {
  if (environment === "production") {
    return "Production settlement wallet is not configured. Open Settings → Settlement Wallet and connect your Mainnet wallet.";
  }

  return "Sandbox settlement wallet is not configured. Open Settings → Settlement Wallet and connect your Testnet wallet.";
}

export async function requireSettlementWallet(
  organizationId: string,
  environment: Organization["environment"],
) {
  const wallet = await getSettlementWallet(organizationId, environment);
  if (!wallet) {
    throw new Error(settlementWalletNotConfiguredMessage(environment));
  }
  return wallet;
}

export async function organizationHasSettlementWallet(
  _organizationId: string,
  _environment: Organization["environment"],
) {
  return false;
}

export async function getPrimaryOrganizationForUser(_userId: string) {
  return MOCK_ORGANIZATION;
}

export async function userHasSettlementWallet(_userId: string) {
  return false;
}

export async function getOrganizationForMember(
  organizationId: string,
  _userId: string,
) {
  if (organizationId !== MOCK_ORGANIZATION.id) {
    return null;
  }
  return MOCK_ORGANIZATION;
}
