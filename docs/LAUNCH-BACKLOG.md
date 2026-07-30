# Launch Backlog

The single living list of everything between here and a real launch. Add to it
whenever something is found; strike items only when they are **deployed**.

Supersedes `prelaunch-readiness.md` and `production-fix-plan.md` for tracking
purposes — those stay as background reading, but status lives here.

---

## Rules

**Done means deployed.** Not written, not merged, not passing locally. An item is
struck through only once it is running on `pravara.ai` and has been verified
there. Merged-but-not-deployed is its own status, because that gap is exactly
where things get forgotten.

| Status | Meaning |
| --- | --- |
| `todo` | Not started |
| `wip` | In progress |
| `merged` | On `main`, not yet verified in production |
| ~~struck~~ | Deployed and verified on `pravara.ai` |
| `deployed (flagged)` | Live in production but behind a flag, so unobservable and unverified there. Must be walked through at go-live. |
| `parked` | Deliberately deferred, with a reason |

Every deployed item records the commit that shipped it, so anything can be traced
back or reverted.

---

## How this is prioritised

Ranked by **cost of delay ÷ effort**, with three rules that override raw ordering:

1. **Anything currently wrong on a live page jumps the queue.** It is costing
   trust with every visitor right now, and it is almost always cheap to fix.
   Contradictory prices on two live pages is worth more attention than a feature
   nobody has asked for yet.
2. **Schema decisions come before the features that need them.** Adding a country
   column to an empty table is minutes; adding it to a populated one, with
   backfill and no source of truth for existing rows, is a project. Cheap now,
   expensive later, so it goes early even when nothing depends on it yet.
3. **Slow non-code work starts first.** Company formation and legal review take
   weeks and are not on the engineering critical path — so they should already be
   running while code gets written. The worst outcome is finishing the code and
   then waiting a month for an entity.

What this deliberately de-prioritises: SEO ranking work (a 6–12 month compounding
play that will not move the 3-month target), and any market not in
US / Canada / India.

---

## P0 — Live and wrong, or cheap-now-expensive-later

| ID | Item | Why now | Status |
| --- | --- | --- | --- |
| ~~TRUTH-01~~ | ~~Single source of truth (`lib/offer.ts`)~~ | Root cause of the three below | ~~deployed `143a8e3`~~ |
| ~~TRUTH-02~~ | ~~"Founding 500" → 1,000 (4 places)~~ | Contradicted the site and its own progress bar | ~~deployed `143a8e3`~~ |
| ~~TRUTH-03~~ | ~~"One month premium at launch" → 3 months~~ | 7 other places promised 3 months | ~~deployed `143a8e3`~~ |
| ~~TRUTH-04~~ | ~~Reconcile `/pricing` with `/membership`~~ | **Withdrawn — not a real finding.** `/pricing` is a 7-line redirect; the figures I reported were comment text. Verified 307 → `/membership` in production. | ~~n/a~~ |
| ~~TRUTH-05~~ | ~~Apply the counter threshold to `MarketingHome` + `MarketingNav`~~ | Found while doing TRUTH-01: the Blocker 1 threshold only guarded `/register`. The go-live page rendered the raw count 3 ways, the nav a 4th, and "998 seats left" leaks it by subtraction. | ~~deployed `143a8e3`~~ |
| DATA-01 | `country` field on registration | Cannot segment, price, or comply per-country without it | `todo` |
| DATA-02 | `region` column on profiles | Required to make EU migration possible later without a backfill | `todo` |
| MOB-01 | International phone input (country code + validation) | Bare `type="tel"` with a US placeholder corrupts the primary contact field outside North America | `todo` |

---

## P1 — Gates the marketing push

Do not drive traffic until these are done. Sending people to a funnel whose
confirmation emails land in spam burns an introduction you only get once.

| ID | Item | Why | Status |
| --- | --- | --- | --- |
| GROWTH-01 | Verify Resend sending domain | Unverified sending → spam → the whole funnel silently fails | `todo` |
| GROWTH-02 | Google Search Console + submit sitemap | Indexing, and the only honest source of search data | `todo` |
| GROWTH-03 | Bing Webmaster Tools | Non-trivial diaspora desktop share | `todo` |
| LEGAL-01 | Privacy policy: CCPA, retention, erasure, third-party AI disclosure | Zero such language today; California already applies | `todo` |
| MOB-02 | PWA manifest + installability | Cheapest high-value item for India — home screen, no app store | `todo` |
| MOB-03 | Onboarding audited on a real low-end Android | Longest form in the product; drop-off there is invisible and unmeasured | `todo` |
| MOB-04 | Tap-target and `inputMode` audit across all forms | Numeric keypads, correct autocomplete, 44px targets | `todo` |
| OPS-01 | Point local + Preview at `pravara-dev` | Project already exists and is restoring. Blocked on its service-role key — all three vars must be set together. | `todo` |
| OPS-03 | `golive-preview` branch with branch-scoped `PRE_LAUNCH_ENABLED=false` | `MarketingHome` currently has no environment that renders it, so the go-live page cannot be QA'd anywhere | `todo` |
| OPS-04 | Go-live checklist for flag-gated items | Deployed-but-invisible is its own risk class; see status legend | `todo` |
| OPS-02 | Performance budget in CI | This week's numbers will erode silently without one | `todo` |

---

## P2 — Able to take money

Runs in parallel with registration growth. Not on the critical path to 1,000.

| ID | Item | Why | Status |
| --- | --- | --- | --- |
| PAY-01 | Stripe checkout — US/Canada, cards + Apple Pay + Google Pay | No payment provider exists in the dependency list at all | `todo` |
| PAY-02 | PayPal Business as second US button | Meaningful conversion lift for older/diaspora buyers | `todo` |
| ADMIN-01 | `membership/page.tsx` reads `membership_plans` instead of hardcoding | The table already exists and is ignored | `todo` |
| ADMIN-02 | Extend `coupons` with `free_months` | Coupons are percentage-only; FOUNDER needs a duration | `todo` |
| ADMIN-03 | `FOUNDER` code + mass start date in `site_config` | 3 months free, counted from a launch date you set | `todo` |
| ADMIN-04 | `AGRAHARAM2026` group code | Works with the existing percentage shape as-is | `todo` |
| ADMIN-05 | 7-day trial as a plan property | A trial belongs on the plan, not behind a code | `todo` |
| ADMIN-06 | Manual approval queue (approve/reject state) | Users tab exists; no explicit state machine | `todo` |
| PAY-03 | **Decision:** Concierge price and scope | $99.99/mo does not cover human matchmaking time | `todo` |

---

## P3 — India monetisation

Gated on company formation, not on code.

| ID | Item | Why | Status |
| --- | --- | --- | --- |
| PAY-04 | Indian registered entity (PAN, bank account, KYC) | Hard prerequisite for Razorpay — weeks to months | `todo` |
| PAY-05 | Razorpay integration (UPI, cards, wallets) | Blocked by PAY-04 | `todo` |
| PAY-06 | INR price list, researched against live competitor pages | US pricing converted to INR will not convert | `todo` |
| PAY-07 | Currency selection driven by `country` from DATA-01 | Depends on P0 | `todo` |

---

## Parked

Deliberately not doing these. Recorded so the decision isn't re-litigated.

| Item | Reason | Revisit when |
| --- | --- | --- |
| EU data residency (separate EU project + routing) | Architectural cost with no EU users yet. DATA-02 keeps the door open. | First real EU demand |
| GDPR compliance programme | Not serving EU/UK at launch | Before any EU marketing |
| Mexico | No evidence of demand | After US/CA/IN prove out |
| Arabic-speaking markets | Several regimes, plus a full RTL rebuild of every page | After India |
| 12-month plan | Refund exposure before a track record exists | Once retention data exists |
| SEO ranking campaign | 6–12 month compounding; will not move the 3-month target | Ongoing background only |

---

## Known debt

Found during this work. None are blockers; all will cost more later than now.

| ID | Item | Impact |
| --- | --- | --- |
| DEBT-01 | Local dev and Preview both write to the **production** Supabase | Test registrations land in the live table. `pravara-dev` (ikzifuotttucelvugjyy) exists and is restoring — it was **paused, not deleted**; an earlier note here said otherwise and was wrong. Needs its service-role key before it can be enabled, or the split-brain recurs. |
| DEBT-02 | Turbopack unusable on Windows — checkout path `E:\7. matrimony\pravara` has a space and leading digit | `dev` and `build` forced onto webpack. Real fix: move the checkout. |
| DEBT-03 | Playfair Display is not preloaded | It is the LCP element; preloading is the next real LCP lever |
| DEBT-04 | Sentry client SDK still 420KB parsed | Deferred off the critical path, not reduced. Shrinking needs a monitoring decision. |
| DEBT-05 | Pre-existing lint errors in `admin/page.tsx` and `(marketing)/about/page.tsx` | `npx eslint app` is red; masks new issues |
| DEBT-06 | `launch_registrations` count uses the service-role client, bypassing RLS | Server-only and aggregate-only, but not strictly RLS-respecting. Fix: `SECURITY DEFINER` RPC. |
| DEBT-07 | Founder note copy is written, not family-authored | Live now; replace whenever the family has its own words |
| ~~DEBT-08~~ | ~~e2e suite flaked under 3 parallel workers on this machine~~ | ~~Workers 3 → 2, retries on. 29/29 in 14.6s, was 2.6m with 3 spurious failures. Deployed `143a8e3`~~ |

---

## Deployed

Verified on `pravara.ai`. Newest first.

| Item | Commit |
| --- | --- |
| ~~P0 TRUTH — `lib/offer.ts` single source of truth; cohort and premium numbers corrected; counter threshold extended to the go-live page and nav~~ | `143a8e3` |
| ~~Launch backlog created as the single source of status~~ | `919d5ca` |
| ~~Stop Vercel analytics 404s failing every smoke test (suite now 29/29)~~ | `4b2d87c` |
| ~~Load Sentry client SDK at idle — initial JS 1268KB → 973KB~~ | `72daab7` |
| ~~Make local dev usable on Windows (webpack, env, README)~~ | `75a71d3` |
| ~~Founder note copy~~ | `b48cb35` |
| ~~Canonical URLs + page-specific OG titles; removed logo shadowing file-based OG~~ | `80722dc` |
| ~~Pare back animated atmosphere on small screens — 52 long tasks → 13~~ | `9e3a4a9` |
| ~~Mandala watermark, toran corners, gilded headline, pointer-aware CTA~~ | `cd92ccd` |
| ~~Split `/register` into pitch-left / form-right; fix mobile header overflow~~ | `4cc6f16` |
| ~~Keep hero CTA above the fold on short viewports (`svh` + `short:` breakpoint)~~ | `6230df0` |
| ~~Declare marketing pages dynamic so they aren't prerendered~~ | `b58095d` |
| ~~Blocker 6 — post-submit expectation and "What happens next"~~ | `c7bb6d1` |
| ~~Blocker 5 — `/register` 1200×630 share card~~ | `4c0d3fb` |
| ~~Blocker 4 — trust layer below the home hero~~ | `bf0a407` |
| ~~Blocker 3 — "Reserve My Founding Seat" + submit microcopy~~ | `8fe6978` |
| ~~Blocker 2 — stop page titles doubling the brand (6 pages)~~ | `43dbf79` |
| ~~Blocker 1 — hide founder counter below a credibility threshold~~ | `0d0dcb2` |

**Infrastructure** (no commit — Vercel dashboard/CLI):

- ~~Supabase, OpenAI, Upstash, admin and pre-launch env vars added to the **Preview** scope~~
- ~~`NEXT_PUBLIC_SITE_UR` typo removed; `NEXT_PUBLIC_SITE_URL` set to `https://www.pravara.ai` in Production and Preview~~
- ~~Canonical, sitemap, robots and OG URLs now all resolve on one hostname with no redirect~~

---

## Log

| Date | Change |
| --- | --- |
| 2026-07-30 | Created. Seeded from the go-live audit: 5 content inconsistencies, no payment provider, admin gaps, mobile gaps, 7 debt items. |
| 2026-07-30 | P0 TRUTH cluster deployed. TRUTH-04 withdrawn as a false finding. TRUTH-05 added and fixed: the counter threshold never covered the go-live page. |
| 2026-07-30 | Corrected DEBT-01: pravara-dev was paused, not deleted. Added `deployed (flagged)` status, OPS-03 and OPS-04. |
