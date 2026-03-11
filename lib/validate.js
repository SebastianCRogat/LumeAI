/**
 * Strict input validation for API routes (OWASP: validate/sanitize all user input,
 * reject unexpected fields, type checks, length limits).
 * Schema-based validation; only allowed fields are passed through.
 */

/**
 * Validate and sanitize analyze POST body. Rejects extra fields.
 * @param {unknown} body
 * @returns {{ idea: string, deep: boolean } | { error: string, status: number }}
 */
export function validateAnalyzeBody(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid body", status: 400 };
  }
  const idea = body.idea;
  if (typeof idea !== "string") {
    return { error: "idea must be a string", status: 400 };
  }
  const trimmed = idea.trim();
  if (trimmed.length < 10) {
    return { error: "Please describe your business idea in a few words (e.g. 'Meal kits in Denmark')", status: 400 };
  }
  if (trimmed.length > 250) {
    return { error: "Input must be 250 characters or less", status: 400 };
  }
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (wordCount < 2) {
    return { error: "Please describe your idea with at least 2 words (e.g. 'Dog food EU')", status: 400 };
  }
  const deep = typeof body.deep === "boolean" ? body.deep : false;
  return { idea: trimmed, deep };
}

/**
 * Validate checkout POST body. priceId, successUrl, cancelUrl required; mode optional ("subscription" | "payment").
 */
export function validateCheckoutBody(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid body", status: 400 };
  }
  const priceId = body.priceId;
  const successUrl = body.successUrl;
  const cancelUrl = body.cancelUrl;
  const mode = body.mode === "payment" ? "payment" : "subscription";
  if (typeof priceId !== "string" || !priceId.trim()) {
    return { error: "priceId required", status: 400 };
  }
  if (typeof successUrl !== "string" || !successUrl.trim()) {
    return { error: "successUrl required", status: 400 };
  }
  if (typeof cancelUrl !== "string" || !cancelUrl.trim()) {
    return { error: "cancelUrl required", status: 400 };
  }
  if (priceId.length > 200 || successUrl.length > 2048 || cancelUrl.length > 2048) {
    return { error: "Invalid input length", status: 400 };
  }
  return { priceId: priceId.trim(), successUrl: successUrl.trim(), cancelUrl: cancelUrl.trim(), mode };
}

/**
 * Validate billing-portal POST body. Only returnUrl allowed (optional).
 */
export function validateBillingPortalBody(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { returnUrl: null };
  }
  const returnUrl = body.returnUrl;
  if (returnUrl === undefined || returnUrl === null) return { returnUrl: null };
  if (typeof returnUrl !== "string") return { error: "returnUrl must be a string", status: 400 };
  if (returnUrl.length > 2048) return { error: "returnUrl too long", status: 400 };
  return { returnUrl: returnUrl.trim() || null };
}

/**
 * Validate profile PATCH body. Only display_name allowed.
 */
export function validateProfilePatchBody(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid body", status: 400 };
  }
  const display_name = body.display_name;
  if (typeof display_name !== "string") {
    return { error: "display_name required", status: 400 };
  }
  const trimmed = display_name.trim().slice(0, 100);
  if (!trimmed) {
    return { error: "display_name required", status: 400 };
  }
  return { display_name: trimmed };
}
