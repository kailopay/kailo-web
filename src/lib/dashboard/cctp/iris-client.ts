import { multiplyUsdcByBps } from "@/lib/dashboard/cctp/amounts";
import type { Organization } from "@/lib/dashboard/db/schema";

const DEFAULT_IRIS_BASE_URL = "https://iris-api.circle.com";
const DEFAULT_IRIS_SANDBOX_BASE_URL = "https://iris-api-sandbox.circle.com";

function getIrisBaseUrl(environment: Organization["environment"]) {
  const fallback =
    environment === "production"
      ? DEFAULT_IRIS_BASE_URL
      : DEFAULT_IRIS_SANDBOX_BASE_URL;
  return (process.env.CCTP_IRIS_BASE_URL ?? fallback).replace(/\/$/, "");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function readMinimumFeeBps(payload: unknown): number | null {
  const first = Array.isArray(payload) ? payload[0] : payload;
  const root = asRecord(first);
  const candidates = [
    root.minimumFee,
    root.minFee,
  ];

  for (const candidate of candidates) {
    const numeric =
      typeof candidate === "string" ? Number(candidate) : candidate;
    if (typeof numeric === "number" && Number.isFinite(numeric) && numeric >= 0) {
      return numeric;
    }
  }

  return null;
}

export async function fetchCctpProtocolFee(input: {
  environment: Organization["environment"];
  sourceDomain: number;
  destinationDomain: number;
  amount: string;
  fallbackBps?: number;
}): Promise<string> {
  const url = `${getIrisBaseUrl(input.environment)}/v2/burn/USDC/fees/${input.sourceDomain}/${input.destinationDomain}`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return multiplyUsdcByBps(input.amount, input.fallbackBps ?? 2);
    }

    const payload = (await response.json()) as unknown;
    const minimumFeeBps = readMinimumFeeBps(payload);
    return minimumFeeBps == null
      ? multiplyUsdcByBps(input.amount, input.fallbackBps ?? 2)
      : multiplyUsdcByBps(input.amount, minimumFeeBps);
  } catch {
    return multiplyUsdcByBps(input.amount, input.fallbackBps ?? 2);
  }
}

export async function fetchCctpMessage(input: {
  environment: Organization["environment"];
  sourceDomain: number;
  burnTxHash: string;
}) {
  const url = `${getIrisBaseUrl(input.environment)}/v2/messages/${input.sourceDomain}?transactionHash=${encodeURIComponent(input.burnTxHash)}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to fetch CCTP attestation");
  }

  return response.json() as Promise<unknown>;
}
