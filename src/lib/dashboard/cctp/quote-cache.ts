import { isQuoteStillValid } from "@/lib/dashboard/checkout/quote-validation";
import type { CctpChainId, CctpFeeEstimate } from "@/lib/dashboard/cctp/types";

type StoredCctpQuotes = {
  amountKey: string;
  rateLockExpiresAt: string | null;
  quotes: Partial<Record<CctpChainId, CctpFeeEstimate>>;
};

export function getCctpQuoteStorageKey(paymentId: string, amountKey: string) {
  return `kailopay:cctp-quote:${paymentId}:${amountKey}`;
}

export function isCctpRateLockExpired(expiresAt: string | null | undefined) {
  if (!expiresAt) {
    return false;
  }

  return !isQuoteStillValid({ expires_at: expiresAt });
}

export function readCctpQuotesFromStorage(
  paymentId: string,
  amountKey: string,
  rateLockExpiresAt: string | null,
): Partial<Record<CctpChainId, CctpFeeEstimate>> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cached = window.localStorage.getItem(
      getCctpQuoteStorageKey(paymentId, amountKey),
    );
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached) as StoredCctpQuotes;
    if (
      parsed.amountKey !== amountKey ||
      parsed.rateLockExpiresAt !== rateLockExpiresAt
    ) {
      return null;
    }

    if (rateLockExpiresAt && isCctpRateLockExpired(rateLockExpiresAt)) {
      return null;
    }

    return parsed.quotes ?? null;
  } catch {
    return null;
  }
}

export function saveCctpQuotesToStorage(
  paymentId: string,
  amountKey: string,
  rateLockExpiresAt: string | null,
  quotes: Partial<Record<CctpChainId, CctpFeeEstimate>>,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getCctpQuoteStorageKey(paymentId, amountKey),
      JSON.stringify({
        amountKey,
        rateLockExpiresAt,
        quotes,
      } satisfies StoredCctpQuotes),
    );
  } catch {
    // ignore
  }
}

export function clearCctpQuotesFromStorage(paymentId: string, amountKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(getCctpQuoteStorageKey(paymentId, amountKey));
  } catch {
    // ignore
  }
}
