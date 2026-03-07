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

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: 40, flex: 1 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: TX }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: MU, marginBottom: 32 }}>Last updated: March 2025</p>

        <Section title="1. Data Controller">
          Lume ("we", "us") processes your personal data in accordance with the EU General Data Protection Regulation (GDPR) and applicable Danish data protection law.
        </Section>

        <Section title="2. Data We Collect">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Account data:</strong> Email, password (hashed), and profile information you provide when signing up.</li>
            <li><strong>Usage data:</strong> Analyses you run, ideas you submit, and usage counts (e.g. analyses per month) for billing and limits.</li>
            <li><strong>Payment data:</strong> Processed by Stripe; we do not store full card numbers. We store subscription status and customer IDs.</li>
            <li><strong>Technical data:</strong> IP address, browser type, and similar data for security and analytics.</li>
          </ul>
        </Section>

        <Section title="3. Legal Basis & Purpose">
          We process your data based on: (a) contract performance (providing the Service), (b) legitimate interests (security, analytics, improvement), and (c) consent where required (e.g. marketing). Your ideas and analyses are used solely to generate AI research and to display your saved analyses.
        </Section>

        <Section title="4. Third Parties">
          We use Supabase (auth & database), Stripe (payments), and Claude/Anthropic (AI processing). These providers process data on our behalf under data processing agreements. We do not sell your personal data.
        </Section>

        <Section title="5. Retention">
          Account and analysis data are retained while your account is active. You may request deletion at any time. We retain anonymized or aggregated data where legally permitted for analytics and improvement.
        </Section>

        <Section title="6. Your Rights (GDPR)">
          You have the right to: access your data, rectify inaccuracies, erase data ("right to be forgotten"), restrict processing, data portability, object to processing, and withdraw consent. You may also lodge a complaint with the Danish Data Protection Agency (Datatilsynet). Contact us at the email provided on the website to exercise these rights.
        </Section>

        <Section title="7. Security">
          We use industry-standard measures to protect your data, including encryption in transit (HTTPS) and at rest. Access to personal data is restricted to authorized personnel.
        </Section>

        <Section title="8. Cookies">
          We use essential cookies for authentication and session management. We may use analytics cookies to improve the Service. You can manage cookie preferences in your browser.
        </Section>

        <Section title="9. Changes">
          We may update this Privacy Policy. Material changes will be communicated via email or in-app notice. Continued use after changes constitutes acceptance.
        </Section>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid " + BD + "50" }}>
          <Link href="/legal" style={{ fontSize: 12, color: AC, textDecoration: "none", fontWeight: 500 }}>← Legal & Disclaimers</Link>
        </div>
      </div>
    </AppLayout>
  );
}
