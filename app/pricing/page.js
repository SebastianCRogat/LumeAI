"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AppLayout from "@/app/components/AppLayout";
import { BG, PN, CD, BD, AC, TX, MU, DM, GR, BL, CARD_RADIUS } from "@/lib/theme";

const PLANS = [
  { id: "free", name: "Free", price: "$0", period: "/month", standard: 1, deep: 0, model: "Claude Haiku", features: ["1 free analysis ever (one-time)", "Basic AI model (Haiku)", "Explore sample analyses", "Upgrade to Pro for full power"], cta: "Free", highlight: false },
  { id: "pro", name: "Pro", price: "$39", period: "/month", standard: 10, deep: 1, model: "Claude Opus", features: ["10 analyses + 1 deep research/month", "Full competitor analysis", "Pie chart & ad snapshots", "Verified sources & links", "Analysis history"], cta: "Upgrade to Pro", highlight: true, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO },
  { id: "business", name: "Business", price: "$99", period: "/month", standard: 50, deep: 5, model: "Claude Opus", features: ["50 analyses + 5 deep research/month", "Everything in Pro", "5× more analyses", "5× more deep research"], cta: "Upgrade to Business", highlight: false, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS },
];

function fetchTier(session) {
  return fetch("/api/profile", { headers: { Authorization: "Bearer " + session.access_token } })
    .then((r) => r.json())
    .then((d) => d.tier || "free");
}

function PricingContent() {
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading } = useAuth();
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    if (user && session) {
      fetchTier(session).then((t) => setTier(t)).catch(() => {});
    }
  }, [user, session]);

  // After checkout redirect, webhook may not have run yet: poll profile until tier updates
  useEffect(() => {
    const success = searchParams.get("success") === "1";
    if (!success || !user || !session) return;
    let count = 0;
    const maxPolls = 6;
    const interval = setInterval(() => {
      count += 1;
      fetchTier(session).then((t) => {
        setTier(t);
        if (t !== "free" || count >= maxPolls) {
          clearInterval(interval);
          if (typeof window !== "undefined" && count >= maxPolls) {
            const u = new URL(window.location.href);
            u.searchParams.delete("success");
            window.history.replaceState({}, "", u.pathname + u.search);
          }
        }
      }).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [searchParams, user, session]);

  async function handleUpgrade(plan) {
    const priceId = plan.priceId;
    if (!priceId) {
      alert("Stripe price not configured. Add NEXT_PUBLIC_STRIPE_PRICE_PRO and NEXT_PUBLIC_STRIPE_PRICE_BUSINESS to .env.local");
      return;
    }
    if (!user || !session) {
      window.location.href = "/?signin=1";
      return;
    }
    setLoading(plan.id);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({
          priceId,
          successUrl: window.location.origin + "/pricing?success=1",
          cancelUrl: window.location.origin + "/pricing",
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Checkout failed");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 40, flex: 1 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>Pricing</h1>
        <p style={{ fontSize: 14, color: MU, textAlign: "center", marginBottom: 40 }}>Choose the plan that fits your research needs</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "stretch" }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                padding: 24,
                background: plan.highlight ? CD : PN,
                border: "1px solid " + (plan.highlight ? AC + "66" : BD + "50"),
                borderRadius: CARD_RADIUS,
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: 14, fontFamily: "monospace", fontWeight: 700, color: AC, marginBottom: 8 }}>{plan.name.toUpperCase()}</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: MU }}>{plan.period}</span></div>
              <div style={{ fontSize: 12, color: DM, marginBottom: 16 }}>{plan.model}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: TX, padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: GR }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => plan.id !== "free" && handleUpgrade(plan)}
                disabled={plan.id === "free" || tier === plan.id || loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: plan.id === "free" || tier === plan.id ? BD : plan.highlight ? AC : BL,
                  color: plan.id === "free" || tier === plan.id ? DM : BG,
                  border: "none",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: plan.id === "free" || tier === plan.id ? "default" : "pointer",
                }}
              >
                {loading === plan.id ? "..." : tier === plan.id ? "Current plan" : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<AppLayout><div style={{ maxWidth: 900, margin: "0 auto", padding: 40, flex: 1, textAlign: "center", color: DM }}>Loading...</div></AppLayout>}>
      <PricingContent />
    </Suspense>
  );
}
