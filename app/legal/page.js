"use client";
import AppLayout from "@/app/components/AppLayout";
import { TX, MU } from "@/lib/theme";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: TX, marginBottom: 12 }}>{title}</h2>
      <div style={{ fontSize: 13, color: MU, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <AppLayout>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: 40, flex: 1 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: TX }}>Legal & Disclaimers</h1>
        <p style={{ fontSize: 13, color: MU, marginBottom: 32 }}>Last updated: March 2025</p>

        <Section title="AI-GENERATED CONTENT DISCLAIMER">
          <p style={{ marginBottom: 12 }}>
            All market research, analyses, competitor data, and insights provided by Lume are <strong>AI-generated</strong>. They are produced by large language models and are intended for informational and exploratory purposes only.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong>Important:</strong> AI-generated content may contain errors, inaccuracies, or outdated information. Data points, market sizes, competitor information, and regulatory summaries should <strong>not</strong> be relied upon as factual without independent verification. Always conduct your own due diligence and consult qualified professionals (legal, financial, market research) before making business decisions.
          </p>
          <p>
            Lume does not guarantee the accuracy, completeness, or suitability of any AI-generated output for any particular purpose. Use of the service is at your own risk.
          </p>
        </Section>

        <Section title="GENERAL DISCLAIMER">
          <p style={{ marginBottom: 12 }}>
            Lume provides a research tool to help you explore market ideas. Nothing on this website or in our analyses constitutes professional advice—including but not limited to legal, financial, tax, or business advice. You are solely responsible for your decisions and their outcomes.
          </p>
          <p>
            Links to external sources are provided for reference. We do not control or endorse third-party content. Regulations and market conditions change; information may become outdated.
          </p>
        </Section>

      </div>
    </AppLayout>
  );
}
