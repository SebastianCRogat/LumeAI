# Næste skridt: Deploy til Vercel

Din lokale app virker. Her er præcis hvad du gør for at sætte den live.

---

## Step 1: Push koden til GitHub

1. Åbn **Terminal** i Cursor (Terminal → New Terminal).
2. Skriv disse kommandoer én ad gangen (tryk Enter efter hver):

   ```
   git add .
   git status
   ```
   Du skal **ikke** se `.env.local` i listen – den må ikke med på GitHub.

3. Derefter:
   ```
   git commit -m "Ready for deploy"
   git push
   ```
   Hvis du får besked om at du skal oprette et repo på GitHub: gå til [github.com/new](https://github.com/new), opret et nyt repository (fx navnet "lume"), og følg derefter de instruktioner GitHub viser (fx `git remote add origin ...` og `git push -u origin main`).

---

## Step 2: Deploy på Vercel

1. Gå til **[vercel.com](https://vercel.com)** og log ind (evt. med GitHub).
2. Klik på **Add New** → **Project**.
3. Vælg dit **lume**-repository og klik **Import**.
4. Før du klikker **Deploy**, skal du tilføje miljøvariabler:
   - Klik på **Environment Variables**.
   - Tilføj **én variabel ad gangen** med præcis disse navne og værdier (kopier værdierne fra din `.env.local`):

   | Name | Value (fra .env.local) |
   |------|------------------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | hele værdien (https://ubmkwxiqsfwowyzguoix.supabase.co) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | hele anon-nøglen |
   | `SUPABASE_SERVICE_ROLE_KEY` | hele service_role-nøglen |

   Vælg **Production** (og evt. Preview) for hver.
5. Klik **Deploy**. Vent til det er færdigt (1–2 min).
6. Når det er grønt: klik på **Visit** eller notér din URL (fx `https://lume-xxxxx.vercel.app`). Det er din **live URL**.

---

## Step 3: Opdater Supabase med din live URL

1. Gå til **Supabase** → dit projekt → **Authentication** → **URL Configuration**.
2. **Site URL**: Sæt til din Vercel-URL (fx `https://lume-xxxxx.vercel.app`).
3. **Redirect URLs**: Tilføj `https://lume-xxxxx.vercel.app/**` (brug din rigtige URL). Gem.

---

## Step 4: Sæt APP_URL i Vercel (anbefalet)

1. I **Vercel** → dit projekt → **Settings** → **Environment Variables**.
2. Tilføj:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** din Vercel-URL (fx `https://lume-xxxxx.vercel.app`)
3. Gem. Gå til **Deployments** → klik på **⋮** ved seneste deployment → **Redeploy** (så den nye variabel bruges).

---

## Efter deploy

- Åbn din Vercel-URL i browseren. Test **Sign up** og **Sign in** – det skal virke som lokalt.
- **Betaling (Stripe)** virker endnu ikke – det er næste fase (Stripe-produkter, webhook). Indtil da kan brugere bruge appen med gratis tier.

Når du er klar til Stripe, sig til – så får du de næste konkrete trin.
