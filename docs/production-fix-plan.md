# Pravara Production Fix Plan

This document is the working execution board for production cleanup and architecture stabilization.

## Current State

Completed baseline:
- `613dc35` - hardening and repo-root cleanup
- `9522f72` - public-flow cleanup and dead scaffold removal

Current active phase:
- Phase 2: route architecture transformation

## Phase 1: Public Surface, Links, Legal, and Dead Code

Goal:
- Make the public site internally consistent, truthful, and free of obvious dead assets or broken user flows.

Status:
- Completed for this tranche

### 1A. Inventory public routes, assets, and hotspots

Status:
- Done

Findings:
- Large route files still driving complexity:
  - `app/admin/page.tsx` - 833 lines / 48,353 bytes
  - `app/dashboard/edit-profile/page.tsx` - 779 lines / 57,208 bytes
  - `app/onboarding/page.tsx` - 586 lines / 30,405 bytes
  - `app/membership/page.tsx` - 505 lines / 22,009 bytes
  - `app/dashboard/page.tsx` - 463 lines / 22,884 bytes
  - `app/support/page.tsx` - 402 lines / 19,308 bytes
- Public asset surface is now smaller, but the repo still contains launch-irrelevant content and draft artifacts outside tracked cleanup commits.

### 1B. Audit broken links, placeholder flows, and public truthfulness

Status:
- Done

Completed:
- Rewrote `app/membership/page.tsx` to remove fake self-serve billing claims and redirect plan changes to support.
- Rewrote `app/support/page.tsx` with truthful support guidance and a real server-backed request flow.
- Rewrote `components/Footer.tsx` to remove placeholder social links and point to live public surfaces.
- Updated `app/(marketing)/legal/terms/page.tsx` and `app/(marketing)/legal/trust/page.tsx` to remove unsupported payment and moderation promises.
- Updated global metadata in `app/layout.tsx` to remove inflated public claims.

### 1C. Remaining public cleanup tasks

Status:
- In progress

To do:
- Audit all footer, nav, and CTA links across public pages.
- Add a route-by-route truthfulness pass for:
  - `/`
  - `/about`
  - `/faq`
  - `/pricing`
  - `/membership`
  - `/support`
- `/legal/privacy`
- Run another dead-code pass after route cleanup.
- Continue removing remaining encoding-corrupted content from legacy pages.

## Phase 2: Route Architecture Transformation

Goal:
- Break monolithic pages into maintainable page, service, and component boundaries.

Status:
- In progress

### 2A. Dashboard decomposition

Status:
- In progress

To do:
Completed in this tranche:
- Extracted dashboard constants into `app/dashboard/constants.ts`.
- Extracted tab panels into:
  - `app/dashboard/components/RequestsPanel.tsx`
  - `app/dashboard/components/ConnectionsPanel.tsx`
  - `app/dashboard/components/ShortlistPanel.tsx`
- Reduced inline rendering complexity inside `app/dashboard/page.tsx`.

Still to do:
- Split data-fetching and Supabase orchestration into dedicated modules under `lib/` or route-local services.
- Remove stale tab-state remnants from `app/dashboard/page.tsx`.
- Decompose the explorer flow further.

### 2B. Onboarding decomposition

Status:
- Pending

To do:
- Split `app/onboarding/page.tsx` into:
  - conversation state model
  - field mapping and normalization logic
  - persistence service
  - presentational chat/input components
- Remove broad `any` usage while extracting types.

### 2C. Admin decomposition

Status:
- Pending

To do:
- Split `app/admin/page.tsx` into:
  - server-side access boundary
  - tab shell
  - users table
  - coupons/offers
  - analytics/ops views
- Reduce client-only gating and move privileged reads/actions behind stronger boundaries.

### 2D. Edit-profile decomposition

Status:
- Pending

To do:
- Split `app/dashboard/edit-profile/page.tsx` into:
  - profile basics
  - preferences
  - Vedic details
  - family details
  - media uploads
  - collaborators
- Extract upload and persistence logic into reusable modules.

## Phase 3: Auth, Admin, and Data Hardening

Goal:
- Make authorization, data access, and privileged operations correct and auditable.

Status:
- Pending

To do:
- Review every admin-only surface for real server-side enforcement.
- Audit Supabase reads/writes against actual role expectations.
- Review RLS assumptions table by table.
- Standardize server-side validation for write endpoints and privileged operations.
- Confirm pre-launch/admin access model stays env-driven and does not drift.

## Phase 4: Email and Notification Foundation

Goal:
- Establish real operational messaging instead of placeholder communication flows.

Status:
- In progress

To do:
Completed in this tranche:
- Added `lib/email.ts` as a central Resend-backed email module.
- Added validated support intake via `app/api/support/route.ts`.
- Added `supportRequestSchema` to `lib/api-schemas.ts`.
- Added support-specific rate limiting in `lib/ratelimit.ts`.

Still to do:
- Add broader transactional flows:
  - welcome/confirmation
  - admin notifications where needed
- Define storage model for future broadcasts and launch messaging.
- Verify sender domain and env configuration requirements.

## Phase 5: Public Readiness, SEO, and Trust

Goal:
- Make the public site technically clean, indexable, and legally truthful.

Status:
- In progress

To do:
- Completed in this tranche:
  - Added `app/robots.ts`.
  - Added `app/sitemap.ts`.
  - Updated shared metadata in `app/layout.tsx`.
  - Aligned support, pricing, and membership copy with implemented product reality on the most visible public surfaces.
- Still to do:
  - Remove remaining encoding-corrupted copy across legacy pages.
  - Audit privacy/terms/trust wording against actual behavior end-to-end.
  - Review canonical coverage and any remaining public metadata gaps.

## Phase 6: Final Production Sweep

Goal:
- Finish with a verifiable, low-surprise production baseline.

Status:
- Pending

To do:
- Run another repo-wide dead-code and dependency sweep.
- Re-run full verification:
  - `npx tsc --noEmit`
  - `npm run build`
  - targeted lint on touched files
- Produce final summary:
  - what was completed
  - what remains intentionally deferred
  - what is still risky before launch

## Reporting Format

After each phase or meaningful slice, record:
- changed files
- verification run
- completed items
- remaining risks
- next active step

## Latest Slice Summary

Changed files:
- `app/support/page.tsx`
- `app/membership/page.tsx`
- `app/(marketing)/legal/terms/page.tsx`
- `app/(marketing)/legal/trust/page.tsx`
- `app/layout.tsx`
- `components/Footer.tsx`
- `app/api/support/route.ts`
- `lib/email.ts`
- `lib/api-schemas.ts`
- `lib/ratelimit.ts`
- `lib/env.ts`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/dashboard/page.tsx`
- `app/dashboard/constants.ts`
- `app/dashboard/components/RequestsPanel.tsx`
- `app/dashboard/components/ConnectionsPanel.tsx`
- `app/dashboard/components/ShortlistPanel.tsx`

Verification run:
- `npx tsc --noEmit --pretty false`
- `npx eslint` on touched files
- `npm run build`

Remaining risks:
- `app/dashboard/page.tsx`, `app/onboarding/page.tsx`, `app/admin/page.tsx`, and `app/dashboard/edit-profile/page.tsx` are still larger than they should be.
- Remaining encoding-corrupted copy still exists in older files outside the rewritten surfaces.
- The support route now works only when `RESEND_API_KEY`, `EMAIL_FROM`, and the support inbox configuration are present in the environment.
- Next.js still warns that `middleware.ts` should be migrated to `proxy.ts`.

Next active step:
- Continue Phase 2 by extracting data-fetching and orchestration from `app/dashboard/page.tsx`, then move into onboarding and admin decomposition.
