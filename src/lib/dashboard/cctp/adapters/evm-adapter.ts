import {
  createPublicClient,
  decodeEventLog,
  decodeFunctionData,
  encodeFunctionData,
  http,
  parseAbi,
  type Hash,
  type Hex,
  type TransactionReceipt,
} from "viem";
import {
  getConfiguredCctpChain,
  STELLAR_CCTP_DOMAIN,
  STELLAR_CCTP_FORWARDER,
  STELLAR_TESTNET_CCTP_FORWARDER,
} from "@/lib/dashboard/cctp/chain-registry";
import {
  decimalToUsdcAtomic,
  usdcAtomicToDecimal,
} from "@/lib/dashboard/cctp/amounts";
import {
  buildCctpForwarderHookData,
  contractStrkeyToBytes32,
  parseCctpForwarderHookRecipient,
} from "@/lib/dashboard/cctp/hook-data";
import type {
  CctpChainId,
  CctpFeeEstimate,
  CctpTransferMode,
} from "@/lib/dashboard/cctp/types";
import type { Organization } from "@/lib/dashboard/db/schema";

const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

const tokenMessengerAbi = parseAbi([
  "function depositForBurnWithHook(uint256 amount, uint32 destinationDomain, bytes32 mintRecipient, address burnToken, bytes32 destinationCaller, uint256 maxFee, uint32 minFinalityThreshold, bytes hookData)",
]);

const DEPOSIT_FOR_BURN_WITH_HOOK_SELECTOR = "779b432d";

export type ExtractedEvmCctpBurn = {
  amount: bigint;
  destinationDomain: number;
  mintRecipient: Hex;
  burnToken: Hex;
  destinationCaller: Hex;
  maxFee: bigint;
  minFinalityThreshold: number;
  hookData: Hex;
  hookRecipient: string | null;
};

export type VerifiedEvmCctpBurn = {
  prepared: ReturnType<typeof buildEvmCctpPayment>;
  burn: ExtractedEvmCctpBurn;
  totalBurnAmount: string;
  maxFeeAmount: string;
};

export function buildEvmCctpPayment(input: {
  environment: Organization["environment"];
  sourceChainId: CctpChainId;
  destinationAddress: string;
  quote: CctpFeeEstimate;
}) {
  const chain = getConfiguredCctpChain(
    input.sourceChainId,
    input.environment,
  );

  if (
    chain.family !== "evm" ||
    !chain.activeEvmChainId ||
    !chain.activeTokenMessenger ||
    !chain.activeUsdc ||
    !chain.activeRpcUrl
  ) {
    throw new Error("This network is not available for CCTP payments.");
  }

  const forwarder =
    input.environment === "production"
      ? STELLAR_CCTP_FORWARDER
      : STELLAR_TESTNET_CCTP_FORWARDER;
  const forwarderBytes32 = contractStrkeyToBytes32(forwarder);
  const totalAmount = decimalToUsdcAtomic(input.quote.totalBurnAmount);
  const maxFee = decimalToUsdcAtomic(input.quote.maxFeeAmount);

  return {
    family: "evm" as const,
    chain: {
      id: chain.id,
      name:
        input.environment === "production"
          ? chain.label
          : (chain.testnetLabel ?? chain.label),
      chainId: chain.activeEvmChainId,
      chainIdHex: `0x${chain.activeEvmChainId.toString(16)}`,
      nativeFeeToken: chain.nativeFeeToken,
      rpcUrl: chain.activeRpcUrl,
      blockExplorerUrl: chain.activeBlockExplorerUrl,
      iconUrl: chain.iconUrl,
    },
    tokenMessenger: chain.activeTokenMessenger,
    usdc: chain.activeUsdc,
    amountAtomic: totalAmount.toString(),
    approveData: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [chain.activeTokenMessenger as `0x${string}`, totalAmount],
    }),
    burnData: encodeFunctionData({
      abi: tokenMessengerAbi,
      functionName: "depositForBurnWithHook",
      args: [
        totalAmount,
        STELLAR_CCTP_DOMAIN,
        forwarderBytes32,
        chain.activeUsdc as `0x${string}`,
        forwarderBytes32,
        maxFee,
        input.quote.transferMode === "fast" ? 1000 : 2000,
        buildCctpForwarderHookData(input.destinationAddress),
      ],
    }),
  };
}

export function extractDepositForBurnCalls(input: Hex): ExtractedEvmCctpBurn[] {
  const normalized = input.toLowerCase().replace(/^0x/, "");
  const burns: ExtractedEvmCctpBurn[] = [];
  let searchFrom = 0;

  while (searchFrom < normalized.length) {
    const selectorIndex = normalized.indexOf(
      DEPOSIT_FOR_BURN_WITH_HOOK_SELECTOR,
      searchFrom,
    );

    if (selectorIndex === -1) {
      break;
    }

    const calldata = `0x${normalized.slice(selectorIndex)}` as Hex;

    try {
      const decoded = decodeFunctionData({
        abi: tokenMessengerAbi,
        data: calldata,
      });

      if (decoded.functionName !== "depositForBurnWithHook") {
        searchFrom = selectorIndex + 8;
        continue;
      }

      const [
        amount,
        destinationDomain,
        mintRecipient,
        burnToken,
        destinationCaller,
        maxFee,
        minFinalityThreshold,
        hookData,
      ] = decoded.args;

      burns.push({
        amount,
        destinationDomain,
        mintRecipient,
        burnToken: burnToken.toLowerCase() as Hex,
        destinationCaller,
        maxFee,
        minFinalityThreshold,
        hookData,
        hookRecipient: parseCctpForwarderHookRecipient(hookData),
      });
    } catch {
      // Keep scanning for nested relay/bundler calldata.
    }

    searchFrom = selectorIndex + 8;
  }

  return burns;
}

function expectedMinFinalityThreshold(transferMode: CctpTransferMode) {
  return transferMode === "fast" ? 1000 : 2000;
}

function payerFundedBurn(
  receipt: TransactionReceipt,
  usdcAddress: string,
  payerAddress: string,
  minAmount: bigint,
) {
  const normalizedUsdc = usdcAddress.toLowerCase();
  const normalizedPayer = payerAddress.toLowerCase();

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== normalizedUsdc) {
      continue;
    }

    try {
      const decoded = decodeEventLog({
        abi: erc20Abi,
        data: log.data,
        topics: log.topics,
      });

      if (decoded.eventName !== "Transfer") {
        continue;
      }

      if (
        decoded.args.from.toLowerCase() === normalizedPayer &&
        decoded.args.value >= minAmount
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}

function selectMatchingBurn(input: {
  burns: ExtractedEvmCctpBurn[];
  destinationAddress: string;
  paymentAmount: string;
  transferMode: CctpTransferMode;
  forwarderBytes32: Hex;
  usdcAddress: string;
}) {
  const minPaymentAmount = decimalToUsdcAtomic(input.paymentAmount);
  const expectedThreshold = expectedMinFinalityThreshold(input.transferMode);
  const normalizedUsdc = input.usdcAddress.toLowerCase();
  const normalizedForwarder = input.forwarderBytes32.toLowerCase();
  const normalizedDestination = input.destinationAddress.toLowerCase();

  return (
    input.burns.find((burn) => {
      if (burn.destinationDomain !== STELLAR_CCTP_DOMAIN) {
        return false;
      }

      if (burn.burnToken !== normalizedUsdc) {
        return false;
      }

      if (burn.amount < minPaymentAmount) {
        return false;
      }

      if (burn.minFinalityThreshold !== expectedThreshold) {
        return false;
      }

      if (burn.mintRecipient.toLowerCase() !== normalizedForwarder) {
        return false;
      }

      if (burn.destinationCaller.toLowerCase() !== normalizedForwarder) {
        return false;
      }

      if (burn.hookRecipient?.toLowerCase() !== normalizedDestination) {
        return false;
      }

      return true;
    }) ?? null
  );
}

export async function verifyEvmCctpBurn(input: {
  environment: Organization["environment"];
  sourceChainId: CctpChainId;
  destinationAddress: string;
  paymentAmount: string;
  transferMode: CctpTransferMode;
  burnTxHash: string;
  payerAddress?: string | null;
}): Promise<VerifiedEvmCctpBurn> {
  const quote: CctpFeeEstimate = {
    chainId: input.sourceChainId,
    destinationChainId: "stellar",
    transferMode: input.transferMode,
    paymentAmount: input.paymentAmount,
    cctpFeeAmount: "0",
    bridgeFeeAmount: "0",
    totalFeeAmount: "0",
    totalBurnAmount: input.paymentAmount,
    maxFeeAmount: "0",
    estimatedTime: "",
    fastTransferAvailable: true,
    sourceDomain: 0,
    destinationDomain: STELLAR_CCTP_DOMAIN,
  };

  const prepared = buildEvmCctpPayment({
    environment: input.environment,
    sourceChainId: input.sourceChainId,
    destinationAddress: input.destinationAddress,
    quote,
  });

  const forwarder =
    input.environment === "production"
      ? STELLAR_CCTP_FORWARDER
      : STELLAR_TESTNET_CCTP_FORWARDER;
  const forwarderBytes32 = contractStrkeyToBytes32(forwarder);

  const client = createPublicClient({
    transport: http(prepared.chain.rpcUrl),
  });
  const hash = input.burnTxHash as Hash;
  const [transaction, receipt] = await Promise.all([
    client.getTransaction({ hash }),
    client.getTransactionReceipt({ hash }),
  ]);

  if (receipt.status !== "success") {
    throw new Error("The CCTP burn transaction failed.");
  }

  const burns = extractDepositForBurnCalls(transaction.input);
  const burn = selectMatchingBurn({
    burns,
    destinationAddress: input.destinationAddress,
    paymentAmount: input.paymentAmount,
    transferMode: input.transferMode,
    forwarderBytes32,
    usdcAddress: prepared.usdc,
  });

  if (!burn) {
    throw new Error("The burn transaction does not match this payment.");
  }

  if (input.payerAddress) {
    const payerMatchesSender =
      transaction.from.toLowerCase() === input.payerAddress.toLowerCase();
    const payerMatchesTransfer = payerFundedBurn(
      receipt,
      prepared.usdc,
      input.payerAddress,
      burn.amount,
    );

    if (!payerMatchesSender && !payerMatchesTransfer) {
      throw new Error("The burn transaction was sent by a different wallet.");
    }
  }

  return {
    prepared,
    burn,
    totalBurnAmount: usdcAtomicToDecimal(burn.amount),
    maxFeeAmount: usdcAtomicToDecimal(burn.maxFee),
  };
}
