/** Format IDR minor units for display without floating-point math. */
export function formatIdrMinor(value: string): string {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/^0+/, "") || "0";
  const groups: string[] = [];
  for (let index = digits.length; index > 0; index -= 3) {
    groups.unshift(digits.slice(Math.max(0, index - 3), index));
  }
  return `Rp${groups.join(".")}`;
}

/** Format XLM amount for display while preserving fractional precision. */
export function formatXlm(value: string): string {
  const trimmed = value.trim();
  if (!trimmed.includes(".")) return `${trimmed} XLM`;
  const [whole, fraction = ""] = trimmed.split(".");
  const normalizedFraction = fraction.replace(/0+$/, "");
  return normalizedFraction ? `${whole}.${normalizedFraction} XLM` : `${whole} XLM`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 1000) / 10}%`;
}
