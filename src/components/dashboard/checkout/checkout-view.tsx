"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@dub/utils";
import { AnimatedSizeContainer, Badge, Button, CopyButton, InfoTooltip, Tooltip } from "@dub/ui";
import { Check2, LoadingSpinner } from "@dub/ui/icons";
import { AssetIcon } from "@/components/dashboard/ui/assets/asset-icon";
import { getOfficialAsset } from "@/lib/dashboard/payment-methods/official-assets";
import { CheckoutWalletPanel } from "@/components/dashboard/checkout/checkout-wallet-panel";
import { CheckoutSandboxBanner } from "@/components/dashboard/checkout/checkout-sandbox-banner";
import { CheckoutAlertBanner } from "@/components/dashboard/checkout/checkout-error-banner";
import { getCheckoutSessionExpiredMessage } from "@/lib/dashboard/checkout/payment-state";
import { sanitizeCheckoutErrorMessage } from "@/lib/dashboard/checkout/error-messages";
import { CheckoutOrderSummary } from "@/components/dashboard/checkout/checkout-order-summary";
import { formatTokenWithAsset } from "@/lib/dashboard/format/amount";
import { hasCustomerCollection, type PaymentLinkCustomerInput } from "@/lib/dashboard/payment-links/types";
import { getPaymentLinkCustomerInputError } from "@/lib/dashboard/payment-links/validate-customer-input";
import { CheckoutAdditionalInfoFields } from "@/components/dashboard/checkout/checkout-additional-info-fields";
import { CheckoutPaymentWaitingBanner, getCheckoutPaymentWaitingVariant } from "@/components/dashboard/checkout/checkout-payment-loading";
import { CheckoutPaymentSuccessIndicator } from "@/components/dashboard/checkout/checkout-payment-success";
import { CheckoutNetworkSelector } from "@/components/dashboard/checkout/checkout-network-selector";
import { CheckoutCctpWalletPanel } from "@/components/dashboard/checkout/checkout-cctp-wallet-panel";
import { getDocsUrl } from "@/lib/dashboard/docs/url";
import type { CctpChainId, CctpFeeEstimate } from "@/lib/dashboard/cctp/types";
import type { EvmWalletProvider } from "@/lib/dashboard/evm/wallet-discovery";
import type { AllowedAsset, CheckoutData, PaymentQuote } from "./checkout-types";
import { PaymentQrCode } from "./payment-qr-code";
import { PaymentQrCodeSkeleton } from "./payment-qr-code-skeleton";

export function getAssetDetails(asset: AllowedAsset) {
  const code = asset.asset_code;
  const official = getOfficialAsset(code);

  if (official) {
    return {
      name: official.displayName,
      description: official.description,
    };
  }

  return {
    name: code,
    description: asset.issuer_address ? `Issued by ${asset.issuer_address.slice(0, 4)}...${asset.issuer_address.slice(-4)}` : "Custom token",
  };
}

const checkoutPaymentViewTransition = {
  duration: 0.22,
  ease: "easeOut" as const,
};

function PrivatePaymentOption({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  const docsUrl = `${getDocsUrl()}/guides/private-payments`;

  return (
    <label className={cn("flex items-start gap-2 text-sm", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
      <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
        <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
        <motion.span aria-hidden className={cn("flex size-4 items-center justify-center rounded border transition-colors duration-200 ease-out", checked ? "border-neutral-900 bg-neutral-900" : "border-neutral-300 bg-white", disabled && "opacity-50")} whileTap={disabled ? undefined : { scale: 0.92 }} transition={checkoutPaymentViewTransition}>
          <AnimatePresence initial={false}>
            {checked ? (
              <motion.span key="checkmark" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={checkoutPaymentViewTransition} className="flex items-center justify-center">
                <Check2 className="size-3 text-white" />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.span>
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="font-medium text-neutral-900">Pay privately</span>
        <InfoTooltip content={`Your wallet won't be linked to this merchant on-chain. [Learn more](${docsUrl})`} />
      </span>
    </label>
  );
}

function assetKey(asset: AllowedAsset) {
  return `${asset.asset_code}:${asset.issuer_address ?? ""}`;
}

const checkoutPanelMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

type CheckoutPaymentMethod = "qr" | "wallet";

function CheckoutPaymentMethodTabs({ value, onChange, disabled, compact }: { value: CheckoutPaymentMethod; onChange: (value: CheckoutPaymentMethod) => void; disabled?: boolean; compact?: boolean }) {
  const tabs = [
    { id: "qr" as const, label: "Pay manually" },
    { id: "wallet" as const, label: "Wallet" },
  ];

  return (
    <div className="flex gap-6 border-b border-neutral-200">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" disabled={disabled} className={cn("-mb-px border-b-2 pb-3 font-medium transition-colors", compact ? "text-xs" : "text-sm", value === tab.id ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900", disabled && "pointer-events-none opacity-50")} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
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

function whenDesktop(embedded: boolean, classes?: string) {
  if (embedded || !classes) {
    return undefined;
  }

  return classes;
}

function RateLockBadge({ content, children }: { content: string; children: ReactNode }) {
  return (
    <Tooltip content={content}>
      <span className="inline-flex cursor-help">{children}</span>
    </Tooltip>
  );
}

export function RateLockCountdown({ countdown, isRefreshingRate }: { countdown: string; isRefreshingRate: boolean; disabled?: boolean }) {
  const badgeClassName = "inline-flex items-center gap-1.5 tabular-nums";

  if (isRefreshingRate) {
    return (
      <RateLockBadge content="Fetching a new exchange rate. Payment actions pause briefly.">
        <Badge variant="gray" className={badgeClassName}>
          <LoadingSpinner className="size-3 shrink-0 text-neutral-600" />
          Updating
        </Badge>
      </RateLockBadge>
    );
  }

  if (countdown === "Expired") {
    return (
      <RateLockBadge content="The rate lock expired. A new rate will load automatically.">
        <Badge variant="gray" className="text-neutral-900">
          Expired
        </Badge>
      </RateLockBadge>
    );
  }

  return (
    <RateLockBadge content="Exchange rate is locked for this countdown">
      <Badge variant="black" className={badgeClassName}>
        {countdown}
      </Badge>
    </RateLockBadge>
  );
}

function CheckoutManualPaymentFollowUp({ disabled, isChecking, isRefreshingRate, onMarkPaid }: { disabled?: boolean; isChecking?: boolean; isRefreshingRate?: boolean; onMarkPaid?: () => void }) {
  const actionsDisabled = disabled || isChecking || isRefreshingRate;

  return (
    <div className={cn("pt-6 text-center leading-relaxed text-neutral-500", disabled ? "text-[10px]" : "text-xs")}>
      <p>We&apos;ll automatically detect your payment.</p>
      <p className="mt-1">
        Not detected?{" "}
        <button type="button" disabled={actionsDisabled} onClick={() => onMarkPaid?.()} className={cn("font-medium text-neutral-700 underline-offset-2 transition-colors hover:text-neutral-900 hover:underline", actionsDisabled && "cursor-not-allowed opacity-50 hover:no-underline")}>
          {isChecking ? "Checking..." : "Click here"}
        </button>
      </p>
    </div>
  );
}

export type CheckoutViewProps = {
  data: CheckoutData;
  isCompleted: boolean;
  isProcessing?: boolean;
  isSessionExpired: boolean;
  lastAttemptError: string | null | undefined;
  qrDestination: string;
  checkoutQrValue: string;
  settlementLabel: string;
  isSandbox: boolean;
  sourceLabel: string;
  currencyCode: string;
  hasPricing: boolean;
  showQuoteAmountLoading: boolean;
  isQuoteReady?: boolean;
  displayAmount: string;
  displayAsset: string;
  quote: PaymentQuote | null;
  rateLockLabel: string | null | undefined;
  isRefreshingRate: boolean;
  allowedAssets: AllowedAsset[];
  selectedPaidAsset: AllowedAsset | null;
  selectedPaidAssetKey: string;
  setSelectedPaidAssetKey: (key: string) => void;
  isAssetDropdownOpen: boolean;
  setIsAssetDropdownOpen: (open: boolean) => void;
  selectedNetwork?: CctpChainId;
  setSelectedNetwork?: (network: CctpChainId) => void;
  isNetworkDropdownOpen?: boolean;
  setIsNetworkDropdownOpen?: (open: boolean) => void;
  isMobileItemsOpen: boolean;
  setIsMobileItemsOpen: (open: boolean) => void;
  address: string | null;
  pendingTxHash: string | null;
  isPaying: boolean;
  isConfirming?: boolean;
  confirmExhausted?: boolean;
  isConnecting: boolean;
  isFetchingQuote?: boolean;
  paymentBlocked: boolean;
  quoteError: string | null;
  depositTrustlineError?: string | null;
  error: string | null;
  networkError: string | null;
  connectError: string | null;
  showQrLoading: boolean;
  cctpQuote?: CctpFeeEstimate | null;
  isFetchingCctpQuote?: boolean;
  isPayingCctp?: boolean;
  cctpStatusLabel?: string | null;
  evmWallets?: EvmWalletProvider[];
  evmAddress?: string | null;
  evmWalletName?: string | null;
  isEvmConnecting?: boolean;
  onConnectEvmWallet?: (walletId: string) => void;
  onPayCctp?: () => void;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
  paymentMethod?: CheckoutPaymentMethod;
  // Callbacks
  onPaymentMethodChange?: (method: CheckoutPaymentMethod) => void;
  onConnectWallet?: () => void;
  onPay?: () => void;
  onRetryConfirm?: () => void;
  onManualPaymentMarkPaid?: () => void;
  isManualChecking?: boolean;
  onDismissAlert?: () => void;
  paymentStatusInfo?: string | null;
  disabled?: boolean;
  embedded?: boolean;
  countdown?: string;
  customerInput?: PaymentLinkCustomerInput;
  onCustomerInputChange?: (value: PaymentLinkCustomerInput) => void;
  usePrivatePayment?: boolean;
  onUsePrivatePaymentChange?: (value: boolean) => void;
};

function getCheckoutErrorMessage(input: { isSessionExpired: boolean; sessionError?: string | null; invoice?: { due_at?: string | null } | null; error: string | null; quoteError: string | null; depositTrustlineError?: string | null; networkError: string | null; connectError: string | null; isRefreshingRate: boolean; lastAttemptError?: string | null }) {
  if (input.isSessionExpired) {
    return input.sessionError ?? getCheckoutSessionExpiredMessage({ invoice: input.invoice });
  }

  if (input.lastAttemptError && input.error?.includes("Settlement could not be completed")) {
    return null;
  }

  return sanitizeCheckoutErrorMessage(
    input.error ??
      input.depositTrustlineError ??
      (!input.isRefreshingRate ? input.quoteError : null) ??
      input.networkError ??
      input.connectError ??
      null,
  );
}

type CheckoutAlert = {
  type: "info" | "error";
  message: string;
  key: string;
};

function getCheckoutAlert(input: { disabled?: boolean; isCompleted?: boolean; isDetailsPanel: boolean; isPaymentPanel: boolean; detailsError: string | null; isSessionExpired: boolean; sessionError?: string | null; invoice?: { due_at?: string | null } | null; error: string | null; quoteError: string | null; depositTrustlineError?: string | null; networkError: string | null; connectError: string | null; isRefreshingRate: boolean; lastAttemptError: string | null | undefined; paymentStatusInfo?: string | null }): CheckoutAlert | null {
  if (input.disabled || input.isCompleted) {
    return null;
  }

  if (input.isDetailsPanel && input.detailsError) {
    return {
      type: "error",
      message: input.detailsError,
      key: `details-error:${input.detailsError}`,
    };
  }

  const checkoutErrorMessage = getCheckoutErrorMessage({
    isSessionExpired: input.isSessionExpired,
    sessionError: input.sessionError,
    invoice: input.invoice,
    error: input.error,
    quoteError: input.quoteError,
    depositTrustlineError: input.depositTrustlineError,
    networkError: input.networkError,
    connectError: input.connectError,
    isRefreshingRate: input.isRefreshingRate,
    lastAttemptError: input.lastAttemptError,
  });

  if (checkoutErrorMessage) {
    return {
      type: "error",
      message: checkoutErrorMessage,
      key: `checkout-error:${checkoutErrorMessage}`,
    };
  }

  if (input.isPaymentPanel && input.isRefreshingRate) {
    return {
      type: "info",
      message: "Rate lock is refreshing. Payment actions are paused until the new rate is ready.",
      key: "rate-refresh",
    };
  }

  if (input.isPaymentPanel && input.lastAttemptError) {
    const lastAttemptMessage = sanitizeCheckoutErrorMessage(input.lastAttemptError);
    if (lastAttemptMessage) {
      return {
        type: "error",
        message: lastAttemptMessage.includes("You can pay again")
          ? lastAttemptMessage
          : `${lastAttemptMessage} You can pay again below using the same payment link.`,
        key: `last-attempt:${lastAttemptMessage}`,
      };
    }
  }

  if (input.isPaymentPanel && input.paymentStatusInfo) {
    return {
      type: "info",
      message: input.paymentStatusInfo,
      key: `payment-status:${input.paymentStatusInfo}`,
    };
  }

  return null;
}

export function CheckoutView({
  data,
  isCompleted,
  isProcessing = false,
  isSessionExpired,
  lastAttemptError,
  qrDestination,
  checkoutQrValue,
  settlementLabel,
  isSandbox,
  sourceLabel,
  currencyCode,
  hasPricing,
  showQuoteAmountLoading,
  isQuoteReady = true,
  displayAmount,
  displayAsset,
  quote,
  rateLockLabel,
  isRefreshingRate,
  allowedAssets,
  selectedPaidAsset,
  selectedPaidAssetKey,
  setSelectedPaidAssetKey,
  isAssetDropdownOpen,
  setIsAssetDropdownOpen,
  selectedNetwork = "stellar",
  setSelectedNetwork,
  isNetworkDropdownOpen = false,
  setIsNetworkDropdownOpen,
  isMobileItemsOpen,
  setIsMobileItemsOpen,
  address,
  pendingTxHash,
  isPaying,
  isConfirming = false,
  confirmExhausted = false,
  isConnecting,
  isFetchingQuote = false,
  paymentBlocked,
  quoteError,
  depositTrustlineError = null,
  error,
  networkError,
  connectError,
  showQrLoading,
  cctpQuote = null,
  isFetchingCctpQuote = false,
  isPayingCctp = false,
  cctpStatusLabel = null,
  evmWallets = [],
  evmAddress = null,
  evmWalletName = null,
  isEvmConnecting = false,
  onConnectEvmWallet,
  onPayCctp,
  dropdownRef,
  paymentMethod = "qr",
  onPaymentMethodChange,
  onConnectWallet,
  onPay,
  onRetryConfirm,
  onManualPaymentMarkPaid,
  isManualChecking = false,
  onDismissAlert,
  paymentStatusInfo = null,
  disabled = false,
  embedded = false,
  countdown = "",
  customerInput,
  onCustomerInputChange,
  usePrivatePayment = false,
  onUsePrivatePaymentChange,
}: CheckoutViewProps) {
  const lineItems = data.items ?? [];
  const showPaymentDetails = !hasPricing || isQuoteReady;
  const showFetchingQuote = hasPricing && !isQuoteReady;
  const privatePaymentAvailable = Boolean(data.shielded?.available);
  const privatePaymentChecked = usePrivatePayment || data.payment.payment_flow === "zk_shielded";
  const privatePaymentLocked = data.payment.payment_flow === "zk_shielded";
  const isUsdcSelected = selectedPaidAsset?.asset_code === "USDC";
  const isWalletCctpNetwork = paymentMethod === "wallet" && isUsdcSelected && selectedNetwork !== "stellar";
  const showPrivatePaymentOption = paymentMethod === "wallet" && !isWalletCctpNetwork && privatePaymentAvailable && (data.payment.payment_flow === "escrow" || data.payment.payment_flow === "zk_shielded");
  const privatePaymentOption = showPrivatePaymentOption ? <PrivatePaymentOption checked={privatePaymentChecked} disabled={privatePaymentLocked || isRefreshingRate || isPaying || isConfirming || isConnecting} onChange={(checked) => onUsePrivatePaymentChange?.(checked)} /> : null;
  const isPaymentWaiting = isProcessing || isPaying || isPayingCctp || isConfirming;
  const showCustomerInfoFields = hasCustomerCollection(data.customer_collection) && !isCompleted && !isSessionExpired && !isPaymentWaiting;
  const customerCollectionKey = useMemo(() => JSON.stringify(data.customer_collection ?? null), [data.customer_collection]);
  const [customerPanel, setCustomerPanel] = useState<"details" | "payment">(showCustomerInfoFields ? "details" : "payment");
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [dismissedAlertKey, setDismissedAlertKey] = useState<string | null>(null);

  useEffect(() => {
    setCustomerPanel(showCustomerInfoFields ? "details" : "payment");
    setDetailsError(null);
    setDismissedAlertKey(null);
  }, [showCustomerInfoFields, customerCollectionKey]);

  const detailsValidationError = useMemo(() => (showCustomerInfoFields ? getPaymentLinkCustomerInputError(customerInput, data.customer_collection) : null), [showCustomerInfoFields, customerInput, data.customer_collection]);
  const canContinueToPayment = detailsValidationError === null;

  function handleContinueToPayment() {
    if (!canContinueToPayment) {
      setDetailsError(detailsValidationError);
      setCustomerPanel("details");
      return;
    }

    setDetailsError(null);
    setCustomerPanel("payment");
  }

  const showCustomerPanelTabs = showCustomerInfoFields;
  const isDetailsPanel = showCustomerPanelTabs && customerPanel === "details";
  const isPaymentPanel = !showCustomerPanelTabs || customerPanel === "payment";
  const checkoutAlert = getCheckoutAlert({
    disabled,
    isCompleted,
    isDetailsPanel,
    isPaymentPanel,
    detailsError,
    isSessionExpired,
    sessionError: data.payment.session_error,
    invoice: data.invoice,
    error,
    quoteError,
    depositTrustlineError,
    networkError,
    connectError,
    isRefreshingRate,
    lastAttemptError,
    paymentStatusInfo,
  });
  useEffect(() => {
    if (!checkoutAlert) {
      setDismissedAlertKey(null);
    }
  }, [checkoutAlert]);

  const visibleCheckoutAlert = checkoutAlert && checkoutAlert.key !== dismissedAlertKey ? checkoutAlert : null;

  function handleDismissAlert() {
    if (!visibleCheckoutAlert) {
      return;
    }

    setDismissedAlertKey(visibleCheckoutAlert.key);
    onDismissAlert?.();
  }

  const showCheckoutAlertBanner = Boolean(visibleCheckoutAlert);

  const paymentWaitingVariant = getCheckoutPaymentWaitingVariant({
    isProcessing,
    isPaying,
    isConfirming,
  });
  const paymentMethodTabsDisabled = isPaying || isPayingCctp || isConfirming || isConnecting || isEvmConnecting || Boolean(paymentWaitingVariant);
  const showPaymentMethodTabs = !isCompleted && !paymentWaitingVariant && !isSessionExpired;

  const paymentPanelPaddingX = disabled ? "px-8" : cn("px-5", whenDesktop(embedded, "@lg:px-10 @lg:pl-20 @lg:pr-12"));
  const paymentPanelContentWidth = cn("w-full max-w-md", embedded ? "mx-auto" : cn("mx-auto", whenDesktop(embedded, "@lg:mx-0")));

  return (
    <div className={cn("relative bg-white text-left flex flex-col flex-1 @container", disabled ? "min-h-0 h-full" : embedded ? "h-dvh min-h-0 max-h-dvh overflow-hidden" : "min-h-svh", showCheckoutAlertBanner && !embedded && !disabled && "pb-16")}>
      <div className={cn("relative flex flex-col flex-1 min-h-0", disabled ? "h-full" : embedded ? "h-full overflow-hidden" : "min-h-svh lg:min-h-0")}>
        {/* Hide sandbox banner when in preview (disabled) */}
        {isSandbox && !disabled ? <CheckoutSandboxBanner /> : null}

        <div className={cn("flex flex-1 min-h-0 flex-col", whenDesktop(embedded, "@lg:flex-row"))}>
          <CheckoutOrderSummary data={data} lineItems={lineItems} sourceLabel={sourceLabel} hasPricing={hasPricing} currencyCode={currencyCode} settlementLabel={settlementLabel} disabled={disabled} embedded={embedded} isMobileItemsOpen={isMobileItemsOpen} setIsMobileItemsOpen={setIsMobileItemsOpen} />

          {/* Payment Section (Right) */}
          <div className={cn("relative flex min-h-0 flex-1 flex-col bg-white", whenDesktop(embedded, "@lg:sticky @lg:top-0 @lg:max-h-svh @lg:overflow-y-hidden"))}>
            <div className={cn(paymentPanelContentWidth, "shrink-0", paymentPanelPaddingX, disabled ? "pt-4" : cn("pt-5", whenDesktop(embedded, "@lg:pt-8")))}>
              <div className="flex items-start justify-between gap-3">
                <h2 className={cn("font-semibold text-neutral-900", disabled ? "text-sm" : "text-base")}>{isCompleted ? "Payment" : isDetailsPanel ? "Your details" : "Payment"}</h2>
                {isPaymentPanel && !isCompleted && (hasPricing || disabled) && countdown ? (
                  <div className="shrink-0">
                    <RateLockCountdown countdown={countdown} isRefreshingRate={isRefreshingRate} />
                  </div>
                ) : null}
              </div>

              {showCustomerPanelTabs ? (
                <div className={cn("mt-4 flex rounded-xl bg-neutral-100 p-1", disabled ? "h-9" : "h-10")}>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailsError(null);
                      setCustomerPanel("details");
                    }}
                    className={cn("flex-1 rounded-lg text-center font-semibold transition-all", disabled ? "text-xs" : "text-sm", customerPanel === "details" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-950")}>
                    Your details
                  </button>
                  <button type="button" disabled={isDetailsPanel && !canContinueToPayment} title={isDetailsPanel && !canContinueToPayment ? "Fill in all required fields first" : undefined} onClick={handleContinueToPayment} className={cn("flex-1 rounded-lg text-center font-semibold transition-all", disabled ? "text-xs" : "text-sm", customerPanel === "payment" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-950", isDetailsPanel && !canContinueToPayment && "cursor-not-allowed opacity-50 hover:text-neutral-500")}>
                    Payment
                  </button>
                </div>
              ) : null}
            </div>

            <div className={cn("min-h-0 flex-1 overflow-y-auto", disabled ? "space-y-4" : "space-y-5")}>
              <div className={cn(paymentPanelContentWidth, "pt-4 pb-2", paymentPanelPaddingX)}>
                {isCompleted ? (
                  <CheckoutPaymentSuccessIndicator title="Payment successful" description="Your payment has been confirmed. You can close this page." />
                ) : isDetailsPanel ? (
                  <div className={disabled ? "space-y-4" : "space-y-5"}>
                    <CheckoutAdditionalInfoFields
                      collection={data.customer_collection!}
                      value={customerInput ?? {}}
                      onChange={(value) => {
                        setDetailsError(null);
                        onCustomerInputChange?.(value);
                      }}
                      readOnly={disabled && !onCustomerInputChange}
                      size={disabled ? "preview" : "default"}
                    />
                    <Button type="button" className={cn("w-full", disabled ? "h-8 text-xs rounded-lg" : "h-10")} text="Continue to payment" disabled={!canContinueToPayment} onClick={handleContinueToPayment} />
                  </div>
                ) : null}

                {isPaymentPanel && !isCompleted ? (
                  paymentWaitingVariant ? (
                    <CheckoutPaymentWaitingBanner variant={paymentWaitingVariant} />
                  ) : isSessionExpired ? (
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
                      <p className="font-medium text-neutral-900">Payment unavailable</p>
                    </div>
                  ) : (
                    <div className={cn(disabled ? "space-y-4" : "space-y-5")}>
                      {allowedAssets.length > 1 ? (
                        <div ref={dropdownRef} className="relative space-y-1.5">
                          <label className={cn("font-medium text-neutral-900", disabled ? "text-xs" : "text-sm")}>Pay with</label>
                          <div className={cn("rounded-xl bg-neutral-100 p-1", isRefreshingRate && "opacity-60")}>
                            <button type="button" disabled={disabled || isRefreshingRate} onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)} className={cn("flex w-full items-center justify-between rounded-lg bg-white text-left font-semibold text-neutral-900 shadow-sm transition-all", disabled ? "p-2 text-xs" : "p-2.5 text-sm", isRefreshingRate && "cursor-not-allowed")}>
                              {selectedPaidAsset && (
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <AssetIcon assetCode={selectedPaidAsset.asset_code} className={cn(disabled ? "size-7" : "size-8")} />
                                  <div className="min-w-0">
                                    <p className="truncate text-neutral-900">{getAssetDetails(selectedPaidAsset).name}</p>
                                    <p className="truncate text-[10px] font-normal text-neutral-500">{getAssetDetails(selectedPaidAsset).description}</p>
                                  </div>
                                </div>
                              )}
                              <div className="flex shrink-0 items-center gap-2 pl-2">
                                {hasPricing && (showQuoteAmountLoading || showFetchingQuote ? <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" /> : quote && showPaymentDetails ? <span className="text-xs font-medium text-neutral-600">{formatTokenWithAsset(displayAmount, displayAsset)}</span> : null)}
                                <svg className={cn("size-4 text-neutral-400 transition-transform", isAssetDropdownOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>
                          </div>

                          <AnimatePresence>
                            {isAssetDropdownOpen && (
                              <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.15, ease: "easeOut" }} className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg">
                                <div className="grid max-h-[240px] gap-0.5 overflow-y-auto">
                                  {allowedAssets.map((asset) => {
                                    const key = assetKey(asset);
                                    const isSelected = selectedPaidAssetKey === key;
                                    const details = getAssetDetails(asset);

                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        disabled={disabled || isRefreshingRate}
                                        onClick={() => {
                                          setSelectedPaidAssetKey(key);
                                          setIsAssetDropdownOpen(false);
                                        }}
                                        className={cn("flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-all", isSelected ? "bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900")}>
                                        <div className="flex items-center gap-2.5">
                                          <AssetIcon assetCode={asset.asset_code} className="size-7" />
                                          <p className="text-sm font-medium">{details.name}</p>
                                        </div>
                                        {isSelected ? <Check2 className="size-4 text-neutral-900" /> : null}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : null}

                      {showPaymentMethodTabs ? <CheckoutPaymentMethodTabs value={paymentMethod} onChange={(method) => onPaymentMethodChange?.(method)} disabled={paymentMethodTabsDisabled} compact={disabled} /> : null}

                      <div className={cn("w-full", disabled ? "space-y-4" : undefined)}>
                        <AnimatedSizeContainer height className="!overflow-visible" transition={checkoutPaymentViewTransition}>
                          <AnimatePresence mode="wait" initial={false}>
                            {paymentMethod === "wallet" ? (
                              <motion.div key={isWalletCctpNetwork ? "cctp-wallet-payment" : "stellar-wallet-payment"} initial={checkoutPanelMotion.initial} animate={checkoutPanelMotion.animate} exit={checkoutPanelMotion.exit} transition={checkoutPaymentViewTransition} className="space-y-4">
                                {isUsdcSelected ? (
                                  <CheckoutNetworkSelector selectedNetwork={selectedNetwork} isOpen={isNetworkDropdownOpen} disabled={disabled || isRefreshingRate || isPaying || isConfirming || isPayingCctp || isEvmConnecting} preview={disabled} onOpenChange={(open) => setIsNetworkDropdownOpen?.(open)} onNetworkChange={(network) => setSelectedNetwork?.(network)} />
                                ) : null}
                                {isWalletCctpNetwork ? (
                                  <CheckoutCctpWalletPanel wallets={evmWallets} address={evmAddress} walletName={evmWalletName} quote={cctpQuote} isFetchingQuote={isFetchingCctpQuote} isConnecting={isEvmConnecting} isPaying={isPayingCctp} paymentBlocked={paymentBlocked} preview={disabled} statusLabel={cctpStatusLabel} onConnect={(walletId) => onConnectEvmWallet?.(walletId)} onPay={() => onPayCctp?.()} />
                                ) : (
                                  <CheckoutWalletPanel address={address} displayAmount={displayAmount} displayAsset={displayAsset} isQuoteReady={isQuoteReady} isFetchingQuote={showFetchingQuote} privatePaymentOption={privatePaymentOption} preview={disabled} isPaying={isPaying} isConfirming={isConfirming} isRefreshingRate={isRefreshingRate} isConnecting={isConnecting} paymentBlocked={paymentBlocked} pendingTxHash={pendingTxHash} confirmExhausted={confirmExhausted} onConnect={onConnectWallet} onPay={onPay} onRetryConfirm={onRetryConfirm} />
                                )}
                              </motion.div>
                            ) : (
                              <motion.div key="qr-payment" initial={checkoutPanelMotion.initial} animate={checkoutPanelMotion.animate} exit={checkoutPanelMotion.exit} transition={checkoutPaymentViewTransition} className={cn(disabled ? "space-y-4" : "space-y-5")}>
                                <div className="w-full">{showQrLoading ? <PaymentQrCodeSkeleton size={disabled ? "sm" : "md"} className="w-full" /> : <PaymentQrCode value={checkoutQrValue} size={disabled ? "sm" : "md"} className="w-full" />}</div>

                                {showFetchingQuote ? (
                                  <div className={cn("flex items-center justify-center gap-2 text-neutral-500", disabled ? "text-xs" : "text-sm")}>
                                    <LoadingSpinner className="size-4 shrink-0 text-neutral-500" />
                                    <span>Fetching quote...</span>
                                  </div>
                                ) : null}

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <p className={cn("font-medium text-neutral-900", disabled ? "text-[10px]" : "text-sm")}>Network</p>
                                      <p className={cn("truncate text-neutral-500", disabled ? "text-xs" : "text-sm")}>Stellar</p>
                                    </div>
                                  </div>

                                  {showPaymentDetails ? (
                                    <>
                                      <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                          <p className={cn("font-medium text-neutral-900", disabled ? "text-[10px]" : "text-sm")}>Payment address</p>
                                          <p className={cn("break-all font-mono text-neutral-500", disabled ? "text-xs" : "text-sm")}>{qrDestination}</p>
                                        </div>
                                        <CopyButton value={qrDestination} className={cn("shrink-0", (isRefreshingRate || disabled) && "pointer-events-none opacity-50")} />
                                      </div>

                                      <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                          <p className={cn("font-medium text-neutral-900", disabled ? "text-[10px]" : "text-sm")}>Amount</p>
                                          <p className={cn("truncate font-mono text-neutral-500", disabled ? "text-xs" : "text-sm")}>{formatTokenWithAsset(displayAmount, displayAsset)}</p>
                                        </div>
                                        <CopyButton value={displayAmount} className={cn("shrink-0", (isRefreshingRate || disabled) && "pointer-events-none opacity-50")} />
                                      </div>
                                    </>
                                  ) : null}

                                  <CheckoutManualPaymentFollowUp disabled={disabled} isChecking={isManualChecking} isRefreshingRate={isRefreshingRate} onMarkPaid={onManualPaymentMarkPaid} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </AnimatedSizeContainer>
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            </div>

            {!embedded ? (
              <div className={cn(paymentPanelContentWidth, "shrink-0 text-center", paymentPanelPaddingX, disabled ? "pb-4 pt-3" : "pb-8 pt-6")}>
                {disabled ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                    <span>Powered by</span>
                    <img src="/logo-full.png" alt="KailoPay" className="h-4 w-auto brightness-90" />
                  </span>
                ) : (
                  <a href="https://kailopay.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                    <span>Powered by</span>
                    <img src="/logo-full.png" alt="KailoPay" className="h-4 w-auto brightness-90" />
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait">{visibleCheckoutAlert ? <CheckoutAlertBanner key={visibleCheckoutAlert.key} type={visibleCheckoutAlert.type} message={visibleCheckoutAlert.message} onDismiss={handleDismissAlert} /> : null}</AnimatePresence>
    </div>
  );
}
