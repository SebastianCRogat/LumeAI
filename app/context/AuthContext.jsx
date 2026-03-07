"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext({ user: null, session: null, loading: true, displayName: null, refreshProfile: () => {}, updateDisplayName: () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(null);

  const refreshProfile = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/profile", { headers: { Authorization: "Bearer " + session.access_token }, cache: "no-store" });
      const data = await res.json();
      if (!data.error) setDisplayName(data.display_name || null);
      else setDisplayName(null);
    } catch {
      setDisplayName(null);
    }
  }, [session?.access_token]);

  const updateDisplayName = useCallback((name) => {
    setDisplayName(name || null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.access_token) {
      setDisplayName(null);
      return;
    }
    refreshProfile();
  }, [session?.access_token, refreshProfile]);

  const resolvedDisplayName = displayName || user?.email?.split("@")[0] || "User";

  return (
    <AuthContext.Provider value={{ user, session, loading, displayName: resolvedDisplayName, refreshProfile, updateDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
