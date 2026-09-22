import assert from "node:assert/strict";
import { test } from "node:test";
import type { CctpFeeEstimate } from "@/lib/dashboard/cctp/types";
import {
  clearCctpQuotesFromStorage,
  getCctpQuoteStorageKey,
  readCctpQuotesFromStorage,
  saveCctpQuotesToStorage,
} from "@/lib/dashboard/cctp/quote-cache";

const storage = new Map<string, string>();

function installLocalStorageMock() {
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
    },
  });

  return () => {
    if (originalWindow === undefined) {
      // @ts-expect-error test cleanup
      delete globalThis.window;
    } else {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
    }
    storage.clear();
  };
}

const quoteFixture = (): CctpFeeEstimate => ({
  chainId: "base",
  destinationChainId: "stellar",
  transferMode: "fast",
  paymentAmount: "2.0000000",
  cctpFeeAmount: "0.000359",
  bridgeFeeAmount: "0.05",
  totalFeeAmount: "0.050359",
  totalBurnAmount: "2.050359",
  maxFeeAmount: "0.000359",
  estimatedTime: "~8 sec",
  fastTransferAvailable: true,
  sourceDomain: 6,
  destinationDomain: 27,
});

test("cctp quote storage survives refresh until rate lock expires", () => {
  const cleanup = installLocalStorageMock();
  const paymentId = "pay_test_cache";
  const amountKey = "2.0000000";
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const quotes = { base: quoteFixture() };

  saveCctpQuotesToStorage(paymentId, amountKey, expiresAt, quotes);

  const restored = readCctpQuotesFromStorage(paymentId, amountKey, expiresAt);
  assert.deepEqual(restored, quotes);
  assert.ok(
    storage.has(getCctpQuoteStorageKey(paymentId, amountKey)),
  );

  clearCctpQuotesFromStorage(paymentId, amountKey);
  assert.equal(readCctpQuotesFromStorage(paymentId, amountKey, expiresAt), null);

  cleanup();
});

test("cctp quote storage ignores expired rate lock", () => {
  const cleanup = installLocalStorageMock();
  const paymentId = "pay_test_expired";
  const amountKey = "2.0000000";
  const expiresAt = new Date(Date.now() - 60_000).toISOString();
  const quotes = { base: quoteFixture() };

  saveCctpQuotesToStorage(paymentId, amountKey, expiresAt, quotes);
  assert.equal(
    readCctpQuotesFromStorage(paymentId, amountKey, expiresAt),
    null,
  );

  clearCctpQuotesFromStorage(paymentId, amountKey);
  cleanup();
});
