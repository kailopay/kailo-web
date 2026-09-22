export function buildCheckoutManualPaymentQrValue(input: {
  destination: string;
}) {
  return input.destination.trim();
}
