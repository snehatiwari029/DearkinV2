-- Migration: 002_purchases
-- Creates the purchases table for Dearkin Stripe integration

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product text not null,
  amount_cents integer not null,
  stripe_session_id text unique not null,
  state text,
  unlocked_at timestamptz not null default now()
);

create index if not exists idx_purchases_email on purchases(email);
create index if not exists idx_purchases_stripe_session_id on purchases(stripe_session_id);

alter table purchases enable row level security;

create policy "service_role_full" on purchases
  for all to service_role using (true) with check (true);
