-- Migration: 001_email_captures
-- Creates the email_captures table for Dearkin Phase 1b
-- Run via: supabase db push (requires Supabase CLI + linked project)

create table if not exists email_captures (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  state text not null default 'WA',
  employer text,
  salary_band text,
  leave_type text,
  weekly_benefit numeric(10,2),
  has_gap boolean default false,
  created_at timestamptz not null default now()
);

-- Index for deduplication and analytics queries
create index if not exists idx_email_captures_email on email_captures(email);
create index if not exists idx_email_captures_created_at on email_captures(created_at);

-- RLS: only service role can insert (no anon inserts)
alter table email_captures enable row level security;

create policy "service_role_insert" on email_captures
  for insert to service_role with check (true);

create policy "service_role_select" on email_captures
  for select to service_role using (true);
