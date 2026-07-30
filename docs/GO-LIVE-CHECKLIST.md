# Go-Live Checklist

Flipping `PRE_LAUNCH_ENABLED` from `true` to `false` is a single environment
variable, and it changes four things at once. Two of them are invisible until
the moment they happen, which is why this list exists.

Work top to bottom. Do not flip production until every box in **Before** passes
on the preview branch.

---

## What the flag actually controls

| # | Effect | Where |
| --- | --- | --- |
| 1 | **The member app opens.** Signed-in users are no longer bounced from `/dashboard` to `/pre-launch` | `middleware.ts:80` |
| 2 | `/` switches from `LaunchHome` to `MarketingHome` | `app/page.tsx:18` |
| 3 | Nav swaps the founding-cohort chip for membership links, and "Register Free" → "Join Free" → `/signup` | `MarketingNav.tsx:139,167` |
| 4 | Every marketing page (`/about`, `/faq`, `/legal/*`) picks up the post-launch nav | those pages pass `launchMode` |

**Effect 1 is the one to be careful about.** Copy mistakes are embarrassing;
releasing the matching experience before it is ready is not recoverable in the
same way. The other three are cosmetic by comparison.

---

## Where to check before flipping

A permanent preview runs the go-live face of the site continuously:

```
https://pravara-git-golive-preview-varahillc.vercel.app
```

The `golive-preview` branch carries a **branch-scoped** `PRE_LAUNCH_ENABLED=false`
in Vercel, so it renders exactly what production will after the flip. Every other
preview branch stays `true`. Keep the branch current with:

```bash
git checkout golive-preview && git merge --ff-only main && git push
```

It points at **pravara-dev**, not production, so anything you do there is safe.

---

## Before — verify on `golive-preview`

### Content that has never been seen in production

These shipped but sit behind the flag, so nobody has looked at them on a real
deployment. They are the reason this section exists.

- [ ] `/` shows **"Founding 1,000 now open"** — not 500
- [ ] `/` shows **"founding cohort of 1,000 members"** — not 500
- [ ] `/` shows **"The first 1,000 members shape the quality"** — not 500
- [ ] `/` shows **"Join the first 1,000 members shaping"** — not 500
- [ ] `/` shows **"3 months premium at launch"** — not "One month"
- [ ] Registration counter is **absent** while the real count is under 75 — no "N registered", no "N seats left", no progress bar, no "N on the list"
- [ ] Closing line falls back to **"Founding access is open for the first circle."**

### The member app

- [ ] Sign in — you land on `/dashboard`, **not** `/pre-launch`
- [ ] `/dashboard` renders with real data and no console errors
- [ ] `/dashboard/shortlist`, `/requests`, `/chat`, `/edit-profile` all load
- [ ] Matching returns sensible results against seeded data
- [ ] `/onboarding` completes end to end and writes a profile

### Navigation

- [ ] Nav shows membership links, not the founding-cohort chip
- [ ] Primary CTA reads **"Join Free"** and goes to `/signup`
- [ ] `/about`, `/faq`, `/legal/privacy`, `/legal/terms`, `/legal/trust` all show the post-launch nav

### Still correct after the flip

- [ ] `/register` still works — the founding funnel does not disappear at go-live
- [ ] `/membership` shows Gold **$29.99** and Concierge **$99.99**
- [ ] Sign-up → email confirmation → onboarding still completes
- [ ] `npx playwright test` passes 29/29

---

## The flip

1. Vercel → Settings → Environment Variables → `PRE_LAUNCH_ENABLED` → **Production** → set `false`
2. Redeploy production (an env change alone does not rebuild)
3. Wait for ● Ready

Do it at a **low-traffic hour**, not before a marketing push. Give yourself a
quiet window to find anything the preview did not.

---

## After — verify on `pravara.ai`

Same checks, on the real thing. Preview runs a different database, so this pass
is about real data, not layout.

- [ ] `/` renders `MarketingHome` with all five numbers correct
- [ ] Counter still suppressed, or showing a real count if you are past 75
- [ ] Sign in with a **real** account → `/dashboard`, not `/pre-launch`
- [ ] A real profile renders correctly — real names, photos, gotra values
- [ ] Matching returns results against real members
- [ ] `/register` still accepts a registration and sends its email
- [ ] No new Sentry errors after 15 minutes
- [ ] Check on an actual phone, not an emulator

---

## Rollback

Set `PRE_LAUNCH_ENABLED=true` in Production and redeploy. That reverses all four
effects in one step — roughly 60 seconds from decision to live.

Nothing about the flip is destructive: no schema change, no data migration. The
only thing you cannot take back is what members saw while it was open, so decide
quickly if something is wrong rather than debugging in place.

---

## Not covered by the flag

Flipping it does **not** make these true. Check `LAUNCH-BACKLOG.md` before
assuming go-live means launched.

- **No payment provider exists.** `/membership` displays prices; nothing can charge a card.
- Concierge is priced at $99.99 with no decision on whether that covers human time (PAY-03).
- The privacy policy has no CCPA or third-party-AI disclosure (LEGAL-01).
- No country field, so nothing can be segmented or priced by region (DATA-01).
- Phone input has no country code (MOB-01).

---

## Log

| Date | Event |
| --- | --- |
| 2026-07-30 | Created. `golive-preview` branch and branch-scoped flag set up; not yet walked through. |
