# Præcis hvad du skal gøre – step for step

Jeg har gemt alle ændringer i din kode. Nu skal du gøre følgende. Efter hver step står **hvad du skal indsætte og hvor**.

---

## STEP A: Opret repository på GitHub

1. Åbn i din browser: **https://github.com/new**
2. I feltet **Repository name** skriver du: **lume**
3. Lad **Public** stå valgt. Klik **Create repository**.
4. På den nye side står der en URL. Den ser nogenlunde sådan ud:
   ```
   https://github.com/DIT-BRUGERNAVN/lume.git
   ```
5. **Kopier den URL** og skriv den her i chatten til mig. Så sætter jeg den op og pusher koden.  
   *(Hvis du vil gøre det selv: efter Step B kan du i Cursor åbne Terminal og skrive: `git remote add origin DIN-URL` og `git push -u origin main`.)*

---

## STEP B: (Jeg gør det, når du har givet mig GitHub-URL)

Når du har skrevet GitHub-URL i chatten, siger du "push" – så kører jeg push til GitHub for dig.

---

## STEP C: Deploy på Vercel

1. Gå til: **https://vercel.com**
2. Klik **Sign Up** eller **Log In** – vælg **Continue with GitHub**.
3. Når du er logget ind: klik **Add New** → **Project**.
4. Du skal se listen over dine GitHub-repos. Klik **Import** ved **lume**.
5. **Før du klikker Deploy:** Klik på **Environment Variables** (under Project Name).
6. Tilføj disse tre variabler **én ad gangen**:

   | Klik "Name" og skriv præcis: | Klik "Value" og indsæt (kopier fra din .env.local): |
   |------------------------------|-----------------------------------------------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://ubmkwxiqsfwowyzguoix.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Hele den lange streng der står på linjen `NEXT_PUBLIC_SUPABASE_ANON_KEY=` i filen `.env.local` i din lume-mappe (uden anførselstegn). |
   | `SUPABASE_SERVICE_ROLE_KEY` | Hele den lange streng der står på linjen `SUPABASE_SERVICE_ROLE_KEY=` i filen `.env.local` (uden anførselstegn). |

   For hver variabel: vælg **Production**, klik **Save**, og tilføj næste.

7. Klik **Deploy**. Vent til der står "Congratulations" eller du ser en link.
8. Klik på **Visit** eller kopiér den URL du får (fx `https://lume-xxxxx.vercel.app`). **Det er din live URL** – skriv den et sted eller send den til mig i chatten.

---

## STEP D: Fortæl Supabase din live URL

1. Gå til: **https://supabase.com/dashboard** og vælg dit projekt.
2. I venstre menu: klik **Authentication** → **URL Configuration**.
3. I feltet **Site URL**: Slet hvad der står og indsæt din Vercel-URL (fx `https://lume-xxxxx.vercel.app`) **uden** skråstreg til sidst.
4. Under **Redirect URLs**: Klik **Add URL** og skriv din Vercel-URL med `/**` til sidst, fx:
   ```
   https://lume-xxxxx.vercel.app/**
   ```
   (Brug din rigtige URL i stedet for `lume-xxxxx`.)
5. Klik **Save**.

---

## STEP E: Test

Åbn din Vercel-URL i browseren (fx `https://lume-xxxxx.vercel.app`). Klik **Sign up** og opret en bruger med din e-mail. Hvis du kan logge ind og se forsiden, er du live.

---

**Opsummering:**  
- **Du gør:** Step A (opret repo, giv mig URL), Step C (Vercel, indsæt de 3 værdier), Step D (Supabase Site URL + Redirect URL), Step E (test).  
- **Jeg gør:** Step B (push til GitHub når du har givet mig URL).
