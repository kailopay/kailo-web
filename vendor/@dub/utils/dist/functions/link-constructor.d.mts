declare function linkConstructor({ domain, key, pretty, searchParams, }: {
    domain?: string;
    key?: string;
    pretty?: boolean;
    searchParams?: Record<string, string>;
}): string;
declare function linkConstructorSimple({ domain, key, }: {
    domain: string;
    key: string;
}): string;

export { linkConstructor, linkConstructorSimple };
