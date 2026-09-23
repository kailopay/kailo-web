import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { getNetworkPassphrase } from "@/lib/dashboard/stellar/network";
import { isRecord, kailopayFetch, KailopayError, stringField } from "@/lib/kailopay/http";
import type { DeveloperWallet } from "./types";

function malformed(what: string): KailopayError {
  return new KailopayError(`Malformed payload: ${what}`, 0, "MALFORMED_RESPONSE", null);
}

function parseWallet(value: unknown): DeveloperWallet {
  if (!isRecord(value)) throw malformed("developer wallet");
  const wallet: DeveloperWallet = {
    id: stringField(value, "id"),
    user_id: stringField(value, "user_id"),
    network: stringField(value, "network"),
    wallet_account: stringField(value, "wallet_account"),
    label: stringField(value, "label"),
    is_primary: value.is_primary === true,
    verification_method: "sep10",
    verified_at: stringField(value, "verified_at"),
    status: stringField(value, "status") as DeveloperWallet["status"],
    created_at: stringField(value, "created_at"),
    updated_at: stringField(value, "updated_at"),
  };
  const clientId = value.client_id;
  if (typeof clientId === "string") wallet.client_id = clientId;
  if (value.revoked_at === null) wallet.revoked_at = null;
  else if (typeof value.revoked_at === "string") wallet.revoked_at = value.revoked_at;
  return wallet;
}

export async function listDeveloperWallets(): Promise<DeveloperWallet[]> {
  const payload = await kailopayFetch("/v1/developer/wallets");
  if (!isRecord(payload) || !Array.isArray(payload.wallets)) {
    throw malformed("developer wallet list");
  }
  return payload.wallets.map(parseWallet);
}

export async function registerDeveloperWallet(input: {
  walletAccount: string;
  label: string;
  sep10Token: string;
  clientId?: string;
  isPrimary?: boolean;
}): Promise<DeveloperWallet> {
  const body: Record<string, unknown> = {
    network: "stellar_testnet",
    wallet_account: input.walletAccount.trim(),
    label: input.label.trim(),
    sep10_token: input.sep10Token,
  };
  if (input.clientId) body.client_id = input.clientId;
  if (input.isPrimary !== undefined) body.is_primary = input.isPrimary;

  const payload = await kailopayFetch("/v1/developer/wallets", { body });
  if (!isRecord(payload) || !isRecord(payload.wallet)) {
    throw malformed("developer wallet create");
  }
  return parseWallet(payload.wallet);
}

export async function updateDeveloperWallet(
  id: string,
  input: { label?: string; isPrimary?: boolean },
): Promise<DeveloperWallet> {
  const body: Record<string, unknown> = {};
  if (input.label !== undefined) body.label = input.label.trim();
  if (input.isPrimary !== undefined) body.is_primary = input.isPrimary;

  const payload = await kailopayFetch(`/v1/developer/wallets/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });
  if (!isRecord(payload) || !isRecord(payload.wallet)) {
    throw malformed("developer wallet update");
  }
  return parseWallet(payload.wallet);
}

export async function revokeDeveloperWallet(id: string): Promise<void> {
  await kailopayFetch(`/v1/developer/wallets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createSep10Proof(walletAccount: string): Promise<string> {
  const account = walletAccount.trim();
  const challengePayload = await kailopayFetch(
    `/auth?account=${encodeURIComponent(account)}`,
  );
  if (!isRecord(challengePayload) || typeof challengePayload.transaction !== "string") {
    throw malformed("sep10 challenge");
  }

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(
    challengePayload.transaction,
    {
      networkPassphrase: getNetworkPassphrase("sandbox"),
      address: account,
    },
  );

  const tokenPayload = await kailopayFetch("/auth", {
    body: { transaction: signedTxXdr },
  });
  if (!isRecord(tokenPayload) || typeof tokenPayload.token !== "string") {
    throw malformed("sep10 token");
  }
  return tokenPayload.token;
}

export function walletErrorMessage(error: unknown): string {
  if (error instanceof KailopayError) {
    if (error.status === 401) {
      return "SEP-10 verification failed. Sign in with your wallet and try again.";
    }
    return error.message || "Unable to manage wallet.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to manage wallet.";
}
