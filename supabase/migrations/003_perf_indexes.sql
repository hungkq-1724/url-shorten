-- Migration: 003_perf_indexes
-- Performance indexes and maintenance helpers for analytics at scale

-- Composite index for source category filtering on click_events
create index if not exists idx_click_events_source
  on public.click_events(source_category, clicked_at desc);

-- Composite index for device category filtering on click_events
create index if not exists idx_click_events_device
  on public.click_events(device_category, clicked_at desc);

-- Partial index for unenriched records (Context7 enrichment batch queries)
create index if not exists idx_click_events_unenriched
  on public.click_events(clicked_at)
  where context7_enriched = false;

-- Index on short_links for active slug lookups (redirect hot path)
create index if not exists idx_short_links_active_slug
  on public.short_links(slug)
  where is_active = true;

-- Materialized view refresh indexes (concurrency support)
-- analytics_daily already has unique index from 002
-- analytics_weekly already has unique index from 002

-- Scheduled refresh helper: can be called from pg_cron or application code
-- Wraps concurrent refresh with a staleness check
create or replace function public.refresh_analytics_if_stale(
  max_age_minutes integer default 15
)
returns boolean as $$
declare
  last_refresh timestamptz;
begin
  -- Use the daily view as the staleness indicator
  select pg_stat_get_last_autovacuum_time(
    (select oid from pg_class where relname = 'analytics_daily')
  ) into last_refresh;

  -- If never refreshed or older than threshold, refresh
  if last_refresh is null or last_refresh < now() - (max_age_minutes || ' minutes')::interval then
    perform public.refresh_analytics_views();
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer;
