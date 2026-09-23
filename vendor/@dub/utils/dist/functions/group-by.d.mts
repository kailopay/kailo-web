declare function groupBy<T>(items: readonly T[], keyFn: (item: T) => string): Record<string, T[]>;

export { groupBy };
