# Data Model: URL Shortener With Analytics

## Entity: User
- Purpose: Authenticated owner of short links and private analytics.
- Primary fields:
  - `id` (uuid, PK, from auth.users)
  - `email` (text, optional mirror)
  - `created_at` (timestamptz)
- Relationships:
  - One-to-many with `ShortLink`.

## Entity: ShortLink
- Purpose: Canonical mapping from short slug to destination URL.
- Primary fields:
  - `id` (uuid, PK)
  - `owner_id` (uuid, FK -> User.id)
  - `slug` (text, unique, indexed)
  - `destination_url` (text)
  - `title` (text, nullable)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- Validation rules:
  - `slug` length 5-32, `[a-zA-Z0-9_-]+`.
  - `destination_url` must be valid HTTP/HTTPS and not private/internal host.
- Relationships:
  - One-to-many with `ClickEvent`.
- State transitions:
  - Active -> Inactive (manual disable).
  - Inactive -> Active (manual enable).

## Entity: ClickEvent
- Purpose: Immutable record of a successful redirect visit.
- Primary fields:
  - `id` (bigint or uuid, PK)
  - `short_link_id` (uuid, FK -> ShortLink.id)
  - `clicked_at` (timestamptz, indexed)
  - `source_category` (enum/text: Direct|Referral|Social|Search|Unknown)
  - `device_category` (enum/text: Desktop|Mobile|Tablet|Other)
  - `referrer_host` (text, nullable)
  - `user_agent` (text, nullable)
  - `ip_hash` (text, nullable)
  - `country_code` (text, nullable)
  - `context7_enriched` (boolean, default false)
- Validation rules:
  - `source_category` and `device_category` constrained to allowed values.
  - `clicked_at` default NOW().
- Relationships:
  - Many-to-one with `ShortLink`.

## Derived Model: AnalyticsDaily
- Purpose: Daily metrics by link and dimensions.
- Definition: SQL view/materialized view grouped by `date(clicked_at)` and `short_link_id`.
- Output fields:
  - `day` (date)
  - `short_link_id` (uuid)
  - `total_clicks` (bigint)
  - `source_category` (text)
  - `device_category` (text)

## Derived Model: AnalyticsWeekly
- Purpose: Weekly metrics by link and dimensions.
- Definition: SQL view/materialized view grouped by `date_trunc('week', clicked_at)` and `short_link_id`.
- Output fields:
  - `week_start` (date)
  - `short_link_id` (uuid)
  - `total_clicks` (bigint)
  - `source_category` (text)
  - `device_category` (text)

## Derived Model: TopLinks
- Purpose: Ranked links for a selected period.
- Definition: Query/view aggregating clicks by `short_link_id` with `ORDER BY total_clicks DESC` and configurable limit.
- Output fields:
  - `short_link_id` (uuid)
  - `slug` (text)
  - `destination_url` (text)
  - `total_clicks` (bigint)
  - `last_clicked_at` (timestamptz)

## RLS and Access Rules
- `short_links`: owner can select/insert/update own rows.
- `click_events`: no direct client insert; server-side trusted path writes rows.
- Analytics views: owner can read only rows mapped to owned links.

## Indexing Notes
- `short_links(slug)` unique index.
- `click_events(short_link_id, clicked_at desc)` for link analytics.
- `click_events(clicked_at)` for range filtering.
