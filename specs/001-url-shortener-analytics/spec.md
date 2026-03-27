# Feature Specification: URL Shortener With Analytics

**Feature Branch**: `001-url-shortener-analytics`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Tôi muốn làm một app URL Shortener with Analytics - Rút gọn link kèm thống kê. Yêu cầu: Xây dựng dịch vụ rút gọn URL, có click analytics. Mô tả: Người dùng tạo Short URL, hệ thống theo dõi số lần click, nguồn, thiết bị (giản lược). Có dashboard thống kê theo ngày/tuần, top links."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Create and Use Short URL (Priority: P1)

As a user, I can submit a long URL and receive a short URL that redirects
correctly, so I can share links in a compact format.

**Why this priority**: URL shortening is the core value of the product. Without
this flow, analytics and dashboard features provide no user value.

**Independent Test**: Create a short URL from a valid long URL, open the short
URL in a browser, and verify redirection to the original destination.

**Acceptance Scenarios**:

1. **Given** a user provides a valid public URL, **When** the user requests
  shortening, **Then** the system returns a unique short URL and saves a
  mapping to the original URL.
2. **Given** an existing short URL, **When** any visitor accesses it,
  **Then** the system redirects the visitor to the mapped original URL.
3. **Given** an invalid or blocked destination URL, **When** shortening is
  requested, **Then** the system rejects the request with a clear validation
  message.

---

### User Story 2 - Capture Click Analytics (Priority: P2)

As a user, I can view analytics for each short URL, including total clicks,
traffic source category, and simplified device category, so I can understand
link performance.

**Why this priority**: Analytics is the primary differentiator requested and
drives decision-making after links are shared.

**Independent Test**: Generate traffic to one short URL from multiple source
types and device types, then verify aggregated click metrics are recorded and
retrievable for that URL.

**Acceptance Scenarios**:

1. **Given** a visitor opens a short URL, **When** redirection occurs,
   **Then** the system records one click event linked to that short URL.
2. **Given** click events include referrer and user-agent context,
   **When** analytics are aggregated, **Then** counts are grouped by day,
   source category, and simplified device category.

---

### User Story 3 - Dashboard and Top Links (Priority: P3)

As a user, I can open an analytics dashboard showing daily/weekly trends and
top-performing links, so I can quickly identify which links perform best.

**Why this priority**: Dashboarding improves usability of analytics data, but
can only deliver value after tracking exists.

**Independent Test**: With seeded click data, open the dashboard and verify the
daily/weekly summaries and top links rankings match known expected totals.

**Acceptance Scenarios**:

1. **Given** a user has multiple short URLs with click history,
   **When** the user opens dashboard views for day and week,
   **Then** the system displays totals and trends for the selected period.
2. **Given** multiple links have different click totals,
   **When** the user views top links,
   **Then** links are ranked by click count for the selected period.

---

### Edge Cases

- A submitted URL is syntactically valid but points to a private/internal host.
- A generated slug collides with an existing slug.
- A short URL is requested after it has been deleted or disabled.
- A click arrives without referrer data; source category should be stored as
  Unknown rather than failing tracking.
- User-agent data is missing or unparsable; device category should be stored as
  Other.
- Very high click bursts occur on one link in a short interval.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authenticated user to create a short URL
  from a valid long URL.
- **FR-002**: System MUST generate a unique short identifier for each created
  short URL.
- **FR-003**: System MUST redirect visitors from a short URL to its mapped
  long URL.
- **FR-004**: System MUST reject invalid, unsupported, or blocked destination
  URLs with actionable error messages.
- **FR-005**: System MUST record each successful redirect as a click event.
- **FR-006**: TypeScript contracts MUST be explicit at all request, action, and data boundaries.
- **FR-007**: All write operations MUST be implemented via Next.js Server Actions.
- **FR-008**: Feature routes and layouts MUST use Next.js App Router conventions.
- **FR-009**: Supabase access rules MUST enforce that users can manage and view
  analytics only for links they own.
- **FR-010**: UI implementation MUST use Tailwind and include accessibility
  acceptance criteria for forms, charts/summary widgets, and tables.
- **FR-011**: System MUST aggregate analytics by day and by week for each short
  URL.
- **FR-012**: System MUST provide analytics breakdown by source category
  (Direct, Referral, Social, Search, Unknown).
- **FR-013**: System MUST provide analytics breakdown by simplified device
  category (Desktop, Mobile, Tablet, Other).
- **FR-014**: System MUST provide a top links view ranked by click count for a
  selected date range.
- **FR-015**: System MUST provide dashboard filtering by time range and display
  updated totals based on the selected range.
- **FR-016**: System MUST preserve analytics event timestamp and link ownership
  metadata for reporting and access control.

### Key Entities *(include if feature involves data)*

- **User**: A product account that creates and owns short URLs; key attributes
  include user identifier and account status.
- **ShortLink**: A mapping from short identifier to destination URL, owned by a
  user; key attributes include slug, destination URL, created time, and active
  state.
- **ClickEvent**: A single recorded redirect event for one short link; key
  attributes include event time, source category, device category, and
  associated short link.
- **AnalyticsAggregate**: Time-bucketed metrics derived from click events; key
  attributes include period (day/week), click totals, and grouped dimensions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can create a short URL in under 30 seconds from
  opening the creation form.
- **SC-002**: 99% of short URL visits result in successful redirection to the
  intended destination.
- **SC-003**: Analytics dashboards for day/week views load selected-range
  metrics in under 2 seconds for 90% of requests.
- **SC-004**: For controlled test datasets, dashboard totals and top-link
  rankings match expected values with at least 99.5% accuracy.
- **SC-005**: At least 90% of pilot users can correctly identify their top
  performing link and its click trend without external assistance.

## Assumptions

- Users are authenticated before creating, viewing, or managing short links.
- Anonymous visitors are allowed to open short URLs and be redirected.
- v1 analytics categories for source and device are simplified and not intended
  for forensic-grade attribution.
- Real-time streaming analytics are out of scope; near-real-time or periodic
  updates are acceptable for dashboard views.
- Link expiration, custom domains, QR generation, and A/B testing are out of
  scope for this feature.
- Existing identity and session management in the project remains unchanged.

## Constitution Alignment *(mandatory)*

- **CA-001 (TypeScript Strict)**: All URL input, slug output, click analytics
  dimensions, and dashboard query parameters are defined with explicit types and
  validated at boundaries; no broad type bypasses are planned.
- **CA-002 (App Router)**: Feature is scoped to App Router pages and layouts for
  link creation, analytics detail, and dashboard views, including loading and
  error states per route segment.
- **CA-003 (Server Actions)**: All mutations are handled through Server Actions,
  including short-link creation, link state changes (if enabled), and
  analytics-related write paths.
- **CA-004 (Supabase Security)**: RLS policies and migration updates enforce
  owner-scoped read/write access for links and analytics while allowing public
  redirect-event ingestion paths that do not expose private data.
- **CA-005 (Tailwind + A11y)**: All user-facing screens use Tailwind utilities;
  forms, dashboard controls, and tabular summaries include keyboard access,
  focus visibility, semantic labels, and contrast-compliant styling.
