const API_ORIGIN = process.env.API_ORIGIN ?? "https://api.kailopay.com";

const FORWARD_REQUEST_HEADERS = [
  "content-type",
  "cookie",
  "idempotency-key",
  "if-none-match",
  "if-modified-since",
  "range",
  "origin",
  "referer",
] as const;

const STRIP_RESPONSE_HEADERS = [
  "content-encoding",
  "content-length",
  "transfer-encoding",
] as const;

/** Strip Domain=/Secure so session cookies work on localhost via the Next.js proxy. */
function normalizeSetCookieHeader(value: string): string {
  return value
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*Secure/gi, "");
}

export async function proxyBackendAuth(
  request: Request,
  backendPath: string,
): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const targetUrl = `${API_ORIGIN}${backendPath}${incomingUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  // Backend CSRF check for session-authenticated POST /v1/onramps|offramps requires
  // a matching browser Origin (or Referer origin). The proxy must preserve it.
  if (!headers.has("origin")) {
    headers.set("origin", incomingUrl.origin);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? body : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  // Node fetch decompresses the body but keeps content-encoding headers.
  // Browsers then fail to decode the already-plain body ("failed to load response data").
  const responseBody = await upstream.arrayBuffer();

  const responseHeaders = new Headers(upstream.headers);
  for (const name of STRIP_RESPONSE_HEADERS) {
    responseHeaders.delete(name);
  }

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];

  responseHeaders.delete("set-cookie");
  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", normalizeSetCookieHeader(cookie));
    }
  } else {
    const singleCookie = upstream.headers.get("set-cookie");
    if (singleCookie) {
      responseHeaders.set("set-cookie", normalizeSetCookieHeader(singleCookie));
    }
  }

  return new Response(responseBody, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
