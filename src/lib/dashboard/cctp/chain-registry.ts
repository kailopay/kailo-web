import type {
  CctpChainConfig,
  CctpChainId,
  CctpConfiguredChain,
} from "@/lib/dashboard/cctp/types";
import type { Organization } from "@/lib/dashboard/db/schema";

export const STELLAR_CCTP_DOMAIN = 27;

export const STELLAR_CCTP_FORWARDER =
  "CBZL2IH7F6BIDAA3WBNXYKIXSATJGMSW7K5P5MJ6STX5RXN47TZJDF5T";
export const STELLAR_TESTNET_CCTP_FORWARDER =
  "CA66Q2WFBND6V4UEB7RD4SAXSVIWMD6RA4X3U32ELVFGXV5PJK4T4VSZ";

const CCTP_TOKEN_MESSENGER_MAINNET =
  "0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d";
const CCTP_TOKEN_MESSENGER_TESTNET =
  "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA";
const ICON_BASE =
  "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains";

export const CCTP_CHAIN_CONFIGS: Record<CctpChainId, CctpChainConfig> = {
  stellar: {
    id: "stellar",
    label: "Stellar",
    family: "stellar",
    domainId: STELLAR_CCTP_DOMAIN,
    fastTransfer: false,
    estimatedFastTime: "~5 sec",
    estimatedStandardTime: "~5 sec",
    nativeFeeToken: "XLM",
    iconUrl: `${ICON_BASE}/stellar/info/logo.png`,
  },
  ethereum: {
    id: "ethereum",
    label: "Ethereum",
    testnetLabel: "Ethereum Sepolia",
    family: "evm",
    domainId: 0,
    evmChainId: 1,
    fastTransfer: true,
    estimatedFastTime: "~20 sec",
    estimatedStandardTime: "15-19 min",
    nativeFeeToken: "ETH",
    iconUrl: `${ICON_BASE}/ethereum/info/logo.png`,
    testnetEvmChainId: 11155111,
    tokenMessenger: CCTP_TOKEN_MESSENGER_MAINNET,
    testnetTokenMessenger: CCTP_TOKEN_MESSENGER_TESTNET,
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    testnetUsdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    testnetRpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    blockExplorerUrl: "https://etherscan.io",
    testnetBlockExplorerUrl: "https://sepolia.etherscan.io",
  },
  base: {
    id: "base",
    label: "Base",
    testnetLabel: "Base Sepolia",
    family: "evm",
    domainId: 6,
    evmChainId: 8453,
    fastTransfer: true,
    estimatedFastTime: "~8 sec",
    estimatedStandardTime: "15-19 min",
    nativeFeeToken: "ETH",
    iconUrl: "https://icons.llamao.fi/icons/chains/rsz_base.jpg",
    testnetEvmChainId: 84532,
    tokenMessenger: CCTP_TOKEN_MESSENGER_MAINNET,
    testnetTokenMessenger: CCTP_TOKEN_MESSENGER_TESTNET,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    testnetUsdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    rpcUrl: "https://mainnet.base.org",
    testnetRpcUrl: "https://sepolia.base.org",
    blockExplorerUrl: "https://basescan.org",
    testnetBlockExplorerUrl: "https://sepolia.basescan.org",
  },
  arbitrum: {
    id: "arbitrum",
    label: "Arbitrum",
    testnetLabel: "Arbitrum Sepolia",
    family: "evm",
    domainId: 3,
    evmChainId: 42161,
    fastTransfer: true,
    estimatedFastTime: "~8 sec",
    estimatedStandardTime: "15-19 min",
    nativeFeeToken: "ETH",
    iconUrl: `${ICON_BASE}/arbitrum/info/logo.png`,
    testnetEvmChainId: 421614,
    tokenMessenger: CCTP_TOKEN_MESSENGER_MAINNET,
    testnetTokenMessenger: CCTP_TOKEN_MESSENGER_TESTNET,
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    testnetUsdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    testnetRpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorerUrl: "https://arbiscan.io",
    testnetBlockExplorerUrl: "https://sepolia.arbiscan.io",
  },
  polygon: {
    id: "polygon",
    label: "Polygon",
    testnetLabel: "Polygon Amoy",
    family: "evm",
    domainId: 7,
    evmChainId: 137,
    fastTransfer: false,
    estimatedFastTime: "~8 sec",
    estimatedStandardTime: "~8 sec",
    nativeFeeToken: "POL",
    iconUrl: `${ICON_BASE}/polygon/info/logo.png`,
    testnetEvmChainId: 80002,
    tokenMessenger: CCTP_TOKEN_MESSENGER_MAINNET,
    testnetTokenMessenger: CCTP_TOKEN_MESSENGER_TESTNET,
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    testnetUsdc: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    rpcUrl: "https://polygon-bor-rpc.publicnode.com",
    testnetRpcUrl: "https://rpc-amoy.polygon.technology",
    blockExplorerUrl: "https://polygonscan.com",
    testnetBlockExplorerUrl: "https://amoy.polygonscan.com",
  },
  optimism: {
    id: "optimism",
    label: "OP Mainnet",
    testnetLabel: "OP Sepolia",
    family: "evm",
    domainId: 2,
    evmChainId: 10,
    fastTransfer: true,
    estimatedFastTime: "~8 sec",
    estimatedStandardTime: "15-19 min",
    nativeFeeToken: "ETH",
    iconUrl: `${ICON_BASE}/optimism/info/logo.png`,
    testnetEvmChainId: 11155420,
    tokenMessenger: CCTP_TOKEN_MESSENGER_MAINNET,
    testnetTokenMessenger: CCTP_TOKEN_MESSENGER_TESTNET,
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    testnetUsdc: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    rpcUrl: "https://mainnet.optimism.io",
    testnetRpcUrl: "https://sepolia.optimism.io",
    blockExplorerUrl: "https://optimistic.etherscan.io",
    testnetBlockExplorerUrl: "https://sepolia-optimism.etherscan.io",
  },
  solana: {
    id: "solana",
    label: "Solana",
    testnetLabel: "Solana Devnet",
    family: "solana",
    domainId: 5,
    fastTransfer: true,
    estimatedFastTime: "~8 sec",
    estimatedStandardTime: "~25 sec",
    nativeFeeToken: "SOL",
    iconUrl: `${ICON_BASE}/solana/info/logo.png`,
    tokenMessenger: "CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe",
    testnetTokenMessenger: "CCTPV2vPZJS2u2BBsUoscuikbYjnpFmbFsvVuJdgUMQe",
    usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    testnetUsdc: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    testnetRpcUrl: "https://api.devnet.solana.com",
    blockExplorerUrl: "https://solscan.io",
    testnetBlockExplorerUrl: "https://explorer.solana.com",
  },
};

export const CCTP_CHECKOUT_CHAIN_IDS: CctpChainId[] = [
  "stellar",
  "base",
  "ethereum",
  "arbitrum",
  "polygon",
  "optimism",
];

export function getCctpChainConfig(chainId: CctpChainId): CctpChainConfig {
  return CCTP_CHAIN_CONFIGS[chainId];
}

export function isCctpChainId(value: string): value is CctpChainId {
  return value in CCTP_CHAIN_CONFIGS;
}

export function getConfiguredCctpChain(
  chainId: CctpChainId,
  environment: Organization["environment"],
): CctpConfiguredChain {
  const config = getCctpChainConfig(chainId);
  const isProduction = environment === "production";

  return {
    ...config,
    activeEvmChainId:
      config.family === "evm"
        ? (isProduction ? config.evmChainId : config.testnetEvmChainId) ?? null
        : null,
    activeTokenMessenger:
      (isProduction ? config.tokenMessenger : config.testnetTokenMessenger) ?? null,
    activeUsdc: (isProduction ? config.usdc : config.testnetUsdc) ?? null,
    activeRpcUrl: (isProduction ? config.rpcUrl : config.testnetRpcUrl) ?? null,
    activeBlockExplorerUrl:
      (isProduction ? config.blockExplorerUrl : config.testnetBlockExplorerUrl) ??
      null,
  };
}

export function getCheckoutCctpChains() {
  return CCTP_CHECKOUT_CHAIN_IDS.map((id) => CCTP_CHAIN_CONFIGS[id]);
}
