"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import AppLayout from "@/app/components/AppLayout";
import { BG, CD, BD, AC, TX, MU, DM, GR, CARD_RADIUS, BTN_RADIUS } from "@/lib/theme";

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState([]);
  const [usage, setUsage] = useState(null);
  const [tier, setTier] = useState("free");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [upgrading, setUpgrading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analyses")
      .select("id, idea, created_at, result")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setAnalyses(data || []));

    const month = new Date().toISOString().slice(0, 7);
    supabase
      .from("usage")
      .select("standard_count, deep_count")
      .eq("user_id", user.id)
      .eq("month", month)
      .single()
      .then(({ data }) => setUsage(data));

    if (session) {
      fetch("/api/profile", { headers: { Authorization: "Bearer " + session.access_token } })
        .then((r) => r.json())
        .then((d) => d.tier && setTier(d.tier))
        .catch(() => {});
    }
  }, [user, session]);

  async function openBillingPortal() {
    if (!session) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ returnUrl: window.location.origin + "/dashboard" }),
      });
      const data = await res.json();
      if (res.ok && data.url) window.location.href = data.url;
      else alert(data.error || "Could not open subscription settings");
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setPortalLoading(false);
    }
  }

  async function grantPro() {
    if (!session || !isAdmin(user)) return;
    setUpgrading(true);
    try {
      const res = await fetch("/api/admin/upgrade-pro", {
        method: "POST",
        headers: { Authorization: "Bearer " + session.access_token },
      });
      const data = await res.json();
      if (res.ok) {
        setTier("pro");
        if (session.access_token) {
          fetch("/api/profile", { headers: { Authorization: "Bearer " + session.access_token } })
            .then((r) => r.json())
            .then((d) => d.tier && setTier(d.tier));
        }
      } else {
        alert(data.error || "Failed (" + res.status + ")");
      }
    } catch (e) {
      alert(e.message || "Network error");
    } finally {
      setUpgrading(false);
    }
  }

  if (loading || !user) {
    return (
      <AppLayout>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: DM, fontFamily: "monospace" }}>
          Loading...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, flex: 1 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: MU, marginBottom: 24 }}>Your saved analyses and usage</p>

        {usage && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
            <div style={{ padding: 20, background: CD, border: "1px solid " + BD, borderRadius: CARD_RADIUS, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: DM, marginBottom: 8, textTransform: "uppercase" }}>This month</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: AC }}>{usage.standard_count || 0}</div>
              <div style={{ fontSize: 12, color: MU }}>analyses</div>
            </div>
            <div style={{ padding: 20, background: CD, border: "1px solid " + BD, borderRadius: CARD_RADIUS, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: DM, marginBottom: 8, textTransform: "uppercase" }}>Deep research</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: AC }}>{usage.deep_count || 0}</div>
              <div style={{ fontSize: 12, color: MU }}>/ {(isAdmin(user) ? 5 : tier === "pro" ? 1 : tier === "business" ? 5 : 0)} this month</div>
            </div>
            <div style={{ padding: 20, background: CD, border: "1px solid " + BD, borderRadius: CARD_RADIUS, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: DM, marginBottom: 8, textTransform: "uppercase" }}>{tier} tier</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: GR }}>{tier === "pro" ? 10 : tier === "business" ? 50 : 0}</div>
              <div style={{ fontSize: 12, color: MU }}>analyses/month</div>
              {tier === "free" && (
                <Link href="/pricing" style={{ display: "block", marginTop: 8, fontSize: 11, color: AC, textDecoration: "none" }}>Upgrade for more →</Link>
              )}
              {isAdmin(user) && tier === "free" && (
                <button onClick={grantPro} disabled={upgrading} style={{ display: "block", marginTop: 8, fontSize: 11, color: AC, background: "none", border: "none", cursor: upgrading ? "wait" : "pointer", padding: 0 }}>
                  {upgrading ? "..." : "Grant Pro (admin)"}
                </button>
              )}
              {(tier === "pro" || tier === "business") && (
                <button onClick={openBillingPortal} disabled={portalLoading} style={{ display: "block", marginTop: 8, fontSize: 11, color: MU, background: "none", border: "none", cursor: portalLoading ? "wait" : "pointer", padding: 0, textDecoration: "underline" }}>
                  {portalLoading ? "..." : "Manage subscription"}
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: DM, margin: 0, textTransform: "uppercase" }}>Saved analyses</h2>
          {analyses.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color: DM, marginRight: 4 }}>Sort</span>
              {["date", "idea"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSortBy(key)}
                  style={{
                    padding: "4px 10px",
                    background: sortBy === key ? BD + "66" : "transparent",
                    border: "none",
                    borderRadius: 6,
                    color: sortBy === key ? TX : DM,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {key}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                style={{
                  padding: "4px 8px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 6,
                  color: DM,
                  fontSize: 12,
                  cursor: "pointer",
                  marginLeft: 4,
                }}
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          )}
        </div>
        {analyses.length === 0 ? (
          <div style={{ padding: 32, background: CD, border: "1px solid " + BD, borderRadius: CARD_RADIUS, textAlign: "center", color: MU, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
            No analyses yet. Run a research on the <Link href="/" style={{ color: AC }}>home page</Link> to get started.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...analyses]
              .sort((a, b) => {
                let va, vb;
                if (sortBy === "date") {
                  va = new Date(a.created_at).getTime();
                  vb = new Date(b.created_at).getTime();
                } else {
                  va = (a.idea || "").toLowerCase();
                  vb = (b.idea || "").toLowerCase();
                }
                if (sortOrder === "asc") return va > vb ? 1 : va < vb ? -1 : 0;
                return va < vb ? 1 : va > vb ? -1 : 0;
              })
              .map((a) => (
              <Link
                key={a.id}
                href={"/analysis/" + a.id}
                style={{
                  display: "block",
                  padding: 16,
                  background: CD,
                  border: "1px solid " + BD,
                  borderRadius: CARD_RADIUS,
                  textDecoration: "none",
                  color: TX,
                  transition: "background 0.15s",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = BD + "44"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = CD; }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.result?.summary?.title || a.idea}</div>
                <div style={{ fontSize: 12, color: DM }}>{a.idea} · {new Date(a.created_at).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
