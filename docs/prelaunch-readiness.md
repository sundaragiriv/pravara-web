# Pravara Pre-Launch Readiness Plan

> Target: **pre-launch live at pravara.ai (~2026-06-15)**. Owner = You, Dev = Claude, Both = pairing.
> Status legend: ☐ todo · ◐ in progress · ☑ done. Priority: **P0** = launch blocker · **P1** = needed for a stellar/safe launch · **P2** = post-launch ok.

---

## 1. User Journey (Pre-Launch)

The pre-launch site is a **curated-live founder funnel** — it manufactures real, matchable profiles, but open matching stays gated until go-live.

**Primary journey**
1. **Discover** → land on `/` (microsite: "founding circle, by invitation").
2. **Register (lead)** → `/register`: name, age, gender, email, phone (30-sec, low friction). Row written to `launch_registrations`. Petal-burst confirmation.
3. **Convert** → success CTA "Build my founding profile" → `/signup?email=&name=` (prefilled) → create account (email/pw or OAuth) → benefit trigger grants Gold 3-mo.
4. **Confirm email** → `/auth/callback` → `/onboarding`.
5. **Build profile** → `/onboarding` (Narada AI biographer): gothra, nakshatra, raasi, community, profession, photo, partner prefs. Strength meter climbs.
6. **Founding Dashboard** → `/pre-launch`: profile-strength meter + "N compatible founders waiting" + curated read-only wall + **vouch card**. **No open search/matching.**
7. **Trust loop** → share vouch link (WhatsApp/copy) → family/friends endorse at `/vouch/[id]` → trust + referral.
8. **Wait for launch** → email keeps them warm; open matching unlocks at go-live (flag flip).

**Secondary journeys**
- **Returning founder** → `/login` → `/dashboard` → (gated) → `/pre-launch`.
- **Incomplete founder** → reminder email → magic-link → `/onboarding`.
- **Admin** → `/admin` + `/admin/cohort` (density/balance → decide when to open matching).

---

## 2. Things To Do — full going-live analysis

### A. Security / "hacker-sealed"  (grounded in live Supabase advisors)
- ☑ **P0** Enable RLS + public-read policy on 8 `ref_*` tables. *(Cleared 8 ERRORs.)*
- ☑ **P0** Add **Content-Security-Policy** + `Permissions-Policy` headers (verified: 29/29 E2E pass under CSP).
- ☑ **P0** Stop **public storage bucket** listing (dropped broad SELECT policies; serving via getPublicUrl unaffected).
- ☑ **P1** Set `search_path` on 3 functions.
- ☑ **P1** SECURITY DEFINER functions — revoked EXECUTE from PUBLIC on the 2 trigger fns.
- ☑ **P1** "RLS policy always true" — was the endorsements public INSERT; now removed (writes go through rate-limited /api/vouch).
- ☐ **P1** Enable Supabase **Leaked Password Protection** (Auth settings, HIBP check) — *your dashboard toggle, last advisor item.*
- ☑ Disabled unused **GraphQL API** (`pg_graphql`) — cleared ~44 schema-exposure advisories.
- ☑ Hardened **vouch** submission — rate-limited + validated `/api/vouch` (was a direct, unlimited client insert).
- 📉 **Supabase security advisor: 65 → 2** (remaining: leaked-password toggle + cosmetic pg_trgm).
- ☐ **P1** **Bot protection** on `/register`, `/signup`, `/login` — Cloudflare Turnstile or hCaptcha.
- ☐ **P1** Put **pravara.ai behind Cloudflare** — WAF, DDoS, Bot Fight Mode, rate-limit login.
- ☐ **P1** Auth hardening: email verification required before profile visible; login-attempt lockout; block disposable-email domains.
- ☑ Rate limiting present (Upstash, fail-open) on register/support/matches/AI routes.
- ☑ Sentry error monitoring configured.
- ☐ **P2** Secrets hygiene: confirm no secret in client bundle; `.env*` gitignored (✓); rotate any key ever shared.

### B. Privacy / Compliance (GDPR + India DPDP)
- ☐ **P1** **Cookie consent** banner (analytics/consent).
- ☐ **P1** **Right to delete** (one-click account+data purge) and **data export**.
- ☐ **P1** Privacy policy accuracy review — discloses AI (Sutradhar/Narada), data retention windows, third parties (Supabase, OpenAI, Resend, Upstash, Sentry, Vercel).
- ☐ **P1** PII minimization — phone/email in `launch_registrations`; confirm encryption-at-rest + access controls.
- ☐ **P2** Legal review of Terms + Privacy by a professional.

### C. SEO / Discoverability
- ☑ `robots.ts` (allows public, disallows member/admin/api) + `sitemap.ts`.
- ☐ **P1** Rich **OG image** (`opengraph-image.tsx`) for WhatsApp/social shares (currently just the logo). Critical for India WhatsApp sharing.
- ☐ **P1** Per-page metadata (titles/descriptions) on all public routes; canonical URLs.
- ☐ **P1** JSON-LD structured data (Organization).
- ☐ **P2** PWA `manifest.ts`, full favicon/apple-icon set.
- ☐ **P1** Vercel Analytics + Speed Insights; `launch_analytics_events` ✓ (table live).

### D. Infrastructure / Deploy
- ☐ **P0** Vercel project + **all env vars** set: `PRE_LAUNCH_ENABLED=true`, Supabase URL/anon/service, `ADMIN_EMAILS`, `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`, `UPSTASH_*`, `OPENAI_API_KEY`, Sentry, `NEXT_PUBLIC_SITE_URL=https://pravara.ai`.
- ☐ **P0** Domain **pravara.ai** → Vercel, DNS, SSL.
- ☐ **P0** **Supabase Pro** (free tier pauses after inactivity — fatal on launch day) + connection pooling.
- ☐ **P1** **Resend** account + verified sending domain for `care@pravara.com` (blocks ALL email).
- ☐ **P1** Cron scheduling (Vercel cron / cron-job.org): `check-expiry` + new `profile-reminders`.
- ☐ **P1** Confirm production build passes on Vercel (local `next build` blocked by Windows symlink only).
- ☐ **P2** Supabase PITR backups.

### E. Email Flow (the founder nudge)
- ☐ **P0** Resend configured (see D).
- ☐ **P1** Rewrite registration email — currently says "wait, we'll email you"; change to active "build your profile now" + branded HTML + CTA.
- ☐ **P1** `profile-reminders` cron → nudge incomplete founders (lead-only + low-strength).
- ☐ **P1** Magic-link return (`signInWithOtp`) → onboarding.

### F. Performance / Scale
- ☐ **P1** Optimize RLS init-plan (30 advisories — wrap `auth.uid()` in `(select …)`); consolidate multiple-permissive policies (22); add indexes for 15 unindexed FKs.
- ☐ **P2** Drop 27 unused indexes; media optimization (Next/Image or Cloudinary).
- ☐ **P1** Core Web Vitals check on key pages.

### G. UX / Accessibility / Experience
- ☐ **P1** Mobile-first QA (70%+ users on mobile) across funnel.
- ☐ **P1** Experiential pass — festive moments, transitions, empty/loading states.
- ☐ **P2** a11y: focus states, alt text, color contrast, keyboard nav.

### H. Reliability / Monitoring
- ☑ Sentry.
- ☐ **P1** Uptime monitor + alert on >100 signups/hour (bot spike) + error-rate alerts.

### I. QA / Testing
- ☑ Playwright harness (29 tests: smoke, auth-gating, flows).
- ☐ **P1** Authenticated E2E (login → onboarding → founding dashboard → vouch).
- ☐ **P1** Full human walkthrough of every journey on staging.

---

## 3. Plan: Develop → Deploy → Human-Test → Pre-Launch Live

**Day 1 — Security + Infra foundation**
- Me: RLS on ref_* tables, CSP/Permissions-Policy headers, search_path fixes, bucket audit. You: Supabase Pro, Vercel project + env, domain DNS, Resend account + domain verify, enable leaked-password protection + Cloudflare.

**Day 2 — Email flow + privacy**
- Me: registration-email rewrite (branded) + reminder cron + magic-link; cookie consent; data-delete/export. You: schedule crons, Turnstile/hCaptcha keys.

**Day 3 — SEO + perf + deploy to staging**
- Me: OG image, per-page metadata, JSON-LD, RLS perf passes, FK indexes. Both: deploy to Vercel staging, run Playwright against it.

**Day 4 — Human test + harden + go**
- Both: full manual walkthrough of every journey on staging (mobile + desktop), fix bugs, remove seed data (`DELETE FROM profiles WHERE id::text LIKE 'a0000000-0000-4000-8000-%'`), final security/SEO check → flip live.

---

## 4. Post-Launch: Complete the Real Site

- Open matching (flip `PRE_LAUNCH_ENABLED=false` per segment readiness via `/admin/cohort`).
- Real signup polish, full dashboard/search UX, MatchCard/profile polish.
- Membership billing (Stripe/Razorpay) — currently manual.
- Sutradhar upgrades (memory, tools), match-engine v2.
- Media CDN, image optimization, mobile bottom-nav.
- Marketing post-launch copy on `MarketingHome` (still founding-cohort framed).
- Endorsement/vouch expansion, referral rewards.

---

## Known constraints
- Local `next build` blocked by Windows symlink (Sentry `import-in-the-middle`) — enable Windows Developer Mode; Vercel/Linux unaffected.
- Local Supabase/Upstash need `NODE_OPTIONS=--use-system-ca` (corporate TLS); handled by `npm run dev:prelaunch` / `dev:golive`.
- 16 seeded test profiles (`a0000000-…` prefix) must be deleted before launch.
