declare const pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;

export { pick };
