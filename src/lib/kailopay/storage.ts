import type { RampDraft } from "./types";

const DRAFT_KEY = "kailopay.ramp.draft";
const PENDING_ORDER_KEY = "kailopay.ramp.pendingOrderId";

export function loadRampDraft(): RampDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RampDraft>;
    const defaults = createDefaultDraft();
    return {
      ...defaults,
      ...parsed,
      payoutBankId: parsed.payoutBankId ?? defaults.payoutBankId,
      payoutAccountNumber: parsed.payoutAccountNumber ?? defaults.payoutAccountNumber,
      payoutAccountName: parsed.payoutAccountName ?? defaults.payoutAccountName,
      payoutDestination: parsed.payoutDestination ?? defaults.payoutDestination,
    };
  } catch {
    return null;
  }
}

export function saveRampDraft(draft: RampDraft): void {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearRampDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY);
}

export function savePendingOrderId(orderId: string): void {
  sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
}

export function readPendingOrderId(): string | null {
  return sessionStorage.getItem(PENDING_ORDER_KEY);
}

export function clearPendingOrderId(): void {
  sessionStorage.removeItem(PENDING_ORDER_KEY);
}

export function createDefaultDraft(): RampDraft {
  return {
    step: 1,
    mode: "buy",
    payAmount: "100.000",
    paymentMethodId: "qris",
    stellarAccount: "",
    memo: "",
    payoutBankId: "bca",
    payoutAccountNumber: "",
    payoutAccountName: "",
    payoutDestination: "",
    idempotencyKey: crypto.randomUUID(),
    orderId: null,
  };
}
