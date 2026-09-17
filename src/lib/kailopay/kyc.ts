import { isRecord, kailopayFetch, KailopayError, stringField } from "./http";
import type { KYCInquiry, KYCStatus, KYCStatusValue } from "./types";

const KYC_STATUSES: readonly KYCStatusValue[] = [
  "not_started",
  "creating",
  "created",
  "pending",
  "completed",
  "pending_review",
  "approved",
  "declined",
  "failed",
  "expired",
];

function parseKYCStatus(value: unknown): KYCStatus {
  if (!isRecord(value)) throw new Error("Malformed KYC status");
  const status = stringField(value, "status") as KYCStatusValue;
  if (!KYC_STATUSES.includes(status)) throw new Error("Unknown KYC status");

  return {
    provider: "persona",
    status,
    provider_status: stringField(value, "provider_status"),
    inquiry_id: typeof value.inquiry_id === "string" ? value.inquiry_id : null,
    created_at: typeof value.created_at === "string" ? value.created_at : null,
    updated_at: typeof value.updated_at === "string" ? value.updated_at : null,
    expires_at: typeof value.expires_at === "string" ? value.expires_at : null,
    approved_at: typeof value.approved_at === "string" ? value.approved_at : null,
  };
}

function parseKYCInquiry(value: unknown): KYCInquiry {
  if (!isRecord(value)) throw new Error("Malformed KYC inquiry");
  const inquiry: KYCInquiry = {
    status: stringField(value, "status") as KYCStatusValue,
    provider_status: stringField(value, "provider_status"),
    inquiry_id: stringField(value, "inquiry_id"),
    environment_id: stringField(value, "environment_id"),
    expires_at: typeof value.expires_at === "string" ? value.expires_at : null,
  };
  if (typeof value.session_token === "string") {
    inquiry.session_token = value.session_token;
  }
  return inquiry;
}

export async function getKYCStatus(): Promise<KYCStatus> {
  const payload = await kailopayFetch("/v1/kyc");
  if (!isRecord(payload) || !isRecord(payload.kyc)) {
    throw new Error("Malformed KYC response");
  }
  return parseKYCStatus(payload.kyc);
}

export async function createKYCInquiry(): Promise<KYCInquiry> {
  const payload = await kailopayFetch("/v1/kyc/inquiry", { method: "POST" });
  if (!isRecord(payload) || !isRecord(payload.inquiry)) {
    throw new Error("Malformed KYC inquiry response");
  }
  return parseKYCInquiry(payload.inquiry);
}

export function isKYCApproved(status: KYCStatus): boolean {
  return status.status === "approved";
}

const PERSONA_SUBMITTED_STATUSES = new Set([
  "completed",
  "marked_for_review",
  "review",
  "approved",
]);

/** Persona flow finished; waiting for backend webhook to mark approved. */
export function isKYCAwaitingApproval(status: KYCStatus): boolean {
  if (status.status === "completed" || status.status === "pending_review") {
    return true;
  }

  const providerStatus = status.provider_status.trim().toLowerCase();
  return PERSONA_SUBMITTED_STATUSES.has(providerStatus);
}

export function isKYCPending(status: KYCStatus): boolean {
  return ["creating", "created", "pending"].includes(status.status);
}

export function hasKYCInquiry(status: KYCStatus): boolean {
  return Boolean(status.inquiry_id);
}

export function shouldOpenPersonaFlow(status: KYCStatus): boolean {
  return (
    status.status === "not_started" ||
    isKYCPending(status) ||
    ["declined", "failed", "expired"].includes(status.status)
  );
}

export function isKYCResumeConflict(error: KailopayError): boolean {
  if (error.code !== "KYC_PROVIDER_UNAVAILABLE") return false;
  const haystack = `${error.message} ${error.details ?? ""}`.toLowerCase();
  return (
    haystack.includes("409") ||
    haystack.includes("resource_state_conflict") ||
    haystack.includes("resuming persona inquiry")
  );
}

/**
 * POST /v1/kyc/inquiry failed but the user likely already finished on Persona.
 * Frontend must not retry Persona; poll GET /v1/kyc instead.
 */
export function isKYCInquiryAlreadySubmitted(
  error: KailopayError,
  status: KYCStatus | null,
): boolean {
  if (isKYCResumeConflict(error)) return true;
  if (error.code !== "KYC_PROVIDER_UNAVAILABLE" || !status) return false;
  return hasKYCInquiry(status) && !isKYCApproved(status);
}
