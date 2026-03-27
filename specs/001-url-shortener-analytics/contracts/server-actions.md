# Server Action Contracts

Server Actions are the only mutation interfaces for authenticated product operations.

## Action: `createShortLinkAction`
- Module: `app/actions/links.ts`
- Auth: Required
- Input type:
```ts
{
  destinationUrl: string;
  customSlug?: string;
  title?: string;
}
```
- Validation:
  - destination URL must be HTTP/HTTPS and not private/internal host.
  - custom slug optional; if present, must match slug pattern and be unique.
- Success result:
```ts
{ ok: true; data: { linkId: string; slug: string; shortUrl: string } }
```
- Error result:
```ts
{ ok: false; error: { code: "VALIDATION" | "CONFLICT" | "UNAUTHORIZED" | "UNKNOWN"; message: string } }
```

## Action: `updateShortLinkStatusAction`
- Module: `app/actions/links.ts`
- Auth: Required (owner only)
- Input type:
```ts
{ linkId: string; isActive: boolean }
```
- Success result:
```ts
{ ok: true; data: { linkId: string; isActive: boolean } }
```

## Action: `refreshAnalyticsAction`
- Module: `app/actions/analytics.ts`
- Auth: Required (owner only)
- Purpose: Trigger recalculation/refresh for owner-visible analytics caches or views.
- Input type:
```ts
{ range: "day" | "week"; linkId?: string }
```
- Success result:
```ts
{ ok: true; data: { refreshed: boolean; scope: "all" | "single-link" } }
```

## Action: `context7EnrichAction` (Optional Admin/Internal)
- Module: `app/actions/analytics.ts`
- Auth: Service/admin only
- Purpose: Batch enrich low-confidence click classifications using Context7 MCP.
- Input type:
```ts
{ batchSize?: number; dryRun?: boolean }
```
- Success result:
```ts
{ ok: true; data: { processed: number; enriched: number; fallbackUsed: number } }
```

## Shared Action Rules
- All actions return discriminated union `{ ok: true | false }`.
- All action inputs are validated with schema-first parsing.
- All action writes are performed with server-side Supabase clients only.
