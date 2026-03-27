<!--
Sync Impact Report
- Version change: 0.0.0-template -> 1.0.0
- Modified principles:
	- Template Principle 1 -> I. TypeScript Strict-First
	- Template Principle 2 -> II. App Router-Only Architecture
	- Template Principle 3 -> III. Server Actions for Mutations (NON-NEGOTIABLE)
	- Template Principle 4 -> IV. Supabase Security and Data Integrity
	- Template Principle 5 -> V. Tailwind-First, Accessible UI
- Added sections: None (template sections were concretized)
- Removed sections: None
- Templates requiring updates:
	- updated: .specify/templates/plan-template.md
	- updated: .specify/templates/spec-template.md
	- updated: .specify/templates/tasks-template.md
	- pending: .specify/templates/commands/*.md (directory not present)
- Follow-up TODOs: None
-->

# URL Shorten Constitution

## Core Principles

### I. TypeScript Strict-First
All application code MUST compile with TypeScript strict mode enabled.
`any`, non-null assertions, and type suppression comments are forbidden unless a
short, issue-linked justification is documented inline and approved in review.
All external inputs (request payloads, params, env vars, database rows) MUST be
validated and narrowed to explicit types at the boundary.
Rationale: strict typing catches logic defects early and keeps refactors safe.

### II. App Router-Only Architecture
Routing MUST use Next.js App Router conventions under `app/`. New Pages Router
code (`pages/`, `pages/api/`) MUST NOT be introduced.
Server Components are the default render model. Client Components are allowed
only when browser APIs, local interaction state, or imperative DOM behavior is
required, and each use MUST keep the boundary minimal.
Rationale: one routing and rendering model reduces architectural drift.

### III. Server Actions for Mutations (NON-NEGOTIABLE)
All first-party write operations (create, update, delete, and privileged side
effects) MUST execute through Next.js Server Actions.
Client components MUST NOT call Supabase directly for writes. Read-only browser
queries are permitted only for non-sensitive data and MUST still respect RLS.
Each Server Action MUST enforce authentication/authorization checks and return
typed success/error contracts.
Rationale: centralized mutation boundaries improve security and auditability.

### IV. Supabase Security and Data Integrity
Supabase Row Level Security MUST be enabled on all user-facing tables before
exposing features. Policies MUST be reviewed whenever schema or access patterns
change.
Schema changes MUST ship as versioned migrations. Production data access MUST
use least privilege and MUST NOT rely on anonymous broad grants.
Service-role usage is restricted to server-only execution paths.
Rationale: data-layer enforcement is required for multi-tenant safety.

### V. Tailwind-First, Accessible UI
UI styling MUST use Tailwind utility classes and design tokens defined in the
project configuration. Ad-hoc CSS is allowed only for cases Tailwind cannot
express and MUST be documented in the PR.
Every shipped UI flow MUST satisfy keyboard navigation, visible focus states,
semantic markup, and contrast requirements.
Rationale: Tailwind standardization and accessibility gates keep the UI coherent
and usable.

## Technical Standards

- Runtime stack MUST be Next.js (App Router) + Supabase + TypeScript +
	Tailwind CSS.
- Data fetching in Server Components and Server Actions MUST prefer server-side
	Supabase clients with request-scoped auth context.
- Environment variables MUST be accessed through typed configuration helpers;
	direct untyped `process.env` access in feature code is prohibited.
- Error handling MUST expose user-safe messages while logging actionable server
	diagnostics.

## Delivery Workflow and Quality Gates

- Every plan and PR MUST include a Constitution Check mapping changed files to
	Principles I-V and describing how each requirement is satisfied.
- CI gates MUST include typecheck, lint, unit tests, and integration tests for
	changed server actions or Supabase policies.
- Any exception to these principles MUST include a documented expiry date,
	owner, and mitigation; permanent exceptions require an amendment.
- Feature specs and task lists MUST explicitly include work for typing,
	App Router boundaries, Server Action contracts, Supabase policy updates, and
	Tailwind/accessibility verification when relevant.

## Governance

This constitution overrides informal team conventions for architecture,
implementation, and review in this repository.

Amendment process:
1. Propose changes through a PR that includes impacted principles, migration
	 steps, and template synchronization updates.
2. Obtain approval from at least one repository maintainer.
3. Update this constitution's Sync Impact Report and version metadata.

Versioning policy:
- MAJOR for incompatible governance changes or principle removals/redefinitions.
- MINOR for new principles/sections or materially expanded obligations.
- PATCH for clarifications, wording improvements, and non-semantic edits.

Compliance review expectations:
- Reviewers MUST block PRs that violate non-negotiable principles without an
	approved exception.
- Constitution compliance MUST be re-checked at planning, implementation, and
	pre-release validation.

**Version**: 1.0.0 | **Ratified**: 2026-03-26 | **Last Amended**: 2026-03-26
