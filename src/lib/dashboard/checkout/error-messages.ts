const SUPPRESSED_CHECKOUT_ERROR_PATTERNS = [
  /sequence\s*number/i,
  /wallet\s+sequence/i,
  /txbadseq/i,
  /tx_bad_seq/i,
  /bad\s+sequence/i,
] as const;

export function isSuppressedCheckoutError(
  message: string | null | undefined,
): boolean {
  if (!message) {
    return false;
  }

  return SUPPRESSED_CHECKOUT_ERROR_PATTERNS.some((pattern) =>
    pattern.test(message),
  );
}

export function sanitizeCheckoutErrorMessage(
  message: string | null | undefined,
): string | null {
  if (!message || isSuppressedCheckoutError(message)) {
    return null;
  }

  return message;
}
