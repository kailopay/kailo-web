import { eq } from "drizzle-orm";
import {
  BASE_FEE,
  Contract,
  Horizon,
  TransactionBuilder,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";
import { db } from "@/lib/dashboard/db";
import { payments, type Payment } from "@/lib/dashboard/db/schema";
import {
  STELLAR_CCTP_FORWARDER,
  STELLAR_TESTNET_CCTP_FORWARDER,
} from "@/lib/dashboard/cctp/chain-registry";
import { fetchCctpMessage } from "@/lib/dashboard/cctp/iris-client";
import { CCTP_METADATA_KEYS } from "@/lib/dashboard/cctp/payment-metadata";
import { usdcAtomicToDecimal } from "@/lib/dashboard/cctp/amounts";
import { getStellarOperatorKeypair } from "@/lib/dashboard/stellar/operator";
import {
  getHorizonUrl,
  getNetworkPassphrase,
} from "@/lib/dashboard/stellar/network";
import { getSorobanConfig } from "@/lib/dashboard/soroban/config";
import {
  submitSorobanTransaction,
  waitForSorobanTransaction,
} from "@/lib/dashboard/soroban/transaction";
import {
  processEscrowSettlement,
  registerEscrowDeposit,
} from "@/lib/dashboard/payments/settlement/escrow";
import { ensurePaymentSettlementQuote } from "@/lib/dashboard/payments/quote-service";
import { resolveAllowedAsset } from "@/lib/dashboard/assets/types";

function hexBytes(value: string) {
  const normalized = value.startsWith("0x") ? value.slice(2) : value;
  if (!normalized || normalized.length % 2 !== 0) {
    throw new Error("Invalid CCTP message data");
  }

  return Buffer.from(normalized, "hex");
}

function readCompleteMessage(payload: unknown) {
  const root =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const messages = Array.isArray(root.messages) ? root.messages : [];
  const first =
    messages[0] && typeof messages[0] === "object"
      ? (messages[0] as Record<string, unknown>)
      : null;

  if (!first || first.status !== "complete") {
    return null;
  }

  if (
    typeof first.message !== "string" ||
    typeof first.attestation !== "string"
  ) {
    throw new Error("Circle returned an invalid attestation");
  }

  const decodedMessage =
    first.decodedMessage && typeof first.decodedMessage === "object"
      ? (first.decodedMessage as Record<string, unknown>)
      : {};
  const decodedBody =
    decodedMessage.decodedMessageBody &&
    typeof decodedMessage.decodedMessageBody === "object"
      ? (decodedMessage.decodedMessageBody as Record<string, unknown>)
      : {};
  const amount = BigInt(String(decodedBody.amount ?? "0"));
  const feeExecuted = BigInt(String(decodedBody.feeExecuted ?? "0"));

  if (amount <= 0n || feeExecuted < 0n || feeExecuted > amount) {
    throw new Error("Circle returned an invalid USDC amount");
  }

  return {
    message: first.message,
    attestation: first.attestation,
    receivedAmount: usdcAtomicToDecimal(amount - feeExecuted),
  };
}

async function recordMinted(payment: Payment, mintTxHash: string) {
  const metadata = {
    ...(payment.metadata ?? {}),
    [CCTP_METADATA_KEYS.attestationStatus]: "complete",
    [CCTP_METADATA_KEYS.phase]: "minted",
    cctp_mint_tx_hash: mintTxHash,
  };
  const [updated] = await db
    .update(payments)
    .set({ metadata, updatedAt: new Date() })
    .where(eq(payments.id, payment.id))
    .returning();

  return updated;
}

export async function relayCctpPayment(payment: Payment) {
  const sourceDomain = Number(payment.metadata?.cctp_source_domain);
  const burnTxHash = payment.metadata?.[CCTP_METADATA_KEYS.burnTxHash];

  if (!Number.isInteger(sourceDomain) || !burnTxHash) {
    throw new Error("CCTP payment metadata is incomplete");
  }

  if (payment.metadata?.[CCTP_METADATA_KEYS.phase] === "minted") {
    const settled =
      payment.status === "deposit_received" ||
      payment.status === "settlement_failed"
        ? await processEscrowSettlement(payment)
        : payment;
    return {
      status: "minted" as const,
      payment: settled,
      mintTxHash: payment.metadata.cctp_mint_tx_hash ?? null,
    };
  }

  const payload = await fetchCctpMessage({
    environment: payment.environment,
    sourceDomain,
    burnTxHash,
  });
  const complete = readCompleteMessage(payload);

  if (!complete) {
    return { status: "attestation_pending" as const, payment };
  }

  const config = getSorobanConfig(payment.environment);
  const signer = getStellarOperatorKeypair(payment.environment);
  const horizon = new Horizon.Server(getHorizonUrl(payment.environment));
  const account = await horizon.loadAccount(signer.publicKey());
  const server = new rpc.Server(config.rpcUrl);
  const forwarder = new Contract(
    payment.environment === "production"
      ? STELLAR_CCTP_FORWARDER
      : STELLAR_TESTNET_CCTP_FORWARDER,
  );
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(payment.environment),
  })
    .addOperation(
      forwarder.call(
        "mint_and_forward",
        xdr.ScVal.scvBytes(hexBytes(complete.message)),
        xdr.ScVal.scvBytes(hexBytes(complete.attestation)),
      ),
    )
    .setTimeout(60)
    .build();
  const simulation = await server.simulateTransaction(transaction);

  if (!rpc.Api.isSimulationSuccess(simulation)) {
    throw new Error("Unable to mint USDC on Stellar");
  }

  const prepared = rpc.assembleTransaction(transaction, simulation).build();
  prepared.sign(signer);
  const submission = await submitSorobanTransaction(server, prepared);

  if (!submission.hash) {
    throw new Error("Stellar mint transaction did not return a hash");
  }

  await waitForSorobanTransaction(config.rpcUrl, submission.hash);
  const updated = await recordMinted(payment, submission.hash);
  const allowedUsdc = updated.allowedAssets.find(
    (asset) => asset.asset_code === "USDC",
  );

  if (!allowedUsdc) {
    throw new Error("USDC is not enabled for this payment");
  }

  const settled = await registerEscrowDeposit({
    payment: await ensurePaymentSettlementQuote(updated, allowedUsdc),
    depositTxHash: submission.hash,
    payerAddress: signer.publicKey(),
    receivedAmount: complete.receivedAmount,
    paidAsset: resolveAllowedAsset(allowedUsdc, updated.environment),
  });

  return {
    status: "minted" as const,
    payment: settled,
    mintTxHash: submission.hash,
  };
}
