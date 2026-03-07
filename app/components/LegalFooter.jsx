"use client";
import Link from "next/link";
import { BD, CD, TX, MU } from "@/lib/theme";

export default function LegalFooter() {
  return (
    <footer
      style={{
        padding: "20px 24px",
        borderTop: "1px solid " + BD + "50",
        background: CD,
        display: "flex",
        flexWrap: "wrap",
        gap: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Link href="/faq" style={{ fontSize: 12, fontWeight: 500, color: TX, textDecoration: "none" }}>FAQ</Link>
      <Link href="/legal" style={{ fontSize: 12, fontWeight: 500, color: TX, textDecoration: "none" }}>Legal & AI Disclaimer</Link>
      <Link href="/terms" style={{ fontSize: 12, fontWeight: 500, color: TX, textDecoration: "none" }}>Terms</Link>
      <Link href="/privacy" style={{ fontSize: 12, fontWeight: 500, color: TX, textDecoration: "none" }}>Privacy</Link>
    </footer>
  );
}
