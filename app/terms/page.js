"use client";
import Link from "next/link";
import AppLayout from "@/app/components/AppLayout";
import { BD, AC, TX, MU } from "@/lib/theme";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: TX, marginBottom: 10 }}>{title}</h2>
      <div style={{ fontSize: 13, color: MU, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: 40, flex: 1 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: TX }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: MU, marginBottom: 32 }}>Last updated: March 2025</p>

        <Section title="1. Acceptance">
          By accessing or using Lume ("the Service"), you agree to these Terms of Service. If you do not agree, do not use the Service.
        </Section>

        <Section title="2. Description of Service">
          Lume is an AI-powered market research tool that generates analyses, competitor insights, and market data based on user input. All output is AI-generated and subject to the disclaimers set forth in our Legal page.
        </Section>

        <Section title="3. Account & Usage">
          You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. Usage limits apply according to your subscription tier. We reserve the right to suspend or terminate accounts that violate these terms or abuse the Service.
        </Section>

        <Section title="4. Subscriptions & Payments">
          Paid plans are billed via Stripe. Subscriptions renew automatically unless cancelled. Refunds are handled according to our refund policy and applicable consumer law (e.g. EU 14-day withdrawal right where applicable).
        </Section>

        <Section title="5. Intellectual Property">
          You retain ownership of your input. Lume grants you a limited license to use the AI-generated output for your own business purposes. We retain rights to the Service, its design, and underlying technology.
        </Section>

        <Section title="6. Limitation of Liability">
          To the fullest extent permitted by law, Lume and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid for the Service in the twelve months preceding the claim.
        </Section>

        <Section title="7. Changes">
          We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance. Material changes will be communicated via email or in-app notice where appropriate.
        </Section>

        <Section title="8. Governing Law">
          These Terms are governed by the laws of Denmark. Any disputes shall be resolved in the courts of Denmark, unless mandatory consumer protection laws in your jurisdiction require otherwise.
        </Section>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid " + BD + "50" }}>
          <Link href="/legal" style={{ fontSize: 12, color: AC, textDecoration: "none", fontWeight: 500 }}>← Legal & Disclaimers</Link>
        </div>
      </div>
    </AppLayout>
  );
}
