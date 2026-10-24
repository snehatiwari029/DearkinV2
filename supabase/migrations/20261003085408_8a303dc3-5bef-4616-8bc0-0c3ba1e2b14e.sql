create type public.member_role as enum ('parent_admin','co_parent','caregiver');
create type public.caregiver_kind as enum ('nanny','family','sitter','none');
create type public.member_status as enum ('invited','active','removed');
create type public.coverage_status as enum ('needs_coverage','pending','confirmed','conflict_flagged','parent_covered','completed');
create type public.invite_status as enum ('pending','accepted','revoked');
create type public.age_bracket as enum ('0-3mo','3-12mo','1-2y','2-5y');

create table public.villages (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Village',
  child_alias text not null check (char_length(child_alias) between 1 and 30),
  child_age_bracket public.age_bracket not null,
  timezone text not null default 'America/Los_Angeles',
  created_by uuid not null,
  created_at timestamptz not null default now()
);
create table public.village_members (
  id uuid primary key default gen_random_uuid(),
  village_id uuid not null references public.villages(id) on delete cascade,
  user_id uuid not null,
  role public.member_role not null,
  caregiver_kind public.caregiver_kind not null default 'none',
  display_name text not null check (char_length(display_name) between 1 and 60),
  status public.member_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (village_id, user_id)
);
create table public.care_blocks (
  id uuid primary key default gen_random_uuid(),
  village_id uuid not null references public.villages(id) on delete cascade,
  child_alias text not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  assigned_user_id uuid,
  coverage_status public.coverage_status not null default 'needs_coverage',
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index on public.care_blocks (village_id, date);
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  village_id uuid not null references public.villages(id) on delete cascade,
  invited_email text not null,
  display_name text not null,
  role public.member_role not null check (role <> 'parent_admin'),
  caregiver_kind public.caregiver_kind not null default 'none',
  token text not null unique default encode(extensions.gen_random_bytes(18),'hex'),
  expires_at timestamptz not null default now() + interval '7 days',
  status public.invite_status not null default 'pending',
  created_at timestamptz not null default now()
);

grant select, update, delete on public.villages to authenticated;
grant select on public.village_members to authenticated;
grant select, insert, update, delete on public.care_blocks to authenticated;
grant select, insert, update, delete on public.invites to authenticated;
grant all on public.villages, public.village_members, public.care_blocks, public.invites to service_role;

alter table public.villages enable row level security;
alter table public.village_members enable row level security;
alter table public.care_blocks enable row level security;
alter table public.invites enable row level security;

create or replace function public.my_role(_village uuid) returns public.member_role
language sql stable security definer set search_path = public as $$
  select role from public.village_members
  where village_id = _village and user_id = auth.uid() and status = 'active' limit 1
$$;
create or replace function public.is_parent(_village uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role(_village) in ('parent_admin','co_parent'), false)
$$;

create policy "members read village" on public.villages for select to authenticated using (public.my_role(id) is not null);
create policy "admin updates village" on public.villages for update to authenticated using (public.my_role(id) = 'parent_admin') with check (public.my_role(id) = 'parent_admin');
create policy "admin deletes village" on public.villages for delete to authenticated using (public.my_role(id) = 'parent_admin');

create policy "parents read roster" on public.village_members for select to authenticated using (public.is_parent(village_id));
create policy "caregiver reads self and parents" on public.village_members for select to authenticated
  using (public.my_role(village_id) is not null and status = 'active' and (user_id = auth.uid() or role in ('parent_admin','co_parent')));

create policy "parents read all blocks" on public.care_blocks for select to authenticated using (public.is_parent(village_id));
create policy "caregiver reads own blocks" on public.care_blocks for select to authenticated using (assigned_user_id = auth.uid() and public.my_role(village_id) is not null);
create policy "parents insert blocks" on public.care_blocks for insert to authenticated with check (public.is_parent(village_id) and created_by = auth.uid());
create policy "parents update blocks" on public.care_blocks for update to authenticated using (public.is_parent(village_id)) with check (public.is_parent(village_id));
create policy "parents delete blocks" on public.care_blocks for delete to authenticated using (public.is_parent(village_id));

create policy "admin manages invites" on public.invites for all to authenticated using (public.my_role(village_id) = 'parent_admin') with check (public.my_role(village_id) = 'parent_admin');

-- Assignee must be an active member
create or replace function public.validate_block_assignee() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.assigned_user_id is not null and not exists (
    select 1 from public.village_members where village_id = new.village_id and user_id = new.assigned_user_id and status = 'active') then
    raise exception 'Assignee is not an active village member';
  end if;
  return new;
end $$;
create trigger care_blocks_assignee before insert or update on public.care_blocks for each row execute function public.validate_block_assignee();

create or replace function public.create_village(_name text, _alias text, _bracket public.age_bracket, _tz text, _display_name text, _pattern text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v uuid; d date; today date := (now() at time zone _tz)::date; i int;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  insert into villages(name, child_alias, child_age_bracket, timezone, created_by)
    values (coalesce(nullif(trim(_name),''),'Our Village'), trim(_alias), _bracket, _tz, auth.uid()) returning id into v;
  insert into village_members(village_id, user_id, role, caregiver_kind, display_name, status)
    values (v, auth.uid(), 'parent_admin', 'none', trim(_display_name), 'active');
  for i in 0..13 loop
    d := today + i;
    if _pattern = 'parent_nanny' and extract(isodow from d) between 1 and 5 then
      insert into care_blocks(village_id, child_alias, date, start_time, end_time, coverage_status, created_by)
        values (v, trim(_alias), d, '08:00', '17:00', 'needs_coverage', auth.uid());
    elsif _pattern = 'grandparent_fridays' and extract(isodow from d) = 5 then
      insert into care_blocks(village_id, child_alias, date, start_time, end_time, coverage_status, created_by)
        values (v, trim(_alias), d, '09:00', '17:00', 'needs_coverage', auth.uid());
    end if;
  end loop;
  return v;
end $$;

create or replace function public.confirm_block(_block uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update care_blocks set coverage_status = 'confirmed'
  where id = _block and assigned_user_id = auth.uid() and my_role(village_id) is not null;
  if not found then raise exception 'Not your block'; end if;
end $$;

create or replace function public.flag_conflict(_block uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update care_blocks set coverage_status = 'conflict_flagged', assigned_user_id = null
  where id = _block and assigned_user_id = auth.uid() and my_role(village_id) is not null;
  if not found then raise exception 'Not your block'; end if;
end $$;

create or replace function public.remove_member(_member uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m village_members%rowtype; tz text;
begin
  select * into m from village_members where id = _member;
  if m.id is null or my_role(m.village_id) is distinct from 'parent_admin' then raise exception 'Not allowed'; end if;
  if m.user_id = auth.uid() then raise exception 'You cannot remove yourself'; end if;
  select timezone into tz from villages where id = m.village_id;
  update village_members set status = 'removed' where id = _member;
  update care_blocks set assigned_user_id = null, coverage_status = 'needs_coverage'
    where village_id = m.village_id and assigned_user_id = m.user_id and date >= (now() at time zone tz)::date;
end $$;

create or replace function public.get_invite(_token text)
returns table(village_name text, role public.member_role, caregiver_kind public.caregiver_kind, invited_email text, display_name text, valid boolean)
language sql stable security definer set search_path = public as $$
  select v.name, i.role, i.caregiver_kind, i.invited_email, i.display_name, (i.status = 'pending' and i.expires_at > now())
  from invites i join villages v on v.id = i.village_id where i.token = _token
$$;

create or replace function public.accept_invite(_token text) returns uuid
language plpgsql security definer set search_path = public as $$
declare i invites%rowtype; em text;
begin
  select email into em from auth.users where id = auth.uid();
  select * into i from invites where token = _token;
  if i.id is null or i.status <> 'pending' or i.expires_at < now() then raise exception 'This invite is no longer valid'; end if;
  if lower(i.invited_email) <> lower(em) then raise exception 'This invite was sent to a different email'; end if;
  insert into village_members(village_id, user_id, role, caregiver_kind, display_name, status)
    values (i.village_id, auth.uid(), i.role, i.caregiver_kind, i.display_name, 'active')
    on conflict (village_id, user_id) do update set status = 'active', role = excluded.role, caregiver_kind = excluded.caregiver_kind;
  update invites set status = 'accepted' where id = i.id;
  return i.village_id;
end $$;

revoke execute on function public.create_village, public.confirm_block, public.flag_conflict, public.remove_member, public.accept_invite, public.get_invite from public, anon;
grant execute on function public.create_village, public.confirm_block, public.flag_conflict, public.remove_member, public.accept_invite, public.get_invite, public.my_role, public.is_parent to authenticated;

-- Seed accounts
-- NOTE: the original migration set a shared test password for these demo users.
-- It has been redacted in this public copy. Never reuse this seed against a
-- real backend without replacing REDACTED_SEED_PASSWORD with a strong secret.
do $$
declare
  s uuid := '11111111-1111-4111-8111-111111111111';
  c uuid := '22222222-2222-4222-8222-222222222222';
  a uuid := '33333333-3333-4333-8333-333333333333';
  v uuid := '44444444-4444-4444-8444-444444444444';
  u record;
begin
  for u in select * from (values (s,'sneha@example.com','Sneha'),(c,'sachin@example.com','Sachin'),(a,'ally@example.com','Ally')) t(id,email,name) loop
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email, extensions.crypt('REDACTED_SEED_PASSWORD', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', jsonb_build_object('first_name', u.name), now(), now(), '', '', '', '')
    on conflict (id) do nothing;
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now())
    on conflict do nothing;
  end loop;

  insert into public.villages (id, name, child_alias, child_age_bracket, timezone, created_by)
    values (v, 'Our Village', 'Baby', '3-12mo', 'America/Los_Angeles', s);
  insert into public.village_members (village_id, user_id, role, caregiver_kind, display_name) values
    (v, s, 'parent_admin', 'none', 'Sneha'), (v, c, 'co_parent', 'none', 'Sachin'), (v, a, 'caregiver', 'nanny', 'Ally');
  insert into public.care_blocks (village_id, child_alias, date, start_time, end_time, assigned_user_id, coverage_status, created_by) values
    (v,'Baby','2026-10-05','08:00','15:00',a,'confirmed',s),
    (v,'Baby','2026-10-06','08:00','15:00',a,'confirmed',s),
    (v,'Baby','2026-10-07','08:00','15:00',a,'confirmed',s),
    (v,'Baby','2026-10-08','08:00','15:00',a,'confirmed',s),
    (v,'Baby','2026-10-09','08:00','15:00',a,'confirmed',s),
    (v,'Baby','2026-10-03','09:00','13:00',a,'confirmed',s),
    (v,'Baby','2026-10-03','13:00','18:00',c,'confirmed',s),
    (v,'Baby','2026-10-04','09:00','13:00',a,'pending',s),
    (v,'Baby','2026-10-08','18:00','21:00',null,'needs_coverage',s);
end $$;
