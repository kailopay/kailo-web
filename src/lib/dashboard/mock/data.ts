import type { DashboardAnalytics } from "@/lib/dashboard/analytics/types";
import type { ApiKeyRow } from "@/lib/dashboard/api-keys/types";
import type { ApiLogRow } from "@/lib/dashboard/api-logs/types";
import type { CustomerRow } from "@/lib/dashboard/customers/types";
import type { Organization, User } from "@/lib/dashboard/db/schema";
import type {
  CheckoutSessionRow,
  InvoiceRow,
  PaymentLinkRow,
  PaymentRow,
} from "@/lib/dashboard/payments/types";
import type { UserProfile } from "@/lib/dashboard/users/service";
import type { WebhookEndpointRow } from "@/lib/dashboard/webhooks/types";

export const MOCK_USER_ID = "00000000-0000-4000-8000-000000000001";
export const MOCK_ORG_ID = "00000000-0000-4000-8000-000000000010";

const now = new Date();
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_USER: User = {
  id: MOCK_USER_ID,
  name: "Ada Lovelace",
  email: "ada@acmepayments.demo",
  passwordHash: null,
  image: null,
  authProvider: "credentials",
  emailVerifiedAt: new Date(daysAgo(30)),
  createdAt: new Date(daysAgo(90)),
  updatedAt: new Date(daysAgo(1)),
};

export const MOCK_USER_PROFILE: UserProfile = {
  id: MOCK_USER.id,
  name: MOCK_USER.name,
  email: MOCK_USER.email,
  image: MOCK_USER.image,
  authProvider: MOCK_USER.authProvider,
  emailVerifiedAt: MOCK_USER.emailVerifiedAt,
  createdAt: MOCK_USER.createdAt,
  updatedAt: MOCK_USER.updatedAt,
};

export const MOCK_ORGANIZATION: Organization = {
  id: MOCK_ORG_ID,
  name: "Acme Payments",
  email: "billing@acmepayments.demo",
  website: "https://acmepayments.demo",
  description: "Demo merchant account.",
  logoUrl: null,
  logoInitials: "AP",
  slug: "acme-payments",
  environment: "sandbox",
  verificationStatus: "verified",
  verifiedAt: new Date(daysAgo(14)),
  verificationExpiresAt: null,
  createdAt: new Date(daysAgo(60)),
  updatedAt: new Date(daysAgo(1)),
};

const usdcAsset = {
  asset_code: "USDC",
  issuer_address: "GBBD47IF6LWK7P7MDEVSCWRYDXTZJU22ODXK6FKBPE4G5SXXFGBPXWZN",
};

export const MOCK_PAYMENTS: PaymentRow[] = [
  {
    id: "pay_demo_001",
    object: "payment",
    amount: "125.00",
    pricing_currency: "USD",
    pricing_amount: "125.00",
    quoted_paid_amount: "125.00",
    received_amount: "125.00",
    quoted_settlement_amount: "124.38",
    platform_fee_amount: "0.62",
    merchant_settlement_amount: "124.38",
    quote_rate: "1.0000000",
    settlement_quote_rate: "1.0000000",
    quote_expires_at: daysAgo(-1),
    settlement_asset: usdcAsset,
    allowed_assets: [usdcAsset, { asset_code: "XLM", issuer_address: null }],
    paid_asset: usdcAsset,
    status: "completed",
    description: "Premium subscription",
    checkout_url: "https://checkout.demo/pay_demo_001",
    source_type: "payment_link",
    payment_flow: "direct",
    customer_id: "cus_demo_001",
    payer_address: "GCKFBEIYTKP6RQBUXIFGVLSDLMJNFZIGRGRN5BRTOXM3BHDRML7R2J",
    tx_hash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
    confirmed_at: daysAgo(0),
    expires_at: daysAgo(-2),
    created_at: daysAgo(1),
    metadata: { plan: "premium" },
  },
  {
    id: "pay_demo_002",
    object: "payment",
    amount: "49.99",
    pricing_currency: "USD",
    pricing_amount: "49.99",
    quoted_paid_amount: "49.99",
    received_amount: null,
    quoted_settlement_amount: "49.74",
    platform_fee_amount: "0.25",
    merchant_settlement_amount: "49.74",
    quote_rate: "1.0000000",
    settlement_quote_rate: "1.0000000",
    quote_expires_at: daysAgo(-1),
    settlement_asset: usdcAsset,
    allowed_assets: [usdcAsset],
    paid_asset: null,
    status: "pending",
    description: "Starter plan",
    checkout_url: "https://checkout.demo/pay_demo_002",
    source_type: "invoice",
    payment_flow: "direct",
    customer_id: "cus_demo_002",
    payer_address: null,
    tx_hash: null,
    confirmed_at: null,
    expires_at: daysAgo(-1),
    created_at: daysAgo(2),
    metadata: null,
  },
];

export const MOCK_CUSTOMERS: CustomerRow[] = [
  {
    id: "cus_demo_001",
    email: "jane@example.com",
    name: "Jane Cooper",
    primary_stellar_address: "GCKFBEIYTKP6RQBUXIFGVLSDLMJNFZIGRGRN5BRTOXM3BHDRML7R2J",
    notes: "Enterprise plan",
    created_at: daysAgo(20),
  },
  {
    id: "cus_demo_002",
    email: "robert@example.com",
    name: "Robert Fox",
    primary_stellar_address: null,
    notes: null,
    created_at: daysAgo(10),
  },
];

export const MOCK_INVOICES: InvoiceRow[] = [
  {
    id: "inv_demo_001",
    object: "invoice",
    invoice_number: "INV-1001",
    status: "open",
    display_status: "Open",
    amount: "250.00",
    currency_code: "USD",
    settlement_asset: usdcAsset,
    allowed_assets: [usdcAsset],
    description: "Consulting services",
    customer_id: "cus_demo_001",
    customer_name: "Jane Cooper",
    customer_email: "jane@example.com",
    checkout_session_id: null,
    checkout_url: "https://checkout.demo/inv_demo_001",
    items: [
      {
        id: "item_001",
        description: "Consulting hours",
        quantity: "10",
        unit_amount: "25.00",
      },
    ],
    activity: [],
    due_at: daysAgo(-7),
    paid_at: null,
    sent_at: daysAgo(3),
    created_at: daysAgo(5),
    updated_at: daysAgo(3),
  },
];

export const MOCK_PAYMENT_LINKS: PaymentLinkRow[] = [
  {
    id: "plink_demo_001",
    object: "payment_link",
    amount: "99.00",
    currency_code: "USD",
    status: "active",
    description: "Annual support package",
    checkout_url: "https://checkout.demo/plink_demo_001",
    created_at: daysAgo(15),
    updated_at: daysAgo(4),
    metadata: null,
    customer_collection: "if_required",
    allowed_assets: [usdcAsset],
    settlement_asset: usdcAsset,
  },
];

export const MOCK_CHECKOUT_SESSIONS: CheckoutSessionRow[] = [
  {
    id: "cs_demo_001",
    object: "checkout_session",
    status: "open",
    payment_intent_id: "pay_demo_002",
    amount: "49.99",
    settlement_asset: usdcAsset,
    allowed_assets: [usdcAsset],
    paid_asset: null,
    payment_status: "pending",
    customer_id: "cus_demo_002",
    success_url: "https://acmepayments.demo/success",
    cancel_url: "https://acmepayments.demo/cancel",
    checkout_url: "https://checkout.demo/cs_demo_001",
    expires_at: daysAgo(-1),
    created_at: daysAgo(2),
  },
];

export const MOCK_API_KEYS: ApiKeyRow[] = [
  {
    id: "key_demo_001",
    name: "Server integration",
    keyPrefix: "pk_test_demo",
    environment: "sandbox",
    scopes: ["payments:read", "payments:write"],
    createdAt: daysAgo(30),
    lastUsedAt: daysAgo(0),
    revokedAt: null,
  },
];

export const MOCK_API_LOGS: ApiLogRow[] = [
  {
    id: "log_demo_001",
    method: "POST",
    path: "/v1/payments",
    statusCode: 201,
    durationMs: 142,
    createdAt: daysAgo(0),
    apiKeyId: "key_demo_001",
    apiKeyName: "Server integration",
    apiKeyPrefix: "pk_test_demo",
  },
];

export const MOCK_WEBHOOKS: WebhookEndpointRow[] = [
  {
    id: "wh_demo_001",
    url: "https://api.acmepayments.demo/webhooks/kailopay",
    events: ["payment.completed", "payment.failed"],
    enabled: 1,
    createdAt: daysAgo(25),
    secretPreview: "whsec_••••demo",
  },
];

export const MOCK_ANALYTICS: DashboardAnalytics = {
  totals: {
    volume: 1840,
    payments: 42,
    successRate: 0.94,
  },
  timeseries: Array.from({ length: 14 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (13 - index));
    return {
      date: date.toISOString().slice(0, 10),
      volume: 80 + index * 12,
      payments: 2 + (index % 4),
      successRate: 0.9 + (index % 3) * 0.02,
    };
  }),
  breakdowns: {
    paymentMethods: [
      { key: "wallet", label: "Wallet", value: 28 },
      { key: "link", label: "Payment link", value: 14 },
    ],
    assets: [
      { key: "USDC", label: "USDC", value: 32 },
      { key: "XLM", label: "XLM", value: 10 },
    ],
    status: [
      { key: "completed", label: "Completed", value: 38 },
      { key: "pending", label: "Pending", value: 4 },
    ],
    customers: [
      { key: "returning", label: "Returning", value: 24 },
      { key: "new", label: "New", value: 18 },
    ],
  },
};

export const MOCK_PAYMENT_METHODS = {
  payment_methods: [
    {
      id: "pm_demo_001",
      asset_code: "USDC",
      issuer_address: usdcAsset.issuer_address,
      display_name: "USDC",
      is_default: true,
      is_enabled: true,
      is_verified: true,
    },
    {
      id: "pm_demo_002",
      asset_code: "XLM",
      issuer_address: null,
      display_name: "XLM",
      is_default: false,
      is_enabled: true,
      is_verified: true,
    },
  ],
};

export const MOCK_INTEGRATIONS = [
  {
    provider: "shopify",
    status: "not_connected",
    connected: false,
  },
  {
    provider: "woocommerce",
    status: "not_connected",
    connected: false,
  },
  {
    provider: "discord",
    status: "not_connected",
    connected: false,
  },
  {
    provider: "slack",
    status: "not_connected",
    connected: false,
  },
];

export const MOCK_VERIFICATION = {
  organization: MOCK_ORGANIZATION,
  application: null,
  isExpired: false,
  canSwitchToProduction:
    MOCK_ORGANIZATION.verificationStatus === "verified" &&
    MOCK_ORGANIZATION.environment === "sandbox",
};

export const MOCK_HUB_COUNTS = {
  payment_intents: 12,
  invoices: 4,
  payment_links: 3,
  checkout_sessions: 2,
};
