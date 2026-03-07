import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseClient } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
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

    const { returnUrl } = await request.json().catch(() => ({}));
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
