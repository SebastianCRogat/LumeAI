"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AppLayout from "@/app/components/AppLayout";
import { BG, CD, BD, AC, TX, MU, DM, CARD_RADIUS, BTN_RADIUS } from "@/lib/theme";

export default function ProfilePage() {
  const { user, session, loading, refreshProfile, updateDisplayName } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({ tier: "free", display_name: "", email: "" });
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/profile", { headers: { Authorization: "Bearer " + session.access_token } })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        setProfile({ tier: d.tier || "free", display_name: d.display_name || "", email: d.email || "" });
        setDisplayName(d.display_name || user?.email?.split("@")[0] || "");
      })
      .catch(() => {});
  }, [user, session]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!session || saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ display_name: displayName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) => ({ ...p, display_name: data.display_name }));
        updateDisplayName(data.display_name);
        refreshProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(data.error || "Could not save");
      }
    } catch (e) {
      alert(e.message || "Error");
    } finally {
      setSaving(false);
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
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 24, flex: 1 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Profile</h1>
        <p style={{ fontSize: 13, color: MU, marginBottom: 24 }}>Edit your display name</p>

        <div
          style={{
            background: CD,
            borderRadius: CARD_RADIUS,
            border: "1px solid " + BD,
            padding: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: DM, marginBottom: 8, textTransform: "uppercase" }}>
                Email
              </label>
              <input
                type="text"
                value={profile.email || user?.email || ""}
                readOnly
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: BD + "44",
                  border: "1px solid " + BD,
                  borderRadius: BTN_RADIUS,
                  color: MU,
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: DM, marginBottom: 8, textTransform: "uppercase" }}>
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: CD,
                  border: "1px solid " + BD,
                  borderRadius: BTN_RADIUS,
                  color: TX,
                  fontSize: 13,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={saving || displayName.trim() === profile.display_name}
              style={{
                padding: "10px 20px",
                background: saving ? BD : AC,
                color: BG,
                border: "none",
                borderRadius: BTN_RADIUS,
                fontWeight: 700,
                fontSize: 12,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
