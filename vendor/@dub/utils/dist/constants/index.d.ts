export { ccTLDs } from './cctlds.js';
export { CONNECT_SUPPORTED_COUNTRIES } from './connect-supported-countries.js';
export { CONTINENTS, CONTINENT_CODES, COUNTRIES_TO_CONTINENTS } from './continents.js';
export { COUNTRIES, COUNTRY_CODES, EU_COUNTRY_CODES } from './countries.js';
export { COUNTRY_CURRENCY_CODES } from './country-currency-codes.js';
export { COUNTRY_PHONE_CODES } from './country-phone-codes.js';
export { SECOND_LEVEL_DOMAINS, SPECIAL_APEX_DOMAINS } from './domains.js';
export { DUB_DEMO_LINKS, DUB_DOMAINS, DUB_DOMAINS_ARRAY } from './dub-domains.js';
export { APPSFLYER_INTEGRATION_ID, HUBSPOT_INTEGRATION_ID, INTERCOM_INTEGRATION_ID, SEGMENT_INTEGRATION_ID, SHOPIFY_INTEGRATION_ID, SLACK_INTEGRATION_ID, STRIPE_INTEGRATION_ID, ZAPIER_INTEGRATION_ID } from './integrations.js';
export { ALL_TOOLS } from './layout.js';
export { LOCALHOST_GEO_DATA, LOCALHOST_IP } from './localhost.js';
export { ACME_PROGRAM_ID, ACME_WORKSPACE_ID, ADMIN_HOSTNAMES, API_DOMAIN, API_HOSTNAMES, APP_DOMAIN, APP_DOMAIN_WITH_NGROK, APP_HOSTNAMES, DUB_LOGO, DUB_LOGO_SQUARE, DUB_QR_LOGO, DUB_THUMBNAIL, DUB_WORDMARK, DUB_WORKSPACE_ID, LEGAL_USER_ID, LEGAL_WORKSPACE_ID, NETWORK_PROGRAM_DEFAULT_GROUP_ID, NETWORK_PROGRAM_DEFAULT_SALE_REWARD_ID, NETWORK_PROGRAM_ID, NETWORK_PROGRAM_SLUG, NETWORK_USER_ID, NETWORK_WORKSPACE_ID, PARTNERS_DOMAIN, PARTNERS_DOMAIN_WITH_NGROK, PARTNERS_HOSTNAMES, R2_URL, SHORT_DOMAIN } from './main.js';
export { DEFAULT_REDIRECTS, DUB_HEADERS, REDIRECTION_QUERY_PARAM } from './middleware.js';
export { DEFAULT_LINK_PROPS, DEFAULT_PAGINATION_LIMIT, DUB_FOUNDING_DATE, DUPLICATE_IDENTITY_DECLINE_REASON, GOOGLE_FAVICON_URL, INFINITY_NUMBER, OG_AVATAR_URL, TWO_WEEKS_IN_SECONDS } from './misc.js';
export { PAYPAL_SUPPORTED_COUNTRIES } from './paypal-supported-countries.js';
export { REGIONS, REGION_CODES } from './regions.js';
export { RESERVED_SLUGS } from './reserved-slugs.js';
export { SAML_PROVIDERS } from './saml.js';
export { STABLECOIN_SUPPORTED_COUNTRIES } from './stablecoin-supported-countries.js';
export { TREMENDOUS_SUPPORTED_COUNTRIES } from './tremendous-supported-countries.js';
import { ReactNode } from 'react';
import { b as PLANS } from '../trial-limits-a79e9a05.js';
export { A as ADVANCED_PLAN, B as BUSINESS_PLAN, D as DUB_TRIAL_PERIOD_DAYS, E as ENTERPRISE_PLAN, F as FREE_PLAN, d as FREE_WORKSPACES_LIMIT, N as NEW_BUSINESS_PRICE_IDS, c as PRO_PLAN, a as PlanDetails, P as PlanFeature, S as SELF_SERVE_PAID_PLANS, T as TRIAL_LIMITS, k as TrialLimitResource, f as getNextPlan, g as getPlanAndTierFromPriceId, e as getPlanDetails, h as getSuggestedPlan, l as getTrialLimitFeaturePhrase, m as getTrialLimitResourceForOverageBanner, o as getWorkspaceLimitsForStripeSubscriptionStatus, i as isDowngradePlan, j as isLegacyBusinessPlan, n as isWorkspaceBillingTrialActive } from '../trial-limits-a79e9a05.js';
export { PRICING_PLAN_MAIN_FEATURES } from './pricing/pricing-plan-main-features.js';
export { PRICING_PLAN_TAGLINES } from './pricing/pricing-plan-taglines.js';

declare const PRICING_PLAN_COMPARE_FEATURES: {
    category: string;
    href: string;
    features: {
        text: string | ((d: {
            id: string;
            plan: (typeof PLANS)[number];
        }) => ReactNode);
        href?: string;
        check?: boolean | {
            default?: boolean;
            free?: boolean;
            pro?: boolean;
            business?: boolean;
            advanced?: boolean;
            enterprise?: boolean;
        };
    }[];
}[];

export { PLANS, PRICING_PLAN_COMPARE_FEATURES };
