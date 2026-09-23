declare function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit | undefined, options?: {
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
}): Promise<Response>;

export { fetchWithRetry };
