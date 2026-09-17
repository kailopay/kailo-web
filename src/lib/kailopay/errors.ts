import { KailopayError } from "./http";

const GENERIC_HTTP_MESSAGES = new Set([
  "Bad Request",
  "Unauthorized",
  "Forbidden",
  "Not Found",
  "Conflict",
  "Internal Server Error",
  "Service Unavailable",
  "Request failed",
]);

export function apiErrorMessage(
  error: KailopayError,
  fallback = "Something went wrong. Try again.",
): string {
  const message = error.message.trim();
  if (!message || GENERIC_HTTP_MESSAGES.has(message)) {
    return fallback;
  }
  return message;
}

export function authErrorMessage(error: KailopayError): string {
  return apiErrorMessage(error);
}

export function rampErrorMessage(error: KailopayError): string {
  if (error.status === 401) {
    return "Your session expired. Sign in again to continue.";
  }
  if (error.status === 403 && error.code === "KYC_REQUIRED") {
    return "Identity verification is required before you can continue.";
  }
  if (error.status === 403) {
    return "This action is unavailable right now.";
  }
  if (error.status === 404) {
    return "This order is no longer available.";
  }

  switch (error.code) {
    case "KYC_REQUIRED":
      return "Complete identity verification to continue.";
    case "KYC_PROVIDER_UNAVAILABLE":
      return "Verification service is temporarily unavailable. Try again shortly.";
    case "IDEMPOTENCY_KEY_REUSED":
      return "This transaction was already submitted with different details. Start a new one.";
    case "INSUFFICIENT_LIQUIDITY":
      return "XLM inventory is temporarily low. Try again later.";
    case "AMOUNT_OUT_OF_RANGE":
      return "Enter an amount within the supported range (Rp 10.000 - Rp 10.000.000).";
    case "INVALID_STELLAR_ACCOUNT":
      return "Enter a valid Stellar address starting with G.";
    case "QUOTE_UNAVAILABLE":
    case "EXTERNAL_SERVICE_UNAVAILABLE":
      return "The checkout service is temporarily unavailable. Try again shortly.";
    case "CHECKOUT_PENDING_RECONCILIATION":
      return "Your order is saved. Payment confirmation is still in progress.";
    default:
      if (error.status === 409) {
        return "This transaction could not be started. Try again with a new amount.";
      }
      if (error.status === 422) {
        return "Check the details and try again.";
      }
      if (error.status === 503) {
        return "Service is temporarily unavailable. Try again shortly.";
      }
      return error.message || "Something went wrong. Try again shortly.";
  }
}

export function shouldRedirectToAuth(error: unknown): boolean {
  return error instanceof KailopayError && error.status === 401;
}

export function shouldRedirectToKYC(error: unknown): boolean {
  return error instanceof KailopayError && error.status === 403 && error.code === "KYC_REQUIRED";
}

/** User-facing KYC step errors. API/backend issues are described plainly for escalation. */
export function kycErrorMessage(error: KailopayError): string {
  if (error.status === 401) {
    return "Your session expired. Sign in again to continue.";
  }

  switch (error.code) {
    case "KYC_PROVIDER_UNAVAILABLE":
      if (error.details?.includes("409") || error.details?.includes("resource_state_conflict")) {
        return "Your verification was already submitted. We are confirming it with KailoPay.";
      }
      return "Identity verification is temporarily unavailable on KailoPay API. Try again shortly.";
    case "KYC_INQUIRY_NOT_FOUND":
      return "KailoPay could not find your verification inquiry. Ask support to reset KYC for your account.";
    case "MALFORMED_RESPONSE":
      return "KailoPay returned an unexpected KYC response. This is an API issue — share the request ID with the backend team.";
    default:
      if (error.status >= 500) {
        return "KailoPay API error while loading verification. Try again or contact support.";
      }
      return rampErrorMessage(error);
  }
}
