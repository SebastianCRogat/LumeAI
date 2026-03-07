import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const priceId = sub.items.data[0]?.price.id;
        const tier = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS ? "business" : "pro";
        await supabaseAdmin.from("profiles").update({ tier }).eq("id", userId);
      }
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      let userId = sub.metadata?.user_id;
      if (!userId && sub.customer) {
        const { data: p } = await supabaseAdmin.from("profiles").select("id").eq("stripe_customer_id", sub.customer).single();
        if (p) userId = p.id;
      }
      if (userId) {
        const tier = sub.status === "active" ? (sub.items?.data?.[0]?.price?.id === process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS ? "business" : "pro") : "free";
        await supabaseAdmin.from("profiles").update({ tier }).eq("id", userId);
      }
    }
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
