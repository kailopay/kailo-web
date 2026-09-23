declare const validKeyRegex: RegExp;
declare const isUnsupportedKey: (key: string) => boolean;
declare const isReservedKeyGlobal: (key: string) => boolean;

export { isReservedKeyGlobal, isUnsupportedKey, validKeyRegex };
