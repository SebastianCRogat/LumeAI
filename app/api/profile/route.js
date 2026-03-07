import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase-server";
import { FULL_ACCESS_USER_ID } from "@/lib/constants";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/rateLimit";
import { validateProfilePatchBody } from "@/lib/validate";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseClient(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: authError?.message || "Unauthorized" }, { status: 401 });

  if (user.id === FULL_ACCESS_USER_ID) return NextResponse.json({ tier: "business", email: user.email, display_name: user.email?.split("@")[0] || "User" });

  const { data: profile } = await supabase.from("profiles").select("tier, display_name, email").eq("id", user.id).single();
  return NextResponse.json({
    tier: profile?.tier || "free",
    display_name: profile?.display_name || user.email?.split("@")[0] || "User",
    email: profile?.email || user.email || "",
  });
}

export async function PATCH(request) {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit("profile:" + ip, RATE_LIMITS.default);
  if (!allowed) return rateLimitResponse(retryAfter ?? 60);

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createSupabaseClient(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: authError?.message || "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const validated = validateProfilePatchBody(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: validated.status });
  }
  const { display_name } = validated;

  const { error } = await supabase.from("profiles").upsert(
    { id: user.id, display_name, email: user.email, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ display_name });
}
