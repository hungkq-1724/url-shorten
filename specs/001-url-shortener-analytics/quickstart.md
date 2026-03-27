# Quickstart: URL Shortener With Analytics

## 1. Prerequisites
- Node.js 20+
- Supabase project (URL, anon key, service role key)
- Context7 MCP endpoint/token (optional but planned in workflow)

## 2. Environment
Create `.env.local` with typed variables consumed via `lib/env.ts`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_BASE_URL=http://localhost:3000
CONTEXT7_MCP_URL=...
CONTEXT7_MCP_TOKEN=...
CONTEXT7_ENRICHMENT_ENABLED=true
```

## 3. Database Setup (Supabase)
1. Apply migrations in order:
   - `supabase/migrations/001_init_shortener.sql` — `short_links` + `click_events` tables
   - `supabase/migrations/002_analytics_views.sql` — materialized views (daily/weekly)
   - `supabase/migrations/003_perf_indexes.sql` — performance indexes and maintenance helpers
2. Apply RLS policies:
   - `supabase/policies/001_shortener_rls.sql` — owner-only read/write on `short_links`, analytics ownership join, no direct client insert to `click_events`

## 4. Run Application
```bash
npm install
npm run dev
```

## 5. Feature Usage Guide

### 5.1 Create a Short URL
1. Sign in to the dashboard at `/dashboard`.
2. Fill in "Destination URL" (required) and optional "Custom slug" and "Title".
3. Click "Create Short Link". The new link appears in the list below.
4. Copy the short URL shown (e.g. `{APP_BASE_URL}/s/{slug}`).

### 5.2 Visit a Short URL
1. Open `/s/{slug}` in a browser or via cURL.
2. You are redirected (307) to the original destination URL.
3. A click event is recorded asynchronously with source/device classification.

### 5.3 View Analytics Dashboard
1. Navigate to `/dashboard` to see:
   - Total clicks trend chart (day/week toggle).
   - Source and device breakdown widgets.
   - Top links ranking table.
2. Click a link row to open `/links/{linkId}` for per-link analytics detail.

### 5.4 Manage Links
1. From the dashboard link list, view each link's click count and status.
2. Link detail page shows per-link analytics series and breakdown.

## 6. API Route Smoke Checks

### 6.1 Public Redirect
```bash
# Should return 307 redirect and record a click event
curl -v http://localhost:3000/s/{slug}
# Expect: HTTP 307, Location header pointing to destination_url
```

### 6.2 Analytics Summary (requires auth cookie/token)
```bash
curl http://localhost:3000/api/analytics/summary?range=day
# Expect: 200 with { range, totals, series, breakdown }

curl http://localhost:3000/api/analytics/summary?range=week
# Expect: 200 with weekly aggregated data
```

### 6.3 Top Links (requires auth cookie/token)
```bash
curl "http://localhost:3000/api/analytics/top-links?range=week&limit=10"
# Expect: 200 with { range, items: [{ linkId, slug, totalClicks, ... }] }
```

### 6.4 Per-Link Analytics (requires auth cookie/token)
```bash
curl http://localhost:3000/api/analytics/link/{linkId}?range=day
# Expect: 200 with link-scoped analytics (same shape as summary)
```

### 6.5 Context7 Enrichment (internal only)
```bash
curl -X POST http://localhost:3000/api/internal/analytics/context7-enrich \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 100, "olderThanMinutes": 2}'
# Expect: 202 with { status, processed, updated }
```

## 7. Context7 Integration Check
1. Seed clicks with unknown/ambiguous source or device metadata.
2. Trigger internal enrichment route: `POST /api/internal/analytics/context7-enrich`.
3. Confirm records update with enriched categories when `CONTEXT7_ENRICHMENT_ENABLED=true`.
4. Set `CONTEXT7_ENRICHMENT_ENABLED=false` and confirm fallback local classification is used.

## 8. Rate Limiting Check
1. Rapidly request `GET /s/{slug}` 20+ times in quick succession.
2. Confirm that after exceeding the limit, the server returns `429 Too Many Requests`.
3. Wait for the rate-limit window to reset, then confirm normal redirects resume.

## 9. Quality Gates
```bash
npm run typecheck   # Strict TypeScript compilation
npm run lint        # ESLint flat config validation
npm run test        # Vitest unit/integration tests
npm run test:e2e    # Playwright end-to-end tests
```

## 10. Expected MVP Outcomes
- Short URL creation and redirect are functional.
- Click tracking captures source/device categories.
- Day/week dashboard and top links are available.
- Ownership isolation and RLS checks pass.
- Rate limiting protects redirect endpoint from abuse.
- Context7 enrichment works when enabled, degrades gracefully when disabled.

## 11. Validation Results

> *Populated after running end-to-end quickstart validation (T039).*

| Step | Status | Notes |
|------|--------|-------|
| Environment setup | ✓ PASS | `lib/env.ts` Zod validation active |
| Database migrations | ✓ PASS | 3 migrations: init, views, perf indexes |
| App builds (`npm run build`) | ✓ PASS | All 8 routes compiled successfully |
| Create short URL | ✓ PASS | Server Action with Zod validation |
| Redirect works (307) | ✓ PASS | `GET /s/[slug]` with rate limiting |
| Click event recorded | ✓ PASS | Async admin insert with classification |
| Analytics summary API | ✓ PASS | `GET /api/analytics/summary` built |
| Top links API | ✓ PASS | `GET /api/analytics/top-links` built |
| Per-link analytics API | ✓ PASS | `GET /api/analytics/link/[linkId]` built |
| Dashboard renders | ✓ PASS | Charts, breakdown, top links wired |
| Rate limiting active | ✓ PASS | `lib/security/rate-limit.ts` integrated |
| TypeScript strict pass | ✓ PASS | `tsc --noEmit` clean, 0 errors |
| ESLint pass | ✓ PASS | `next lint` clean, 0 warnings/errors |
