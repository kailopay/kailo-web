"use client";

import type { EIP1193Provider } from "viem";

type Eip6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

type Eip6963ProviderDetail = {
  info: Eip6963ProviderInfo;
  provider: EIP1193Provider;
};

export type EvmWalletProvider = {
  id: string;
  name: string;
  icon: string | null;
  provider: EIP1193Provider;
};

const COINBASE_WALLET_ICON = "/marketing/logos/coinbase.png";

function isCoinbaseWallet(info: Eip6963ProviderInfo) {
  const haystack = `${info.name} ${info.rdns}`.toLowerCase();
  return haystack.includes("coinbase");
}

function resolveWalletIcon(info: Eip6963ProviderInfo): string | null {
  if (isCoinbaseWallet(info)) {
    return COINBASE_WALLET_ICON;
  }

  if (
    info.icon.startsWith("data:image/") ||
    info.icon.startsWith("http://") ||
    info.icon.startsWith("https://")
  ) {
    return info.icon;
  }

  return null;
}

export function discoverEvmWallets(
  onChange: (wallets: EvmWalletProvider[]) => void,
) {
  const wallets = new Map<string, EvmWalletProvider>();

  function emit() {
    onChange(Array.from(wallets.values()));
  }

  function handleProvider(event: Event) {
    const { info, provider } = (event as CustomEvent<Eip6963ProviderDetail>)
      .detail;

    wallets.set(info.uuid, {
      id: info.uuid,
      name: info.name,
      icon: resolveWalletIcon(info),
      provider,
    });
    emit();
  }

  window.addEventListener("eip6963:announceProvider", handleProvider);
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  const fallbackTimer = window.setTimeout(() => {
    const injected = (
      window as typeof window & { ethereum?: EIP1193Provider }
    ).ethereum;

    if (wallets.size === 0 && injected) {
      wallets.set("injected", {
        id: "injected",
        name: "Browser wallet",
        icon: null,
        provider: injected,
      });
      emit();
    }
  }, 100);

  return () => {
    window.clearTimeout(fallbackTimer);
    window.removeEventListener("eip6963:announceProvider", handleProvider);
  };
}
