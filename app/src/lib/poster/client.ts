import "server-only";

// Thin client for the Poster POS API (dev.joinposter.com). Server-only: tokens
// must never reach a client bundle. See docs/PROJECT_SPEC.md §1.4 for the account
// structure (one Connect account for the shared catalog, three branch accounts
// for their own stock/orders) and docs/ARCHITECTURE.md for how each is used.

export type PosterAccount = "connect" | "left" | "centre" | "alfarabi";

const TOKEN_ENV_VAR: Record<PosterAccount, string> = {
  connect: "POSTER_CONNECT_TOKEN",
  left: "POSTER_API_TOKEN_LEFT",
  centre: "POSTER_API_TOKEN_CENTRE",
  alfarabi: "POSTER_API_TOKEN_ALFARABI",
};

const API_BASE = "https://joinposter.com/api";

export class PosterConfigError extends Error {}
export class PosterApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number
  ) {
    super(message);
  }
}

export function getPosterToken(account: PosterAccount): string | null {
  const envVar = TOKEN_ENV_VAR[account];
  return process.env[envVar]?.trim() || null;
}

export function requirePosterToken(account: PosterAccount): string {
  const token = getPosterToken(account);
  if (!token) {
    throw new PosterConfigError(
      `${TOKEN_ENV_VAR[account]} is not set — add it to app/.env.local to use the "${account}" Poster account.`
    );
  }
  return token;
}

/** True once every account this deployment needs has a token configured. */
export function isPosterConfigured(accounts: PosterAccount[] = ["connect", "left", "centre", "alfarabi"]): boolean {
  return accounts.every((a) => getPosterToken(a) !== null);
}

interface PosterFetchOptions {
  method?: "GET" | "POST";
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

// Poster's own examples POST via PHP's http_build_query, not a JSON body — a
// nested array like `products: [{product_id: 1}]` becomes the form-encoded
// `products[0][product_id]=1`. Mirrors that so the fields actually arrive
// (a JSON body left every field looking unset to Poster, failing with a bare
// "42 — переменной не существует" no matter what the fields were named).
function toFormEntries(value: unknown, prefix: string, out: string[]): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => toFormEntries(v, `${prefix}[${i}]`, out));
  } else if (typeof value === "object") {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      toFormEntries(v, prefix ? `${prefix}[${key}]` : key, out);
    }
  } else {
    out.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`);
  }
}

function toFormBody(body: unknown): string {
  const out: string[] = [];
  toFormEntries(body, "", out);
  return out.join("&");
}

/**
 * Calls a single Poster API method against one account. Throws PosterConfigError
 * if the account's token is missing, PosterApiError if Poster returns an error
 * payload. Callers decide the fallback (mock data, skip, etc.) — this client
 * never silently swallows a failure.
 */
export async function posterFetch<T>(
  account: PosterAccount,
  method: string,
  { method: httpMethod = "GET", params = {}, body }: PosterFetchOptions = {}
): Promise<T> {
  const token = requirePosterToken(account);
  const search = new URLSearchParams({ token, format: "json" });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const url = `${API_BASE}/${method}?${search.toString()}`;

  const res = await fetch(url, {
    method: httpMethod,
    headers: body ? { "Content-Type": "application/x-www-form-urlencoded" } : undefined,
    body: body ? toFormBody(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new PosterApiError(`Poster API HTTP ${res.status} on ${method} (account: ${account})`, res.status);
  }

  const json = (await res.json()) as { response?: T; error?: string | { code?: number; message?: string }; code?: number };
  if (json.error) {
    // Poster's error shape isn't consistent across endpoints (sometimes a flat
    // code, sometimes {code, message} nested under error) — log the raw body
    // instead of assuming a shape, so a real failure doesn't come through as
    // just a bare, unexplained number.
    const detail = typeof json.error === "object" ? JSON.stringify(json.error) : String(json.error);
    throw new PosterApiError(`Poster API error on ${method} (account: ${account}): ${detail}`, json.code);
  }
  return json.response as T;
}

// Only Уалиханова (centre) feeds the site's stock and takes its orders —
// client's call, 2026-09-23. left/alfarabi tokens stay configured but unused.
export const BRANCH_ACCOUNTS: Extract<PosterAccount, "left" | "centre" | "alfarabi">[] = ["centre"];
