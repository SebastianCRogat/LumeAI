import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase-server";

export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseClient(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: authError?.message || "Unauthorized" }, { status: 401 });

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail.trim().toLowerCase()) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = serviceKey
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey)
    : supabase;

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ tier: "pro", updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, tier: "pro" });
}
