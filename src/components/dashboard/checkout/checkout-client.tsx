"use client";

import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { Horizon } from "@stellar/stellar-sdk";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { CheckoutErrorBanner } from "@/components/dashboard/checkout/checkout-error-banner";
import { BusinessMark } from "@/components/dashboard/business/business-mark";
import { useStellarWallet } from "@/hooks/dashboard/use-stellar-wallet";
import { usePaymentQuoteCountdown } from "@/hooks/dashboard/use-payment-quote-countdown";
import { useCheckoutQuotes } from "@/hooks/dashboard/use-checkout-quotes";
import { useCctpQuote } from "@/hooks/dashboard/use-cctp-quote";
import { useEvmWallet } from "@/hooks/dashboard/use-evm-wallet";
import { useCheckoutEmbed } from "@/hooks/dashboard/use-checkout-embed";
import { formatInvoiceAmount } from "@/lib/dashboard/invoices/amount";
import { formatAmountWithUnit, formatTokenWithAsset } from "@/lib/dashboard/format/amount";
import type { CheckoutLineItem } from "@/lib/dashboard/checkout/line-items";
import { getHorizonUrl, getNetworkPassphrase } from "@/lib/dashboard/stellar/network";
import { formatHorizonSubmitError } from "@/lib/dashboard/stellar/errors";
import { sanitizeCheckoutErrorMessage } from "@/lib/dashboard/checkout/error-messages";
import type { Organization } from "@/lib/dashboard/db/schema";
import { cn } from "@dub/utils";

import type { PaymentLinkCustomerInput } from "@/lib/dashboard/payment-links/types";
import { getPaymentLinkCustomerInputError } from "@/lib/dashboard/payment-links/validate-customer-input";
import type {
  AllowedAsset,
  CheckoutData,
} from "./checkout-types";
import type { CctpChainId, CctpFeeEstimate } from "@/lib/dashboard/cctp/types";
import {
  executeEvmCctpPayment,
  type PreparedEvmCctpPayment,
} from "@/lib/dashboard/cctp/adapters/evm-wallet";
import { isCctpChainId } from "@/lib/dashboard/cctp/chain-registry";
import { CheckoutLoadingState } from "./checkout-loading-state";
import { CheckoutView } from "./checkout-view";
import { buildCheckoutManualPaymentQrValue } from "@/lib/dashboard/checkout/manual-payment-qr";
import {
  getManualPaymentCheckMessage,
  isCheckoutProcessingStatus,
  isCheckoutSessionExpired,
} from "@/lib/dashboard/checkout/payment-state";
import { assetsMatch } from "@/lib/dashboard/assets/types";
import {
  isCheckoutQuoteReady,
  resolveCheckoutDisplayAmount,
} from "@/lib/dashboard/checkout/quote-validation";
import {
  executePrivatePayment,
  getPrivatePaymentStatusMessage,
} from "@/lib/dashboard/zk/execute-private-payment";

function assetKey(asset: AllowedAsset) {
  return `${asset.asset_code}:${asset.issuer_address ?? ""}`;
}

function getSourceLabel(sourceType: string | null) {
  switch (sourceType) {
    case "invoice":
      return "Invoice";
    case "payment_link":
      return "Payment link";
    case "checkout_session":
      return "Checkout";
    default:
      return "Payment";
  }
}

function getStoredCheckoutTxHash(paymentId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(`kailopay:checkout-tx:${paymentId}`);
}

function getInitialPaidAssetKey(allowedAssets: AllowedAsset[]) {
  if (typeof window === "undefined" || allowedAssets.length === 0) {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const paidAssetCode = params.get("paid_asset");
  const paidAssetIssuer = params.get("paid_asset_issuer");

  if (paidAssetCode) {
    const match = allowedAssets.find(
      (asset) =>
        asset.asset_code === paidAssetCode &&
        (!paidAssetIssuer || asset.issuer_address === paidAssetIssuer)
    );

    if (match) {
      return assetKey(match);
    }
  }

  return assetKey(allowedAssets[0]!);
}

export function CheckoutClient({
  paymentId,
  embedded = false,
}: {
  paymentId: string;
  embedded?: boolean;
}) {
  const [data, setData] = useState<CheckoutData | null>(null);
  const [error, setErrorState] = useState<string | null>(null);
  const setError = useCallback((message: string | null) => {
    setErrorState(sanitizeCheckoutErrorMessage(message));
  }, []);
  const [isPaying, setIsPaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usePrivatePayment, setUsePrivatePayment] = useState(false);
  const [selectedPaidAssetKey, setSelectedPaidAssetKey] = useState("");
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [isMobileItemsOpen, setIsMobileItemsOpen] = useState(false);
  const [pendingTxHash, setPendingTxHash] = useState<string | null>(() =>
    getStoredCheckoutTxHash(paymentId),
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmExhausted, setConfirmExhausted] = useState(false);
  const [isManualChecking, setIsManualChecking] = useState(false);
  const [paymentStatusInfo, setPaymentStatusInfo] = useState<string | null>(null);
  const [customerInput, setCustomerInput] = useState<PaymentLinkCustomerInput>({});
  const [restoredPaymentId, setRestoredPaymentId] = useState(paymentId);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "wallet">("qr");
  const [selectedNetwork, setSelectedNetwork] = useState<CctpChainId>("stellar");
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isPayingCctp, setIsPayingCctp] = useState(false);
  const [cctpStatusLabel, setCctpStatusLabel] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
    }
    if (isAssetDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isAssetDropdownOpen]);

  if (restoredPaymentId !== paymentId) {
    setRestoredPaymentId(paymentId);
    setPendingTxHash(getStoredCheckoutTxHash(paymentId));
    setConfirmExhausted(false);
    setPaymentMethod("qr");
    setSelectedNetwork("stellar");
    setCctpStatusLabel(null);
  }

  const environment = data?.payment.environment ?? "sandbox";
  const {
    address,
    connect,
    disconnect,
    clearErrors: clearWalletErrors,
    isConnecting,
    networkError,
    connectError,
  } = useStellarWallet(environment, { restoreSession: false });
  const {
    wallets: evmWallets,
    address: evmAddress,
    walletName: evmWalletName,
    provider: evmProvider,
    isConnecting: isEvmConnecting,
    connectError: evmConnectError,
    connect: connectEvmWallet,
    disconnect: disconnectEvmWallet,
    clearErrors: clearEvmWalletErrors,
  } = useEvmWallet();

  const handleDismissAlert = useCallback(() => {
    setError(null);
    setPaymentStatusInfo(null);
    clearWalletErrors();
    clearEvmWalletErrors();
  }, [clearEvmWalletErrors, clearWalletErrors]);

  const allowedAssets = useMemo(
    () => data?.payment.allowed_assets ?? [],
    [data?.payment.allowed_assets],
  );

  const selectedPaidAsset = useMemo(() => {
    return allowedAssets.find((asset) => assetKey(asset) === selectedPaidAssetKey) ?? null;
  }, [allowedAssets, selectedPaidAssetKey]);

  const isUsdcSelected = selectedPaidAsset?.asset_code === "USDC";

  const hasPricing = Boolean(
    data?.payment.pricing_currency && data?.payment.pricing_amount,
  );

  const paymentStatus = data?.payment.status;
  const skipQuotes =
    Boolean(pendingTxHash) ||
    Boolean(data?.cctp) ||
    paymentStatus === "completed" ||
    (paymentStatus != null && isCheckoutProcessingStatus(paymentStatus));

  const serverPaidAssetMatchesSelection =
    Boolean(
      data?.payment.paid_asset &&
        selectedPaidAsset &&
        assetsMatch(data.payment.paid_asset, selectedPaidAsset),
    );

  const { quote, quoteError, isLoadingQuote, loadQuote, getQuoteForAsset } = useCheckoutQuotes({
    paymentId,
    allowedAssets,
    selectedPaidAsset,
    hasPricing,
    disabled: skipQuotes,
    pricingAmount: data?.payment.pricing_amount ?? null,
    pricingCurrency: data?.payment.pricing_currency ?? null,
    lockedQuotedPaidAmount: serverPaidAssetMatchesSelection
      ? (data?.payment.quoted_paid_amount ?? null)
      : null,
  });

  useEffect(() => {
    if (paymentStatus === "completed") {
      setError(null);
      setPendingTxHash(null);
      sessionStorage.removeItem(`kailopay:checkout-tx:${paymentId}`);
    }
  }, [paymentId, paymentStatus]);

  const { countdown, quoteExpired, isRefreshingRate, rateLockLabel } =
    usePaymentQuoteCountdown({
      expiresAt: hasPricing ? quote?.expires_at : null,
      isLoadingQuote,
      quoteError,
      loadQuote,
    });

  const depositTrustlineError = quote?.deposit_trustline_error ?? null;
  const isPayProcessing = data
    ? isCheckoutProcessingStatus(data.payment.status)
    : false;
  const paymentBlocked =
    isPayProcessing ||
    Boolean(data?.cctp) ||
    Boolean(depositTrustlineError) ||
    (hasPricing && (!quote || isLoadingQuote || quoteExpired || isRefreshingRate));

  const showQuoteAmountLoading = isLoadingQuote && !quote;
  const isQuoteReady = isCheckoutQuoteReady({
    hasPricing,
    selectedPaidAsset,
    quote,
    quoteExpired,
    isLoadingQuote,
    isRefreshingRate,
  });
  const showQrLoading =
    isLoading ||
    !(data?.payment.deposit_address ?? data?.payment.receiving_address);
  const isFetchingQuote = hasPricing && !isQuoteReady;

  const refreshCheckout = useCallback(async () => {
    const response = await fetch(`/api/checkout/${paymentId}`);
    const json = (await response.json()) as CheckoutData & { error?: string };

    if (!response.ok) {
      setError(json.error ?? "Payment not found");
      return;
    }

    setData(json);
    if (json.cctp?.source_chain && isCctpChainId(json.cctp.source_chain)) {
      setSelectedNetwork(json.cctp.source_chain);
      setCctpStatusLabel("Payment sent. Waiting for confirmation...");
    }
    if (json.payment.payment_flow === "zk_shielded") {
      setUsePrivatePayment(true);
    }
    const firstAsset = json.payment.allowed_assets[0];
    if (firstAsset) {
      const cctpUsdc = json.cctp
        ? json.payment.allowed_assets.find(
            (asset) => asset.asset_code === "USDC",
          )
        : null;
      setSelectedPaidAssetKey(
        cctpUsdc
          ? assetKey(cctpUsdc)
          : getInitialPaidAssetKey(json.payment.allowed_assets),
      );
    }
  }, [paymentId]);

  useEffect(() => {
    async function load() {
      await refreshCheckout();
      setIsLoading(false);
    }

    void load();
  }, [paymentId, refreshCheckout]);

  const reloadCheckoutData = useCallback(async () => {
    const response = await fetch(`/api/checkout/${paymentId}`);
    const json = (await response.json()) as CheckoutData & { error?: string };

    if (response.ok) {
      setData(json);
      if (
        json.payment.status === "pending" &&
        json.payment.last_attempt_error
      ) {
        setError(null);
      }
    }

    return json;
  }, [paymentId]);

  const lastSyncedQuoteAmountRef = useRef<string | null>(null);

  useEffect(() => {
    if (!quote?.paid_amount || skipQuotes) {
      return;
    }

    if (quote.paid_amount === lastSyncedQuoteAmountRef.current) {
      return;
    }

    lastSyncedQuoteAmountRef.current = quote.paid_amount;
    void reloadCheckoutData();
  }, [quote?.paid_amount, reloadCheckoutData, skipQuotes]);

  const confirmPayment = useCallback(
    async (txHash: string) => {
      const confirmResponse = await fetch(`/api/checkout/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_classic_deposit",
          txHash,
        }),
      });

      const confirmData = (await confirmResponse.json().catch(() => ({}))) as {
        status?: string;
        error?: string;
        setup?: string[];
      };

      if (confirmResponse.status === 202) {
        setPendingTxHash(txHash);
        sessionStorage.setItem(`kailopay:checkout-tx:${paymentId}`, txHash);
        setData((current) =>
          current
            ? { ...current, payment: { ...current.payment, status: "processing" } }
            : current,
        );
        setError(null);
        return false;
      }

      if (!confirmResponse.ok) {
        const message = confirmData.error ?? "Payment verification failed";
        const isTransientDepositDelay =
          message.includes("Deposit not detected yet") ||
          message.includes("Deposit is still processing");

        if (isTransientDepositDelay) {
          setPendingTxHash(txHash);
          sessionStorage.setItem(`kailopay:checkout-tx:${paymentId}`, txHash);
          setError(null);
          return false;
        }

        setPendingTxHash(null);
        sessionStorage.removeItem(`kailopay:checkout-tx:${paymentId}`);
        const setupHint =
          confirmData.setup && confirmData.setup.length > 0
            ? ` ${confirmData.setup.join(" ")}`
            : "";
        setError(message + setupHint);
        await reloadCheckoutData();
        return false;
      }

      setPendingTxHash(null);
      setConfirmExhausted(false);
      sessionStorage.removeItem(`kailopay:checkout-tx:${paymentId}`);
      setData((current) =>
        current
          ? {
              ...current,
              payment: {
                ...current.payment,
                status: confirmData.status ?? "completed",
              },
            }
          : current,
      );

      return true;
    },
    [address, paymentId, reloadCheckoutData],
  );

  const recheckCheckoutPayment = useCallback(async () => {
    if (!data) {
      return { refreshed: null, depositCheckError: null };
    }

    let depositCheckError: string | null = null;
    const pollAddress =
      data.payment.deposit_address ?? data.payment.receiving_address;
    const canDetectByMemo = data.payment.payment_flow === "direct";

    try {
      if (data.payment.payment_flow === "escrow") {
        const response = await fetch(`/api/checkout/${paymentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: data.cctp ? "cctp_status" : "check_deposit",
            tx_hash: data.cctp ? undefined : (pendingTxHash ?? undefined),
          }),
        });

        if (!response.ok && response.status !== 202) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
          };

          if (response.status === 409 && payload.error) {
            depositCheckError = payload.error;
            setError(payload.error);
          }
        }
      }

      if (canDetectByMemo && pollAddress && data.payment.memo) {
        const horizonUrl = getHorizonUrl(data.payment.environment);
        const server = new Horizon.Server(horizonUrl);
        const response = await server
          .transactions()
          .forAccount(pollAddress)
          .order("desc")
          .limit(10)
          .call();

        for (const tx of response.records) {
          if (tx.memo === data.payment.memo && tx.successful) {
            await confirmPayment(tx.hash);
            break;
          }
        }
      }
    } catch (err) {
      console.error("Payment recheck error:", err);
    }

    const refreshed = await reloadCheckoutData();

    if (refreshed.payment?.status === "refunded") {
      setPendingTxHash(null);
      sessionStorage.removeItem(`kailopay:checkout-tx:${paymentId}`);
      setError(null);
    }

    return { refreshed, depositCheckError };
  }, [confirmPayment, data, paymentId, pendingTxHash, reloadCheckoutData]);

  const handleManualPaymentMarkPaid = useCallback(async () => {
    setIsManualChecking(true);
    setPaymentStatusInfo(null);

    try {
      const { refreshed, depositCheckError } = await recheckCheckoutPayment();

      if (depositCheckError) {
        return;
      }

      if (!refreshed?.payment) {
        setPaymentStatusInfo(
          "We couldn't refresh the payment status. Please try again.",
        );
        return;
      }

      setPaymentStatusInfo(
        getManualPaymentCheckMessage(refreshed.payment.status),
      );
    } finally {
      setIsManualChecking(false);
    }
  }, [recheckCheckoutPayment]);

  useEffect(() => {
    const isPayCompleted = data?.payment.status === "completed";
    const isPayExpired = data
      ? isCheckoutSessionExpired(data.payment)
      : false;
    const isPayProcessing = data
      ? isCheckoutProcessingStatus(data.payment.status)
      : false;

    if (isPayCompleted || isPayExpired || isPayProcessing) {
      return;
    }

    const interval = setInterval(() => {
      void recheckCheckoutPayment().then(({ refreshed }) => {
        if (
          refreshed?.payment.status === "completed" ||
          refreshed?.payment.status === "refunded"
        ) {
          clearInterval(interval);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [
    data?.payment.status,
    data?.payment.session_error,
    recheckCheckoutPayment,
  ]);

  useEffect(() => {
    const shouldPoll =
      (data != null && isCheckoutProcessingStatus(data.payment.status)) ||
      Boolean(pendingTxHash);

    if (!shouldPoll) {
      return;
    }

    const interval = setInterval(() => {
      void recheckCheckoutPayment();
    }, 3000);

    return () => clearInterval(interval);
  }, [data?.payment.status, pendingTxHash, recheckCheckoutPayment]);

  const displayAmount =
    resolveCheckoutDisplayAmount({
      hasPricing,
      paymentAmount: data?.payment.amount ?? "0",
      paymentPaidAsset: data?.payment.paid_asset ?? null,
      quotedPaidAmount: data?.payment.quoted_paid_amount ?? null,
      selectedPaidAsset,
      quote,
    }) ?? "";
  const displayAsset =
    selectedPaidAsset?.asset_code ??
    data?.payment.paid_asset?.asset_code ??
    data?.payment.settlement_asset.asset_code ??
    "XLM";

  const usdcAsset = useMemo(
    () => allowedAssets.find((asset) => asset.asset_code === "USDC") ?? null,
    [allowedAssets],
  );
  const usdcPricingQuote = usdcAsset ? getQuoteForAsset(usdcAsset) : null;
  const cctpAmountKey = hasPricing
    ? (usdcPricingQuote?.paid_amount ?? null)
    : (data?.payment.amount ?? null);
  const cctpPrefetchEnabled =
    Boolean(data) &&
    Boolean(usdcAsset) &&
    Boolean(cctpAmountKey) &&
    (!hasPricing ||
      Boolean(
        usdcPricingQuote &&
          !quoteExpired &&
          !isRefreshingRate,
      )) &&
    !skipQuotes;

  const {
    quote: cctpQuote,
    error: cctpQuoteError,
    isFetchingQuote: isFetchingCctpQuote,
    setQuote: setCctpQuote,
    reset: resetCctpQuote,
  } = useCctpQuote({
    paymentId,
    sourceChain: selectedNetwork,
    prefetchEnabled: cctpPrefetchEnabled,
    amountKey: cctpAmountKey,
    rateLockExpiresAt: hasPricing ? (usdcPricingQuote?.expires_at ?? null) : null,
  });

  const handlePaymentMethodChange = useCallback(
    async (method: "qr" | "wallet") => {
      setPaymentMethod(method);

      if (method === "qr") {
        setSelectedNetwork("stellar");
        setIsNetworkDropdownOpen(false);
        setUsePrivatePayment(false);
        setCctpStatusLabel(null);
        disconnectEvmWallet();
        await disconnect();
      }
    },
    [disconnect, disconnectEvmWallet],
  );

  const handleNetworkChange = useCallback(
    async (network: CctpChainId) => {
      setSelectedNetwork(network);
      setCctpStatusLabel(null);

      if (network === "stellar") {
        disconnectEvmWallet();
        return;
      }

      setUsePrivatePayment(false);
      await disconnect();
    },
    [disconnect, disconnectEvmWallet],
  );

  useEffect(() => {
    if (
      !pendingTxHash ||
      !address ||
      data?.payment.status === "completed" ||
      data?.payment.status === "expired"
    ) {
      return;
    }

    let cancelled = false;

    async function pollConfirmation() {
      setIsConfirming(true);
      setConfirmExhausted(false);

      for (let attempt = 0; attempt < 30 && !cancelled; attempt += 1) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        const confirmed = await confirmPayment(pendingTxHash!);
        if (confirmed || cancelled) {
          setIsConfirming(false);
          return;
        }

        const refreshed = await reloadCheckoutData();
        if (cancelled) {
          return;
        }

        if (refreshed.payment?.status === "completed") {
          setPendingTxHash(null);
          setConfirmExhausted(false);
          sessionStorage.removeItem(`kailopay:checkout-tx:${paymentId}`);
          setIsConfirming(false);
          setError(null);
          return;
        }

        if (
          refreshed.payment?.status === "pending" &&
          refreshed.payment.last_attempt_error
        ) {
          setPendingTxHash(null);
          setConfirmExhausted(false);
          sessionStorage.removeItem(`kailopay:checkout-tx:${paymentId}`);
          setIsConfirming(false);
          setError(null);
          return;
        }

        if (
          refreshed.payment?.status === "deposit_received" ||
          refreshed.payment?.status === "settling"
        ) {
          setError(null);
        }
      }

      if (!cancelled) {
        setIsConfirming(false);
        setConfirmExhausted(true);
      }
    }

    void pollConfirmation();

    return () => {
      cancelled = true;
      setIsConfirming(false);
    };
  }, [
    address,
    confirmPayment,
    data?.payment.status,
    paymentId,
    pendingTxHash,
    reloadCheckoutData,
  ]);

  async function handlePay() {
    if (!data || !address || !selectedPaidAsset || selectedNetwork !== "stellar") {
      return;
    }

    const customerInputError = getPaymentLinkCustomerInputError(
      customerInput,
      data.customer_collection,
    );

    if (customerInputError) {
      setError(customerInputError);
      return;
    }

    if (paymentBlocked) {
      if (isRefreshingRate) {
        setError("Rate is refreshing. Please wait a moment and try again.");
      } else {
        setError("Payment quote is unavailable. A new rate will load automatically.");
      }
      return;
    }

    setIsPaying(true);
    setError(null);
    setPaymentStatusInfo(null);

    try {
      if (usePrivatePayment || data.payment.payment_flow === "zk_shielded") {
        const shielded = data.shielded;
        if (
          !shielded?.payment_id_hash ||
          !shielded.recipient_hash ||
          !shielded.amount_stroops
        ) {
          throw new Error("Private payment is not available for this checkout.");
        }

        await executePrivatePayment({
          paymentId,
          checkout: data,
          shielded: {
            payment_id_hash: shielded.payment_id_hash,
            pool_contract_id: shielded.pool_contract_id,
            recipient_hash: shielded.recipient_hash,
            amount_stroops: shielded.amount_stroops,
            amount_label:
              shielded.amount_label ?? shielded.amount_stroops,
          },
          walletAddress: address,
          paidAsset: selectedPaidAsset,
          onStatus: (status) => {
            setPaymentStatusInfo(getPrivatePaymentStatusMessage(status));
          },
          onOptedIn: refreshCheckout,
        });

        setPaymentStatusInfo(null);
        await refreshCheckout();
        return;
      }

      const buildResponse = await fetch(`/api/checkout/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "build_transaction",
          sourcePublicKey: address,
          paid_asset: selectedPaidAsset,
        }),
      });

      const buildData = (await buildResponse.json()) as {
        xdr?: string;
        payment_type?: string;
        error?: string;
        setup?: string[];
      };

      if (!buildResponse.ok || !buildData.xdr) {
        const setupHint =
          buildData.setup && buildData.setup.length > 0
            ? ` ${buildData.setup.join(" ")}`
            : "";
        setError((buildData.error ?? "Unable to build transaction") + setupHint);
        setIsPaying(false);
        return;
      }

      const { signedTxXdr } = await StellarWalletsKit.signTransaction(
        buildData.xdr,
        {
          networkPassphrase: getNetworkPassphrase(data.payment.environment),
          address,
        },
      );

      const submitResult = await (async () => {
        const response = await fetch(`/api/checkout/${paymentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submit_classic",
            signedXdr: signedTxXdr,
          }),
        });
        const payload = (await response.json()) as {
          tx_hash?: string;
          error?: string;
          setup?: string[];
        };

        if (!response.ok || !payload.tx_hash) {
          const setupHint =
            payload.setup && payload.setup.length > 0
              ? ` ${payload.setup.join(" ")}`
              : "";
          throw new Error(
            (payload.error ?? "Unable to submit payment") + setupHint,
          );
        }

        return { hash: payload.tx_hash };
      })();

      setPendingTxHash(submitResult.hash);
      sessionStorage.setItem(`kailopay:checkout-tx:${paymentId}`, submitResult.hash);
    } catch (payError) {
      setError(formatHorizonSubmitError(payError));
    } finally {
      setIsPaying(false);
    }
  }

  async function handlePayCctp() {
    if (!data || selectedNetwork === "stellar") {
      return;
    }

    if (!evmProvider || !evmAddress) {
      setError("Connect an EVM wallet to continue.");
      return;
    }

    setIsPayingCctp(true);
    setError(null);
    setPaymentStatusInfo(null);

    try {
      const prepareResponse = await fetch(`/api/checkout/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prepare_cctp_payment",
          source_chain: selectedNetwork,
        }),
      });
      const prepared = (await prepareResponse.json().catch(() => ({}))) as {
        error?: string;
        quote?: CctpFeeEstimate;
        payment?: PreparedEvmCctpPayment;
      };

      if (!prepareResponse.ok || !prepared.payment || !prepared.quote) {
        setError(prepared.error ?? "This network is not available.");
        return;
      }

      setCctpQuote(prepared.quote);
      const result = await executeEvmCctpPayment(
        prepared.payment,
        evmProvider,
        (status) => {
          setCctpStatusLabel(
            status === "connecting"
              ? "Connecting wallet..."
              : status === "approving"
                ? "Approve USDC in your wallet..."
                : "Confirm payment in your wallet...",
          );
        },
      );
      setCctpStatusLabel("Payment sent. Waiting for confirmation...");

      const submitResponse = await fetch(`/api/checkout/${paymentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_cctp_burn",
          source_chain: selectedNetwork,
          burn_tx_hash: result.burnHash,
          payer_address: result.account,
          transfer_mode: prepared.quote.transferMode,
        }),
      });
      const submitted = (await submitResponse.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!submitResponse.ok && submitResponse.status !== 202) {
        setError(submitted.error ?? "Unable to confirm payment.");
        return;
      }

      setCctpStatusLabel("Payment sent. Waiting for confirmation...");

      for (let attempt = 0; attempt < 90; attempt += 1) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        const statusResponse = await fetch(`/api/checkout/${paymentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cctp_status" }),
        });
        const status = (await statusResponse.json().catch(() => ({}))) as {
          status?: string;
          phase?: string;
          error?: string;
        };

        if (statusResponse.ok && status.phase === "completed") {
          setCctpStatusLabel(null);
          await reloadCheckoutData();
          return;
        }

        if (statusResponse.status !== 202) {
          throw new Error(
            status.error ?? "Unable to complete payment on Stellar.",
          );
        }

        setCctpStatusLabel(
          status.phase === "minted"
            ? "Finalizing payment..."
            : "Waiting for network confirmation...",
        );
      }

      throw new Error(
        "Payment is still processing. You can safely leave this page and check again later.",
      );
    } catch (payError) {
      setError(
        payError instanceof Error
          ? payError.message
          : "Unable to complete payment.",
      );
      setCctpStatusLabel(null);
    } finally {
      setIsPayingCctp(false);
    }
  }

  useCheckoutEmbed({
    embedded,
    paymentId,
    status: data?.payment.status,
    txHash: pendingTxHash,
    isLoaded: Boolean(data),
  });

  useEffect(() => {
    if (!embedded) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlHeight = html.style.height;
    const previousBodyHeight = body.style.height;
    const previousBodyOverflow = body.style.overflow;

    html.style.height = "100%";
    body.style.height = "100%";
    body.style.overflow = "hidden";

    return () => {
      html.style.height = previousHtmlHeight;
      body.style.height = previousBodyHeight;
      body.style.overflow = previousBodyOverflow;
    };
  }, [embedded]);

  if (isLoading) {
    return <CheckoutLoadingState />;
  }

  if (!data) {
    const notFoundMessage = error ?? "Payment not found";

    return (
      <div className="relative flex min-h-svh items-center justify-center bg-neutral-50 p-6 pb-20">
        <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-600">{notFoundMessage}</p>
        </div>
        <CheckoutErrorBanner message={notFoundMessage} />
      </div>
    );
  }

  const isCompleted = data.payment.status === "completed";
  const isProcessing =
    isCheckoutProcessingStatus(data.payment.status) ||
    Boolean(pendingTxHash) ||
    isConfirming;
  const isSessionExpired = isCheckoutSessionExpired(data.payment);
  const lastAttemptError = data.payment.last_attempt_error;
  const qrDestination =
    data.payment.deposit_address ?? data.payment.receiving_address;
  const checkoutQrValue = qrDestination
    ? buildCheckoutManualPaymentQrValue({ destination: qrDestination })
    : "";
  const settlementLabel = data.payment.settlement_asset.asset_code;
  const isSandbox = data.payment.environment === "sandbox";
  const sourceLabel = getSourceLabel(data.payment.source_type);
  const currencyCode = data.payment.pricing_currency ?? "USD";
  const lineItems = data.items ?? [];

  function formatLineAmount(amount: string) {
    if (hasPricing) {
      return formatAmountWithUnit(amount, currencyCode);
    }

    return formatTokenWithAsset(amount, settlementLabel);
  }

  const checkoutView = (
    <CheckoutView
      data={data}
      isCompleted={isCompleted}
      isProcessing={isProcessing}
      isSessionExpired={isSessionExpired}
      lastAttemptError={lastAttemptError}
      qrDestination={qrDestination}
      checkoutQrValue={checkoutQrValue}
      settlementLabel={settlementLabel}
      isSandbox={isSandbox}
      sourceLabel={sourceLabel}
      currencyCode={currencyCode}
      hasPricing={hasPricing}
      showQuoteAmountLoading={showQuoteAmountLoading}
      isQuoteReady={isQuoteReady}
      displayAmount={displayAmount}
      displayAsset={displayAsset}
      quote={quote}
      rateLockLabel={rateLockLabel}
      countdown={countdown}
      isRefreshingRate={isRefreshingRate}
      allowedAssets={allowedAssets}
      selectedPaidAsset={selectedPaidAsset}
      selectedPaidAssetKey={selectedPaidAssetKey}
      setSelectedPaidAssetKey={(key) => {
        const nextAsset = allowedAssets.find((asset) => assetKey(asset) === key);
        setSelectedPaidAssetKey(key);

        if (nextAsset?.asset_code !== "USDC") {
          setSelectedNetwork("stellar");
          setIsNetworkDropdownOpen(false);
          resetCctpQuote();
          disconnectEvmWallet();
          setCctpStatusLabel(null);
        }
      }}
      isAssetDropdownOpen={isAssetDropdownOpen}
      setIsAssetDropdownOpen={setIsAssetDropdownOpen}
      selectedNetwork={selectedNetwork}
      setSelectedNetwork={(network) => {
        void handleNetworkChange(network);
      }}
      isNetworkDropdownOpen={isNetworkDropdownOpen}
      setIsNetworkDropdownOpen={setIsNetworkDropdownOpen}
      isMobileItemsOpen={isMobileItemsOpen}
      setIsMobileItemsOpen={setIsMobileItemsOpen}
      address={address}
      pendingTxHash={pendingTxHash}
      isPaying={isPaying}
      isConfirming={isConfirming}
      confirmExhausted={confirmExhausted}
      isConnecting={isConnecting}
      isFetchingQuote={isFetchingQuote}
      paymentBlocked={paymentBlocked}
      quoteError={
        paymentMethod === "wallet" &&
        isUsdcSelected &&
        selectedNetwork !== "stellar"
          ? (cctpQuoteError ?? quoteError)
          : quoteError
      }
      depositTrustlineError={depositTrustlineError}
      error={error}
      networkError={networkError}
      connectError={
        paymentMethod === "wallet" && selectedNetwork !== "stellar"
          ? evmConnectError
          : connectError
      }
      showQrLoading={showQrLoading}
      cctpQuote={cctpQuote}
      isFetchingCctpQuote={isFetchingCctpQuote}
      isPayingCctp={isPayingCctp}
      cctpStatusLabel={cctpStatusLabel}
      evmWallets={evmWallets}
      evmAddress={evmAddress}
      evmWalletName={evmWalletName}
      isEvmConnecting={isEvmConnecting}
      onConnectEvmWallet={(walletId) => {
        void connectEvmWallet(walletId);
      }}
      onPayCctp={() => {
        void handlePayCctp();
      }}
      dropdownRef={dropdownRef}
      paymentMethod={paymentMethod}
      onPaymentMethodChange={(method) => void handlePaymentMethodChange(method)}
      onConnectWallet={() => void connect()}
      onPay={() => void handlePay()}
      onDismissAlert={handleDismissAlert}
      paymentStatusInfo={paymentStatusInfo}
      usePrivatePayment={usePrivatePayment}
      onUsePrivatePaymentChange={setUsePrivatePayment}
      onRetryConfirm={() => {
        setConfirmExhausted(false);
        setIsConfirming(true);
        void confirmPayment(pendingTxHash!).finally(() => {
          setIsConfirming(false);
        });
      }}
      onManualPaymentMarkPaid={() => {
        void handleManualPaymentMarkPaid();
      }}
      isManualChecking={isManualChecking}
      customerInput={customerInput}
      onCustomerInputChange={setCustomerInput}
      embedded={embedded}
    />
  );

  if (!embedded) {
    return checkoutView;
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
      {checkoutView}
    </div>
  );
}
