export type AccountIntent = "business" | "individual";

const ACCOUNT_INTENTS = new Set<AccountIntent>(["business", "individual"]);

export function parseAccountIntent(value: string | null | undefined): AccountIntent {
  if (value && ACCOUNT_INTENTS.has(value as AccountIntent)) {
    return value as AccountIntent;
  }
  return "business";
}

export function resolvePostAuthPath(
  intent: AccountIntent,
  nextPath?: string | null,
): string {
  const next = nextPath?.trim();
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return intent === "individual" ? "/individuals" : "/dashboard";
}

export function authPageHref(
  page: "login" | "register",
  intent: AccountIntent,
  nextPath?: string | null,
): string {
  const params = new URLSearchParams({ intent });
  const next = nextPath?.trim();
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    params.set("next", next);
  }
  return `/${page}?${params.toString()}`;
}

export function developerAuthPageHref(
  page: "login" | "register",
  nextPath?: string | null,
): string {
  const next = nextPath?.trim();
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return `/${page}?next=${encodeURIComponent(next)}`;
  }
  return `/${page}`;
}
