# API Route Contracts

These contracts describe App Router route handlers. Authenticated writes remain in Server Actions per constitution.

## 1) Public Redirect
- Route: `GET /s/{slug}`
- Auth: Public
- Purpose: Resolve short slug and redirect; record click event.
- Inputs:
  - `slug` (path, required)
  - Request headers used for telemetry: `user-agent`, `referer`, `x-forwarded-for`
- Success response:
  - `307 Temporary Redirect` with `Location: {destination_url}`
- Error responses:
  - `404` when slug not found or inactive
  - `410` when slug explicitly expired/deleted
- Side effects:
  - Create one `click_events` row per successful redirect
  - Apply local source/device classification
  - Optionally enqueue Context7 enrichment when classification confidence is low

## 2) Analytics Summary
- Route: `GET /api/analytics/summary`
- Auth: Required (owner only)
- Query params:
  - `range` (required): `day | week`
  - `from` (optional, ISO date)
  - `to` (optional, ISO date)
- Success response `200`:
```json
{
  "range": "day",
  "from": "2026-03-01",
  "to": "2026-03-26",
  "totals": {
    "clicks": 1240
  },
  "series": [
    { "bucket": "2026-03-20", "clicks": 120 },
    { "bucket": "2026-03-21", "clicks": 142 }
  ],
  "breakdown": {
    "source": [
      { "category": "Direct", "clicks": 500 }
    ],
    "device": [
      { "category": "Mobile", "clicks": 700 }
    ]
  }
}
```
- Error responses:
  - `400` invalid range/date
  - `401` unauthenticated
  - `403` unauthorized scope

## 3) Top Links Ranking
- Route: `GET /api/analytics/top-links`
- Auth: Required (owner only)
- Query params:
  - `range` (required): `day | week`
  - `from` (optional)
  - `to` (optional)
  - `limit` (optional, default 10, max 100)
- Success response `200`:
```json
{
  "range": "week",
  "items": [
    {
      "linkId": "uuid",
      "slug": "abc123",
      "destinationUrl": "https://example.com/page",
      "totalClicks": 321,
      "lastClickedAt": "2026-03-26T10:00:00Z"
    }
  ]
}
```

## 4) Per-Link Analytics Detail
- Route: `GET /api/analytics/link/{linkId}`
- Auth: Required (owner only)
- Query params:
  - `range` (required): `day | week`
  - `from` (optional)
  - `to` (optional)
- Success response `200`: same shape as summary but scoped to one link.
- Error responses:
  - `404` when link not found in owner scope

## 5) Context7 Enrichment Trigger (Internal)
- Route: `POST /api/internal/analytics/context7-enrich`
- Auth: Internal (service token / cron only)
- Purpose: Re-classify ambiguous click records using Context7 MCP and update classification metadata.
- Request:
```json
{
  "batchSize": 500,
  "olderThanMinutes": 2
}
```
- Success response `202`:
```json
{
  "status": "accepted",
  "processed": 500,
  "updated": 420
}
```
- Notes:
  - This route is optional for MVP if enrichment runs in-process background task.
  - Must never block redirect path.
