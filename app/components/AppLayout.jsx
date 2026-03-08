"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import AuthModal from "./AuthModal";
import LegalFooter from "./LegalFooter";
import {
  BG,
  PN,
  CD,
  BD,
  AC,
  TX,
  MU,
  DM,
  OUTER_BG,
  BTN_RADIUS,
} from "@/lib/theme";

function LumeLogo({ size }) {
  const s = size || 24;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <rect width={32} height={32} rx={8} fill={BG} />
      <path d="M10 22V10h3v12h6v2H10z" fill={TX} />
      <path
        d="M22 14.5c0-.8.6-1.5 1.4-1.5.8 0 1.4.7 1.4 1.5v5c0 .8-.6 1.5-1.4 1.5-.8 0-1.4-.7-1.4-1.5v-5z"
        fill={TX}
        opacity={0.6}
      />
    </svg>
  );
}

function IconCheckBox() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={18} y1={20} x2={18} y2={10} />
      <line x1={12} y1={20} x2={12} y2={4} />
      <line x1={6} y1={20} x2={6} y2={14} />
    </svg>
  );
}

function IconPricing() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={12} y1={1} x2={12} y2={23} />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const { user, displayName } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const isResearch = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const isPricing = pathname === "/pricing";

  return (
    <div
      style={{
        height: "100vh",
        background: `
          radial-gradient(ellipse 60% 50% at 55% 50%, rgba(0,180,255,0.25) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 60% 45%, rgba(0,230,255,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 50% 50%, rgba(20,60,200,0.4) 0%, transparent 70%),
          linear-gradient(160deg, #0a0a2e 0%, #0c1a5e 30%, #1040a0 50%, #0c1a5e 70%, #0a0a2e 100%)
        `,
        color: TX,
        fontFamily: "system-ui,sans-serif",
        padding: "24px 20px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          height: "100%",
          margin: "0 auto",
          background: BG,
          borderRadius: 24,
          boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 16px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", flex: 1 }}>
        <header
          style={{
            flexShrink: 0,
            background: PN,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid " + BD + "50",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <LumeLogo size={32} />
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Link
                href="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: BTN_RADIUS,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isResearch ? TX : MU,
                  textDecoration: "none",
                  background: isResearch ? CD : "transparent",
                  border: "none",
                }}
              >
                <IconCheckBox />
                <span>Research</span>
              </Link>
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: BTN_RADIUS,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isDashboard ? TX : MU,
                  textDecoration: "none",
                  background: isDashboard ? CD : "transparent",
                  border: "none",
                }}
              >
                <IconChart />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/pricing"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: BTN_RADIUS,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isPricing ? TX : MU,
                  textDecoration: "none",
                  background: isPricing ? CD : "transparent",
                  border: "none",
                }}
              >
                <IconPricing />
                <span>Pricing</span>
              </Link>
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {user ? (
              <>
                <Link
                  href="/profile"
                  style={{
                    textAlign: "right",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: TX }}>
                    {displayName || "User"}
                  </div>
                  <div style={{ fontSize: 11, color: DM }}>
                    {"@" + (displayName || "user").toLowerCase().replace(/\s+/g, "")}
                  </div>
                </Link>
                <Link
                  href="/profile"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: BD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: TX,
                    textDecoration: "none",
                  }}
                >
                  {(displayName || "U")[0].toUpperCase()}
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  style={{
                    padding: "8px 14px",
                    background: CD,
                    border: "1px solid " + BD,
                    borderRadius: BTN_RADIUS,
                    fontSize: 11,
                    fontWeight: 600,
                    color: MU,
                    cursor: "pointer",
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/pricing"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: MU,
                    textDecoration: "none",
                    padding: "8px 14px",
                    background: CD,
                    borderRadius: BTN_RADIUS,
                  }}
                >
                  Pricing
                </Link>
                <button
                  onClick={() => setShowAuth(true)}
                  style={{
                    padding: "8px 18px",
                    background: AC,
                    color: BG,
                    border: "none",
                    borderRadius: BTN_RADIUS,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </header>

        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => setShowAuth(false)}
          />
        )}

        <main
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {children}
        </main>

        <div style={{ flexShrink: 0 }}>
          <LegalFooter />
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
