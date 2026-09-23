"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { SettingsSection } from "@/components/dashboard/ui/settings/settings-section";
import { ConnectedWallet } from "@/components/dashboard/ui/wallet/connected-wallet";
import { SmoothSkeleton } from "@/components/dashboard/ui/shared/smooth-skeleton";
import { useSettlementWalletConnection } from "@/hooks/dashboard/use-settlement-wallet-connection";
import { useAsyncData } from "@/hooks/dashboard/use-async-data";
import { developerErrorMessage } from "@/lib/kailopay/developer/access";
import type { DeveloperWallet } from "@/lib/kailopay/developer/types";
import {
  createSep10Proof,
  listDeveloperWallets,
  registerDeveloperWallet,
  revokeDeveloperWallet,
  walletErrorMessage,
} from "@/lib/kailopay/developer/wallets";
import { Button } from "@dub/ui";

function walletLabelForAccount(address: string) {
  return `Wallet ${address.slice(0, 4)}…${address.slice(-4)}`;
}

function getActiveDeveloperWallet(
  wallets: DeveloperWallet[] | undefined,
): DeveloperWallet | null {
  if (!wallets?.length) {
    return null;
  }

  const activeWallets = wallets.filter((wallet) => wallet.status === "active");
  return activeWallets.find((wallet) => wallet.is_primary) ?? activeWallets[0] ?? null;
}

export function DeveloperWalletsPanel() {
  const {
    networkError,
    connectError,
    isConnecting,
    isReady,
    connect,
    changeWallet,
    networkLabel,
  } = useSettlementWalletConnection("sandbox");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchWallets = useCallback(async () => listDeveloperWallets(), []);
  const { data: wallets, error, isLoading, reload } = useAsyncData(fetchWallets, []);

  const activeWallet = useMemo(() => getActiveDeveloperWallet(wallets), [wallets]);
  const isConfigured = Boolean(activeWallet);
  const isBusy = isConnecting || isSubmitting || isDisconnecting;
  const displayError = formError ?? networkError ?? connectError;

  async function handleConnectAndSave() {
    setFormError(null);

    const connection = await connect();
    if (!connection) {
      return;
    }

    setIsSubmitting(true);
    try {
      const sep10Token = await createSep10Proof(connection.address);
      const registered = await registerDeveloperWallet({
        walletAccount: connection.address,
        label: walletLabelForAccount(connection.address),
        sep10Token,
        isPrimary: true,
      });

      const otherActiveWallets =
        wallets?.filter(
          (wallet) => wallet.status === "active" && wallet.id !== registered.id,
        ) ?? [];

      if (otherActiveWallets.length > 0) {
        await Promise.all(otherActiveWallets.map((wallet) => revokeDeveloperWallet(wallet.id)));
      }

      toast.success(isConfigured ? "Wallet updated" : "Wallet connected");
      reload();
    } catch (submitError) {
      setFormError(walletErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDisconnect() {
    if (!activeWallet) {
      return;
    }

    setIsDisconnecting(true);
    setFormError(null);
    try {
      await revokeDeveloperWallet(activeWallet.id);
      await changeWallet();
      toast.success("Wallet disconnected");
      reload();
    } catch (disconnectError) {
      setFormError(walletErrorMessage(disconnectError));
    } finally {
      setIsDisconnecting(false);
    }
  }

  if (isLoading && !wallets) {
    return (
      <div className="mb-6">
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="space-y-4 p-6">
            <SmoothSkeleton className="h-5 w-36" />
            <SmoothSkeleton className="h-4 w-full max-w-md" />
            <SmoothSkeleton className="h-10 w-full max-w-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-6">
      <SettingsSection
        title="Developer wallet"
        description="Connect and verify your Stellar wallet with SEP-10."
        helpText={
          isConfigured
            ? "Update the connected wallet or disconnect it from your account."
            : "Connect a wallet to use with your integration."
        }
        action={
          <div className="flex flex-wrap gap-2">
            {isConfigured ? (
              <Button
                type="button"
                variant="outline"
                text="Disconnect"
                loading={isDisconnecting}
                disabled={isBusy}
                onClick={() => void handleDisconnect()}
              />
            ) : null}
            <Button
              type="button"
              text={isConfigured ? "Update wallet" : "Connect wallet"}
              loading={isConnecting || isSubmitting}
              disabled={!isReady || isBusy}
              onClick={() => void handleConnectAndSave()}
            />
          </div>
        }
      >
        <div className="space-y-4">
          {displayError ? <p className="text-sm text-red-600">{displayError}</p> : null}
          {error ? (
            <p className="text-sm text-red-600">{developerErrorMessage(error)}</p>
          ) : null}

          {isConfigured ? (
            <ConnectedWallet
              address={activeWallet!.wallet_account}
              networkLabel={networkLabel}
            />
          ) : (
            <p className="text-sm text-neutral-500">No wallet connected yet.</p>
          )}
        </div>
      </SettingsSection>
    </div>
  );
}
