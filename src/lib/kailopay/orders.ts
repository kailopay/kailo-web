import {
  isRecord,
  kailopayFetch,
  KailopayError,
  numberField,
  optionalStringField,
  stringField,
} from "./http";
import type {
  Checkout,
  Order,
  OrderStatus,
  PaymentMethod,
  Payout,
  Quote,
} from "./types";

const ORDER_STATUSES: readonly OrderStatus[] = [
  "created",
  "payment_pending",
  "payment_confirmed",
  "stellar_processing",
  "completed",
  "expired",
  "payment_failed",
  "stellar_failed",
  "cancelled",
  "asset_pending",
  "asset_received",
  "asset_invalid",
  "retirement_processing",
  "withdrawal_processing",
  "retirement_failed",
  "withdrawal_failed",
];

const OFFRAMP_STATUSES: readonly OrderStatus[] = [
  "asset_pending",
  "asset_received",
  "asset_invalid",
  "retirement_processing",
  "withdrawal_processing",
  "retirement_failed",
  "withdrawal_failed",
];

function malformed(what: string): KailopayError {
  return new KailopayError(`Malformed payload: ${what}`, 0, "MALFORMED_RESPONSE", null);
}

function parseQuote(value: unknown): Quote {
  if (!isRecord(value)) throw malformed("quote");
  return {
    rate: stringField(value, "rate"),
    adjusted_rate: stringField(value, "adjusted_rate"),
    spread_bps: numberField(value, "spread_bps"),
    source_at: stringField(value, "source_at"),
    expires_at: stringField(value, "expires_at"),
  };
}

function parseCheckout(value: unknown): Checkout | null {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) throw malformed("checkout");
  const presentation = stringField(value, "presentation_type");
  if (
    presentation !== "PAYMENT_LINK" &&
    presentation !== "QR_STRING" &&
    presentation !== "VIRTUAL_ACCOUNT_NUMBER"
  ) {
    throw malformed("checkout presentation_type");
  }
  const expiresAt = value.expires_at;
  if (expiresAt !== null && expiresAt !== undefined && typeof expiresAt !== "string") {
    throw malformed("checkout expires_at");
  }
  return {
    id: stringField(value, "id"),
    status: stringField(value, "status"),
    presentation_type: presentation,
    presentation_value: optionalStringField(value, "presentation_value"),
    payment_link_url: optionalStringField(value, "payment_link_url"),
    expires_at: expiresAt ?? null,
  };
}

function parsePayout(value: unknown): Payout | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) throw malformed("payout");
  return {
    reference: stringField(value, "reference"),
    method: stringField(value, "method"),
    amount_minor: stringField(value, "amount_minor"),
    state: stringField(value, "state"),
    simulated: value.simulated === true,
    disclosure: stringField(value, "disclosure"),
  };
}

function parsePaymentMethod(value: unknown): PaymentMethod | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (value === "xendit" || value === "qris" || value === "bri_va") {
    return value;
  }
  throw malformed("payment_method");
}

function parseOrderBody(order: Record<string, unknown>): Order {
  const status = stringField(order, "status");
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    throw malformed(`order status "${status}"`);
  }

  const fiat = order.fiat;
  const asset = order.asset;
  const destination = order.stellar_destination;
  if (!isRecord(fiat) || !isRecord(asset) || !isRecord(destination)) {
    throw malformed("order fields");
  }

  const memo = destination.memo;
  if (memo !== null && typeof memo !== "string") throw malformed("destination memo");

  const paymentMethod = parsePaymentMethod(order.payment_method);

  const depositHash = optionalStringField(order, "deposit_transaction_hash");
  const payout = parsePayout(order.payout);
  const orderStatus = status as OrderStatus;

  const parsed: Order = {
    id: stringField(order, "id"),
    direction:
      OFFRAMP_STATUSES.includes(orderStatus) || payout !== undefined || depositHash !== undefined
        ? "offramp"
        : "onramp",
    status: orderStatus,
    environment: stringField(order, "environment"),
    network: stringField(order, "network"),
    fiat: {
      currency: stringField(fiat, "currency"),
      amount_minor: stringField(fiat, "amount_minor"),
    },
    asset: {
      code: stringField(asset, "code"),
      amount: stringField(asset, "amount"),
    },
    quote: parseQuote(order.quote),
    payment_method: paymentMethod,
    stellar_destination: {
      account: stringField(destination, "account"),
      memo,
    },
    checkout: parseCheckout(order.checkout),
    created_at: stringField(order, "created_at"),
    updated_at: stringField(order, "updated_at"),
  };

  const hash = order.stellar_transaction_hash;
  if (typeof hash === "string") parsed.stellar_transaction_hash = hash;
  if (depositHash !== undefined) parsed.deposit_transaction_hash = depositHash;
  if (payout !== undefined) parsed.payout = payout;
  const failureCode = optionalStringField(order, "failure_code");
  if (failureCode !== undefined) parsed.failure_code = failureCode;

  return parsed;
}

function parseOrderEnvelope(payload: unknown): Order {
  if (!isRecord(payload) || !isRecord(payload.order)) throw malformed("order");
  return parseOrderBody(payload.order);
}

function readOnrampError(payload: unknown): {
  code: string;
  requestId: string | null;
  orderId: string | null;
} | null {
  if (!isRecord(payload) || !isRecord(payload.error)) return null;
  const code = payload.error.code;
  if (typeof code !== "string") return null;
  const requestId = payload.request_id;
  const orderId = payload.order_id;
  return {
    code,
    requestId: typeof requestId === "string" ? requestId : null,
    orderId: typeof orderId === "string" ? orderId : null,
  };
}

export type CreateOnrampInput = {
  idempotencyKey: string;
  amountMinor: string;
  paymentMethod: PaymentMethod;
  destinationAccount: string;
  memo: string | null;
};

export type CreateOfframpInput = {
  idempotencyKey: string;
  assetAmount: string;
  destinationToken: string;
};

export async function createOnramp(input: CreateOnrampInput): Promise<Order> {
  const payload = await kailopayFetch("/v1/onramps", {
    method: "POST",
    idempotencyKey: input.idempotencyKey,
    body: {
      fiat: { currency: "IDR", amount_minor: input.amountMinor },
      payment_method: input.paymentMethod,
      stellar_destination: {
        account: input.destinationAccount,
        memo: input.memo,
      },
    },
  });

  const hold = readOnrampError(payload);
  if (hold !== null) {
    throw new KailopayError(
      "The checkout outcome is being confirmed with the payment provider.",
      202,
      hold.code,
      hold.requestId,
      hold.orderId,
    );
  }

  return parseOrderEnvelope(payload);
}

export async function createOfframp(input: CreateOfframpInput): Promise<Order> {
  const payload = await kailopayFetch("/v1/offramps", {
    method: "POST",
    idempotencyKey: input.idempotencyKey,
    body: {
      asset: { network: "stellar_testnet", code: "XLM", amount: input.assetAmount },
      withdrawal: {
        currency: "IDR",
        method: "sandbox_bank_transfer",
        destination_token: input.destinationToken,
      },
    },
  });
  return parseOrderEnvelope(payload);
}

export async function getOrder(id: string, signal?: AbortSignal): Promise<Order> {
  const payload = await kailopayFetch(`/v1/orders/${encodeURIComponent(id)}`, { signal });
  return parseOrderEnvelope(payload);
}

export function paymentLinkForCheckout(checkout: Checkout | null): string | null {
  if (checkout === null) return null;
  if (checkout.payment_link_url) return checkout.payment_link_url;
  if (checkout.presentation_type === "PAYMENT_LINK" && checkout.presentation_value) {
    return checkout.presentation_value;
  }
  return null;
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return [
    "completed",
    "expired",
    "payment_failed",
    "stellar_failed",
    "cancelled",
    "asset_invalid",
    "retirement_failed",
    "withdrawal_failed",
  ].includes(status);
}

export function formatXlmAmount(amount: number): string {
  return amount.toFixed(7);
}
