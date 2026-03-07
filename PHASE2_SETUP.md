# Phase 2 Setup — Auth & Dashboard

## 1. Run database migration in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Open **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial.sql`
4. Paste and click **Run**

## 2. Enable Email Auth (if not already)

1. In Supabase: **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. (Optional) Under **Email Auth**, disable "Confirm email" for faster local testing

## 3. Test

1. Run `npm run dev`
2. Click **Sign in** → **Sign up** to create an account
3. Run a research — it will be saved to your dashboard
4. Go to **Dashboard** to see saved analyses
