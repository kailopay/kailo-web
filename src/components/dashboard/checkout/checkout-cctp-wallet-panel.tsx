"use client";

import { Button, InfoTooltip } from "@dub/ui";
import { LoadingSpinner } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import { useState } from "react";
import { CheckoutEvmWalletPicker } from "@/components/dashboard/checkout/checkout-evm-wallet-picker";
import type { CctpFeeEstimate } from "@/lib/dashboard/cctp/types";
import type { EvmWalletProvider } from "@/lib/dashboard/evm/wallet-discovery";
import { formatTokenWithAsset } from "@/lib/dashboard/format/amount";

type CheckoutCctpWalletPanelProps = {
  quote: CctpFeeEstimate | null;
  wallets?: EvmWalletProvider[];
  address?: string | null;
  walletName?: string | null;
  isFetchingQuote?: boolean;
  isConnecting?: boolean;
  isPaying?: boolean;
  paymentBlocked?: boolean;
  preview?: boolean;
  statusLabel?: string | null;
  onConnect?: (walletId: string) => void;
  onPay: () => void;
};

function DetailRow({
  label,
  value,
  preview,
  tooltip,
}: {
  label: string;
  value: string;
  preview?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-1">
        <p className={cn("font-medium text-neutral-900", preview ? "text-[10px]" : "text-sm")}>
          {label}
        </p>
        {tooltip ? <InfoTooltip content={tooltip} /> : null}
      </div>
      <p className={cn("truncate font-mono text-neutral-500", preview ? "text-xs" : "text-sm")}>
        {value}
      </p>
    </div>
  );
}

export function CheckoutCctpWalletPanel({
  quote,
  wallets = [],
  address,
  walletName,
  isFetchingQuote,
  isConnecting,
  isPaying,
  paymentBlocked,
  preview,
  statusLabel,
  onConnect,
  onPay,
}: CheckoutCctpWalletPanelProps) {
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const isConnected = Boolean(address);
  const actionsDisabled =
    preview || paymentBlocked || isFetchingQuote || isConnecting || isPaying;
  const payDisabled = actionsDisabled || !quote || !isConnected;

  return (
    <div className={cn(preview ? "space-y-3" : "space-y-4")}>
      <div className="space-y-3">
        <div className="relative min-w-0">
          <p
            className={cn(
              "font-medium text-neutral-900",
              preview ? "text-[10px]" : "text-sm",
            )}
          >
            Wallet address
          </p>
          {isConnected ? (
            <button
              type="button"
              disabled={actionsDisabled}
              className={cn(
                "mt-0.5 block w-full text-left transition-colors",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
              onClick={() => setIsWalletPickerOpen(true)}
            >
              <span
                className={cn(
                  "block truncate text-neutral-500",
                  preview ? "text-xs" : "text-sm",
                )}
              >
                {walletName ? `${walletName} · ` : null}
                <span className="font-mono">{address}</span>
              </span>
            </button>
          ) : preview ? (
            <p className="mt-0.5 text-xs text-neutral-500">Tap to connect</p>
          ) : (
            <button
              type="button"
              disabled={actionsDisabled}
              className="mt-0.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => setIsWalletPickerOpen(true)}
            >
              Tap to connect
            </button>
          )}
          <CheckoutEvmWalletPicker
            wallets={wallets}
            selectedWalletName={walletName}
            isOpen={isWalletPickerOpen}
            disabled={actionsDisabled}
            onOpenChange={setIsWalletPickerOpen}
            onConnect={(walletId) => onConnect?.(walletId)}
          />
        </div>

        {isFetchingQuote && !quote ? (
          <div className={cn("flex items-center gap-2 text-neutral-500", preview ? "text-xs" : "text-sm")}>
            <LoadingSpinner className="size-3.5 shrink-0 text-neutral-500" />
            <span>Fetching bridge quote...</span>
          </div>
        ) : quote ? (
          <>
            <DetailRow
              label="Amount"
              value={formatTokenWithAsset(quote.paymentAmount, "USDC")}
              preview={preview}
            />
            <DetailRow
              label="Fee"
              value={formatTokenWithAsset(quote.totalFeeAmount, "USDC")}
              preview={preview}
              tooltip="Maximum network fee included in this payment."
            />
            <DetailRow
              label="Total"
              value={formatTokenWithAsset(quote.totalBurnAmount, "USDC")}
              preview={preview}
            />
          </>
        ) : isFetchingQuote ? null : (
          <p className={cn("text-neutral-500", preview ? "text-xs" : "text-sm")}>
            Bridge quote unavailable. Try again in a moment.
          </p>
        )}

        {statusLabel ? (
          <p className={cn("text-neutral-500", preview ? "text-xs" : "text-sm")}>
            {statusLabel}
          </p>
        ) : null}
      </div>

      <Button
        type="button"
        className={cn("w-full", preview ? "h-8 rounded-lg text-xs" : "h-10")}
        text={
          isConnected
            ? quote
              ? `Pay ${formatTokenWithAsset(quote.totalBurnAmount, "USDC")}`
              : "Pay"
            : "Connect wallet"
        }
        loading={isPaying || isConnecting}
        disabled={isConnected ? payDisabled : actionsDisabled}
        onClick={
          isConnected ? onPay : () => setIsWalletPickerOpen(true)
        }
      />
    </div>
  );
}
