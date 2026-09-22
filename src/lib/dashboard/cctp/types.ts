import type { Organization } from "@/lib/dashboard/db/schema";

export type CctpChainFamily = "evm" | "solana";

export type CctpChainId =
  | "stellar"
  | "ethereum"
  | "base"
  | "arbitrum"
  | "polygon"
  | "optimism"
  | "solana";

export type CctpTransferMode = "fast" | "standard";

export type CctpChainConfig = {
  id: CctpChainId;
  label: string;
  testnetLabel?: string;
  family: CctpChainFamily | "stellar";
  domainId: number;
  fastTransfer: boolean;
  estimatedFastTime: string;
  estimatedStandardTime: string;
  nativeFeeToken: string;
  iconUrl: string;
  evmChainId?: number;
  testnetEvmChainId?: number;
  tokenMessenger?: string;
  testnetTokenMessenger?: string;
  usdc?: string;
  testnetUsdc?: string;
  rpcUrl?: string;
  testnetRpcUrl?: string;
  blockExplorerUrl?: string;
  testnetBlockExplorerUrl?: string;
};

export type CctpConfiguredChain = CctpChainConfig & {
  activeEvmChainId: number | null;
  activeTokenMessenger: string | null;
  activeUsdc: string | null;
  activeRpcUrl: string | null;
  activeBlockExplorerUrl: string | null;
};

export type CctpFeeEstimate = {
  chainId: CctpChainId;
  destinationChainId: "stellar";
  transferMode: CctpTransferMode;
  paymentAmount: string;
  cctpFeeAmount: string;
  bridgeFeeAmount: string;
  totalFeeAmount: string;
  totalBurnAmount: string;
  maxFeeAmount: string;
  estimatedTime: string;
  fastTransferAvailable: boolean;
  sourceDomain: number;
  destinationDomain: number;
};

export type CctpCheckoutQuoteInput = {
  environment: Organization["environment"];
  sourceChainId: CctpChainId;
  paymentAmount: string;
  transferMode?: CctpTransferMode;
};

export type CctpBurnSubmissionInput = {
  sourceChainId: CctpChainId;
  burnTxHash: string;
  payerAddress?: string | null;
  quote: CctpFeeEstimate;
};
