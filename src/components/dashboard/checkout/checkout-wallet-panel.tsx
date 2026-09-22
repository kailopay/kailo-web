"use client";

import { Button } from "@dub/ui";
import { LoadingSpinner, PenWriting } from "@dub/ui/icons";
import type { ReactNode } from "react";
import { CheckoutPaymentSpinner } from "@/components/dashboard/checkout/checkout-payment-loading";
import { formatTokenWithAsset } from "@/lib/dashboard/format/amount";
import { cn } from "@dub/utils";

type CheckoutWalletPanelProps = {
  address?: string | null;
  displayAmount: string;
  displayAsset: string;
  isQuoteReady?: boolean;
  isFetchingQuote?: boolean;
  privatePaymentOption?: ReactNode;
  preview?: boolean;
  isPaying: boolean;
  isConfirming: boolean;
  isRefreshingRate: boolean;
  isConnecting: boolean;
  paymentBlocked: boolean;
  pendingTxHash: string | null;
  confirmExhausted: boolean;
  onConnect?: () => void;
  onPay?: () => void;
  onRetryConfirm?: () => void;
};

export function CheckoutWalletPanel({
  address,
  displayAmount,
  displayAsset,
  isQuoteReady = true,
  isFetchingQuote = false,
  privatePaymentOption,
  preview = false,
  isPaying,
  isConfirming,
  isRefreshingRate,
  isConnecting,
  paymentBlocked,
  pendingTxHash,
  confirmExhausted,
  onConnect,
  onPay,
  onRetryConfirm,
}: CheckoutWalletPanelProps) {
  const amountLabel = isQuoteReady
    ? formatTokenWithAsset(displayAmount, displayAsset)
    : "";
  const isConnected = Boolean(address);
  const actionsDisabled =
    preview || isPaying || isConfirming || isRefreshingRate || isConnecting;
  const connectButtonDisabled =
    preview || isRefreshingRate || isConnecting || paymentBlocked;
  const payButtonDisabled =
    preview || paymentBlocked || isRefreshingRate || isPaying || Boolean(pendingTxHash);
  const labelClassName = cn(
    "font-medium text-neutral-900",
    preview ? "text-[10px]" : "text-sm",
  );
  const valueClassName = cn(
    "text-neutral-500",
    preview ? "text-xs" : "text-sm",
  );

  return (
    <div className={cn(preview ? "space-y-3" : "space-y-4")}>
      <div className="space-y-3">
        <div className="min-w-0">
          <p className={labelClassName}>Wallet address</p>

          {isConnected ? (
            <div className="mt-0.5 flex items-start justify-between gap-3">
              <p className={cn("min-w-0 flex-1 break-all font-mono", valueClassName)}>
                {address}
              </p>
              {!preview ? (
                <button
                  type="button"
                  aria-label="Change wallet"
                  className={cn(
                    "shrink-0 rounded-md p-1 text-neutral-400 transition-colors",
                    "hover:bg-neutral-100 hover:text-neutral-900",
                    "disabled:pointer-events-none disabled:opacity-50",
                  )}
                  disabled={actionsDisabled}
                  onClick={onConnect}
                >
                  <PenWriting className="size-4" />
                </button>
              ) : null}
            </div>
          ) : preview ? (
            <p className={cn("mt-0.5 font-medium", valueClassName)}>Tap to connect</p>
          ) : (
            <button
              type="button"
              className={cn(
                "mt-0.5 font-medium text-neutral-500 transition-colors",
                "hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-50",
                preview ? "text-xs" : "text-sm",
              )}
              disabled={actionsDisabled}
              onClick={onConnect}
            >
              Tap to connect
            </button>
          )}
        </div>

        <div className="min-w-0">
          <p className={labelClassName}>Amount</p>
          {isFetchingQuote ? (
            <div className={cn("mt-0.5 flex items-center gap-2", valueClassName)}>
              <LoadingSpinner className="size-3.5 shrink-0 text-neutral-500" />
              <span>Fetching quote...</span>
            </div>
          ) : isQuoteReady ? (
            <p className={cn("truncate font-mono", valueClassName)}>{amountLabel}</p>
          ) : null}
        </div>
      </div>

      {privatePaymentOption}

      <div className="space-y-2">
        {isConnected && pendingTxHash && confirmExhausted && !isConfirming && !preview ? (
          <Button
            type="button"
            variant="secondary"
            className={cn("w-full", preview ? "h-8 text-xs rounded-lg" : "h-10")}
            text="Retry payment confirmation"
            icon={isPaying ? <CheckoutPaymentSpinner /> : undefined}
            disabled={isRefreshingRate || isPaying}
            onClick={onRetryConfirm}
          />
        ) : null}

        {isConnected ? (
          <Button
            type="button"
            className={cn("w-full", preview ? "h-8 text-xs rounded-lg" : "h-10")}
            text={isQuoteReady ? `Pay ${amountLabel}` : "Pay"}
            loading={isPaying}
            disabled={payButtonDisabled || !isQuoteReady}
            onClick={onPay}
          />
        ) : (
          <Button
            type="button"
            className={cn("w-full", preview ? "h-8 text-xs rounded-lg" : "h-10")}
            text={isConnecting ? "Connecting..." : "Connect wallet"}
            loading={isConnecting}
            disabled={connectButtonDisabled}
            onClick={onConnect}
          />
        )}
      </div>
    </div>
  );
}
