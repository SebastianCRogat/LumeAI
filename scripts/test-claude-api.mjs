#!/usr/bin/env node
/**
 * Test at Claude/Anthropic API virker med ANTHROPIC_API_KEY fra .env.local.
 * Kør: node scripts/test-claude-api.mjs
 * (Læser .env.local fra projektroden)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

try {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
} catch (e) {
  console.error("Kunne ikke læse .env.local:", e.message);
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY mangler i .env.local");
  process.exit(1);
}

console.log("Kalder Anthropic API (ét kort prompt)...");

const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-haiku-4-5",
    max_tokens: 64,
    messages: [{ role: "user", content: "Svarbare kun: OK og dagens dato." }],
  }),
});

const data = await res.json();

if (data.error) {
  console.error("API fejl:", data.error.message || data.error);
  process.exit(1);
}

const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
console.log("Svar fra Claude:", text || "(intet tekst)");
console.log("\nClaude API virker.");
