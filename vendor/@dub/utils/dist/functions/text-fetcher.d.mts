declare function textFetcher(input: RequestInfo, init?: RequestInit & {
    headers?: Record<string, string>;
}): Promise<string>;

export { textFetcher };
