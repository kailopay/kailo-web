"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check2 } from "@dub/ui/icons";
import { cn } from "@dub/utils";
import type { EvmWalletProvider } from "@/lib/dashboard/evm/wallet-discovery";

export function CheckoutEvmWalletPicker({
  wallets,
  selectedWalletName,
  isOpen,
  disabled,
  onOpenChange,
  onConnect,
}: {
  wallets: EvmWalletProvider[];
  selectedWalletName?: string | null;
  isOpen: boolean;
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (walletId: string) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close wallet picker"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-50 mt-2 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg"
          >
            {wallets.length > 0 ? (
              <div className="grid max-h-72 gap-0.5 overflow-y-auto">
                {wallets.map((wallet) => {
                  const isSelected = wallet.name === selectedWalletName;

                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onConnect(wallet.id);
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg p-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-neutral-100 text-neutral-900"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 bg-cover bg-center text-xs font-semibold ring-1 ring-neutral-200"
                          style={
                            wallet.icon
                              ? { backgroundImage: `url("${wallet.icon}")` }
                              : undefined
                          }
                        >
                          {wallet.icon ? null : wallet.name.slice(0, 1)}
                        </span>
                        <span className="truncate text-sm font-medium">
                          {wallet.name}
                        </span>
                      </span>
                      {isSelected ? (
                        <Check2 className="size-4 shrink-0 text-neutral-900" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="px-3 py-4 text-center text-sm text-neutral-500">
                No compatible browser wallet found.
              </p>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
