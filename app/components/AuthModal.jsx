"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

var BG = "#0a0e17", PN = "#111827", CD = "#1a2235", BD = "#2a3654", AC = "#f97316";
var TX = "#e2e8f0", MU = "#8896b3", DM = "#5a6a8a", GR = "#22c55e", RD = "#ef4444";

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("signin");
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
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: PN,
          border: "1px solid " + BD,
          borderRadius: 8,
          padding: 24,
          width: "100%",
          maxWidth: 360,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: AC }}>
            {mode === "signin" ? "SIGN IN" : "SIGN UP"}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: DM, cursor: "pointer", fontSize: 18 }}
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
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 10,
              background: CD,
              border: "1px solid " + BD,
              borderRadius: 4,
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
            style={{
              width: "100%",
              padding: "10px 12px",
              marginBottom: 16,
              background: CD,
              border: "1px solid " + BD,
              borderRadius: 4,
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
              padding: "10px",
              background: loading ? BD : AC,
              color: loading ? DM : BG,
              border: "none",
              borderRadius: 4,
              fontFamily: "monospace",
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
