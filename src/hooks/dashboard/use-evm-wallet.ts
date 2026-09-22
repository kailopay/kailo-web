"use client";

import { useCallback, useEffect, useState } from "react";
import type { EIP1193Provider } from "viem";
import {
  discoverEvmWallets,
  type EvmWalletProvider,
} from "@/lib/dashboard/evm/wallet-discovery";

const SELECTED_WALLET_KEY = "kailopay:evm-wallet";

type EventedEvmProvider = EIP1193Provider & {
  on?: (event: string, listener: (accounts: string[]) => void) => void;
  removeListener?: (
    event: string,
    listener: (accounts: string[]) => void,
  ) => void;
};

export function useEvmWallet() {
  const [wallets, setWallets] = useState<EvmWalletProvider[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  useEffect(() => discoverEvmWallets(setWallets), []);

  useEffect(() => {
    if (walletId || wallets.length === 0) {
      return;
    }

    const storedWalletId = sessionStorage.getItem(SELECTED_WALLET_KEY);
    const storedWallet = wallets.find((wallet) => wallet.id === storedWalletId);
    if (!storedWallet) {
      return;
    }

    void storedWallet.provider
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const [connectedAddress] = accounts as string[];
        if (connectedAddress) {
          setWalletId(storedWallet.id);
          setProvider(storedWallet.provider);
          setAddress(connectedAddress);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(SELECTED_WALLET_KEY);
      });
  }, [walletId, wallets]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    const eventedProvider = provider as EventedEvmProvider;
    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] ?? null);
    };

    eventedProvider.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      eventedProvider.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [provider]);

  const connect = useCallback(
    async (selectedWalletId: string) => {
      const wallet = wallets.find((item) => item.id === selectedWalletId);
      if (!wallet) {
        setConnectError("Wallet is no longer available.");
        return;
      }

      setIsConnecting(true);
      setConnectError(null);

      try {
        const accounts = (await wallet.provider.request({
          method: "eth_requestAccounts",
        })) as string[];
        const [connectedAddress] = accounts;

        if (!connectedAddress) {
          throw new Error("Wallet connection was cancelled.");
        }

        setAddress(connectedAddress);
        setWalletId(wallet.id);
        setProvider(wallet.provider);
        sessionStorage.setItem(SELECTED_WALLET_KEY, wallet.id);
      } catch {
        setConnectError("Wallet connection was cancelled or failed. Try again.");
      } finally {
        setIsConnecting(false);
      }
    },
    [wallets],
  );

  const disconnect = useCallback(() => {
    setAddress(null);
    setWalletId(null);
    setProvider(null);
    setConnectError(null);
    sessionStorage.removeItem(SELECTED_WALLET_KEY);
  }, []);

  const clearErrors = useCallback(() => {
    setConnectError(null);
  }, []);

  return {
    wallets,
    address,
    walletName:
      wallets.find((wallet) => wallet.id === walletId)?.name ?? null,
    provider,
    isConnecting,
    connectError,
    connect,
    disconnect,
    clearErrors,
  };
}
