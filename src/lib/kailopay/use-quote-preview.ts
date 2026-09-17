"use client";

import { useEffect, useState } from "react";

import type { RampMode } from "@/content/individuals";
import { RAMP_FEE_BPS, RAMP_RATE_XLM_IDR } from "@/content/individuals";
import { rampErrorMessage } from "@/lib/kailopay/errors";
import { KailopayError } from "@/lib/kailopay/http";
import { previewBuyQuote, previewSellQuote, type QuotePreview } from "@/lib/kailopay/quotes";

const DEBOUNCE_MS = 400;

type QuotePreviewState = {
  quote: QuotePreview | null;
  source: "api" | "fallback";
  loading: boolean;
  error: string | null;
  receiveAmount: number;
  feeAmount: number;
  rateIdr: number;
};

function fallbackEstimate(mode: RampMode, payNumeric: number) {
  if (!payNumeric) {
    return { receiveAmount: 0, feeAmount: 0, rateIdr: RAMP_RATE_XLM_IDR };
  }

  if (mode === "buy") {
    const feeAmount = (payNumeric * RAMP_FEE_BPS) / 10_000;
    const netIdr = payNumeric - feeAmount;
    return { receiveAmount: netIdr / RAMP_RATE_XLM_IDR, feeAmount, rateIdr: RAMP_RATE_XLM_IDR };
  }

  const grossIdr = payNumeric * RAMP_RATE_XLM_IDR;
  const feeAmount = (grossIdr * RAMP_FEE_BPS) / 10_000;
  return { receiveAmount: grossIdr - feeAmount, feeAmount, rateIdr: RAMP_RATE_XLM_IDR };
}

function estimateFromQuote(quote: QuotePreview, mode: RampMode, payNumeric: number) {
  const rateIdr = Number(quote.adjusted_rate);
  const spreadBps = quote.spread_bps;

  if (mode === "buy") {
    const receiveAmount = Number(quote.asset.amount);
    const feeAmount = (payNumeric * spreadBps) / 10_000;
    return { receiveAmount, feeAmount, rateIdr };
  }

  const receiveAmount = Number(quote.fiat.amount_minor);
  const grossIdr = payNumeric * rateIdr;
  const feeAmount = (grossIdr * spreadBps) / 10_000;
  return { receiveAmount, feeAmount, rateIdr };
}

export function useQuotePreview(mode: RampMode, payNumeric: number): QuotePreviewState {
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [source, setSource] = useState<"api" | "fallback">("fallback");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payNumeric) {
      setQuote(null);
      setSource("fallback");
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      const request =
        mode === "buy"
          ? previewBuyQuote(payNumeric, controller.signal)
          : previewSellQuote(payNumeric, controller.signal);

      void request
        .then((nextQuote) => {
          setQuote(nextQuote);
          setSource("api");
        })
        .catch((caught) => {
          if (controller.signal.aborted) return;
          if (caught instanceof KailopayError && caught.status === 401) {
            setQuote(null);
            setSource("fallback");
            return;
          }
          setQuote(null);
          setSource("fallback");
          setError(
            caught instanceof KailopayError
              ? rampErrorMessage(caught)
              : "Could not load live quote.",
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [mode, payNumeric]);

  const numbers =
    quote && source === "api"
      ? estimateFromQuote(quote, mode, payNumeric)
      : fallbackEstimate(mode, payNumeric);

  return {
    quote,
    source,
    loading,
    error,
    receiveAmount: numbers.receiveAmount,
    feeAmount: numbers.feeAmount,
    rateIdr: numbers.rateIdr,
  };
}
