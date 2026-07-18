-- Fight Lab Tips schema. Run this once in the Supabase SQL Editor
-- (Project → SQL Editor → New query → paste this → Run).

create extension if not exists pgcrypto;

create table public.tips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  tags text[] not null default '{}',
  youtube_url text,
  note text,
  date_added timestamptz not null default now(),
  date_filmed timestamptz
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  tip_id uuid not null references public.tips(id) on delete cascade,
  platform text not null check (platform in ('YouTube', 'Instagram', 'Facebook', 'TikTok')),
  published_date timestamptz not null default now(),
  post_url text
);

alter table public.tips enable row level security;
alter table public.publications enable row level security;

-- Single-user app: any authenticated session IS Yaniv's session, because
-- the app has no public sign-up form (see Task 4). "authenticated" is
-- therefore an equivalent, simpler check than scoping by an owner_id column.
create policy "authenticated read/write on tips"
  on public.tips
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "authenticated read/write on publications"
  on public.publications
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
