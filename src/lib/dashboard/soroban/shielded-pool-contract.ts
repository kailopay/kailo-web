import { createHash } from "node:crypto";
import {
  Address,
  BASE_FEE,
  Contract,
  Horizon,
  Keypair,
  nativeToScVal,
  rpc,
  TransactionBuilder,
  authorizeEntry,
  xdr,
} from "@stellar/stellar-sdk";
import type { Payment } from "@/lib/dashboard/db/schema";
import { getNetworkPassphrase, getHorizonUrl } from "@/lib/dashboard/stellar/network";
import {
  resolveSettlementAmounts,
  settlementAmountToStroops,
} from "@/lib/dashboard/payments/settlement/amounts";
import {
  amountToShieldedStroops,
  getShieldedPoolConfigForPayment,
  hashPaymentPublicIdBytes,
  hashStellarAddress,
} from "@/lib/dashboard/zk/shielded-config";
import { getSorobanSimulationErrorMessage } from "@/lib/dashboard/soroban/simulation";
import {
  submitSorobanTransaction,
  waitForSorobanTransaction,
} from "@/lib/dashboard/soroban/transaction";
import {
  assertSorobanConfigured,
  classifySorobanSimulationError,
} from "@/lib/dashboard/soroban/setup-errors";

function paymentIdHashBytes(payment: Payment) {
  return hashPaymentPublicIdBytes(payment.publicId);
}

function recipientHashBytes(payment: Payment) {
  return createHash("sha256").update(payment.receivingAddress).digest();
}

function grossSettlementAmountStroops(payment: Payment) {
  const { gross } = resolveSettlementAmounts(payment);
  return amountToShieldedStroops(gross);
}

function platformFeeStroops(payment: Payment) {
  const { platformFee } = resolveSettlementAmounts(payment);
  return settlementAmountToStroops(platformFee);
}

function buildWithdrawOperation(
  contract: Contract,
  payment: Payment,
  input: { proof: Buffer; nullifier: Buffer; merkleRoot: Buffer }
) {
  return contract.call(
    "withdraw",
    xdr.ScVal.scvBytes(input.proof),
    xdr.ScVal.scvBytes(input.nullifier),
    nativeToScVal(payment.receivingAddress, { type: "address" }),
    nativeToScVal(grossSettlementAmountStroops(payment), { type: "i128" }),
    xdr.ScVal.scvBytes(paymentIdHashBytes(payment)),
    nativeToScVal(1, { type: "u32" }),
    xdr.ScVal.scvBytes(input.merkleRoot),
    xdr.ScVal.scvBytes(recipientHashBytes(payment))
  );
}

async function simulateShieldedPoolTransaction(
  payment: Payment,
  buildOperation: (contract: Contract) => xdr.Operation
) {
  assertSorobanConfigured(payment.environment);
  const config = getShieldedPoolConfigForPayment(payment);
  const signer = Keypair.fromSecret(config.authorizationSignerSecret);
  const horizon = new Horizon.Server(getHorizonUrl(payment.environment));
  const account = await horizon.loadAccount(signer.publicKey());
  const contract = new Contract(config.contractId);
  const server = new rpc.Server(config.rpcUrl);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(payment.environment),
  })
    .addOperation(buildOperation(contract))
    .setTimeout(60)
    .build();

  const simulation = await server.simulateTransaction(transaction);

  if (!rpc.Api.isSimulationSuccess(simulation)) {
    throw classifySorobanSimulationError(
      getSorobanSimulationErrorMessage(
        simulation,
        "Shielded pool simulation failed"
      ),
      payment.environment
    );
  }

  return {
    config,
    server,
    transaction,
    simulation,
    signer,
  };
}

async function invokeShieldedPoolContract(
  payment: Payment,
  buildOperation: (contract: Contract) => xdr.Operation
) {
  const { config, server, transaction, simulation, signer } =
    await simulateShieldedPoolTransaction(payment, buildOperation);
  const signerAddress = signer.publicKey();
  const validUntilLedgerSeq = simulation.latestLedger + 1000;
  const auth = await Promise.all(
    simulation.result?.auth.map(async (entry) => {
      const credentials = entry.credentials();
      const entryAddress =
        credentials.switch().name === "sorobanCredentialsAddress"
          ? Address.fromScAddress(credentials.address().address()).toString()
          : null;

      return entryAddress === signerAddress
        ? authorizeEntry(
            entry,
            signer,
            validUntilLedgerSeq,
            getNetworkPassphrase(payment.environment)
          )
        : entry;
    }) ?? []
  );

  simulation.result!.auth = auth;
  const prepared = rpc.assembleTransaction(transaction, simulation).build();
  prepared.sign(signer);

  const submission = await submitSorobanTransaction(server, prepared);

  if (submission.hash) {
    await waitForSorobanTransaction(config.rpcUrl, submission.hash);
  }

  return submission;
}

export async function registerShieldedPaymentIntentOnContract(payment: Payment) {
  const expiresAt = Math.floor((payment.expiresAt ?? new Date()).getTime() / 1000);

  return invokeShieldedPoolContract(payment, (contract) =>
    contract.call(
      "register_payment_intent",
      xdr.ScVal.scvBytes(paymentIdHashBytes(payment)),
      nativeToScVal(payment.receivingAddress, { type: "address" }),
      nativeToScVal(grossSettlementAmountStroops(payment), { type: "i128" }),
      nativeToScVal(platformFeeStroops(payment), { type: "i128" }),
      nativeToScVal(1, { type: "u32" }),
      nativeToScVal(BigInt(expiresAt), { type: "u64" })
    )
  );
}

export async function buildShieldedDepositTransaction(input: {
  payment: Payment;
  payerAddress: string;
  commitment: Buffer;
}) {
  const config = getShieldedPoolConfigForPayment(input.payment);
  const contract = new Contract(config.contractId);
  const server = new rpc.Server(config.rpcUrl);
  const account = await server.getAccount(input.payerAddress);

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(input.payment.environment),
  })
    .addOperation(
      contract.call(
        "deposit",
        nativeToScVal(input.payerAddress, { type: "address" }),
        xdr.ScVal.scvBytes(input.commitment),
        nativeToScVal(grossSettlementAmountStroops(input.payment), { type: "i128" })
      )
    )
    .setTimeout(60)
    .build();

  const simulation = await server.simulateTransaction(transaction);
  if (!rpc.Api.isSimulationSuccess(simulation)) {
    throw classifySorobanSimulationError(
      getSorobanSimulationErrorMessage(
        simulation,
        "Unable to build shielded deposit transaction"
      ),
      input.payment.environment
    );
  }

  return rpc.assembleTransaction(transaction, simulation).build().toXDR();
}

export async function buildShieldedWithdrawTransaction(input: {
  payment: Payment;
  payerAddress?: string;
  proof: Buffer;
  nullifier: Buffer;
  merkleRoot: Buffer;
}) {
  const { transaction, simulation } = await simulateShieldedPoolTransaction(
    input.payment,
    (contract) =>
      buildWithdrawOperation(contract, input.payment, {
        proof: input.proof,
        nullifier: input.nullifier,
        merkleRoot: input.merkleRoot,
      })
  );

  return rpc.assembleTransaction(transaction, simulation).build().toXDR();
}

export async function submitShieldedWithdrawOnChain(input: {
  payment: Payment;
  proof: Buffer;
  nullifier: Buffer;
  merkleRoot: Buffer;
}) {
  const { config, server, transaction, simulation, signer } =
    await simulateShieldedPoolTransaction(
      input.payment,
      (contract) =>
        buildWithdrawOperation(contract, input.payment, {
          proof: input.proof,
          nullifier: input.nullifier,
          merkleRoot: input.merkleRoot,
        })
    );

  const prepared = rpc.assembleTransaction(transaction, simulation).build();
  prepared.sign(signer);

  const submission = await submitSorobanTransaction(server, prepared);

  if (submission.hash) {
    await waitForSorobanTransaction(config.rpcUrl, submission.hash);
  }

  return submission;
}

export async function submitShieldedPoolTransaction(input: {
  payment: Payment;
  signedXdr: string;
}) {
  const config = getShieldedPoolConfigForPayment(input.payment);
  const server = new rpc.Server(config.rpcUrl);
  const transaction = TransactionBuilder.fromXDR(
    input.signedXdr,
    getNetworkPassphrase(input.payment.environment)
  );
  const submission = await submitSorobanTransaction(server, transaction);

  if (submission.hash) {
    await waitForSorobanTransaction(config.rpcUrl, submission.hash);
  }

  return submission;
}

export function shieldedRecipientHash(payment: Payment) {
  return hashStellarAddress(payment.receivingAddress);
}
