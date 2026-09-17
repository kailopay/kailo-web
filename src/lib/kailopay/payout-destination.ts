import { OFFRAMP_DESTINATION_MAX_LENGTH } from "@/content/individuals";

export type PayoutBank = {
  id: string;
  name: string;
  icon: string;
};

export const PAYOUT_BANKS: readonly PayoutBank[] = [
  { id: "bca", name: "BCA", icon: "/marketing/payment-channels/bca_virtual_account.svg" },
  { id: "bri", name: "BRI", icon: "/marketing/payment-channels/bri_virtual_account.svg" },
  { id: "mandiri", name: "Mandiri", icon: "/marketing/payment-channels/mandiri_virtual_account.svg" },
  { id: "bni", name: "BNI", icon: "/marketing/payment-channels/bni_virtual_account.svg" },
  { id: "permata", name: "Permata", icon: "/marketing/payment-channels/permata_virtual_account.svg" },
  { id: "cimb", name: "CIMB Niaga", icon: "/marketing/payment-channels/cimb_virtual_account.svg" },
];

export type PayoutBankDetails = {
  bankId: string;
  accountNumber: string;
  accountName: string;
};

export function payoutBankById(bankId: string): PayoutBank | undefined {
  return PAYOUT_BANKS.find((bank) => bank.id === bankId);
}

export function sanitizeAccountNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 20);
}

export function validatePayoutBankDetails(details: PayoutBankDetails): string | null {
  const bank = payoutBankById(details.bankId);
  if (!bank) {
    return "Select a bank to continue.";
  }

  const accountNumber = sanitizeAccountNumber(details.accountNumber);
  if (accountNumber.length < 8) {
    return "Enter a valid bank account number.";
  }

  const accountName = details.accountName.trim();
  if (accountName.length < 2) {
    return "Enter the account holder name.";
  }
  if (accountName.length > 100) {
    return "Account holder name is too long.";
  }

  return null;
}

/** Encodes bank details into the API `destination_token` string. */
export function buildPayoutDestinationToken(details: PayoutBankDetails): string {
  const token = JSON.stringify({
    bank: details.bankId,
    account: sanitizeAccountNumber(details.accountNumber),
    name: details.accountName.trim(),
  });

  if (token.length > OFFRAMP_DESTINATION_MAX_LENGTH) {
    throw new Error("Payout details are too long.");
  }

  return token;
}

export function formatPayoutBankLabel(details: PayoutBankDetails): string {
  const bank = payoutBankById(details.bankId);
  const accountNumber = sanitizeAccountNumber(details.accountNumber);
  return `${bank?.name ?? details.bankId} · ${accountNumber}`;
}
