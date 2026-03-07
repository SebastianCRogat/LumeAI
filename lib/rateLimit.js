/**
 * In-memory rate limiter for API routes.
 * OWASP: Limit request rate per identifier (IP + optional user) to mitigate abuse.
 * Note: In serverless, this is per-instance; for multi-instance production consider Redis (e.g. Upstash).
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;   // e.g. 60 req/min per IP for general endpoints
const MAX_ANALYZE_PER_WINDOW = 20;    // stricter for expensive analyze endpoint

const store = new Map(); // key -> { count, resetAt }

function prune() {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.resetAt < now) store.delete(k);
  }
}

/**
 * @param {string} identifier - e.g. IP or userId
 * @param {{ windowMs?: number, max?: number }} options
 * @returns {{ allowed: boolean, retryAfter?: number }}
 */
export function checkRateLimit(identifier, options = {}) {
  const windowMs = options.windowMs ?? WINDOW_MS;
  const max = options.max ?? MAX_REQUESTS_PER_WINDOW;
  if (store.size > 10000) prune();

  const now = Date.now();
  let entry = store.get(identifier);
  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, entry);
    return { allowed: true };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true };
}

/**
 * Get client IP from request (Vercel/proxy headers).
 * @param {Request} request
 */
export function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Rate limit configs per route type */
export const RATE_LIMITS = {
  default: { windowMs: WINDOW_MS, max: MAX_REQUESTS_PER_WINDOW },
  analyze: { windowMs: WINDOW_MS, max: MAX_ANALYZE_PER_WINDOW },
};

/**
 * Build a 429 response with Retry-After (OWASP: graceful rate limit response).
 * @param {number} retryAfterSeconds
 */
export function rateLimitResponse(retryAfterSeconds) {
  const headers = { "Retry-After": String(retryAfterSeconds) };
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later.", retryAfter: retryAfterSeconds }),
    { status: 429, headers: { "Content-Type": "application/json", ...headers } }
  );
}
