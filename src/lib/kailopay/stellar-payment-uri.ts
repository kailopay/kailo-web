export function buildStellarPaymentUri(input: {
  destination: string;
  amount: string;
  memo?: string | null;
}): string {
  const destination = input.destination.trim();
  const amount = input.amount.trim();
  const params = new URLSearchParams({
    destination,
    amount,
  });

  const memo = input.memo?.trim();
  if (memo) {
    params.set("memo", memo);
    params.set("memo_type", "MEMO_TEXT");
  }

  return `web+stellar:pay?${params.toString()}`;
}
