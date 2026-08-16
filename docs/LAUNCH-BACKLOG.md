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

**Closed 2026-07-30.** All items deployed and verified in production.

| ID | Item | Why now | Status |
| --- | --- | --- | --- |
| ~~TRUTH-01~~ | ~~Single source of truth (`lib/offer.ts`)~~ | Root cause of the three below | ~~deployed `143a8e3`~~ |
| ~~TRUTH-02~~ | ~~"Founding 500" → 1,000 (4 places)~~ | Contradicted the site and its own progress bar | ~~deployed `143a8e3`~~ |
| ~~TRUTH-03~~ | ~~"One month premium at launch" → 3 months~~ | 7 other places promised 3 months | ~~deployed `143a8e3`~~ |
| ~~TRUTH-04~~ | ~~Reconcile `/pricing` with `/membership`~~ | **Withdrawn — not a real finding.** `/pricing` is a 7-line redirect; the figures I reported were comment text. Verified 307 → `/membership` in production. | ~~n/a~~ |
| ~~TRUTH-05~~ | ~~Apply the counter threshold to `MarketingHome` + `MarketingNav`~~ | Found while doing TRUTH-01: the Blocker 1 threshold only guarded `/register`. The go-live page rendered the raw count 3 ways, the nav a 4th, and "998 seats left" leaks it by subtraction. | ~~deployed `143a8e3`~~ |
| ~~DATA-01~~ | ~~`country` field on registration~~ | ~~Migration applied to dev and production; drift check clean. Insert degrades safely if the column is ever absent.~~ | ~~deployed `5c14a1d`~~ |
| ~~DATA-02~~ | ~~`region` column on profiles~~ | **No work needed** — `profiles.country` and `.state` already existed in dev and prod. I had listed this without checking. | ~~n/a~~ |
| ~~MOB-01~~ | ~~International phone input~~ | ~~81 countries, derived dial code, E.164 on submit. Verified live on pravara.ai.~~ | ~~deployed `5c14a1d`~~ |

---

## P0b — Exogamy correctness (found 2026-08-16)

The gotra block is described in our own FAQ as "a core, non-negotiable feature".
It is currently wrong in four ways, all verified against the code. A wrong
marriage recommendation is the most serious error this product can make, so these
sit above everything except things already live and wrong.

| ID | Item | Evidence | Status |
| --- | --- | --- | --- |
| EXO-01 | Exogamy check ignores pravara entirely | `isSagothra()` (`utils/matchEngine.ts:352`) compares `gothra_id` only. Traditional practice blocks on rishi-set overlap. Our own data proves the gap: `bharadwaja` pravara is *Angirasa-Barhaspatya-Bharadwaja*; `gargya` is *Angirasa-Barhaspatya-Bharadwaja-Sainya-Gargya*. Bharadwaja's entire pravara sits inside Gargya's — traditionally prohibited, and we recommend the match. Same for Kashyapa vs Sandilya (2 of 3 rishis shared). | `todo` |
| EXO-02 | Fail-open when gotra is missing | `isSagothra` returns `false` — i.e. *not sagotra*, i.e. approved — when either side has no gotra. A check billed as non-negotiable must fail closed or surface as unknown. | `todo` |
| EXO-03 | `koushika` alt-name collision swaps lineages | `'koushika'` appears in `altNames` of **both** Kaundinya (id 9) and Kaushika (id 16) in `utils/community-data.ts`. `findGothra` uses `.find()`, so it always resolves to Kaundinya. Different primary lineages, different pravaras — a Kaushika user is silently stored as Kaundinya. | `todo` |
| EXO-04 | Pravara lookup fails for 21 of 30 gotras | Two divergent sources: `lib/vedicData.ts` holds 15 gotras, `utils/community-data.ts` holds 30, keyed differently. `Vasishtha`→`vashishta`, `Parasara`→`parashara`, `Garga`→`gargya`, `Harita`→`harithasa`, `Kaushika`→`kausika`, `Upamanya`→`upamanyu` all miss. `isPravaraValidForGothra` returns `false` on a miss, so it **rejects valid input** for 70% of the list. | `todo` |
| EXO-05 | The 30-gotra list mixes three different tiers | `Naidhruva` (id 30) is listed as a peer gotra but is a *pravara rishi of Kashyapa* — per our own `vedicData.ts`. `Angirasa` (id 18) is a primary lineage, not a sibling of Bharadwaja. Marichi, Pulaha, Pulastya, Kratu are Prajapati-level. Two people can be flagged "different gotra" when one entry is literally the other's ancestor. | `todo` |
| EXO-06 | **Decision:** should the block be overridable? | Sagotra marriage is legal — validated by the Hindu Marriage Disabilities Removal Act 1946, carried into s.29(1) of the Hindu Marriage Act 1955. Our block is a cultural preference enforced on families' behalf, not a legal requirement. Argues for a clearly-labelled, overridable setting rather than a silent hard filter. | `todo` — **yours** |

Sizing: the practical gotra list runs to **~400+** (a Kanchi Kamakoti–approved
compilation lists 421). A survey of 3,507 Tamil Iyer matrimonial advertisements
found 51 distinct gotras in actual use, with Bharadwaja at 19.5%. So ~50 covers
the bulk and the tail is hundreds long — our 30 guarantees silent misses.
Recommended: searchable autocomplete over the full list, plus a "not listed"
free-text fallback that marks the profile *gotra unverified* and excludes it from
the auto-block guarantee rather than silently passing it.

## P1 — Gates the marketing push

Do not drive traffic until these are done. Sending people to a funnel whose
confirmation emails land in spam burns an introduction you only get once.

| ID | Item | Why | Status |
| --- | --- | --- | --- |
| GROWTH-01 | Resend sending | Domain **is** verified (DKIM + SPF + return-path MX all live). `RESEND_API_KEY` and `EMAIL_FROM` now set; founder welcome **delivered** end to end. Remaining: `care@pravara.ai` has no mailbox (Google 550-5.1.1), so internal alerts and replies bounce. | `merged` — blocked on Google Workspace alias |
| GROWTH-04 | Create `care@pravara.ai` in Google Workspace | Google rejects it with 550-5.1.1 "account does not exist". Registration alerts bounce, replies to the welcome email bounce, and the footer promises "a person reads it". | `todo` — **yours** |
| GROWTH-05 | Add DMARC (`_dmarc` TXT, `p=none`) | Two senders now DKIM-sign for this domain (Google + Resend). Gmail and Yahoo require DMARC from bulk senders. | `todo` — **yours** |
| GROWTH-02 | Google Search Console + submit sitemap | Indexing, and the only honest source of search data | `todo` |
| GROWTH-03 | Bing Webmaster Tools | Non-trivial diaspora desktop share | `todo` |
| LEGAL-01 | Privacy policy: CCPA, retention, erasure, third-party AI disclosure | Zero such language today; California already applies | `todo` |
| ~~MOB-02~~ | ~~PWA manifest + installability~~ | ~~Installable. Also replaced the 2.1MB logo3.png that was serving as favicon AND apple-touch-icon — now 4.7KB.~~ | ~~merged `07318c1`~~ |
| MOB-03 | Onboarding audited on a real low-end Android | Longest form in the product; drop-off there is invisible and unmeasured | `todo` |
| ~~MOB-04~~ | ~~Tap-target and `inputMode` audit~~ | ~~Audited 7 routes at 390px with touch emulation. Input issues 5→1: /login had no autocomplete at all, /register age had no numeric keypad.~~ | ~~merged `07318c1`~~ |
| ~~OPS-01~~ | ~~Point local + Preview at `pravara-dev`~~ | Both repointed; all three vars set together. Local dev verified: 0 Supabase errors, `/api/launch-analytics` 200 (was 500). | ~~done~~ |
| ~~OPS-03~~ | ~~`golive-preview` branch + branch-scoped flag~~ | Permanent URL for the go-live face of the site. Built ● Ready; needs a human to open it (Deployment Protection). | ~~done~~ |
| ~~OPS-04~~ | ~~Go-live checklist~~ | `docs/GO-LIVE-CHECKLIST.md`. Found while writing it: the flag also releases the whole member app via `middleware.ts:80`, which is a bigger deal than the copy. | ~~done~~ |
| OPS-02 | Performance budget in CI | This week's numbers will erode silently without one | `todo` |
| ~~OPS-05~~ | ~~Schema drift detection between dev and production~~ | ~~`npm run db:drift`. Separate Supabase projects mean nothing propagates; drift was silent until it broke something.~~ | ~~done~~ |

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
| ~~DEBT-01~~ | ~~Local dev and Preview wrote to the **production** Supabase~~ | ~~Both now on `pravara-dev`. It was **paused, not deleted** — an earlier note here said otherwise and was wrong.~~ |
| DEBT-02 | Turbopack unusable on Windows — checkout path `E:\7. matrimony\pravara` has a space and leading digit | `dev` and `build` forced onto webpack. Real fix: move the checkout. |
| DEBT-03 | Playfair Display is not preloaded | It is the LCP element; preloading is the next real LCP lever |
| DEBT-04 | Sentry client SDK still 420KB parsed | Deferred off the critical path, not reduced. Shrinking needs a monitoring decision. |
| DEBT-05 | Pre-existing lint errors in `admin/page.tsx` and `(marketing)/about/page.tsx` | `npx eslint app` is red; masks new issues |
| DEBT-06 | `launch_registrations` count uses the service-role client, bypassing RLS | Server-only and aggregate-only, but not strictly RLS-respecting. Fix: `SECURITY DEFINER` RPC. |
| DEBT-07 | Founder note copy is written, not family-authored | Live now; replace whenever the family has its own words |
| ~~DEBT-09~~ | ~~pravara-dev had no test data~~ | ~~120 seeded profiles across US/India/Canada + a reusable, dev-only seed script. Admin account created for sundaragiriv@gmail.com.~~ |
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
| 2026-07-30 | OPS-01/03/04 done. Local + Preview moved off production onto pravara-dev. golive-preview branch live. Go-live checklist written. |
| 2026-07-30 | P0 code complete. DATA-02 withdrawn (already existed). country column applied to dev by Raj; prod SQL still pending. pravara-dev seeded with 120 profiles + admin account. |
| 2026-07-30 | **P0 closed.** country migration applied to production, drift check clean, country selector verified live. |
| 2026-07-31 | Email pipeline live: domain verified, keys wired, founder welcome delivered. Rebranded to site palette with a hosted logo. Found care@pravara.ai has no mailbox and DMARC is missing. MOB-02/04 done. |
| 2026-08-16 | Gotra research returned four verified correctness bugs in the exogamy check, not just missing data. Added as P0b. |

### P0b additions from the taxonomy research (2026-08-16)

- [x] **DATA-03** `utils/community-data.ts` listed `'chitragupta'` as a Chitpavan
      alias. Chitragupta is the **Kayastha** divine progenitor. Removed.
- [x] **DATA-04** Gaur described as "From Gaud (Bengal/UP) region - highly
      respected lineage". Bengal derivation is disputed folk etymology; the
      praise ranks a community in user-facing copy. Rewritten.
- [x] **DATA-05** `VEDIC_HIERARCHY_GUIDE.md` listed Pancha Gauda as six
      divisions, dropped Utkala, added Saryupareen (a sub-caste of Kanyakubja)
      and Kashmiri Pandit (who are Saraswat). Corrected.
- [ ] **EXO-07** Ten colliding `altNames` across communities: `vaidiki`,
      `vaidika`, `smartha`, `havyaka`, `hoysala karnataka`, `saraswat`,
      `mulakanadu`, `koushika`, `shandilya`, `shaunaka`. `findCommunity` uses
      `.find()`, so each silently resolves to whichever entry was declared
      first. Same defect class as the `koushika` gotra bug. Resolve within the
      selected language; make a genuinely ambiguous string ask, not guess.
- [ ] **EXO-08** No fuzzy matching on community names, anywhere. `Hali` is a
      Scheduled Caste in Himachal and a slur in Kumaon; `Halbaha` is a Brahmin
      group one character away. Bridging them would assign a wrong caste status,
      which touches reservation entitlement. Exact match or explicit selection.
- [ ] **EXO-09** Block-list of derisive terms, never stored and never suggested:
      Khasa, Khasiya, Khasia, Khas Brahmin, Pitali, Hali, Nan-dhoti, Agradani,
      Mahabrahmin, Kattaha, Ghatiya, Jugi. Accept silently in free text if a
      user types one; never offer.
- [ ] **EXO-10** Bengal needs two fields, not one: territorial division (Rarhi,
      Varendra, Vaidik...) and Kulin rank (Kulin/Shrotriya/Vangaja; Kap for
      Varendra). They are orthogonal. Rank optional, never required.
- [ ] **EXO-11** Four communities need neutral top-level entries rather than
      nesting under Brahmin: Bhumihar, Tyagi, Rajpurohit, Anavil. Each has a
      live dispute; nesting or omitting both take a side.
- [ ] **EXO-12** Free-text "Other / not listed" escape hatch on every community
      field, plus "prefer not to say". A fixed list will miss real
      self-identifications, and many users genuinely do not know their subcaste.

## Post-P0b: the four topics (16 Aug 2026)

Full audit published as an artifact; findings summarised here so the repo carries
the actionable list.

### Blocking the member app opening

- [x] **SAFE-01** ~~No block, report, mute or abuse queue exists anywhere.~~
      **DEPLOYED 16 Aug 2026.** Blocks and reports tables with RLS in dev and
      prod, silent symmetric blocking, block enforced at the database via
      `is_blocked_between()`, report-blocks-by-default, admin queue at
      `/admin/reports`. Verified end to end through real authenticated sessions:
      `npm run check:safety`, 18/18.
- [x] **TRUST-01a** ~~ID upload collects documents nobody reviews.~~ **Upload
      withdrawn 16 Aug 2026** behind `VERIFICATION_QUEUE_LIVE = false`. Flip it
      when the queue below ships.
- [ ] **TRUST-01** ID upload writes `govt_id_url` and sets `varaahi_status` to
      `pending_verification`, and nothing ever reads it. The admin `is_verified`
      toggle is a separate, unconnected concept. Members hand over government ID
      and wait for a process that does not exist. Build the queue or hide the
      upload — holding documents unread is the worst of both.
- [ ] **QA-01** Eleven member-app surfaces compile and typecheck but have never
      been used by a member. Turn `PRE_LAUNCH_ENABLED` off in dev and walk them.

### Correctness

- [ ] **OPS-03** `/api/cron/check-expiry` exists but is not in `vercel.json`, so
      subscription expiry never runs. Harmless until payments land, then a
      billing bug. One line, and it belongs in before payments.
- [ ] **DATA-06** `varaahi_status` and `govt_id_url` are live in dev and prod but
      created by no migration. Drift checker passes because both agree; a fresh
      environment built from `supabase/migrations` would lack them and the ID
      upload would fail unexplainably. Backfill the migration.

### Varaahi Shield

- [ ] **TRUST-02** Four independent signals, shown as separate badges, never as a
      single score — a number invites "why is theirs higher", which is the
      ranking problem in another costume. Identity (human-reviewed ID) ·
      Vouches (already collected, never surfaced; show the relationship) ·
      Family participation (guardian mode doing double duty) · Completeness
      (computed, not claimed).
- [ ] **TRUST-03** Guardian mode, built out from the `collaborators` table. The
      most culturally correct feature on the list — in these marriages parents
      are participants, and the software currently assumes a solo user.

### ID verification

- [ ] **TRUST-04** Admin review queue; decision writes through to `is_verified`.
- [ ] **TRUST-05** Delete the document on decision. Keep the verdict and date,
      not the passport scan — the privacy policy already commits us to
      minimisation.
- [ ] **TRUST-06** Audit the storage bucket policy before it holds a real ID.
- [ ] **TRUST-07** Tell the member the outcome either way. Silence after handing
      over an ID is the worst possible experience.

### Tradition, structurally

- [ ] **CULT-01** Panchangam strip — today's tithi, nakshatra, vara.
- [ ] **CULT-02** Transliteration plus a one-line meaning on first use of every
      Sanskrit term in the member app. The FAQ does this well; the app does not.
- [ ] **CULT-03** Muhurta note on introductions. Suggestion, never a block.
- [ ] **CULT-04** Seasonal treatment for Akshaya Tritiya, Vasant Panchami — when
      families actually start looking.
- **Standing constraint:** "more tradition" and "never rank a community" are the
  same project. No ordering, no purity language, no "higher" or "purer" in copy
  or data; block list stays enforced; the platform never tells anyone what their
  community is. `npm run check:data` fails if a blocked term becomes resolvable.

### Wiring still to do

- [ ] **WIRE-01** Notifications table behind the existing bell — Narada is
      email-only today.
- [ ] **WIRE-02** Supabase Realtime for chat; it polls today.
- [ ] **WIRE-03** Geo-gate to US/CA/IN via the Vercel geo header, with a
      courteous message and an email capture for everyone else.
- [ ] **WIRE-04** City autocomplete. No city table exists. Skip pincodes.
- [ ] **WIRE-05** `ref_languages` is missing Malayalam, Bengali, Gujarati, Odia,
      Punjabi, Konkani, Tulu, Assamese — which caps what the picker can offer.
- [ ] **WIRE-06** Trial and coupons (FOUNDER, AGRAHARAM2026) before payments;
      they are already promised in email. Then Stripe + PayPal (US), Razorpay
      once the Indian entity exists.

- [ ] **SAFE-02** `public.messages` carries two SELECT policies — "Users can read
      messages in their connections" (from a migration) and "View messages"
      (from nowhere), both granted to `public` rather than `authenticated`.
      Behaviour is correct in dev — an unrelated member reads nothing, asserted
      in `check:safety` — but duplicate policies on one command are exactly what
      let the old permissive INSERT policy override the new strict one. Worth a
      nuclear reset of the SELECT policies for the same reason. Not urgent;
      verified safe.
