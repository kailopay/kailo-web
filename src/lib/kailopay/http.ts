export class KailopayError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null,
    readonly requestId: string | null,
    readonly orderId: string | null = null,
    readonly details: string | null = null,
  ) {
    super(message);
    this.name = "KailopayError";
  }
}

export type FetchOptions = {
  method?: string;
  body?: unknown;
  idempotencyKey?: string;
  signal?: AbortSignal;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function parseApiError(response: Response): Promise<KailopayError> {
  let requestId = response.headers.get("X-Request-ID");
  let orderId: string | null = null;
  let message = response.statusText || "Request failed";
  let code: string | null = null;
  let details: string | null = null;

  try {
    const payload: unknown = await response.json();
    if (isRecord(payload)) {
      const bodyRequestId = payload.request_id;
      if (requestId === null && typeof bodyRequestId === "string") {
        requestId = bodyRequestId;
      }
      const bodyOrderId = payload.order_id;
      if (typeof bodyOrderId === "string") orderId = bodyOrderId;

      const error = payload.error;
      if (typeof error === "string") {
        message = error;
      } else if (isRecord(error) && typeof error.message === "string") {
        message = error.message;
        if (typeof error.code === "string") code = error.code;
        if (typeof error.details === "string") details = error.details;
      }
    }
  } catch {
    // Non-JSON body.
  }

  return new KailopayError(message, response.status, code, requestId, orderId, details);
}

export async function kailopayFetch(
  path: string,
  options: FetchOptions = {},
): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.idempotencyKey !== undefined) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  const response = await fetch(path, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "include",
    cache: "no-store",
    signal: options.signal,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new KailopayError(
      "Malformed response from server",
      response.status,
      "MALFORMED_RESPONSE",
      response.headers.get("X-Request-ID"),
    );
  }
}

export function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string") {
    throw new KailopayError(`Malformed response: field "${key}"`, 0, "MALFORMED_RESPONSE", null);
  }
  return value;
}

export function numberField(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number") {
    throw new KailopayError(`Malformed response: field "${key}"`, 0, "MALFORMED_RESPONSE", null);
  }
  return value;
}

export function optionalStringField(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new KailopayError(`Malformed response: field "${key}"`, 0, "MALFORMED_RESPONSE", null);
  }
  return value;
}
