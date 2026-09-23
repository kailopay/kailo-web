type PlanFeature = {
    id?: string;
    text: string;
    tooltip?: {
        title: string;
        cta?: string;
        href?: string;
    };
};
type PlanDetails = {
    name: string;
    price: {
        monthly: number | null;
        yearly: number | null;
        ids?: string[];
    };
    limits: {
        links: number;
        clicks: number;
        payouts: number;
        domains: number;
        tags: number;
        partnerTags: number;
        folders: number;
        groups: number;
        networkInvites: number;
        partners: number;
        users: number;
        ai: number;
        api: number;
        analyticsApi: number;
        retention: string;
    };
    tiers?: {
        [key: number]: {
            price: {
                monthly: number | null;
                yearly: number | null;
                ids: string[];
            };
            limits: {
                links: number;
                clicks: number;
            };
        };
    };
    featureTitle?: string;
    features?: PlanFeature[];
};
declare const NEW_BUSINESS_PRICE_IDS: string[];
declare const PLANS: PlanDetails[];
declare const FREE_PLAN: PlanDetails;
declare const PRO_PLAN: PlanDetails;
declare const BUSINESS_PLAN: PlanDetails;
declare const ADVANCED_PLAN: PlanDetails;
declare const ENTERPRISE_PLAN: PlanDetails;
declare const SELF_SERVE_PAID_PLANS: PlanDetails[];
declare const FREE_WORKSPACES_LIMIT = 2;
declare const getPlanAndTierFromPriceId: ({ priceId, }: {
    priceId: string;
}) => {
    plan: PlanDetails | null;
    planTier: number;
};
declare const getPlanDetails: ({ plan, planTier, }: {
    plan: string;
    planTier?: number;
}) => PlanDetails;
declare const getNextPlan: (plan?: string | null) => PlanDetails;
declare const isDowngradePlan: ({ currentPlan, newPlan, currentTier, newTier, }: {
    currentPlan: string;
    newPlan: string;
    currentTier?: number;
    newTier?: number;
}) => boolean;
declare const getSuggestedPlan: ({ events, links, }: {
    events?: number;
    links?: number;
}) => {
    plan: PlanDetails;
    planTier: number;
};
declare const isLegacyBusinessPlan: ({ plan, partnersLimit, }: {
    plan?: string;
    partnersLimit?: number;
}) => boolean;

declare const TRIAL_LIMITS: {
    readonly links: 100;
    readonly clicks: 5000;
    readonly payouts: 50000;
    readonly domains: 5;
    readonly tags: 5;
    readonly partnerTags: 5;
    readonly folders: 5;
    readonly groups: 5;
    readonly networkInvites: 0;
    readonly partners: 50;
    readonly users: 3;
    readonly ai: 100;
    readonly api: 120;
    readonly analyticsApi: 2;
};
type TrialLimitResource = keyof typeof TRIAL_LIMITS | "partnerEnrollments" | "freeDotLinkDomain";
declare function getTrialLimitFeaturePhrase(kind: TrialLimitResource): string;
declare function getTrialLimitResourceForOverageBanner({ exceededEvents, exceededLinks, exceededPayouts, }: {
    exceededEvents: boolean;
    exceededLinks: boolean;
    exceededPayouts: boolean;
}): TrialLimitResource | null;
declare const DUB_TRIAL_PERIOD_DAYS = 14;
declare function isWorkspaceBillingTrialActive(trialEndsAt: Date | string | null | undefined): boolean;
type WorkspaceLimitFields = PlanDetails["limits"];
declare function getWorkspaceLimitsForStripeSubscriptionStatus({ planLimits, subscriptionStatus, }: {
    planLimits: WorkspaceLimitFields;
    subscriptionStatus: string;
}): WorkspaceLimitFields;

export { ADVANCED_PLAN as A, BUSINESS_PLAN as B, DUB_TRIAL_PERIOD_DAYS as D, ENTERPRISE_PLAN as E, FREE_PLAN as F, NEW_BUSINESS_PRICE_IDS as N, PLANS as P, SELF_SERVE_PAID_PLANS as S, TRIAL_LIMITS as T, FREE_WORKSPACES_LIMIT as a, PRO_PLAN as b, type PlanDetails as c, type PlanFeature as d, type TrialLimitResource as e, getPlanAndTierFromPriceId as f, getNextPlan as g, getPlanDetails as h, getSuggestedPlan as i, getTrialLimitFeaturePhrase as j, getTrialLimitResourceForOverageBanner as k, getWorkspaceLimitsForStripeSubscriptionStatus as l, isDowngradePlan as m, isLegacyBusinessPlan as n, isWorkspaceBillingTrialActive as o };
