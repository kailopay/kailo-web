import type { CheckoutLineItem } from "@/lib/dashboard/checkout/line-items";
import type { CheckoutInvoiceDetails } from "@/lib/dashboard/checkout/invoice-details";
import type { PaymentLinkCustomerCollection } from "@/lib/dashboard/payment-links/types";
import type { Organization } from "@/lib/dashboard/db/schema";

export type AllowedAsset = {
  asset_code: string;
  issuer_address: string | null;
};

export type PaymentQuote = {
  pricing_amount: string;
  pricing_currency: string;
  paid_asset: AllowedAsset;
  paid_amount: string;
  settlement_asset?: AllowedAsset;
  settlement_amount?: string;
  rate: string;
  settlement_quote_rate?: string;
  requires_path_payment?: boolean;
  expires_at: string;
  deposit_trustline_error?: string | null;
};

export type AssetBalances = Record<string, string | null>;

export type CheckoutData = {
  payment: {
    id: string;
    amount: string | null;
    settlement_asset: AllowedAsset;
    allowed_assets: AllowedAsset[];
    paid_asset: AllowedAsset | null;
    status: string;
    session_error?: string | null;
    last_attempt_error?: string | null;
    description: string | null;
    environment: Organization["environment"];
    expires_at: string | null;
    quote_expires_at: string | null;
    pricing_currency: string | null;
    pricing_amount: string | null;
    quoted_paid_amount: string | null;
    quoted_settlement_amount: string | null;
    quote_rate: string | null;
    settlement_quote_rate: string | null;
    source_type: string | null;
    receiving_address: string;
    deposit_address: string | null;
    memo: string | null;
    payment_flow: "direct" | "soroban" | "escrow" | "zk_shielded";
  };
  shielded?: {
    available: boolean;
    enabled: boolean;
    payment_id_hash: string | null;
    pool_contract_id: string | null;
    recipient_hash: string | null;
    amount_stroops: string | null;
    amount_label: string | null;
  } | null;
  cctp?: {
    source_chain: string;
    phase: string;
  } | null;
  items: CheckoutLineItem[];
  merchant: {
    name: string;
    logoUrl: string | null;
    logoInitials: string;
  } | null;
  invoice?: CheckoutInvoiceDetails | null;
  merchant_memo?: string | null;
  customer_collection?: PaymentLinkCustomerCollection | null;
};
