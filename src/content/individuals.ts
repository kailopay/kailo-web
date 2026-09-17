import type { PaymentMethod as ApiPaymentMethod } from "@/lib/kailopay/types";

export type RampMode = "buy" | "sell";

/** IDR per 1 XLM — preview estimate only; final rate locked at checkout. */
export const RAMP_RATE_XLM_IDR = 3378;

export const RAMP_FEE_BPS = 50;

export const TOKEN_META = {
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
} as const;

export type PaymentMethod = {
  id: string;
  apiMethod: ApiPaymentMethod;
  name: string;
  icon: string;
  eta: string;
  modes: RampMode[];
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "qris",
    apiMethod: "qris",
    name: "QRIS",
    icon: "/marketing/payment-channels/qris.svg",
    eta: "1-3 minutes",
    modes: ["buy"],
  },
  {
    id: "gopay",
    apiMethod: "xendit",
    name: "GoPay",
    icon: "/marketing/payment-channels/gopay.svg",
    eta: "Instant",
    modes: ["buy"],
  },
  {
    id: "bca_va",
    apiMethod: "bri_va",
    name: "BCA Virtual Account",
    icon: "/marketing/payment-channels/bca_virtual_account.svg",
    eta: "5-10 minutes",
    modes: ["buy"],
  },
];

export const OFFRAMP_DESTINATION_MAX_LENGTH = 200;

export function apiPaymentMethodForId(id: string): ApiPaymentMethod {
  const method = PAYMENT_METHODS.find((entry) => entry.id === id);
  return method?.apiMethod ?? "xendit";
}

export const STELLAR_ACCOUNT_PATTERN = /^G[A-Z2-7]{55}$/;

export const ORDER_MIN_IDR = 10_000;
export const ORDER_MAX_IDR = 10_000_000;
