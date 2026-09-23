import type { DeveloperFilters } from "./types";

export function buildDeveloperQuery(
  filters: DeveloperFilters & { bucket?: "hour" | "day" | "week" } = {},
): string {
  const params = new URLSearchParams();

  if (filters.client_id) params.set("client_id", filters.client_id);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.currency) params.set("currency", filters.currency);
  if (filters.direction) params.set("direction", filters.direction);
  if (filters.status) params.set("status", filters.status);
  if (filters.payment_method) params.set("payment_method", filters.payment_method);
  if (filters.bucket) params.set("bucket", filters.bucket);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.paging_id) params.set("paging_id", filters.paging_id);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function defaultDeveloperRange(now = new Date()): { from: string; to: string } {
  const to = now.toISOString();
  const fromDate = new Date(now);
  fromDate.setUTCDate(fromDate.getUTCDate() - 30);
  return { from: fromDate.toISOString(), to };
}
