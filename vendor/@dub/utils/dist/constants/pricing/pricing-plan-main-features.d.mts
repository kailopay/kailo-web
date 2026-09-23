import { ReactNode } from 'react';

type HeroFeature = {
    id?: string;
    text: string;
    disabled?: boolean;
    tooltip?: ReactNode | {
        title: string;
        cta?: string;
        href?: string;
    };
};
declare const PRICING_PLAN_MAIN_FEATURES: {
    links: {
        Pro: {
            features: HeroFeature[];
        }[];
        Business: {
            features: HeroFeature[];
        }[];
        Advanced: {
            features: HeroFeature[];
        }[];
        Enterprise: {
            features: HeroFeature[];
        }[];
    };
    partners: {
        Business: {
            features: HeroFeature[];
        }[];
        Advanced: {
            features: HeroFeature[];
        }[];
        Enterprise: {
            features: HeroFeature[];
        }[];
    };
};

export { PRICING_PLAN_MAIN_FEATURES };
