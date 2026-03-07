"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { AnalysisResultView } from "@/app/components/LumeApp";
import AppLayout from "@/app/components/AppLayout";
import { AC, BD, DM } from "@/lib/theme";

export default function AnalysisPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState(null);
  const [tier, setTier] = useState("free");

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (session?.access_token) {
      fetch("/api/profile", { headers: { Authorization: "Bearer " + session.access_token } })
        .then((r) => r.json())
        .then((d) => d.tier && setTier(d.tier))
        .catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    if (!user || !params.id) return;
    supabase
      .from("analyses")
      .select("id, idea, result, created_at")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()
      .then(({ data: d, error }) => {
        if (error || !d) router.replace("/dashboard");
        else setData(d);
      });
  }, [user, params.id, router]);

  if (loading || !user) {
    return (
      <AppLayout>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: DM, fontFamily: "monospace" }}>
          Loading...
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: DM, fontFamily: "monospace" }}>
          Loading...
        </div>
      </AppLayout>
    );
  }

  const result = data.result || {};
  if (!result.summary) {
    return (
      <AppLayout>
        <div style={{ flex: 1, color: DM, padding: 40, fontFamily: "monospace" }}>
          <Link href="/dashboard" style={{ color: AC }}>← Dashboard</Link>
          <p style={{ marginTop: 20 }}>This analysis could not be displayed. The saved data may be incomplete.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid " + BD + "50" }}>
        <Link href="/dashboard" style={{ fontSize: 12, color: "inherit", textDecoration: "none" }}>← Dashboard</Link>
      </div>
      <AnalysisResultView data={result} />
    </AppLayout>
  );
}
