# Implementation Plan: URL Shortener With Analytics

**Branch**: `001-url-shortener-analytics` | **Date**: 2026-03-26 | **Spec**: /Users/kieu.quoc.hung/Desktop/url-shorten/specs/001-url-shortener-analytics/spec.md
**Input**: Feature specification from `/specs/001-url-shortener-analytics/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a Next.js App Router URL shortener that supports authenticated link
creation and public redirect tracking, then expose analytics dashboards for
day/week trends and top links. The implementation uses Supabase PostgreSQL with
RLS for ownership isolation, Server Actions for all mutations, route handlers
for redirect and read-only analytics APIs, and Tailwind-based UI.

Context7 MCP is integrated into the analytics pipeline as an enrichment helper
for unresolved referrer/user-agent classification, with local fallback rules to
keep click ingestion reliable.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), SQL (PostgreSQL 15+)  
**Primary Dependencies**: Next.js App Router, React, Supabase SSR + JS client, Zod, Tailwind CSS, ua-parser-js, MCP client for Context7 integration  
**Storage**: Supabase PostgreSQL (`short_links`, `click_events`, aggregation views/materialized views)  
**Testing**: Vitest (unit/integration), Playwright (critical E2E), SQL policy tests  
**Target Platform**: Web (modern desktop/mobile browsers), Node.js runtime for server actions and route handlers
**Project Type**: Web application (single Next.js project)  
**Performance Goals**: Redirect p95 < 250ms, analytics summary API p95 < 2s, 99% successful redirect rate  
**Constraints**: App Router only, all writes via Server Actions, RLS on all user-facing tables, graceful fallback when Context7 unavailable  
**Scale/Scope**: MVP: up to 100k links and 5M click events; dashboard range day/week with top links limit <= 100

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] TypeScript strict compliance defined: no unbounded `any`, boundary
  validation via Zod and typed env helper (`lib/env.ts`) documented.
- [x] Next.js architecture compliance defined: App Router paths (`app/`) with
  server-first rendering and explicit client boundaries.
- [x] Mutation path compliance defined: short-link create/update writes and
  enrichment writes mapped to Server Actions with auth checks and typed
  result contracts.
- [x] Supabase governance compliance defined: RLS policies for ownership,
  migration-first schema changes, service-role usage server-only.
- [x] UI compliance defined: Tailwind tokens/components plus accessibility
  checks for keyboard, focus, labels, and contrast.

Post-Design Re-check: PASS (no constitution violations introduced by Phase 1
design artifacts).

## Project Structure

### Documentation (this feature)

```text
specs/001-url-shortener-analytics/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-routes.md
│   └── server-actions.md
└── tasks.md             # Created later by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── (marketing)/
│   └── page.tsx
├── (dashboard)/
│   ├── dashboard/page.tsx
│   └── links/[linkId]/page.tsx
├── s/[slug]/route.ts                  # Public redirect + click tracking
├── api/
│   ├── analytics/summary/route.ts     # Read-only analytics summary
│   ├── analytics/top-links/route.ts   # Read-only ranking endpoint
│   └── analytics/link/[linkId]/route.ts
└── actions/
  ├── links.ts                       # create/update short links
  └── analytics.ts                   # owner-triggered analytics operations

components/
├── links/
├── analytics/
└── ui/

lib/
├── env.ts
├── validation/
├── analytics/
│   ├── categorize.ts
│   ├── aggregate.ts
│   └── context7-enrichment.ts
└── supabase/
  ├── client.ts
  ├── server.ts
  └── admin.ts

supabase/
├── migrations/
└── policies/

tests/
├── unit/
├── integration/
├── contract/
└── e2e/
```

**Structure Decision**: Single Next.js App Router project with server-centric
data and mutation flow. Redirect and analytics reads use route handlers;
authenticated writes use Server Actions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
