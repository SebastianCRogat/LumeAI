-- Waitlist for Lume
-- Run in Supabase SQL Editor

create table if not exists public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

-- Allow anyone to join (insert only)
create policy "Anyone can join waitlist" on public.waitlist for insert with check (true);
