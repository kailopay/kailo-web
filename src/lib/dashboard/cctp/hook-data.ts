import { StrKey } from "@stellar/stellar-sdk";

export function contractStrkeyToBytes32(strkey: string) {
  if (!StrKey.isValidContract(strkey)) {
    throw new Error("Invalid Stellar contract address");
  }

  return `0x${Buffer.from(StrKey.decodeContract(strkey)).toString("hex")}` as const;
}

export function parseCctpForwarderHookRecipient(
  hookData: `0x${string}`,
): string | null {
  const bytes = Buffer.from(hookData.slice(2), "hex");
  if (bytes.length < 32) {
    return null;
  }

  const version = bytes.readUInt32BE(24);
  if (version !== 0) {
    return null;
  }

  const recipientLength = bytes.readUInt32BE(28);
  if (recipientLength <= 0 || 32 + recipientLength > bytes.length) {
    return null;
  }

  const recipient = bytes.subarray(32, 32 + recipientLength).toString("utf8");
  const isValidRecipient =
    StrKey.isValidEd25519PublicKey(recipient) ||
    StrKey.isValidMed25519PublicKey(recipient) ||
    StrKey.isValidContract(recipient);

  return isValidRecipient ? recipient : null;
}

export function buildCctpForwarderHookData(
  forwardRecipientStrkey: string,
): `0x${string}` {
  const isValidRecipient =
    StrKey.isValidEd25519PublicKey(forwardRecipientStrkey) ||
    StrKey.isValidMed25519PublicKey(forwardRecipientStrkey) ||
    StrKey.isValidContract(forwardRecipientStrkey);

  if (!isValidRecipient) {
    throw new Error("Invalid Stellar forward recipient");
  }

  const recipientBytes = Buffer.from(forwardRecipientStrkey, "utf8");
  const hookData = Buffer.alloc(32 + recipientBytes.length);
  hookData.writeUInt32BE(0, 24);
  hookData.writeUInt32BE(recipientBytes.length, 28);
  recipientBytes.copy(hookData, 32);

  return `0x${hookData.toString("hex")}`;
}
