import { isRecord, kailopayFetch, numberField, stringField } from "./http";

export type QuotePreview = {
  direction: "buy" | "sell";
  environment: string;
  network: string;
  fiat: { currency: string; amount_minor: string };
  asset: { code: string; amount: string };
  rate: string;
  adjusted_rate: string;
  spread_bps: number;
  source_at: string;
  expires_at: string;
};

function parseQuotePreview(value: unknown): QuotePreview {
  if (!isRecord(value)) throw new Error("Malformed quote preview");
  const fiat = value.fiat;
  const asset = value.asset;
  if (!isRecord(fiat) || !isRecord(asset)) throw new Error("Malformed quote preview");

  const direction = stringField(value, "direction");
  if (direction !== "buy" && direction !== "sell") {
    throw new Error("Malformed quote preview");
  }

  return {
    direction,
    environment: stringField(value, "environment"),
    network: stringField(value, "network"),
    fiat: {
      currency: stringField(fiat, "currency"),
      amount_minor: stringField(fiat, "amount_minor"),
    },
    asset: {
      code: stringField(asset, "code"),
      amount: stringField(asset, "amount"),
    },
    rate: stringField(value, "rate"),
    adjusted_rate: stringField(value, "adjusted_rate"),
    spread_bps: numberField(value, "spread_bps"),
    source_at: stringField(value, "source_at"),
    expires_at: stringField(value, "expires_at"),
  };
}

export async function previewBuyQuote(
  amountMinor: number,
  signal?: AbortSignal,
): Promise<QuotePreview> {
  const payload = await kailopayFetch("/v1/quotes", {
    body: {
      direction: "buy",
      fiat: { currency: "IDR", amount_minor: String(Math.round(amountMinor)) },
      asset: { network: "stellar_testnet", code: "XLM" },
    },
    signal,
  });
  if (!isRecord(payload) || !isRecord(payload.quote)) {
    throw new Error("Malformed quote response");
  }
  return parseQuotePreview(payload.quote);
}

export async function previewSellQuote(
  assetAmount: number,
  signal?: AbortSignal,
): Promise<QuotePreview> {
  const payload = await kailopayFetch("/v1/quotes", {
    body: {
      direction: "sell",
      fiat: { currency: "IDR" },
      asset: {
        network: "stellar_testnet",
        code: "XLM",
        amount: assetAmount.toFixed(7),
      },
    },
    signal,
  });
  if (!isRecord(payload) || !isRecord(payload.quote)) {
    throw new Error("Malformed quote response");
  }
  return parseQuotePreview(payload.quote);
}
