export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavDropdown = {
  label: string;
  align?: "left" | "right";
  items: NavLink[];
};

export type FaqItem = {
  question: string;
  answer: string;
  defaultOpen?: boolean;
};

export type StatItem = {
  value: string;
  label: string;
  className?: string;
};

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export type SocialLink = {
  label: string;
  href: string;
  icon: "x" | "instagram" | "tiktok" | "linkedin" | "facebook";
};

export const BRAND_NAME = "KailoPay";
export const EARLY_ACCESS_URL = "https://calendly.com/kailopay/demo";

export const audienceTabs = [
  { label: "Business", href: "/" },
  { label: "Individuals", href: "/individuals" },
] as const;

export const mainNavDropdowns: NavDropdown[] = [
  {
    label: "Products",
    items: [
      { label: "P2P Liquidity", href: "/products/api" },
      { label: "Token listing", href: "/products/token-listing" },
    ],
  },
  {
    label: "Use Cases",
    items: [
      { label: "Fintech", href: "/use-cases/fintech" },
      { label: "Trading", href: "/use-cases/trading" },
      { label: "Remittance", href: "/use-cases/cross-border" },
    ],
  },
];

export const mainNavLinks: NavLink[] = [{ label: "API", href: "/api" }];

export const resourcesDropdown: NavDropdown = {
  label: "Resources",
  align: "right",
  items: [
    { label: "Help Center", href: "/help", external: false },
    { label: "Blog", href: "/blog", external: false },
    { label: "API Docs", href: "/docs", external: false },
  ],
};

export type PaymentMethodLogo = {
  name: string;
  src: string;
};

/** Indonesia payment channels from Xendit (assets.xendit.co/payment-session/logos). */
export const paymentMethodLogos: readonly PaymentMethodLogo[] = [
  { name: "QRIS", src: "/marketing/payment-channels/qris.svg" },
  { name: "GoPay", src: "/marketing/payment-channels/gopay.svg" },
  { name: "OVO", src: "/marketing/payment-channels/ovo.svg" },
  { name: "DANA", src: "/marketing/payment-channels/dana.svg" },
  { name: "ShopeePay", src: "/marketing/payment-channels/shopeepay.svg" },
  { name: "LinkAja", src: "/marketing/payment-channels/linkaja.svg" },
  { name: "Jenius Pay", src: "/marketing/payment-channels/jeniuspay.svg" },
  { name: "BCA Virtual Account", src: "/marketing/payment-channels/bca_virtual_account.svg" },
  { name: "BRI Virtual Account", src: "/marketing/payment-channels/bri_virtual_account.svg" },
  { name: "BNI Virtual Account", src: "/marketing/payment-channels/bni_virtual_account.svg" },
  { name: "Mandiri Virtual Account", src: "/marketing/payment-channels/mandiri_virtual_account.svg" },
  { name: "Permata Virtual Account", src: "/marketing/payment-channels/permata_virtual_account.svg" },
  { name: "CIMB Virtual Account", src: "/marketing/payment-channels/cimb_virtual_account.svg" },
  { name: "BSI Virtual Account", src: "/marketing/payment-channels/bsi_virtual_account.svg" },
  { name: "BJB Virtual Account", src: "/marketing/payment-channels/bjb_virtual_account.svg" },
  { name: "BNC Virtual Account", src: "/marketing/payment-channels/bnc_virtual_account.svg" },
  { name: "BSS Virtual Account", src: "/marketing/payment-channels/bss_virtual_account.svg" },
  { name: "Hana Virtual Account", src: "/marketing/payment-channels/hana_virtual_account.svg" },
  { name: "Muamalat Virtual Account", src: "/marketing/payment-channels/muamalat_virtual_account.svg" },
  { name: "BRI Direct Debit", src: "/marketing/payment-channels/bri_direct_debit.svg" },
  { name: "Indomaret", src: "/marketing/payment-channels/indomaret.svg" },
  { name: "Alfamart", src: "/marketing/payment-channels/alfamart.svg" },
  { name: "Akulaku", src: "/marketing/payment-channels/akulaku.svg" },
  { name: "Kredivo", src: "/marketing/payment-channels/kredivo.svg" },
  { name: "Indodana", src: "/marketing/payment-channels/indodana.svg" },
  { name: "Atome", src: "/marketing/payment-channels/atome.svg" },
  { name: "AstraPay", src: "/marketing/payment-channels/astrapay.svg" },
  { name: "Nex Cash", src: "/marketing/payment-channels/nexcash.svg" },
  { name: "GoPay Recurring", src: "/marketing/payment-channels/gopay_recurring.svg" },
];

export const securityFeatures = [
  {
    title: "Sandbox-first by design",
    description:
      "Every flow runs on Stellar testnet with Xendit sandbox checkout. No real IDR moves in this release.",
  },
  {
    title: "Verified checkout",
    description:
      "Payments are confirmed through a real payment gateway integration before XLM is released on-chain.",
  },
  {
    title: "KYC-ready flows",
    description:
      "Identity checks can gate on-ramp and off-ramp before a user completes their first order.",
  },
  {
    title: "Non-custodial by default",
    description:
      "Users keep control of their Stellar keys. KailoPay orchestrates payment and settlement, not custody.",
  },
] as const;

export const coverageStats: StatItem[] = [
  { value: "50M+", label: "QRIS merchants nationwide", className: "md:pl-0" },
  { value: "30+", label: "Indonesian payment channels", className: "border-l" },
  {
    value: "270M+",
    label: "Indonesians on local payment rails",
    className: "border-t md:border-t-0 md:border-l",
  },
  {
    value: "< 3s",
    label: "to open checkout with a locked quote",
    className: "border-l border-t md:border-t-0",
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "What is KailoPay?",
    answer:
      "KailoPay is an Indonesia-first on-ramp and off-ramp for Stellar. It lets users and developers move between Rupiah (IDR) and XLM using QRIS, bank transfer, and e-wallets.",
    defaultOpen: true,
  },
  {
    question: "Is this production-ready?",
    answer:
      "Not yet. The current release is a sandbox platform on Stellar testnet with Xendit sandbox checkout. No real IDR is settled in this phase.",
    defaultOpen: true,
  },
  {
    question: "What is live today?",
    answer:
      "A user-facing web app and public REST API for IDR→XLM and XLM→IDR flows, QRIS and BRI virtual account checkout in sandbox, order status polling, and developer API keys.",
  },
  {
    question: "Who is this for?",
    answer:
      "Indonesian fintechs, wallets, remittance apps, and crypto products whose users need to buy or sell on Stellar with familiar local payment methods.",
  },
  {
    question: "How is this different from Transak or MoonPay?",
    answer:
      "KailoPay is Stellar-native with full on-ramp and off-ramp flows, built around how Indonesians already pay: QRIS, bank transfer, and e-wallets, not card-first global ramps.",
  },
  {
    question: "Is it custodial?",
    answer:
      "No. Users control their own Stellar keys. KailoPay orchestrates payment checkout and on-chain settlement; it does not hold user funds.",
  },
  {
    question: "Which payment methods are supported?",
    answer:
      "The sandbox supports 30+ Indonesian channels through Xendit, including QRIS, major bank virtual accounts, GoPay, OVO, DANA, ShopeePay, LinkAja, and retail outlets like Indomaret and Alfamart.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book a demo or try the sandbox app and API documentation. We are onboarding partners building for the Indonesian Stellar corridor.",
  },
];

export const footerColumns: FooterColumn[] = [
  {
    title: "Products",
    links: [
      { label: "P2P Liquidity", href: "/products/api" },
      { label: "Widget and SDK", href: "#" },
      { label: "Token listing", href: "/products/token-listing" },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Fintech", href: "/use-cases/fintech" },
      { label: "Trading", href: "/use-cases/trading" },
      { label: "Remittance", href: "/use-cases/cross-border" },
    ],
  },
  {
    title: "API",
    links: [
      { label: "Overview", href: "/api" },
      { label: "Book a demo", href: EARLY_ACCESS_URL, external: true },
    ],
  },
  {
    title: "Resources",
    links: resourcesDropdown.items,
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Merchant terms", href: "/legal/merchant-terms" },
      { label: "All documents", href: "/legal" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: "X", href: "https://twitter.com/kailopay", icon: "x" },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kailopay/",
    icon: "instagram",
  },
  { label: "TikTok", href: "https://www.tiktok.com/@kailopay", icon: "tiktok" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/kailopay/",
    icon: "linkedin",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/kailopay",
    icon: "facebook",
  },
];