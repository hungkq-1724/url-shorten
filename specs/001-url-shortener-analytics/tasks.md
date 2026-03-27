# Tasks: URL Shortener With Analytics

**Input**: Design documents from `/specs/001-url-shortener-analytics/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test tasks are intentionally omitted because TDD/test-first was not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story so each story remains independently implementable and testable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize repository structure and baseline Next.js + TypeScript + Tailwind scaffolding.

- [x] T001 Create base project directory structure in app/, components/, lib/, supabase/, and tests/
- [x] T002 Initialize Next.js app dependencies and scripts in package.json
- [x] T003 [P] Configure strict TypeScript compiler options in tsconfig.json
- [x] T004 [P] Configure Tailwind and global styles in tailwind.config.ts and app/globals.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core platform building blocks required by all stories.

**CRITICAL**: No user story implementation starts before this phase is complete.

- [x] T005 Define typed environment validation in lib/env.ts
- [x] T006 Implement Supabase clients in lib/supabase/client.ts, lib/supabase/server.ts, and lib/supabase/admin.ts
- [x] T007 Create initial schema migration for short links and click events in supabase/migrations/001_init_shortener.sql
- [x] T008 [P] Define RLS policies for owner-scoped access in supabase/policies/001_shortener_rls.sql
- [x] T009 Create analytics aggregation views/materialized views in supabase/migrations/002_analytics_views.sql
- [x] T010 [P] Create URL and slug validation schemas in lib/validation/url.ts
- [x] T011 [P] Implement analytics categorization and Context7 gateway in lib/analytics/categorize.ts and lib/analytics/context7-enrichment.ts
- [x] T012 Establish App Router baseline layouts and route segments in app/layout.tsx and app/(dashboard)/dashboard/page.tsx
- [x] T013 Configure structured server logging helpers in lib/observability/logger.ts

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Create and Use Short URL (Priority: P1) MVP

**Goal**: Authenticated user creates short URL and visitors are redirected correctly.

**Independent Test**: User creates a short URL from dashboard and opening `/s/{slug}` redirects to original destination.

- [x] T014 [US1] Define short-link action contracts in lib/links/types.ts
- [x] T015 [US1] Implement createShortLinkAction in app/actions/links.ts
- [x] T016 [P] [US1] Build short link creation form in components/links/create-link-form.tsx
- [x] T017 [US1] Integrate creation form into dashboard page in app/(dashboard)/dashboard/page.tsx
- [x] T018 [US1] Implement public redirect route handler in app/s/[slug]/route.ts
- [x] T019 [US1] Add owner-scoped link detail page shell in app/(dashboard)/links/[linkId]/page.tsx
- [x] T020 [US1] Add authorization and validation error handling in app/actions/links.ts and lib/validation/url.ts

**Checkpoint**: User Story 1 is fully functional and independently demonstrable.

---

## Phase 4: User Story 2 - Capture Click Analytics (Priority: P2)

**Goal**: System captures and serves click analytics by source/device/day/week.

**Independent Test**: Generate traffic for one short URL and verify summary metrics change in analytics APIs.

- [x] T021 [US2] Record click events during redirect in app/s/[slug]/route.ts
- [x] T022 [P] [US2] Implement source/device classification logic in lib/analytics/categorize.ts
- [x] T023 [P] [US2] Implement Context7 enrichment workflow in lib/analytics/context7-enrichment.ts
- [x] T024 [US2] Implement internal enrichment trigger endpoint in app/api/internal/analytics/context7-enrich/route.ts
- [x] T025 [US2] Implement analytics aggregation query helpers in lib/analytics/aggregate.ts
- [x] T026 [US2] Implement analytics summary API route in app/api/analytics/summary/route.ts
- [x] T027 [US2] Implement per-link analytics API route in app/api/analytics/link/[linkId]/route.ts

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Dashboard and Top Links (Priority: P3)

**Goal**: Dashboard shows day/week trend, breakdown, and top links ranking.

**Independent Test**: With seeded click data, dashboard totals and rankings match API responses.

- [x] T028 [US3] Implement top-links API route in app/api/analytics/top-links/route.ts
- [x] T029 [P] [US3] Build analytics trend chart component in components/analytics/analytics-series.tsx
- [x] T030 [P] [US3] Build source/device breakdown widgets in components/analytics/breakdown-cards.tsx
- [x] T031 [US3] Build top links table component in components/analytics/top-links-table.tsx
- [x] T032 [US3] Add range filters and summary wiring in app/(dashboard)/dashboard/page.tsx
- [x] T033 [US3] Add per-link analytics detail wiring in app/(dashboard)/links/[linkId]/page.tsx
- [x] T034 [US3] Add loading and error states in app/(dashboard)/dashboard/loading.tsx and app/(dashboard)/dashboard/error.tsx

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Quality, security, performance, and release readiness across all stories.

- [x] T035 [P] Update feature usage and API smoke steps in specs/001-url-shortener-analytics/quickstart.md
- [x] T036 Add redirect abuse protections in lib/security/rate-limit.ts and app/s/[slug]/route.ts
- [x] T037 [P] Add performance indexes/maintenance migration in supabase/migrations/003_perf_indexes.sql
- [x] T038 Validate strict typing and lint constraints in tsconfig.json and eslint.config.mjs
- [x] T039 Run end-to-end quickstart validation and record outcomes in specs/001-url-shortener-analytics/quickstart.md
- [x] T040 Fix redirect click persistence and use real-time click aggregation for analytics in app/s/[slug]/route.ts and lib/analytics/aggregate.ts
- [x] T041 Fix link detail navigation path to avoid 404 in components/links/link-row.tsx
- [x] T042 Translate all Vietnamese user-facing/docs text to English in app/page.tsx and README.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1): start immediately.
- Foundational (Phase 2): depends on Phase 1 and blocks all user stories.
- User Stories (Phases 3-5): start after Phase 2; can run in parallel by staffing.
- Polish (Phase 6): depends on completion of all selected user stories.

### User Story Dependencies

- US1 (P1): depends only on Foundational phase.
- US2 (P2): depends on US1 redirect flow and Foundational phase.
- US3 (P3): depends on US2 analytics APIs plus Foundational phase.

### Dependency Graph

- T001 -> T002 -> (T003, T004)
- (T003, T004) -> (T005, T006, T007, T008, T009, T010, T011, T012, T013)
- Phase 2 complete -> (US1 tasks T014-T020)
- US1 complete -> (US2 tasks T021-T027)
- US2 complete -> (US3 tasks T028-T034)
- US1+US2+US3 complete -> (T035-T039)

---

## Parallel Execution Examples

### User Story 1

- Run T016 in parallel with T014-T015 because UI form is in a separate file.
- Run T019 in parallel with T018 because link detail shell is independent from redirect handler.

### User Story 2

- Run T022 and T023 in parallel (classification vs Context7 integration modules).
- Run T026 and T027 in parallel after T025 aggregation helpers are complete.

### User Story 3

- Run T029 and T030 in parallel (separate analytics components).
- Run T032 and T033 in parallel after T028 API is available.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) as MVP and validate redirect flow.
3. Proceed to analytics capture (US2), then dashboard (US3).

### Incremental Delivery

1. Ship US1 (shortening + redirect).
2. Ship US2 (analytics capture + summary APIs).
3. Ship US3 (dashboard + top links).
4. Run Phase 6 hardening and release checks.
