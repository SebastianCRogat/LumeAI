"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BG, PN, CD, BD, TX, MU, DM, AC, RD, GR, BTN_RADIUS, CARD_RADIUS } from "@/lib/theme";

export default function AuthModal({ onClose, onSuccess, initialMode }) {
  const [mode, setMode] = useState(initialMode === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess?.();
        onClose?.();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email for the confirmation link.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: CD,
          border: "1px solid " + BD,
          borderRadius: CARD_RADIUS,
          padding: 24,
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: AC, textTransform: "uppercase" }}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: DM, cursor: "pointer", fontSize: 20 }}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: 10,
              background: BG,
              border: "1px solid " + BD,
              borderRadius: BTN_RADIUS,
              color: TX,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: 16,
              background: BG,
              border: "1px solid " + BD,
              borderRadius: BTN_RADIUS,
              color: TX,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
          {error && <div style={{ color: RD, fontSize: 12, marginBottom: 10 }}>{error}</div>}
          {message && <div style={{ color: GR, fontSize: 12, marginBottom: 10 }}>{message}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? BD : AC,
              color: loading ? DM : "#0F0F0F",
              border: "none",
              borderRadius: BTN_RADIUS,
              fontWeight: 700,
              fontSize: 12,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "..." : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            color: MU,
            fontSize: 12,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
