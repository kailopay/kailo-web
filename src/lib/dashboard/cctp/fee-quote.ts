import {
  addPercentageBuffer,
  addUsdcDecimals,
} from "@/lib/dashboard/cctp/amounts";
import {
  getCctpChainConfig,
  STELLAR_CCTP_DOMAIN,
} from "@/lib/dashboard/cctp/chain-registry";
import { fetchCctpProtocolFee } from "@/lib/dashboard/cctp/iris-client";
import type {
  CctpCheckoutQuoteInput,
  CctpFeeEstimate,
  CctpTransferMode,
} from "@/lib/dashboard/cctp/types";

function getServiceFeeAmount() {
  return process.env.CCTP_SERVICE_FEE_USDC ?? "0.05";
}

function resolveTransferMode(
  requested: CctpTransferMode | undefined,
  fastTransferAvailable: boolean,
): CctpTransferMode {
  if (requested === "standard") {
    return "standard";
  }

  return fastTransferAvailable ? "fast" : "standard";
}

export async function calculateCctpCheckoutQuote(
  input: CctpCheckoutQuoteInput,
): Promise<CctpFeeEstimate> {
  const source = getCctpChainConfig(input.sourceChainId);

  if (source.id === "stellar") {
    return {
      chainId: source.id,
      destinationChainId: "stellar",
      transferMode: "standard",
      paymentAmount: input.paymentAmount,
      cctpFeeAmount: "0",
      bridgeFeeAmount: "0",
      totalFeeAmount: "0",
      totalBurnAmount: input.paymentAmount,
      maxFeeAmount: "0",
      estimatedTime: source.estimatedStandardTime,
      fastTransferAvailable: false,
      sourceDomain: source.domainId,
      destinationDomain: STELLAR_CCTP_DOMAIN,
    };
  }

  const transferMode = resolveTransferMode(input.transferMode, source.fastTransfer);
  const estimatedProtocolFee =
    transferMode === "fast"
      ? await fetchCctpProtocolFee({
          environment: input.environment,
          sourceDomain: source.domainId,
          destinationDomain: STELLAR_CCTP_DOMAIN,
          amount: input.paymentAmount,
        })
      : "0";
  const cctpFeeAmount =
    transferMode === "fast"
      ? addPercentageBuffer(estimatedProtocolFee, 20)
      : "0";
  const bridgeFeeAmount = getServiceFeeAmount();
  const totalFeeAmount = addUsdcDecimals(cctpFeeAmount, bridgeFeeAmount);
  const totalBurnAmount = addUsdcDecimals(
    input.paymentAmount,
    totalFeeAmount,
  );

  return {
    chainId: source.id,
    destinationChainId: "stellar",
    transferMode,
    paymentAmount: input.paymentAmount,
    cctpFeeAmount,
    bridgeFeeAmount,
    totalFeeAmount,
    totalBurnAmount,
    maxFeeAmount: cctpFeeAmount,
    estimatedTime:
      transferMode === "fast"
        ? source.estimatedFastTime
        : source.estimatedStandardTime,
    fastTransferAvailable: source.fastTransfer,
    sourceDomain: source.domainId,
    destinationDomain: STELLAR_CCTP_DOMAIN,
  };
}
