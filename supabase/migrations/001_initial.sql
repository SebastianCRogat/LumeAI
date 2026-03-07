-- Lume Phase 2: Auth + Analyses + Usage
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  tier text default 'free' check (tier in ('free','pro','business')),
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analyses (saved research results)
create table if not exists public.analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  idea text not null,
  model_used text default 'haiku',
  result jsonb not null,
  tier_at_creation text default 'free',
  created_at timestamptz default now()
);

-- Usage tracking (per user per month)
create table if not exists public.usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,
  standard_count int default 0,
  deep_count int default 0,
  unique(user_id, month)
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.usage enable row level security;

-- Profiles: users can read/update own
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Analyses: users can CRUD own
create policy "Users can read own analyses" on public.analyses for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on public.analyses for insert with check (auth.uid() = user_id);
create policy "Users can delete own analyses" on public.analyses for delete using (auth.uid() = user_id);

-- Usage: users can read/insert/update own (API uses user token to increment)
create policy "Users can read own usage" on public.usage for select using (auth.uid() = user_id);
create policy "Users can insert own usage" on public.usage for insert with check (auth.uid() = user_id);
create policy "Users can update own usage" on public.usage for update using (auth.uid() = user_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
