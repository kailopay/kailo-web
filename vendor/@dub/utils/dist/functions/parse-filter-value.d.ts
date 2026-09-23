type FilterOperator = "IS" | "IS_NOT" | "IS_ONE_OF" | "IS_NOT_ONE_OF";
type SQLOperator = "IN" | "NOT IN";
interface ParsedFilter {
    operator: FilterOperator;
    sqlOperator: SQLOperator;
    values: string[];
}
/**
 * Parse filter value from URL format to structured filter
 *
 * Formats supported:
 * - "US" → IS, values: ["US"], SQL: IN
 * - "US,BR,FR" → IS_ONE_OF, values: ["US", "BR", "FR"], SQL: IN
 * - "-US" → IS_NOT, values: ["US"], SQL: NOT IN
 * - "-US,BR" → IS_NOT_ONE_OF, values: ["US", "BR"], SQL: NOT IN
 *
 * Note: All filters now use IN/NOT IN operators for consistency,
 * even for single values. This simplifies SQL query generation.
 *
 * @param value - The filter value string (can include "-" prefix for negation)
 * @returns Parsed filter with operator and values array
 */
declare function parseFilterValue(value: string | string[] | undefined): ParsedFilter | undefined;
/**
 * Build filter value string from parsed filter
 *
 * @param parsed - The parsed filter object
 * @returns URL-formatted filter string
 */
declare function buildFilterValue(parsed: ParsedFilter): string;

export { FilterOperator, ParsedFilter, SQLOperator, buildFilterValue, parseFilterValue };
