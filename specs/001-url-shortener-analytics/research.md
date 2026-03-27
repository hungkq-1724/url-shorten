# Research: URL Shortener With Analytics

## Decision 1: Data model on Supabase (normalized events + aggregate views)
- Decision: Store canonical links in `short_links`, raw click telemetry in `click_events`, and expose dashboard rollups via SQL views/materialized views for day/week periods.
- Rationale: Preserves auditability and allows re-aggregation when classification rules evolve, while keeping dashboard reads fast.
- Alternatives considered:
  - Store only pre-aggregated counters per link: rejected because source/device breakdown and recomputation would be limited.
  - Compute all aggregates in application code: rejected due to higher latency and operational complexity.

## Decision 2: API and mutation boundaries in App Router
- Decision: Use Server Actions for all authenticated mutations (create/manage short links), and App Router route handlers for redirect and read-only analytics endpoints.
- Rationale: Aligns with constitution requirement for mutation safety while preserving standard HTTP endpoints where browser/navigation access is needed.
- Alternatives considered:
  - REST API for all operations: rejected because it conflicts with Server Action-first mutation governance.
  - Server Actions for redirect reads: rejected because public redirect is naturally represented as route handler.

## Decision 3: Click source and device classification strategy
- Decision: At redirect ingestion time, classify source and device using deterministic local rules first; unresolved or low-confidence records are optionally enriched through Context7 MCP service.
- Rationale: Local classification keeps redirect path resilient and low-latency. Context7 adds smarter normalization for ambiguous patterns without blocking core flow.
- Alternatives considered:
  - Fully synchronous Context7 call in redirect path: rejected because it risks redirect latency and availability coupling.
  - Local rules only: rejected because taxonomy quality may degrade over time for edge referrers/user-agents.

## Decision 4: Context7 MCP integration model
- Decision: Add a server-side enrichment module (`lib/analytics/context7-enrichment.ts`) that calls Context7 MCP for taxonomy mapping guidance and stores enrichment results in batch/background-safe flow.
- Rationale: Keeps MCP integration isolated, testable, and optional; failures degrade gracefully to local categorization.
- Alternatives considered:
  - Integrate Context7 directly in UI/dashboard: rejected because classification belongs in backend data pipeline.
  - Use Context7 only during development docs lookup: rejected because user requested integration in processing workflow.

## Decision 5: Supabase security and ownership model
- Decision: Enforce owner-only access through RLS on `short_links` and analytics read paths; public redirect endpoint writes click events through server-side trusted path without exposing private rows.
- Rationale: Balances public redirect behavior with strict tenant isolation.
- Alternatives considered:
  - Disable RLS for analytics tables: rejected as non-compliant and unsafe.
  - Client-side direct writes for clicks: rejected due to tampering and governance constraints.

## Decision 6: Dashboard query design
- Decision: Provide dedicated summary and ranking endpoints with explicit range filters (`day`, `week`) and optional `linkId` scope.
- Rationale: Stable contracts simplify UI rendering and contract testing.
- Alternatives considered:
  - Single generic analytics endpoint: rejected because response shape becomes ambiguous and harder to cache.
