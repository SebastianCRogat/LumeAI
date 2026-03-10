import { NextResponse } from "next/server";
import { getMockData, getDeepMockData, buildPrompt, buildDeepPrompt, cleanJSON, sanitizeResult } from "@/lib/analysis";
import { createSupabaseClient } from "@/lib/supabase-server";
import { getLimit } from "@/lib/usage";
import { FULL_ACCESS_USER_ID } from "@/lib/constants";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/lib/rateLimit";
import { validateAnalyzeBody } from "@/lib/validate";

export async function POST(request) {
  // Rate limit by IP (OWASP: prevent abuse)
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit("analyze:" + ip, RATE_LIMITS.analyze);
  if (!allowed) return rateLimitResponse(retryAfter ?? 60);

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const validated = validateAnalyzeBody(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: validated.status });
  }
  const { idea: trimmed, deep: isDeep } = validated;
  let tier = "free";
  let userId = null;

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (adminEmail && adminEmail.trim()) {
    if (!token) return NextResponse.json({ error: "Access restricted" }, { status: 403 });
    try {
      const supabaseAuth = createSupabaseClient(token);
      const { data: { user } } = await supabaseAuth.auth.getUser();
      if (!user || user.email?.toLowerCase() !== adminEmail.trim().toLowerCase()) {
        return NextResponse.json({ error: "Access restricted" }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Access restricted" }, { status: 403 });
    }
  }

  if (token) {
    try {
      const supabase = createSupabaseClient(token);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
        tier = profile?.tier || "free";
        const limit = getLimit(tier, user.id);
        const month = new Date().toISOString().slice(0, 7);
        if (isDeep) {
          const { data: usage } = await supabase.from("usage").select("deep_count").eq("user_id", user.id).eq("month", month).maybeSingle();
          if (limit.deep === 0) {
            return NextResponse.json({ error: "Deep research requires Pro or Business. Upgrade to unlock." }, { status: 403 });
          }
          const usedDeep = usage?.deep_count || 0;
          if (usedDeep >= limit.deep) {
            return NextResponse.json({ error: `You've used your ${limit.deep} deep research this month. Resets next month.` }, { status: 429 });
          }
        } else {
          if (tier === "free" && userId !== FULL_ACCESS_USER_ID) {
            const { data: allUsage } = await supabase.from("usage").select("standard_count").eq("user_id", user.id);
            const totalStandard = (allUsage || []).reduce((sum, row) => sum + (row.standard_count || 0), 0);
            if (totalStandard >= 1) {
              return NextResponse.json({ error: "You've used your free analysis. Upgrade to Pro for more research.", upgrade: true }, { status: 429 });
            }
          } else if (limit.standard !== Infinity) {
            const { data: usage } = await supabase.from("usage").select("standard_count").eq("user_id", user.id).eq("month", month).maybeSingle();
            const used = usage?.standard_count || 0;
            if (used >= limit.standard) {
              return NextResponse.json({ error: "You've used your analyses this month. Resets next month or upgrade for more." }, { status: 429 });
            }
          }
        }
      }
    } catch (e) {
      console.error("Usage check:", e);
    }
  }
  if (!token) {
    return NextResponse.json({ error: "Sign in required to run research. Explore sample data or sign in and upgrade to Pro." }, { status: 401 });
  }

  // API key only from env; never expose to client (OWASP: secure key handling)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const useOpus = isDeep || tier === "pro" || tier === "business" || userId === FULL_ACCESS_USER_ID;
  const isFree = tier === "free" && userId !== FULL_ACCESS_USER_ID;
  const model = isFree ? "claude-haiku-4-5" : (useOpus ? "claude-opus-4-6" : "claude-haiku-4-5");
  const maxTokens = isDeep ? 16000 : 8000;
  let result;

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: "user", content: isDeep ? buildDeepPrompt(trimmed) : buildPrompt(trimmed) }],
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      if (data.stop_reason === "max_tokens") {
        console.warn("AI response truncated (hit max_tokens). Model:", model, "Deep:", isDeep, "Tier:", tier);
      }

      let txt = "";
      for (const block of data.content || []) {
        if (block.type === "text") txt += block.text;
      }

      const parsed = cleanJSON(txt);
      if (!parsed) {
        console.error("cleanJSON failed. Raw length:", txt.length, "First 200 chars:", txt.substring(0, 200));
        throw new Error("Could not parse AI response. Try again.");
      }
      result = sanitizeResult(parsed);
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  } else {
    await new Promise((r) => setTimeout(r, isDeep ? 1500 : 800));
    result = sanitizeResult(isDeep ? getDeepMockData(trimmed) : getMockData(trimmed));
  }

  if (token) {
    try {
      const supabase = createSupabaseClient(token);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
        const tier = profile?.tier || "free";
        await supabase.from("analyses").insert({
          user_id: user.id,
          idea: trimmed,
          model_used: apiKey ? model : "mock",
          result,
          tier_at_creation: tier,
        });
        const month = new Date().toISOString().slice(0, 7);
        const { data: existing } = await supabase.from("usage").select("id, standard_count, deep_count").eq("user_id", user.id).eq("month", month).maybeSingle();
        if (existing) {
          if (isDeep) {
            await supabase.from("usage").update({ deep_count: (existing.deep_count || 0) + 1 }).eq("id", existing.id);
          } else {
            await supabase.from("usage").update({ standard_count: (existing.standard_count || 0) + 1 }).eq("id", existing.id);
          }
        } else {
          await supabase.from("usage").insert({
            user_id: user.id,
            month,
            standard_count: isDeep ? 0 : 1,
            deep_count: isDeep ? 1 : 0,
          });
        }
      }
    } catch (e) {
      console.error("Save analysis/usage:", e);
    }
  }

  return NextResponse.json(result);
}
