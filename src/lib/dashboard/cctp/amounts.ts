const USDC_DECIMALS = 6;
const USDC_SCALE = 10n ** BigInt(USDC_DECIMALS);

export function decimalToUsdcAtomic(value: string): bigint {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("-")) {
    throw new Error("Invalid USDC amount");
  }

  const [wholeRaw, fractionRaw = ""] = trimmed.split(".");
  const whole = wholeRaw || "0";
  const fraction = fractionRaw.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);

  if (!/^\d+$/.test(whole) || !/^\d+$/.test(fraction)) {
    throw new Error("Invalid USDC amount");
  }

  return BigInt(whole) * USDC_SCALE + BigInt(fraction);
}

export function usdcAtomicToDecimal(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const abs = value < 0n ? -value : value;
  const whole = abs / USDC_SCALE;
  const fraction = (abs % USDC_SCALE).toString().padStart(USDC_DECIMALS, "0");
  const trimmedFraction = fraction.replace(/0+$/, "");

  return `${sign}${whole.toString()}${trimmedFraction ? `.${trimmedFraction}` : ""}`;
}

export function addUsdcDecimals(...values: string[]): string {
  return usdcAtomicToDecimal(
    values.reduce((sum, value) => sum + decimalToUsdcAtomic(value), 0n),
  );
}

export function multiplyUsdcByBps(value: string, bps: number): string {
  const atomic = decimalToUsdcAtomic(value);
  const bpsScale = 1_000n;
  const scaledBps = BigInt(Math.ceil(bps * Number(bpsScale)));
  const denominator = 10_000n * bpsScale;
  const fee = (atomic * scaledBps + denominator - 1n) / denominator;

  return usdcAtomicToDecimal(fee);
}

export function addPercentageBuffer(value: string, percentage: number): string {
  const atomic = decimalToUsdcAtomic(value);
  const scale = 10_000n;
  const multiplier = scale + BigInt(Math.ceil(percentage * 100));
  return usdcAtomicToDecimal((atomic * multiplier + scale - 1n) / scale);
}
