import { Asset, Horizon } from "@stellar/stellar-sdk";
import {
  calculateMerchantSettlementAmount,
} from "@/constants/dashboard/payments/defaults";
import type { AllowedAsset } from "@/lib/dashboard/assets/types";
import type { Organization } from "@/lib/dashboard/db/schema";
import { applySendMaxBuffer } from "@/lib/dashboard/pricing/quotes";
import { resolveStellarAsset } from "@/lib/dashboard/stellar/assets";
import { getHorizonUrl } from "@/lib/dashboard/stellar/network";
import { isLiquiditySettlementError } from "@/lib/dashboard/stellar/errors";
import { buildPathPaymentStrictReceiveXdr } from "@/lib/dashboard/stellar/payments";

export type CrossAssetSettlementDiagnosisInput = {
  environment: Organization["environment"];
  operatorPublicKey: string;
  merchantAddress: string;
  paidAsset: AllowedAsset;
  receivedAmount: string;
  settlementAsset: AllowedAsset;
  quotedSettlementAmount?: string | null;
  merchantSettlementAmount?: string | null;
};

export type CrossAssetSettlementDiagnosis = {
  merchantSettlementAmount: string;
  sendMax: string;
  pathPayment: {
    available: boolean;
    bestSourceAmount: string | null;
    path: string[];
    error: string | null;
  };
  operatorBalances: {
    paidAsset: string;
    settlementAsset: string;
  };
  directSettlement: {
    possible: boolean;
    reason: string | null;
  };
  pathBuild: {
    ok: boolean;
    error: string | null;
  };
  expectedOutcome: "path_payment" | "direct_usdc" | "paid_asset_fallback";
  summary: string;
};

function formatBalance(
  environment: Organization["environment"],
  asset: AllowedAsset,
  balance: string,
) {
  return `${balance} ${asset.asset_code}`;
}

async function readOperatorBalance(
  server: Horizon.Server,
  operatorPublicKey: string,
  asset: AllowedAsset,
  environment: Organization["environment"],
) {
  const account = await server.loadAccount(operatorPublicKey);
  const stellarAsset = resolveStellarAsset(
    {
      assetCode: asset.asset_code,
      issuerAddress: asset.issuer_address,
    },
    environment,
  );

  if (stellarAsset.isNative()) {
    const native = account.balances.find(
      (balance) => balance.asset_type === "native",
    );
    return native?.balance ?? "0";
  }

  const credit = account.balances.find(
    (balance) =>
      (balance.asset_type === "credit_alphanum4" ||
        balance.asset_type === "credit_alphanum12") &&
      balance.asset_code === stellarAsset.code &&
      balance.asset_issuer === stellarAsset.issuer,
  );

  return credit?.balance ?? "0";
}

function describePath(path: Array<{
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}>) {
  return path.map((node) => {
    if (node.asset_type === "native") {
      return "XLM";
    }

    return node.asset_code ?? "unknown";
  });
}

export async function diagnoseCrossAssetSettlement(
  input: CrossAssetSettlementDiagnosisInput,
): Promise<CrossAssetSettlementDiagnosis> {
  const server = new Horizon.Server(getHorizonUrl(input.environment));
  const grossSettlementAmount =
    input.quotedSettlementAmount ?? input.receivedAmount;
  const merchantSettlementAmount =
    input.merchantSettlementAmount ??
    calculateMerchantSettlementAmount(grossSettlementAmount);
  const sendMax = applySendMaxBuffer(input.receivedAmount);

  const sendStellarAsset = resolveStellarAsset(
    {
      assetCode: input.paidAsset.asset_code,
      issuerAddress: input.paidAsset.issuer_address,
    },
    input.environment,
  );
  const destStellarAsset = resolveStellarAsset(
    {
      assetCode: input.settlementAsset.asset_code,
      issuerAddress: input.settlementAsset.issuer_address,
    },
    input.environment,
  );

  const [paidBalance, settlementBalance] = await Promise.all([
    readOperatorBalance(
      server,
      input.operatorPublicKey,
      input.paidAsset,
      input.environment,
    ),
    readOperatorBalance(
      server,
      input.operatorPublicKey,
      input.settlementAsset,
      input.environment,
    ),
  ]);

  let pathPayment: CrossAssetSettlementDiagnosis["pathPayment"] = {
    available: false,
    bestSourceAmount: null,
    path: [],
    error: null,
  };

  try {
    const paths = await server
      .strictReceivePaths(
        [sendStellarAsset],
        destStellarAsset,
        merchantSettlementAmount,
      )
      .call();

    if (!paths.records.length) {
      pathPayment = {
        available: false,
        bestSourceAmount: null,
        path: [],
        error: `No liquidity path from ${input.paidAsset.asset_code} to ${input.settlementAsset.asset_code}`,
      };
    } else {
      const best = paths.records[0] as {
        source_amount: string;
        path?: Array<{
          asset_type: string;
          asset_code?: string;
          asset_issuer?: string;
        }>;
      };

      pathPayment = {
        available: true,
        bestSourceAmount: best.source_amount,
        path: describePath(best.path ?? []),
        error: null,
      };
    }
  } catch (error) {
    pathPayment = {
      available: false,
      bestSourceAmount: null,
      path: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }

  const sendMaxNumeric = Number(sendMax);
  const operatorPaidNumeric = Number(paidBalance);
  const operatorSettlementNumeric = Number(settlementBalance);
  const merchantNumeric = Number(merchantSettlementAmount);

  const pathWouldWork =
    pathPayment.available &&
    pathPayment.bestSourceAmount !== null &&
    operatorPaidNumeric >= Number(pathPayment.bestSourceAmount) &&
    operatorPaidNumeric >= sendMaxNumeric;

  const directPossible = operatorSettlementNumeric >= merchantNumeric;

  let pathBuild: CrossAssetSettlementDiagnosis["pathBuild"] = {
    ok: false,
    error: null,
  };

  try {
    await buildPathPaymentStrictReceiveXdr({
      sourcePublicKey: input.operatorPublicKey,
      destinationPublicKey: input.merchantAddress,
      sendAsset: {
        assetCode: input.paidAsset.asset_code,
        issuerAddress: input.paidAsset.issuer_address,
      },
      sendMax,
      destAsset: {
        assetCode: input.settlementAsset.asset_code,
        issuerAddress: input.settlementAsset.issuer_address,
      },
      destAmount: merchantSettlementAmount,
      environment: input.environment,
      memo: undefined,
    });
    pathBuild = { ok: true, error: null };
  } catch (error) {
    pathBuild = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  let expectedOutcome: CrossAssetSettlementDiagnosis["expectedOutcome"];
  let summary: string;

  if (pathWouldWork && pathBuild.ok) {
    expectedOutcome = "path_payment";
    summary =
      "Path payment should succeed: operator holds enough XLM and Horizon reports a valid route.";
  } else if (directPossible) {
    expectedOutcome = "direct_usdc";
    summary =
      "Path payment is unavailable or underfunded, but operator can pay USDC directly.";
  } else {
    expectedOutcome = "paid_asset_fallback";
    const reasons: string[] = [];

    if (!pathPayment.available) {
      reasons.push(
        pathPayment.error ??
          `no ${input.paidAsset.asset_code}→${input.settlementAsset.asset_code} path on Horizon`,
      );
    } else if (!pathBuild.ok) {
      reasons.push(pathBuild.error ?? "path payment XDR could not be built");
    } else if (operatorPaidNumeric < Number(pathPayment.bestSourceAmount ?? 0)) {
      reasons.push(
        `operator XLM (${paidBalance}) is below path source amount (${pathPayment.bestSourceAmount})`,
      );
    }

    if (!directPossible) {
      reasons.push(
        `operator ${input.settlementAsset.asset_code} balance (${settlementBalance}) is below merchant amount (${merchantSettlementAmount})`,
      );
    }

    summary = `Settlement falls back to paid asset because: ${reasons.join("; ")}.`;
  }

  return {
    merchantSettlementAmount,
    sendMax,
    pathPayment,
    operatorBalances: {
      paidAsset: formatBalance(
        input.environment,
        input.paidAsset,
        paidBalance,
      ),
      settlementAsset: formatBalance(
        input.environment,
        input.settlementAsset,
        settlementBalance,
      ),
    },
    directSettlement: {
      possible: directPossible,
      reason: directPossible
        ? null
        : `Operator needs at least ${merchantSettlementAmount} ${input.settlementAsset.asset_code}`,
    },
    pathBuild,
    expectedOutcome,
    summary,
  };
}

export function classifySettlementFailure(error: unknown) {
  const message =
    error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("no liquidity path")) {
    return "no_path";
  }

  if (isLiquiditySettlementError(error)) {
    return "liquidity";
  }

  if (lower.includes("trustline")) {
    return "trustline";
  }

  return "other";
}

export function assetFromPaymentFields(input: {
  assetCode: string;
  issuerAddress?: string | null;
}): AllowedAsset {
  return {
    asset_code: input.assetCode,
    issuer_address: input.issuerAddress ?? null,
  };
}

export function horizonAssetsForDiagnosis(
  paidAsset: AllowedAsset,
  settlementAsset: AllowedAsset,
  environment: Organization["environment"],
) {
  return {
    send: resolveStellarAsset(
      {
        assetCode: paidAsset.asset_code,
        issuerAddress: paidAsset.issuer_address,
      },
      environment,
    ),
    dest: resolveStellarAsset(
      {
        assetCode: settlementAsset.asset_code,
        issuerAddress: settlementAsset.issuer_address,
      },
      environment,
    ),
  };
}

export function isNativeAsset(asset: Asset) {
  return asset.isNative();
}
