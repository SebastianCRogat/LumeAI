import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/rateLimit";
import { validateBillingPortalBody } from "@/lib/validate";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key);
}

export async function POST(request) {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit("billing:" + ip, RATE_LIMITS.default);
  if (!allowed) return rateLimitResponse(retryAfter ?? 60);

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  try {
    const supabase = createSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();
    const customerId = profile?.stripe_customer_id;
    if (!customerId) return NextResponse.json({ error: "No subscription found" }, { status: 400 });

    let body;
    try {
      body = await request.json().catch(() => ({}));
    } catch {
      body = {};
    }
    const validated = validateBillingPortalBody(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }
    const { returnUrl } = validated;

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || (request.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/dashboard",
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Billing portal error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
