"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check2, PenWriting } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import {
  getCheckoutCctpChains,
  getCctpChainConfig,
} from "@/lib/dashboard/cctp/chain-registry";
import type { CctpChainId } from "@/lib/dashboard/cctp/types";
import { ChainIcon } from "@/components/dashboard/ui/chains/chain-icon";

export function CheckoutNetworkSelector({
  selectedNetwork,
  isOpen,
  disabled,
  preview,
  onOpenChange,
  onNetworkChange,
}: {
  selectedNetwork: CctpChainId;
  isOpen: boolean;
  disabled?: boolean;
  preview?: boolean;
  onOpenChange: (open: boolean) => void;
  onNetworkChange: (network: CctpChainId) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = getCctpChainConfig(selectedNetwork);
  const options = getCheckoutCctpChains();

  useEffect(() => {
    if (!isOpen || preview) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      onOpenChange(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange, preview]);

  return (
    <div ref={rootRef} className="relative flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className={cn("font-medium text-neutral-900", preview ? "text-[10px]" : "text-sm")}>
          Network
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <ChainIcon chainId={selected.id} className="size-5 text-[8px]" />
          <p className={cn("truncate text-neutral-500", preview ? "text-xs" : "text-sm")}>
            {selected.label}
          </p>
        </div>
      </div>
      {!preview ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onOpenChange(!isOpen)}
          className={cn(
            "shrink-0 rounded-md p-1 text-neutral-400 transition-colors",
            "hover:bg-neutral-100 hover:text-neutral-900",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
          aria-label="Change network"
        >
          <PenWriting className="size-4" />
        </button>
      ) : null}

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
          >
            <div className="grid max-h-[280px] gap-0.5 overflow-y-auto">
              {options.map((chain) => {
                const isSelected = selectedNetwork === chain.id;

                return (
                  <button
                    key={chain.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onNetworkChange(chain.id);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-all",
                      isSelected
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <ChainIcon chainId={chain.id} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{chain.label}</span>
                        <span className="block truncate text-xs text-neutral-500">
                          {chain.id === "stellar" ? "Native payment" : `USDC on ${chain.label}`}
                        </span>
                      </span>
                    </span>
                    {isSelected ? <Check2 className="size-4 text-neutral-900" /> : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
