"use client";

import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
  parseAbi,
  type Address,
  type EIP1193Provider,
  type Hex,
} from "viem";
import { usdcAtomicToDecimal } from "@/lib/dashboard/cctp/amounts";

const erc20Abi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
]);

export type PreparedEvmCctpPayment = {
  family: "evm";
  chain: {
    id: string;
    name: string;
    chainId: number;
    chainIdHex: string;
    nativeFeeToken: string;
    rpcUrl: string;
    blockExplorerUrl: string | null;
    iconUrl: string;
  };
  tokenMessenger: Address;
  usdc: Address;
  amountAtomic: string;
  approveData: Hex;
  burnData: Hex;
};

async function switchNetwork(
  provider: EIP1193Provider,
  payment: PreparedEvmCctpPayment,
) {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: payment.chain.chainIdHex }],
    });
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? Number(error.code)
        : null;

    if (code !== 4902) {
      throw error;
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: payment.chain.chainIdHex,
          chainName: payment.chain.name,
          nativeCurrency: {
            name: payment.chain.nativeFeeToken,
            symbol: payment.chain.nativeFeeToken,
            decimals: 18,
          },
          rpcUrls: [payment.chain.rpcUrl],
          blockExplorerUrls: payment.chain.blockExplorerUrl
            ? [payment.chain.blockExplorerUrl]
            : undefined,
        },
      ],
    });
  }
}

export async function executeEvmCctpPayment(
  payment: PreparedEvmCctpPayment,
  provider: EIP1193Provider,
  onStatus?: (status: "connecting" | "approving" | "burning") => void,
) {
  onStatus?.("connecting");
  await switchNetwork(provider, payment);

  const chain = defineChain({
    id: payment.chain.chainId,
    name: payment.chain.name,
    nativeCurrency: {
      name: payment.chain.nativeFeeToken,
      symbol: payment.chain.nativeFeeToken,
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [payment.chain.rpcUrl] },
    },
    blockExplorers: payment.chain.blockExplorerUrl
      ? {
          default: {
            name: `${payment.chain.name} explorer`,
            url: payment.chain.blockExplorerUrl,
          },
        }
      : undefined,
  });
  const walletClient = createWalletClient({
    chain,
    transport: custom(provider),
  });
  const publicClient = createPublicClient({
    chain,
    transport: http(payment.chain.rpcUrl),
  });
  const [account] = await walletClient.requestAddresses();

  if (!account) {
    throw new Error("Wallet connection was cancelled.");
  }

  const requiredAmount = BigInt(payment.amountAtomic);
  const [balance, allowance] = await Promise.all([
    publicClient.readContract({
      address: payment.usdc,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [account],
    }),
    publicClient.readContract({
      address: payment.usdc,
      abi: erc20Abi,
      functionName: "allowance",
      args: [account, payment.tokenMessenger],
    }),
  ]);

  if (balance < requiredAmount) {
    throw new Error(
      `Insufficient USDC on ${payment.chain.name}. You need ${usdcAtomicToDecimal(requiredAmount)} USDC, but this wallet has ${usdcAtomicToDecimal(balance)} USDC.`,
    );
  }

  let approvalHash: Hex | null = null;
  if (allowance < requiredAmount) {
    onStatus?.("approving");
    approvalHash = await walletClient.sendTransaction({
      account,
      chain,
      to: payment.usdc,
      data: payment.approveData,
    });
    await publicClient.waitForTransactionReceipt({ hash: approvalHash });
  }

  await publicClient.estimateGas({
    account,
    to: payment.tokenMessenger,
    data: payment.burnData,
  });

  onStatus?.("burning");
  const burnHash = await walletClient.sendTransaction({
    account,
    chain,
    to: payment.tokenMessenger,
    data: payment.burnData,
  });
  await publicClient.waitForTransactionReceipt({ hash: burnHash });

  return {
    account,
    approvalHash,
    burnHash,
  };
}
