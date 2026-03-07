# Lume – Go-live tjekliste

Brug denne rækkefølge. Afkryds når du er færdig.

---

## Fase 1: Forberedelse (inden deploy)

- [ ] **Supabase**: Opret projekt på [supabase.com](https://supabase.com) (hvis ikke allerede). Notér URL + anon key + service_role key.
- [ ] **Stripe**: Opret konto på [stripe.com](https://stripe.com). Opret produkter **Pro** ($39/md) og **Business** ($99/md). Notér begge Price IDs (`price_...`).
- [ ] **Anthropic**: Hent API key fra [console.anthropic.com](https://console.anthropic.com) (til rigtig AI-analyse).
- [ ] **Git**: Push koden til GitHub (eller anden Git-provider).

---

## Fase 2: Database (Supabase)

- [ ] Supabase Dashboard → **SQL Editor**. Kør i rækkefølge:
  - [ ] `supabase/migrations/001_initial.sql`
  - [ ] (Valgfri) `supabase/migrations/003_full_access_user.sql` – erstatt UUID med din egen user id hvis du vil have gratis business-adgang.
- [ ] **Authentication** → **Providers**: Email aktiveret.
- [ ] **Authentication** → **URL Configuration**:  
  - Site URL: sæt til din production URL (fx `https://din-app.vercel.app`).  
  - Redirect URLs: tilføj `https://din-app.vercel.app/**` og `http://localhost:3000/**`.

---

## Fase 3: Miljøvariabler

- [ ] Opret `.env.local` lokalt (se `.env.example`). Udfyld:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `STRIPE_SECRET_KEY` (test: `sk_test_...` / prod: `sk_live_...`)
  - [ ] `STRIPE_WEBHOOK_SECRET` (kommer i Fase 4)
  - [ ] `NEXT_PUBLIC_STRIPE_PRICE_PRO`
  - [ ] `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` (fx `https://din-app.vercel.app`)
- [ ] Lad `NEXT_PUBLIC_ADMIN_EMAIL` være **tom** eller udelad den (så alle kan køre analyse).

---

## Fase 4: Deploy (Vercel)

- [ ] Gå til [vercel.com](https://vercel.com) → **Add New** → **Project** → importer Lume-repo.
- [ ] Under **Settings** → **Environment Variables** tilføj **alle** variabler fra Fase 3 (vælg Production).
- [ ] Sæt `NEXT_PUBLIC_APP_URL` til den URL Vercel giver (fx `https://lume-xxx.vercel.app`).
- [ ] **Deploy**. Notér din production URL.

---

## Fase 5: Stripe webhook (efter deploy)

- [ ] Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**.
- [ ] **Endpoint URL**: `https://DIN-VERCEL-URL.vercel.app/api/webhook/stripe`
- [ ] Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Kopiér **Signing secret** (`whsec_...`).
- [ ] Vercel → Project → **Settings** → **Environment Variables**: tilføj/opdater `STRIPE_WEBHOOK_SECRET` med den værdi. **Redeploy** (Deployments → ⋮ → Redeploy).

---

## Fase 6: Supabase URLs (efter du kender production URL)

- [ ] Supabase → **Authentication** → **URL Configuration**:  
  - Site URL = din production URL  
  - Redirect URLs inkluderer `https://din-production-url/**`

---

## Fase 7: Test

- [ ] Gå til din production URL. Opret bruger (Sign up).
- [ ] Kør en analyse (fx "Meal kits Denmark" eller egen idé). Tjek at resultat vises.
- [ ] Gå til Pricing → **Upgrade to Pro**. Brug testkort `4242 4242 4242 4242`. Gennemfør checkout.
- [ ] Tjek at brugerens tier er opdateret (dashboard / ny analyse som Pro).
- [ ] Test **Manage subscription** (billing portal) – den skal returnere til dashboard.

---

## Eget domæne (valgfri)

- [ ] Vercel → **Settings** → **Domains** → tilføj dit domæne (fx `lume.dk`).
- [ ] Opdater DNS hos din udbyder (CNAME eller A-record som Vercel viser).
- [ ] Opdater **Supabase** Site URL + Redirect URLs til det nye domæne.
- [ ] Opdater **Stripe webhook** URL til `https://lume.dk/api/webhook/stripe`.
- [ ] Sæt `NEXT_PUBLIC_APP_URL=https://lume.dk` i Vercel og redeploy.

---

**Hjælp:** Fuld beskrivelse står i `GO_LIVE_PLAN.md`.
