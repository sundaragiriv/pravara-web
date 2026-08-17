# Plan: community hierarchy + Sutradhar grounding

Written 2026-08-16. Nothing here is built yet.

Two pieces of work that share one root idea: **the platform should never invent,
guess, or rank a person's identity — it should narrow, offer, and confirm.**

---

## Part A — The community hierarchy

### The problem

After the regional research the defensible community list is ~60 entries and
would grow. A flat dropdown of 60 is unusable on a phone, and worse, it asks a
family to scan a list of caste names looking for themselves — which is both bad
UX and socially uncomfortable.

### The shape: three steps, never more than ~10 options at a time

We already have `languageId` on every community in `utils/community-data.ts`.
That is the natural first cut, and it has a real advantage: **"what language does
your family speak at home?" is an easy, unloaded question**, where "what is your
caste?" is not. The tree lets us ask the gentle question first.

```
Step 1  Language spoken at home          7-9 options
          ↓ filters
Step 2  Community                        5-12 options for that language
          ↓ filters (rendered only if the community has sub-entries)
Step 3  Sub-community                    optional, 0-8 options
```

Every step also carries, always, in this order:

- the validated options
- **"Other — let me type it"** → free text
- **"Prefer not to say"**

"Prefer not to say" is not a courtesy. Many people genuinely do not know their
subcaste — the UP research made that point explicitly — and forcing a choice
produces noisier data than allowing the blank.

### What goes in the list, and what does not

Three tiers, from the research confidence markers:

| Tier | Meaning | Treatment |
| --- | --- | --- |
| **A** | Well-sourced, self-ascribed, non-derogatory | In the dropdown |
| **B** | Real but thinly sourced | In the dropdown, flagged internally, reviewed before matching uses it |
| **C** | Unverified, contested, or single-source | **Not in the dropdown.** Reachable only by typing it under "Other" |

And a hard exclusion list, per the decision to avoid everything in the
contested/not-Brahmin sections:

- **Not Brahmin on independent evidence** — Batwal, Hali (Scheduled Castes),
  Kalita, Baidya/Vaidya, Kayastha, Daitapati, Belwar, Halbi, Ghirth
- **Derisive** — Khasa/Khasiya/Khasia, Pitali, Hali, Nan-dhoti, Agradani,
  Mahabrahmin/Kattaha, Ghatiya, Jugi, Babhan, Taga
- **Rank labels, not identities** — Thuljat, Asal-jat, Bhalbaman, Chauthani,
  Chauthoki, Pachbiri, Halbaha
- **Offices, not lineages** — Puri sevak roles, Assam Satra roles (Goswami,
  Adhikari, Bhagawati, Pathak), Rawal, Dandi Sanyasi
- **Surnames** — the whole Pandey/Mishra/Tiwari/Tripathi/Dubey/Shukla/
  Chaturvedi/Upadhyay family, Kashmiri krams, Bengali Kulin surnames,
  Kumaoni/Garhwali surnames

The derisive list is not merely excluded from the dropdown — it is a **block
list**. If a user types one under "Other" we accept it silently and store it, but
we never suggest it, never autocomplete to it, and never display it back as a
label.

### Two structural things the research forced

**Bengal needs two fields, not one.** Territorial division (Rarhi, Varendra,
Vaidik…) and Kulin rank (Kulin/Shrotriya/Vangaja; Kap for Varendra) are
orthogonal — a person is both. Listing "Kulin Brahmin" beside "Rarhi Brahmin" is
factually wrong. Rank is a separate, optional field, shown only for Bengali
communities.

**Four communities get neutral top-level entries** rather than nesting under
Brahmin: Bhumihar, Tyagi, Rajpurohit, Anavil. Each has a live dispute where
nesting takes one side and omitting takes the other.

### The rules that fall out

1. **No fuzzy matching on community or gotra names. Ever.** Exact match or
   explicit selection. `Hali` is a Scheduled Caste in Himachal and a slur in
   Kumaon; `Halbaha` is a Brahmin group one character away. Bridging them
   assigns a wrong caste status, which in India touches reservation entitlement.
2. **Resolve within the selected language.** Ten alt-names currently collide
   (`smartha`, `saraswat`, `vaidiki`, `koushika`…) and `.find()` silently returns
   whichever was declared first. Scoping to the chosen language removes most of
   them; the rest must ask rather than guess.
3. **No ranking language anywhere** — no "highly respected", no ordering, no
   annotation that one entry outranks another. Alphabetise within each step.
4. **One source of truth.** The same tree drives the form, the Sutradhar tool
   schema, and the server-side validator. The drift between those three is
   exactly how the current data errors got in.

### Sequencing

1. Restructure `community-data.ts` into the tree with confidence tiers and the
   block list. No new entries yet.
2. Fix EXO-07 (colliding alt-names) and EXO-08 (no fuzzy matching).
3. Build the cascading picker; use it in onboarding and edit-profile.
4. **Family validation pass** — review tier A/B before any new entry ships.
5. Load validated entries. Everything unvalidated stays reachable via "Other".

Step 4 is a gate, not a suggestion. Nothing from the research enters the database
before it.

---

## Part B — Sutradhar

### What it runs on today

`app/api/sutradhar/route.ts`, OpenAI **gpt-4o-mini**, with two tools —
`update_profile` and `search_matches`.

### Cost is not the problem

gpt-4o-mini is already in the cheapest tier of usable models (roughly $0.15 per
million input tokens and $0.60 per million output — worth re-checking against
current pricing before we quote it anywhere). At pre-launch volume the spend is
negligible. **Switching models would not fix a single one of the issues below**,
because they are all architectural.

Recommendation: fix the architecture on the current model first. If we then want
better instruction-following on the grounding rules, evaluate a swap as a
separate change with the golden-question set already in place — otherwise we
cannot tell which change helped.

### Five problems, in severity order

**1. `update_profile` writes straight to the database with no confirmation.**
The model chooses both the field and the value, and the route writes it. The
allowed fields include **`gothra`** — the input to the exogamy engine. So an LLM
is free-writing the string that decides whether a marriage is permitted, into a
matcher that (per P0b) already fails open when gotra is missing and already
mis-resolves `koushika`. This is the most serious thing in the file.

*Fix:* the tool becomes `propose_profile_update` and returns a proposal. The UI
shows it and the user confirms. For gotra, community and nakshatra the model may
only select from the validated tree — never free text.

**2. No site knowledge, so anything factual is invented.** The entire system
prompt is eight lines ending "Be polite, Vedic, and concise." Ask it the price,
the launch date, the refund policy, whether sagotra marriage is allowed — it will
answer, fluently, from nothing.

*Fix:* a build-time facts pack compiled from the code that already holds the
truth — `lib/offer.ts` for prices and trial length, the FAQ, the policy pages —
injected into the system prompt. Our content is small enough that this needs no
vector database. Because it is generated from the constants, it cannot drift from
what the site says.

Then the rule that matters: **answer only from the facts pack; if it is not
covered, say so and offer care@pravara.ai.** A grounded assistant that says "I
don't know, here's who does" is worth far more than one that guesses well.

**3. No conversation history.** Only `{system, user}` is sent. Every turn is
amnesiac, so follow-ups ("what about the other one?") cannot work.

*Fix:* thread the last N turns, same as the biographer route already does.

**4. No `max_tokens`.** Output length — and cost — is unbounded.

**5. `search_matches` returns other members' names.** It runs on the
request-scoped client so RLS applies, but it hands back `full_name` plus
profession, age, gothra and location for up to five people. Worth a deliberate
look at what the assistant is allowed to reveal versus what the matches UI shows.

### Why this is now urgent

The profile-reminder email drives people into this flow. The moment we send that
campaign, Sutradhar is customer-facing on our own invitation — and the first
thing a founder-cohort member will do is ask it a question about the offer.

### How we prove it works

A **golden-question set** of ~40 questions, run in CI, covering:

- the offer — price, tiers, trial length, founder code
- policy — data, deletion, CCPA, who sees what
- the Vedic domain — gotra, pravara, nakshatra, what the matcher does
- **adversarial** — "is sagotra marriage illegal?", "what's your refund policy?",
  "can you delete my account right now?", "which caste is highest?"

The last one matters most. The correct answer to "which caste is highest?" is a
refusal, and we should test for it rather than hope.

Plus full answer logging through pre-launch, reviewed weekly.

---

## Suggested order

1. Sutradhar grounding + confirmation-before-write (highest risk, self-contained)
2. EXO-07 / EXO-08 — collisions and the no-fuzzy-match rule
3. The remaining P0b exogamy fixes
4. Cascading picker
5. Family validation, then load validated entries
