const idIntegerFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const idDecimalFormatter = (maxDecimals: number) =>
  new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });

export function parseAmountInput(value: string): number {
  if (!value.trim()) return 0;

  const hasComma = value.includes(",");
  if (hasComma) {
    const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parts = value.replace(/\s/g, "").split(".");
  if (parts.length === 1) {
    const parsed = Number.parseFloat(parts[0].replace(/[^\d]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (parts.length === 2 && parts[1].length <= 2) {
    const parsed = Number.parseFloat(`${parts[0]}.${parts[1]}`);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function parseIntegerInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function formatIntegerInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return idIntegerFormatter.format(Number(digits));
}

export function formatDecimalInput(value: string, maxDecimals = 6): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const endsWithSeparator = /[,.]$/.test(trimmed);
  const numeric = parseAmountInput(trimmed);

  if (!numeric && !endsWithSeparator) {
    return trimmed.replace(/[^\d,.]/g, "");
  }

  if (endsWithSeparator) {
    const base = idDecimalFormatter(maxDecimals).format(numeric);
    return `${base},`;
  }

  return idDecimalFormatter(maxDecimals).format(numeric);
}

export function formatIdr(amount: number): string {
  if (!amount) return "0";
  return idIntegerFormatter.format(Math.round(amount));
}

export function formatCrypto(amount: number, decimals = 4): string {
  if (!amount) return "0";
  return idDecimalFormatter(decimals).format(amount);
}

/** Display XLM without unnecessary trailing zeros (API payloads stay at 7 decimals). */
export function formatXlmDisplay(value: string | number): string {
  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(numeric)) {
    const trimmed = String(value).trim();
    return trimmed || "0";
  }

  return numeric
    .toFixed(7)
    .replace(/(\.\d*?[1-9])0+$/, "$1")
    .replace(/\.0+$/, "");
}
