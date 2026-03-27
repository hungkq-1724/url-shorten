-- RLS Policies: 001_shortener_rls
-- Owner-scoped access for short_links; restricted click_events access

-- Enable RLS on both tables
alter table public.short_links enable row level security;
alter table public.click_events enable row level security;

-- short_links: owner can read own rows
create policy "Owner can select own links"
  on public.short_links for select
  using (auth.uid() = owner_id);

-- short_links: owner can insert own rows
create policy "Owner can insert own links"
  on public.short_links for insert
  with check (auth.uid() = owner_id);

-- short_links: owner can update own rows
create policy "Owner can update own links"
  on public.short_links for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- short_links: public read for active slugs (redirect lookup)
create policy "Public can read active slugs"
  on public.short_links for select
  using (is_active = true);

-- click_events: no direct client insert (server-side only via service role)
-- click_events: owner can read events for own links
create policy "Owner can read own click events"
  on public.click_events for select
  using (
    exists (
      select 1 from public.short_links
      where short_links.id = click_events.short_link_id
        and short_links.owner_id = auth.uid()
    )
  );
