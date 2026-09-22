import type { ApiKeyRow } from "@/lib/dashboard/api-keys/types";
import { apiErrorMessage } from "@/lib/kailopay/errors";
import { isRecord, KailopayError, kailopayFetch } from "@/lib/kailopay/http";

type BackendApiKeyMetadata = {
  id: string;
  client_id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at?: string;
  revoked_at?: string | null;
};

function mapApiKey(row: BackendApiKeyMetadata): ApiKeyRow {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.prefix,
    environment: "sandbox",
    scopes: ["apis.all"],
    lastUsedAt: row.last_used_at ?? null,
    revokedAt: row.revoked_at ?? null,
    createdAt: row.created_at,
  };
}

function parseApiKeyList(payload: unknown): ApiKeyRow[] {
  if (!isRecord(payload) || !Array.isArray(payload.api_keys)) {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }
  return payload.api_keys.map((row) => mapApiKey(row as BackendApiKeyMetadata));
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  return parseApiKeyList(await kailopayFetch("/v1/api-keys"));
}

export async function createApiKey(name: string): Promise<{ secret: string }> {
  const payload = await kailopayFetch("/v1/api-keys", {
    body: { name: name.trim() },
  });

  if (!isRecord(payload) || !isRecord(payload.api_key)) {
    throw new KailopayError(
      "Unexpected response from server",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }

  const key = payload.api_key.key;
  if (typeof key !== "string" || !key) {
    throw new KailopayError(
      "API key was created but the secret was missing from the response",
      0,
      "MALFORMED_RESPONSE",
      null,
    );
  }

  return { secret: key };
}

export async function revokeApiKey(id: string): Promise<void> {
  await kailopayFetch(`/v1/api-keys/${id}`, { method: "DELETE" });
}

export function apiKeyErrorMessage(error: unknown): string {
  if (error instanceof KailopayError) {
    if (error.status === 403 && error.code === "KYC_REQUIRED") {
      return "Complete identity verification before creating API keys.";
    }
    if (error.status === 403) {
      return "Developer mode is required to manage API keys.";
    }
    return apiErrorMessage(error);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Try again.";
}
