interface CurrencyFormatterOptions extends Intl.NumberFormatOptions {
    trailingZeroDisplay?: "auto" | "stripIfInteger";
}
declare const currencyFormatter: (valueInCents: number | bigint, options?: CurrencyFormatterOptions) => string;

export { currencyFormatter };
