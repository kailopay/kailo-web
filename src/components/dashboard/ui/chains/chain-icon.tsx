"use client";

import { cn } from "@dub/utils";
import { useState } from "react";
import type { CctpChainId } from "@/lib/dashboard/cctp/types";
import { getCctpChainConfig } from "@/lib/dashboard/cctp/chain-registry";

const LOCAL_CHAIN_ICONS: Partial<Record<CctpChainId, string>> = {
  base: "/marketing/logos/coinbase.png",
};

const CHAIN_INITIALS: Record<CctpChainId, string> = {
  stellar: "S",
  ethereum: "E",
  base: "B",
  arbitrum: "A",
  polygon: "P",
  optimism: "OP",
  solana: "So",
};

function ChainIconFallback({
  chainId,
  className,
}: {
  chainId: CctpChainId;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-neutral-100 font-semibold text-neutral-600 ring-1 ring-neutral-200",
        className ?? "size-7 text-[10px]",
      )}
      aria-hidden
    >
      {CHAIN_INITIALS[chainId]}
    </span>
  );
}

export function ChainIcon({
  chainId,
  className,
}: {
  chainId: CctpChainId;
  className?: string;
}) {
  const config = getCctpChainConfig(chainId);
  const iconUrl = LOCAL_CHAIN_ICONS[chainId] ?? config.iconUrl;
  const [imageFailed, setImageFailed] = useState(false);

  if (!iconUrl || imageFailed) {
    return <ChainIconFallback chainId={chainId} className={className} />;
  }

  return (
    <img
      src={iconUrl}
      alt=""
      className={cn(
        "inline-block shrink-0 rounded-full object-cover ring-1 ring-neutral-200",
        className ?? "size-7",
      )}
      onError={() => setImageFailed(true)}
    />
  );
}
