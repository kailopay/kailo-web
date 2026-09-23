declare const isValidUrl: (url: string) => boolean;
declare function isSafeLinkHref(href: string | null | undefined): href is string;
declare const getUrlFromString: (str: string) => string;
declare const getUrlObjFromString: (str: string) => URL | null;
declare const getUrlFromStringIfValid: (str: string) => string | null;
declare const getSearchParams: (url: string) => Record<string, string>;
declare const getSearchParamsWithArray: (url: string) => Record<string, string | string[]>;
declare const getParamsFromURL: (url: string) => Record<string, string>;
declare const UTMTags: readonly ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"];
declare const constructURLFromUTMParams: (url: string, utmParams: Record<string, string | null>) => string;
declare const paramsMetadata: {
    display: string;
    key: string;
    examples: string;
}[];
declare const getUTMParamsFromURL: (url: string) => {
    [k: string]: string;
};
declare const getUrlWithoutUTMParams: (url: string) => string;
declare const getPrettyUrl: (url?: string | null) => string;
declare const createHref: (href: string, domain: string, utmParams?: Partial<Record<(typeof UTMTags)[number], string>>) => string;
declare const getPathnameFromUrl: (url: string) => string;
declare const normalizeUrl: (url: string) => string;
declare function buildUrl(baseUrl: string, params?: Record<string, string | number | boolean | null | undefined>): string;
declare const getFileExtension: (url: string) => string | null;

export { UTMTags, buildUrl, constructURLFromUTMParams, createHref, getFileExtension, getParamsFromURL, getPathnameFromUrl, getPrettyUrl, getSearchParams, getSearchParamsWithArray, getUTMParamsFromURL, getUrlFromString, getUrlFromStringIfValid, getUrlObjFromString, getUrlWithoutUTMParams, isSafeLinkHref, isValidUrl, normalizeUrl, paramsMetadata };
