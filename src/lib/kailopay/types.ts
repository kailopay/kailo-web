export type User = {
  id: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  developer_enabled: boolean;
  avatar_url?: string;
};

export type KYCStatusValue =
  | "not_started"
  | "creating"
  | "created"
  | "pending"
  | "completed"
  | "pending_review"
  | "approved"
  | "declined"
  | "failed"
  | "expired";

export type KYCStatus = {
  provider: "persona";
  status: KYCStatusValue;
  provider_status: string;
  inquiry_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  expires_at: string | null;
  approved_at: string | null;
};

export type KYCInquiry = {
  status: KYCStatusValue;
  provider_status: string;
  inquiry_id: string;
  environment_id: string;
  session_token?: string;
  expires_at: string | null;
};

export type PaymentMethod = "xendit" | "qris" | "bri_va";

export type OrderStatus =
  | "created"
  | "payment_pending"
  | "payment_confirmed"
  | "stellar_processing"
  | "completed"
  | "expired"
  | "payment_failed"
  | "stellar_failed"
  | "cancelled"
  | "asset_pending"
  | "asset_received"
  | "asset_invalid"
  | "retirement_processing"
  | "withdrawal_processing"
  | "retirement_failed"
  | "withdrawal_failed";

export type Quote = {
  rate: string;
  adjusted_rate: string;
  spread_bps: number;
  source_at: string;
  expires_at: string;
};

export type Checkout = {
  id: string;
  status: string;
  presentation_type: "PAYMENT_LINK" | "QR_STRING" | "VIRTUAL_ACCOUNT_NUMBER";
  presentation_value?: string;
  payment_link_url?: string;
  expires_at: string | null;
};

export type Payout = {
  reference: string;
  method: string;
  amount_minor: string;
  state: string;
  simulated: boolean;
  disclosure: string;
};

export type Order = {
  id: string;
  direction: "onramp" | "offramp";
  status: OrderStatus;
  environment: string;
  network: string;
  fiat: { currency: string; amount_minor: string };
  asset: { code: string; amount: string };
  quote: Quote;
  payment_method: PaymentMethod | null;
  stellar_destination: { account: string; memo: string | null };
  checkout: Checkout | null;
  stellar_transaction_hash?: string;
  deposit_transaction_hash?: string;
  payout?: Payout;
  failure_code?: string;
  created_at: string;
  updated_at: string;
};

export type RampStep = 1 | 2 | 3 | 4 | 5 | 6;

export type RampMode = "buy" | "sell";

export type RampDraft = {
  step: RampStep;
  mode: RampMode;
  payAmount: string;
  paymentMethodId: string;
  stellarAccount: string;
  memo: string;
  payoutBankId: string;
  payoutAccountNumber: string;
  payoutAccountName: string;
  payoutDestination: string;
  idempotencyKey: string;
  orderId: string | null;
};
