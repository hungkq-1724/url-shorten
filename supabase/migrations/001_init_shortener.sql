-- Migration: 001_init_shortener
-- Creates core tables for URL shortener with analytics

-- short_links: canonical mapping from slug to destination URL
create table if not exists public.short_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  destination_url text not null,
  title text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint short_links_slug_unique unique (slug),
  constraint short_links_slug_length check (char_length(slug) between 5 and 32),
  constraint short_links_slug_pattern check (slug ~ '^[a-zA-Z0-9_-]+$')
);

create index if not exists idx_short_links_owner on public.short_links(owner_id);

-- click_events: immutable redirect telemetry
create table if not exists public.click_events (
  id bigint generated always as identity primary key,
  short_link_id uuid not null references public.short_links(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  source_category text not null default 'Unknown'
    check (source_category in ('Direct', 'Referral', 'Social', 'Search', 'Unknown')),
  device_category text not null default 'Other'
    check (device_category in ('Desktop', 'Mobile', 'Tablet', 'Other')),
  referrer_host text,
  user_agent text,
  ip_hash text,
  country_code text,
  context7_enriched boolean not null default false
);

create index if not exists idx_click_events_link_time
  on public.click_events(short_link_id, clicked_at desc);

create index if not exists idx_click_events_time
  on public.click_events(clicked_at);

-- auto-update updated_at on short_links
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_short_links_updated_at
  before update on public.short_links
  for each row execute function public.handle_updated_at();
