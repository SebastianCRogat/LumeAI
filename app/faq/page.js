"use client";
import Link from "next/link";
import AppLayout from "@/app/components/AppLayout";
import { CD, BD, AC, TX, MU, DM, CARD_RADIUS } from "@/lib/theme";

const FAQ_ITEMS = [
  {
    q: "What is Lume?",
    a: "Lume is an AI-powered market research engine. Enter a business idea and Lume generates market analysis, competitor insights, and product recommendations to help you understand a market before building.",
  },
  {
    q: "How accurate is the research?",
    a: "Lume uses AI to generate research. Data points marked as VERIFIED are backed by cited sources when available. Assumptions are clearly labeled. Always verify critical data independently—see our Legal & AI Disclaimer for details.",
  },
  {
    q: "What are the pricing tiers?",
    a: "Free: try with sample data only (no live research). Pro ($39/mo): 10 analyses + 1 deep research per month. Business ($99/mo): 50 analyses + 5 deep research per month. See the Pricing page for full details.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Dashboard and click 'Manage subscription'. You'll be taken to Stripe's billing portal where you can cancel, update payment methods, or view invoices.",
  },
  {
    q: "Can I export my analyses?",
    a: "Pro and Business plans include PDF export. Saved analyses are available in your Dashboard and can be revisited anytime.",
  },
  {
    q: "What regions does Lume support?",
    a: "Lume can research any market. Specify your target region in your idea (e.g. 'Meal kits Denmark', 'Dog food EU') for more relevant results.",
  },
  {
    q: "How do I try Lume?",
    a: "Use the example buttons on the home page (Meal kits Denmark, Dog food EU, SaaS accounting) to explore sample analyses. Sign in and upgrade to Pro for live AI research.",
  },
];

export default function FAQPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: 40, flex: 1 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: TX }}>FAQ</h1>
        <p style={{ fontSize: 13, color: MU, marginBottom: 32 }}>Frequently asked questions about Lume</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} style={{ padding: 20, background: CD, border: "1px solid " + BD + "50", borderRadius: CARD_RADIUS, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: TX, marginBottom: 10 }}>{item.q}</h3>
              <p style={{ fontSize: 13, color: MU, lineHeight: 1.7, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid " + BD + "50", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/legal" style={{ fontSize: 12, color: AC, textDecoration: "none", fontWeight: 500 }}>Legal & Disclaimers →</Link>
          <Link href="/terms" style={{ fontSize: 12, color: AC, textDecoration: "none", fontWeight: 500 }}>Terms of Service →</Link>
          <Link href="/privacy" style={{ fontSize: 12, color: AC, textDecoration: "none", fontWeight: 500 }}>Privacy Policy →</Link>
        </div>
      </div>
    </AppLayout>
  );
}
