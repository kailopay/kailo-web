"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CCTP_CHECKOUT_CHAIN_IDS } from "@/lib/dashboard/cctp/chain-registry";
import {
  clearCctpQuotesFromStorage,
  isCctpRateLockExpired,
  readCctpQuotesFromStorage,
  saveCctpQuotesToStorage,
} from "@/lib/dashboard/cctp/quote-cache";
import type { CctpChainId, CctpFeeEstimate } from "@/lib/dashboard/cctp/types";

const PREFETCH_CHAIN_IDS = CCTP_CHECKOUT_CHAIN_IDS.filter(
  (chainId) => chainId !== "stellar",
);

type UseCctpQuoteOptions = {
  paymentId: string;
  sourceChain: CctpChainId;
  prefetchEnabled: boolean;
  /** Stable amount key used to invalidate cached bridge quotes. */
  amountKey: string | null;
  /** Pricing rate-lock expiry; cached bridge quotes refresh after this time. */
  rateLockExpiresAt?: string | null;
};

function buildCacheKey(
  paymentId: string,
  sourceChain: CctpChainId,
  amountKey: string,
) {
  return `${paymentId}:${sourceChain}:${amountKey}`;
}

export function useCctpQuote({
  paymentId,
  sourceChain,
  prefetchEnabled,
  amountKey,
  rateLockExpiresAt = null,
}: UseCctpQuoteOptions) {
  const [quotesByChain, setQuotesByChain] = useState<
    Partial<Record<CctpChainId, CctpFeeEstimate>>
  >({});
  const [errorsByChain, setErrorsByChain] = useState<
    Partial<Record<CctpChainId, string>>
  >({});
  const [loadingChains, setLoadingChains] = useState<Set<CctpChainId>>(
    () => new Set(),
  );

  const quotesRef = useRef(quotesByChain);
  const loadingChainsRef = useRef(loadingChains);
  const inFlightRef = useRef<Set<string>>(new Set());
  const lockedExpiresAtRef = useRef<string | null>(null);

  quotesRef.current = quotesByChain;
  loadingChainsRef.current = loadingChains;
  lockedExpiresAtRef.current = rateLockExpiresAt ?? null;

  const persistQuotes = useCallback(
    (quotes: Partial<Record<CctpChainId, CctpFeeEstimate>>) => {
      if (!amountKey) {
        return;
      }

      saveCctpQuotesToStorage(
        paymentId,
        amountKey,
        lockedExpiresAtRef.current,
        quotes,
      );
    },
    [amountKey, paymentId],
  );

  const markLoading = useCallback((chainId: CctpChainId, loading: boolean) => {
    setLoadingChains((current) => {
      const next = new Set(current);
      if (loading) {
        next.add(chainId);
      } else {
        next.delete(chainId);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    if (amountKey) {
      clearCctpQuotesFromStorage(paymentId, amountKey);
    }

    setQuotesByChain({});
    setErrorsByChain({});
    setLoadingChains(new Set());
    inFlightRef.current = new Set();
    lockedExpiresAtRef.current = null;
  }, [amountKey, paymentId]);

  useEffect(() => {
    setQuotesByChain({});
    setErrorsByChain({});
    setLoadingChains(new Set());
    inFlightRef.current = new Set();
  }, [paymentId]);

  useEffect(() => {
    if (!amountKey) {
      setQuotesByChain({});
      setErrorsByChain({});
      setLoadingChains(new Set());
      inFlightRef.current = new Set();
      return;
    }

    const cached = readCctpQuotesFromStorage(
      paymentId,
      amountKey,
      rateLockExpiresAt ?? null,
    );

    setQuotesByChain(cached ?? {});
    setErrorsByChain({});
    setLoadingChains(new Set());
    inFlightRef.current = new Set();
  }, [amountKey, paymentId, rateLockExpiresAt]);

  const fetchQuoteForChain = useCallback(
    async (
      chainId: CctpChainId,
      cacheKey: string,
      { force = false }: { force?: boolean } = {},
    ) => {
      if (!amountKey || inFlightRef.current.has(cacheKey)) {
        return;
      }

      if (
        !force &&
        quotesRef.current[chainId] &&
        !isCctpRateLockExpired(lockedExpiresAtRef.current)
      ) {
        return;
      }

      inFlightRef.current.add(cacheKey);
      const showLoading = !quotesRef.current[chainId];
      if (showLoading) {
        markLoading(chainId, true);
      }

      setErrorsByChain((current) => {
        if (!(chainId in current)) {
          return current;
        }

        const next = { ...current };
        delete next[chainId];
        return next;
      });

      try {
        const response = await fetch(`/api/checkout/${paymentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "cctp_quote",
            source_chain: chainId,
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          quote?: CctpFeeEstimate;
          error?: string;
        };

        if (!response.ok || !payload.quote) {
          throw new Error(payload.error ?? "Unable to fetch bridge quote.");
        }

        setQuotesByChain((current) => {
          const next = {
            ...current,
            [chainId]: payload.quote!,
          };
          persistQuotes(next);
          return next;
        });
      } catch (fetchError) {
        setErrorsByChain((current) => ({
          ...current,
          [chainId]:
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to fetch bridge quote.",
        }));

        if (force) {
          setQuotesByChain((current) => {
            if (!(chainId in current)) {
              return current;
            }

            const next = { ...current };
            delete next[chainId];
            persistQuotes(next);
            return next;
          });
        }
      } finally {
        inFlightRef.current.delete(cacheKey);
        if (showLoading) {
          markLoading(chainId, false);
        }
      }
    },
    [amountKey, markLoading, paymentId, persistQuotes],
  );

  const prefetchAllQuotes = useCallback(
    async ({ force = false } = {}) => {
      if (!prefetchEnabled || !amountKey) {
        return;
      }

      const chainsToFetch = PREFETCH_CHAIN_IDS.filter((chainId) => {
        if (force) {
          return true;
        }

        return (
          !quotesRef.current[chainId] ||
          isCctpRateLockExpired(lockedExpiresAtRef.current)
        );
      });

      if (chainsToFetch.length === 0) {
        return;
      }

      await Promise.all(
        chainsToFetch.map((chainId) =>
          fetchQuoteForChain(
            chainId,
            buildCacheKey(paymentId, chainId, amountKey),
            { force },
          ),
        ),
      );
    },
    [amountKey, fetchQuoteForChain, paymentId, prefetchEnabled],
  );

  useEffect(() => {
    if (!prefetchEnabled || !amountKey) {
      return;
    }

    void prefetchAllQuotes();
  }, [amountKey, prefetchAllQuotes, prefetchEnabled]);

  useEffect(() => {
    if (
      !prefetchEnabled ||
      !amountKey ||
      sourceChain === "stellar" ||
      quotesRef.current[sourceChain] ||
      loadingChainsRef.current.has(sourceChain)
    ) {
      return;
    }

    void fetchQuoteForChain(
      sourceChain,
      buildCacheKey(paymentId, sourceChain, amountKey),
    );
  }, [
    amountKey,
    fetchQuoteForChain,
    paymentId,
    prefetchEnabled,
    sourceChain,
  ]);

  useEffect(() => {
    if (!prefetchEnabled || !amountKey || !rateLockExpiresAt) {
      return;
    }

    const refreshTimer = window.setTimeout(
      () => {
        void prefetchAllQuotes({ force: true });
      },
      Math.max(new Date(rateLockExpiresAt).getTime() - Date.now(), 0) + 50,
    );

    return () => window.clearTimeout(refreshTimer);
  }, [amountKey, prefetchAllQuotes, prefetchEnabled, rateLockExpiresAt]);

  useEffect(() => {
    if (!prefetchEnabled || !amountKey) {
      return;
    }

    const chainsWithErrors = PREFETCH_CHAIN_IDS.filter(
      (chainId) => errorsByChain[chainId],
    );

    if (chainsWithErrors.length === 0) {
      return;
    }

    const retryTimer = window.setTimeout(() => {
      void Promise.all(
        chainsWithErrors.map((chainId) =>
          fetchQuoteForChain(
            chainId,
            buildCacheKey(paymentId, chainId, amountKey),
            { force: true },
          ),
        ),
      );
    }, 3000);

    return () => window.clearTimeout(retryTimer);
  }, [
    amountKey,
    errorsByChain,
    fetchQuoteForChain,
    paymentId,
    prefetchEnabled,
  ]);

  const quote =
    sourceChain === "stellar" ? null : (quotesByChain[sourceChain] ?? null);
  const error =
    sourceChain === "stellar" ? null : (errorsByChain[sourceChain] ?? null);
  const isFetchingQuote =
    sourceChain !== "stellar" &&
    !quote &&
    loadingChains.has(sourceChain);

  return {
    quote,
    error,
    isFetchingQuote,
    setQuote: (nextQuote: CctpFeeEstimate | null) => {
      if (sourceChain === "stellar") {
        return;
      }

      setQuotesByChain((current) => {
        if (!nextQuote) {
          if (!(sourceChain in current)) {
            return current;
          }

          const next = { ...current };
          delete next[sourceChain];
          persistQuotes(next);
          return next;
        }

        const next = {
          ...current,
          [sourceChain]: nextQuote,
        };
        persistQuotes(next);
        return next;
      });
    },
    reset,
    refreshQuote: () => prefetchAllQuotes({ force: true }),
  };
}
