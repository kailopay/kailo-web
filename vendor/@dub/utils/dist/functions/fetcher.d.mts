declare function fetcher<JSON = any>(input: RequestInfo, init?: RequestInit & {
    headers?: Record<string, string>;
}): Promise<JSON>;

export { fetcher };
