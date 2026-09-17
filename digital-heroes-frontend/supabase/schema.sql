-- Run after the base Digital Heroes tables have been created.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

create table if not exists public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  numbers int2[] not null,
  created_at timestamptz not null default now(),
  unique(draw_id,user_id)
);

alter table public.draw_entries enable row level security;

do $$ begin
  alter table public.subscriptions add constraint one_subscription_per_user unique(user_id);
exception when duplicate_object then null; end $$;

alter table public.subscriptions add column if not exists stripe_customer_id text;
alter table public.draws add column if not exists published_at timestamptz;

-- Subscribers may read their own operational data.
drop policy if exists "Users view own subscription" on public.subscriptions;
create policy "Users view own subscription" on public.subscriptions for select to authenticated using(auth.uid()=user_id);
drop policy if exists "Users view own entries" on public.draw_entries;
create policy "Users view own entries" on public.draw_entries for select to authenticated using(auth.uid()=user_id);
drop policy if exists "Users view own winnings" on public.winners;
create policy "Users view own winnings" on public.winners for select to authenticated using(auth.uid()=user_id);
drop policy if exists "Authenticated view published draws" on public.draws;
create policy "Authenticated view published draws" on public.draws for select to authenticated using(status='published' or public.is_admin());

-- Admin access for assignment management screens.
drop policy if exists "Admins manage draws" on public.draws;
create policy "Admins manage draws" on public.draws for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admins manage entries" on public.draw_entries;
create policy "Admins manage entries" on public.draw_entries for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admins manage winners" on public.winners;
create policy "Admins manage winners" on public.winners for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admins view profiles" on public.profiles;
create policy "Admins view profiles" on public.profiles for select to authenticated using(public.is_admin());
drop policy if exists "Admins manage charities" on public.charities;
create policy "Admins manage charities" on public.charities for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admins view subscriptions" on public.subscriptions;
create policy "Admins view subscriptions" on public.subscriptions for select to authenticated using(public.is_admin());

-- Set your chosen test account as admin manually, never from the client:
-- update public.profiles set role='admin' where id='<AUTH_USER_UUID>';
