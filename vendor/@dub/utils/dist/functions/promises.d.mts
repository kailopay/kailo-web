declare const isFulfilled: <T>(p: PromiseSettledResult<T>) => p is PromiseFulfilledResult<T>;
declare const isRejected: <T>(p: PromiseSettledResult<T>) => p is PromiseRejectedResult;
declare function logPromiseResults<T>(results: PromiseSettledResult<T>[], options?: {
    label?: string;
    items?: {
        id?: string | number;
    }[];
}): {
    successCount: number;
    failureCount: number;
};

export { isFulfilled, isRejected, logPromiseResults };
