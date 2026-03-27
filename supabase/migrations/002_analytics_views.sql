-- Migration: 002_analytics_views
-- Aggregation views for dashboard day/week/top-links queries

-- Daily analytics by link, source, and device
create materialized view if not exists public.analytics_daily as
select
  date(clicked_at) as day,
  short_link_id,
  source_category,
  device_category,
  count(*) as total_clicks
from public.click_events
group by date(clicked_at), short_link_id, source_category, device_category;

create unique index if not exists idx_analytics_daily_pk
  on public.analytics_daily(day, short_link_id, source_category, device_category);

-- Weekly analytics by link, source, and device
create materialized view if not exists public.analytics_weekly as
select
  date_trunc('week', clicked_at)::date as week_start,
  short_link_id,
  source_category,
  device_category,
  count(*) as total_clicks
from public.click_events
group by date_trunc('week', clicked_at)::date, short_link_id, source_category, device_category;

create unique index if not exists idx_analytics_weekly_pk
  on public.analytics_weekly(week_start, short_link_id, source_category, device_category);

-- Helper function to refresh analytics views (call from cron or action)
create or replace function public.refresh_analytics_views()
returns void as $$
begin
  refresh materialized view concurrently public.analytics_daily;
  refresh materialized view concurrently public.analytics_weekly;
end;
$$ language plpgsql security definer;
