# Phase 3 Setup — Stripe Payments

## 1. Stripe Products & Prices

1. Gå til [Stripe Dashboard](https://dashboard.stripe.com) → **Products**
2. Opret **Pro** product: $39/month recurring
3. Opret **Business** product: $99/month recurring
4. Kopiér **Price ID** for hver (starter med `price_...`)
5. Tilføj til `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxx
   NEXT_PUBLIC_STRIPE_PRICE_BUSINESS=price_xxx
   ```

## 2. Stripe Webhook

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://din-domain.com/api/webhook/stripe` (eller brug Stripe CLI til lokal test)
3. Vælg events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Kopiér **Signing secret** (starter med `whsec_...`)
5. Tilføj til `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

## 3. Supabase Service Role Key (til webhook)

1. Supabase Dashboard → **Settings** → **API**
2. Kopiér **service_role** key (ikke anon!)
3. Tilføj til `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=eyJ...`

## 4. Lokal webhook-test med Stripe CLI

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Brug den `whsec_...` som CLI viser som STRIPE_WEBHOOK_SECRET i .env.local.
