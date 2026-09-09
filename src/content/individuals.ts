export type CryptoToken = "XLM" | "USDC";

export type RampMode = "buy" | "sell";

/** IDR per 1 token. */
export const RAMP_RATES_IDR: Record<CryptoToken, number> = {
  XLM: 3378,
  USDC: 15850,
};

export const RAMP_FEE_BPS = 50;

export const TOKEN_META: Record<
  CryptoToken | "IDR",
  { label: string; symbol: string; icon: string; decimals: number }
> = {
  IDR: {
    label: "Indonesian Rupiah",
    symbol: "IDR",
    icon: "/marketing/indonesia-circle.svg",
    decimals: 0,
  },
  XLM: {
    label: "Stellar Lumens",
    symbol: "XLM",
    icon: "/marketing/tokens/xlm.svg",
    decimals: 7,
  },
  USDC: {
    label: "USD Coin",
    symbol: "USDC",
    icon: "/marketing/tokens/usdc.svg",
    decimals: 6,
  },
};

export type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
  eta: string;
  modes: RampMode[];
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    icon: "/marketing/payment-channels/qris.svg",
    eta: "1-3 minutes",
    modes: ["buy"],
  },
  {
    id: "gopay",
    name: "GoPay",
    icon: "/marketing/payment-channels/gopay.svg",
    eta: "Instant",
    modes: ["buy"],
  },
  {
    id: "bca_va",
    name: "BCA Virtual Account",
    icon: "/marketing/payment-channels/bca_virtual_account.svg",
    eta: "5-10 minutes",
    modes: ["buy", "sell"],
  },
];
