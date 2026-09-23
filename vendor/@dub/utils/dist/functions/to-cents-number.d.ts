/**
 * Normalize a cents value from Prisma (number before migration, bigint after) to number.
 * Use for display, JSON serialization, and anywhere a number is required.
 */
declare function toCentsNumber(value: number | bigint | null | undefined): number;

export { toCentsNumber };
