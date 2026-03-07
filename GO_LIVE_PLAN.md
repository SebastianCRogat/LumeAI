# Komplet implementeringsplan: Lume live

Denne plan beskriver præcis, hvad du mangler og hvad du skal gøre for at få hjemmesiden live.

---

## Oversigt over det, du allerede har

- **Auth**: Supabase (email sign up / sign in), profiler, display name
- **Database**: `profiles`, `analyses`, `usage` + RLS og trigger ved signup (ingen waitlist)
- **Billing**: Stripe Checkout, webhook til tier-opdatering, billing portal
- **Analyse**: API-route med Anthropic (Claude), usage limits (free / pro / business), mock data når API key mangler
- **Frontend**: Forside, pricing, dashboard, analyse-view, PDF-export, FAQ, legal sider

---

## 1. Miljøvariabler (obligatorisk)

Opret en `.env.local` til lokal udvikling og sæt de samme variabler i din hosting (f.eks. Vercel) til **production**.

### 1.1 Supabase (påkrævet)

| Variabel | Beskrivelse | Hvor du finder det |
|----------|-------------|--------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key | Samme sted |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (kun backend/webhook) | Samme sted – **aldrig** eksponer i frontend |

### 1.2 Stripe (påkrævet for betaling)

| Variabel | Beskrivelse | Hvor du finder det |
|----------|-------------|--------------------|
| `STRIPE_SECRET_KEY` | Secret key (starter med `sk_live_` i prod) | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (starter med `whsec_`) | Stripe Dashboard → Developers → Webhooks (se nedenfor) |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO` | Price ID for Pro ($39/md) | Stripe Dashboard → Products → Pro → kopiér Price ID |
| `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS` | Price ID for Business ($99/md) | Samme for Business |

### 1.3 Anthropic (påkrævet for rigtig AI-analyse)

| Variabel | Beskrivelse |
|----------|-------------|
| `ANTHROPIC_API_KEY` | API key fra Anthropic. Uden denne kører appen kun mock data. |

### 1.4 App URL (anbefalet i prod)

| Variabel | Beskrivelse |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Din endelige domæne, f.eks. `https://lume.dk`. Bruges til Stripe success/cancel og billing portal return URL. |

### 1.5 Valgfri: Admin / beta-lås

| Variabel | Beskrivelse |
|----------|-------------|
| `NEXT_PUBLIC_ADMIN_EMAIL` | Hvis sat: kun denne bruger kan køre analyse (beta-lås). **Sæt tom eller udelad i prod**, så alle indloggede brugere kan bruge appen. |

---

## 2. Database (Supabase)

Kør migrationer i Supabase SQL Editor (Dashboard → SQL Editor):

1. **001_initial.sql** – profiles, analyses, usage, RLS, trigger ved signup (obligatorisk)  
2. **003_full_access_user.sql** – (valgfri) giver én bruger business-tier. Erstat UUID med din egen user id, eller udelad migrationen.

*(002_waitlist.sql bruges ikke – der er kun normal sign up / log in.)*

Tjek derefter:

- **Authentication → Providers**: Email er aktiveret.  
- **Authentication → URL Configuration**:  
  - Site URL: sæt til din production URL (f.eks. `https://lume.dk`).  
  - Redirect URLs: tilføj `https://dit-domain.com/**` og evt. `http://localhost:3000/**` til dev.

---

## 3. Stripe

### 3.1 Produkter og priser

1. Stripe Dashboard → **Products** → opret to produkter:
   - **Pro**: $39/month (recurring)  
   - **Business**: $99/month (recurring)  
2. Kopiér **Price ID** (starter med `price_...`) for hver og sæt i env som vist ovenfor.

### 3.2 Webhook (vigtigt i production)

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**.  
2. **Endpoint URL**: `https://DIT-DOMÆNE.com/api/webhook/stripe` (skift til dit rigtige domæne).  
3. Vælg events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Kopiér **Signing secret** (`whsec_...`) og sæt som `STRIPE_WEBHOOK_SECRET` i production env.

Uden korrekt webhook bliver brugere ikke opgraderet til Pro/Business efter betaling.

### 3.3 Lokal test af webhook (valgfri)

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Brug den `whsec_...` som CLI viser som `STRIPE_WEBHOOK_SECRET` i `.env.local`.

---

## 4. Deployment (f.eks. Vercel)

### 4.1 Vercel

1. Push koden til GitHub (eller anden Git-provider).  
2. Gå til [vercel.com](https://vercel.com) → **Add New** → **Project** → importer Lume-repo.  
3. Under **Environment Variables** tilføj **alle** variabler fra punkt 1 (vælg både Production og Preview hvis du vil).  
4. Sæt **NEXT_PUBLIC_APP_URL** til din production URL (f.eks. `https://lume.vercel.app` eller dit eget domæne).  
5. Deploy. Efter build kan du åbne den tildelte `*.vercel.app`-URL.

### 4.2 Eget domæne

1. Vercel → Project → **Settings** → **Domains** → tilføj dit domæne (f.eks. `lume.dk`).  
2. Følg instruktionerne (CNAME eller A-record hos din DNS-udbyder).  
3. Opdater **Supabase** Site URL og Redirect URLs til det nye domæne.  
4. Opdater **Stripe webhook** til `https://lume.dk/api/webhook/stripe`.  
5. Sæt `NEXT_PUBLIC_APP_URL=https://lume.dk` i Vercel env.

---

## 5. Tjekliste lige før / efter go-live

- [ ] Alle env variabler sat i production (Supabase, Stripe, Anthropic, evt. APP_URL).  
- [ ] Alle tre Supabase-migrationer kørt.  
- [ ] Supabase Auth: Email provider slået til; Site URL og Redirect URLs matcher production.  
- [ ] Stripe: Pro og Business prices oprettet; Price IDs i env.  
- [ ] Stripe webhook oprettet med **production** URL og de tre events; webhook secret i env.  
- [ ] `NEXT_PUBLIC_APP_URL` sat til den rigtige production URL.  
- [ ] Hvis du ikke længere kører beta: fjern eller tom **NEXT_PUBLIC_ADMIN_EMAIL** så alle kan køre analyse.  
- [ ] Test: Opret bruger → Log ind → Køb Pro (test card `4242 4242 4242 4242`) → Tjek at tier bliver "pro" (dashboard / ny analyse).  
- [ ] Test: Billing portal (Manage subscription) virker og returnerer til `/dashboard`.

---

## 6. Valgfri forbedringer før / efter launch

| Område | Hvad du kan gøre |
|--------|-------------------|
| **Env-eksempel** | Opret `.env.example` med alle variabelnavne (uden værdier), så du og andre ved, hvad der skal sættes. |
| **Fejlovervågning** | Tilføj f.eks. Sentry til Next.js, så du får fejlrapporter fra production. |
| **Rate limiting** | Begræns antal requests pr. IP eller bruger på `/api/analyze` og evt. login for at undgå misbrug. |
| **E-mail bekræftelse** | I Supabase kan du slå "Confirm email" til og evt. tilpasse mails (SMTP) så brugere bekræfter signup. |
| **GDPR / cookies** | Hvis du bruger analytics eller tredjepartscookies, tilføj cookie-banner og opdater privacy policy. |
| **FULL_ACCESS_USER_ID** | I `lib/constants.js` står en fast UUID. Erstat med din egen user id fra Supabase Auth hvis du vil have én “owner” med business-adgang uden betaling, eller fjern logikken hvis ikke nødvendig. |

---

## 7. Kort reference: Hvad sker der, når?

| Handling | Hvor det håndteres |
|----------|--------------------|
| Sign up | Supabase Auth → trigger opretter `profiles` række |
| Køb Pro/Business | `/api/checkout` → Stripe Checkout → bruger betaler → Stripe kalder `/api/webhook/stripe` → `profiles.tier` opdateres |
| Kør analyse | `/api/analyze` tjekker token, tier, usage → kaller Anthropic → gemmer i `analyses` og opdaterer `usage` |
| Gratis brugere | `LIMITS.free` = 0 standard, 0 deep – de kan kun se sample data medmindre du ændrer det |

Når alt i **punkt 5** er afkrydset og et gennemtestet køb + webhook virker, er du klar til at sætte Lume live.
