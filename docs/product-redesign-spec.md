# Pravara Product Redesign Spec

Date: April 26, 2026

## 1. Product Positioning

### Current risk

Pravara currently risks being perceived as:

- a premium matrimony app with better branding
- an astrology-forward niche product
- a culturally strict biodata workflow

That is not the strongest position available.

### New position

Pravara should be positioned as:

`relationship intelligence for serious marriage decisions`

This is not a copy change only. The product itself must support that claim.

### Core promise

Pravara helps serious candidates and families:

- verify identity and seriousness
- reduce wasted conversations
- align candidate and family expectations
- make culturally and practically sound decisions
- move through the marriage journey with clarity and dignity

## 2. Product Principles

All redesign decisions should follow these principles.

### Principle 1: Trust before scale

Do not optimize for more profiles, more swipes, or more chat volume.
Optimize for trustworthiness of the people and decisions in the system.

### Principle 2: Reduce fatigue

Every major flow should reduce:

- ambiguity
- false hope
- repeated explanation
- silent dead ends
- admin overhead for families

### Principle 3: Preserve autonomy with family inclusion

Pravara should support family participation without making the candidate disappear behind the family.

### Principle 4: Specificity without false precision

Vedic and cultural data are valuable, but the system must not pretend uncertain data are precise.

### Principle 5: Progress must feel meaningful

Every interaction should make the user feel:

- more complete
- more trustable
- closer to a meaningful next step

## 3. New Product Framework

The entire product should be organized around four layers.

### Layer 1: Trust

Answers:

- is this person real
- how was the profile verified
- who is managing the profile
- how current is the information

### Layer 2: Intent

Answers:

- how serious is this person
- who is involved in decision-making
- what is their timeline
- how open are they to progression

### Layer 3: Compatibility

Answers:

- are they culturally aligned
- are they Vedic-compatible
- are they practically compatible
- what is unknown

### Layer 4: Progress

Answers:

- where is this connection in the journey
- what is the next step
- what blockers remain

## 4. User Segments

The redesigned product should explicitly support these segments.

### Segment A: Candidate-led serious user

Traits:

- wants autonomy
- values clarity
- may involve family later
- may know only some cultural details

Needs:

- fast onboarding
- privacy
- trust in counterpart quality
- low-fatigue experience

### Segment B: Joint family-candidate user

Traits:

- candidate is active
- family has advisory role
- wants structure and coordination

Needs:

- role clarity
- review flows
- family-readable match summaries

### Segment C: Family-led serious search

Traits:

- parent or elder is heavily involved
- candidate may approve later
- cultural precision matters more

Needs:

- candidate confirmation checkpoints
- high trust signals
- clear progression rules

## 5. Information Architecture

### Public

- `/`
- `/how-it-works`
- `/trust`
- `/faq`
- `/about`
- `/legal/privacy`
- `/legal/terms`
- `/legal/trust`
- `/support`

### Authenticated

- `/dashboard`
- `/profile`
- `/matches`
- `/connections`
- `/family`
- `/trust-center`
- `/settings`

### Hidden / system

- admin
- support ops
- verification ops
- notifications

## 6. Homepage Redesign

### Objective

The homepage should not look like a feature grid for another matrimony site.
It should immediately communicate:

- serious intent
- trust architecture
- family compatibility
- calm confidence

### New page structure

#### Section 1: Hero

Headline:

`Serious marriage decisions need more than profiles.`

Subheadline:

`Pravara helps candidates and families move with trust, clarity, and culturally grounded compatibility.`

Primary CTA:

- `Create Your Profile`

Secondary CTA:

- `See How Pravara Works`

Hero support points:

- verified identity layers
- family collaboration
- Vedic-aware matching
- intent clarity

#### Section 2: Why current platforms fail

Use 4 concrete pains:

- fake or misleading profiles
- unclear seriousness
- family-candidate mismatch
- exhausting dead-end conversations

#### Section 3: The Pravara model

Present the 4 pillars:

- trust
- intent
- compatibility
- progress

#### Section 4: How it works

Three-step journey:

1. Build a serious profile
2. Verify identity and intent
3. Move through guided meaningful connections

#### Section 5: Trust system

Introduce:

- Varaahi Shield
- verification tiers
- candidate confirmation
- family collaboration controls

#### Section 6: Cultural intelligence

Show:

- gothra protection
- Vedic compatibility
- provenance-aware cultural fields

#### Section 7: Family involvement

Explain self-managed, family-managed, and joint mode.

#### Section 8: Closing CTA

Not hype-heavy.
Tone should be:

- serious
- premium
- calm
- specific

## 7. Onboarding Redesign

### Core goal

Reduce abandonment while preserving cultural depth.

### Main problem with current onboarding

It asks culturally dense questions too early and assumes users know them with confidence.

### New onboarding model

Two entry paths:

#### Path A: Quick Start

Collect only:

- full name
- age
- gender
- current location
- profile manager mode
- marriage timeline
- one photo

Then enter dashboard with progress prompts.

#### Path B: Guided Full Setup

Collect:

- basic identity
- family and intent structure
- optional Vedic and cultural details

### New onboarding stages

#### Stage 1: Profile basics

- name
- age
- gender
- profession
- location
- photo

#### Stage 2: Intent setup

- self-managed / parent-managed / jointly managed
- actively looking / exploring / family reviewing
- preferred timeline
- candidate-first / family-first interaction preference

#### Stage 3: Family context

- community
- sub-community
- language
- family involvement mode

#### Stage 4: Vedic data

Collect with provenance:

- gothra
- nakshatra
- padam
- raasi
- pravara

Each with source:

- I know this
- family told me
- horoscope says
- not sure yet

#### Stage 5: Trust setup

- phone verify
- email verify
- photo confirmation
- optional ID verification

### New onboarding UX patterns

- conversational guidance
- clear skip behavior
- saved progress
- visible “why this matters”
- no hard stop on uncertain Vedic fields

## 8. Dashboard Redesign

### Objective

The dashboard should feel like a serious marriage journey command center, not a matches page with extras.

### New dashboard layout

#### Top summary strip

Show:

- trust level
- profile completeness
- intent readiness
- verification status
- pending actions

#### Left rail

Navigation by journey:

- Overview
- Improve Profile
- Trust Center
- Matches
- Conversations
- Family
- Settings

#### Main overview

Top block:

- “Next best action”

Examples:

- confirm candidate management mode
- add timeline
- verify identity
- respond to shortlisted match

Second block:

- top 3 meaningful matches

Third block:

- active conversations and status

Fourth block:

- missing trust signals

#### Right rail

- Sutradhar guidance
- family alerts
- verification reminders
- unresolved blockers

## 9. Match Discovery Redesign

### Core principle

Users should not just see profiles.
They should understand why each profile is worth attention.

### New match card structure

#### Block 1: Identity

- name
- age
- city
- profile manager mode
- last confirmed active date

#### Block 2: Trust

- trust tier
- candidate confirmed or not
- family collaborator present or not
- ID verified or not

#### Block 3: Intent

- active looking status
- timeline
- candidate-first or family-first preference

#### Block 4: Compatibility

- Vedic fit
- lifestyle fit
- family fit
- unknowns

#### Block 5: Why shown

Examples:

- same language, high Vedic fit, similar timeline
- strong practical fit, missing padam confirmation

### New actions

- `Interested`
- `Request Clarification`
- `Save for Family Review`
- `Pass Respectfully`

## 10. Profile Redesign

### Objective

Profiles should communicate signal quality, not just volume of biodata.

### New profile structure

#### Section 1: Trust Summary

- trust tier
- identity verification
- candidate participation
- data freshness
- vouches

#### Section 2: Intent Summary

- managed by
- seriousness level
- timeline
- interaction preference

#### Section 3: Personal Snapshot

- profession
- education
- city
- values summary

#### Section 4: Cultural and Vedic

- gothra
- nakshatra
- padam
- raasi
- pravara
- source / confidence for each

#### Section 5: Family Context

- family involvement level
- family details
- location roots

#### Section 6: What should be clarified

System-generated or user-defined unknowns:

- Vedic data partially self-reported
- family involvement not confirmed
- timeline not declared

## 11. Trust Center Redesign

### This should become a major product surface

Not buried.

### Purpose

Let users build and understand their credibility.

### Trust Center modules

#### Identity

- phone verified
- email verified
- selfie verification
- ID upload

#### Candidate confirmation

- candidate confirmed profile details
- candidate confirmed intent

#### Family confirmation

- family collaborator added
- family review acknowledged

#### Community signals

- vouches
- report status
- moderation history summary if appropriate

### Trust tier model

Example:

- Tier 0: Basic profile
- Tier 1: Contact verified
- Tier 2: Identity verified
- Tier 3: Candidate confirmed
- Tier 4: Family confirmed
- Tier 5: High-trust profile

## 12. Parent / Family Workflow Redesign

### Core principle

Family support should be first-class, but controlled.

### New model

At signup or onboarding:

- `I am managing my own profile`
- `My family is helping`
- `My family manages first contact`

### Family permissions

Explicit permissions by role:

- browse only
- shortlist
- comment internally
- approve outreach
- send interest

### Internal family review layer

New feature:

- internal notes visible only to the profile team
- shortlists for family review
- candidate acknowledgment before progression

## 13. Conversation Flow Redesign

### Problem

Category chat is often shallow, repetitive, and directionless.

### New structure

Each connection should move through guided stages:

1. Intro
2. Basic intent
3. Practical fit
4. Family alignment
5. Vedic clarification
6. Next step

### New conversation tools

- suggested clarifying questions
- mismatch flags
- structured close-out reasons
- next-step readiness prompt

## 14. UX States and Microcopy Direction

### Tone

- calm
- specific
- respectful
- grounded
- never gimmicky

### Good state examples

- `Candidate confirmed. Family collaborator active.`
- `Your Vedic details are partially complete. Add the missing pieces when ready.`
- `This match looks strong, but timeline alignment is still unclear.`
- `You have not added enough trust signals to unlock higher-quality engagement.`

### Avoid

- generic “AI magic”
- fake urgency
- motivational fluff
- shallow “100% compatibility” style language

## 15. Visual Design Direction

### Current problem

The visual language still leans too close to premium dark SaaS / AI landing conventions.

### New visual direction

#### Mood

- ceremonial precision
- modern dignity
- premium but not flashy
- warm authority

#### Typography

- clearer hierarchy
- serif reserved for truly important headings
- strong, legible sans for body and system labels

#### Color system

State colors need meaning:

- verified: green
- pending: amber
- blocked / conflict: red
- family-managed: muted blue or bronze
- uncertain / missing: stone + amber

#### Surfaces

- fewer decorative blobs
- more intentional cards
- stronger distinction between trust, compatibility, and action zones

#### Motion

- progress-reinforcing motion
- staged reveals
- subtle progression animation
- no generic “AI shimmer”

## 16. New Data Model Requirements

These fields are required to support the redesign.

### Trust

- `verification_tier`
- `phone_verified_at`
- `email_verified_at`
- `identity_verified_at`
- `candidate_confirmed_at`
- `family_confirmed_at`
- `last_profile_reviewed_at`

### Intent

- `profile_manager_mode`
- `intent_status`
- `marriage_timeline`
- `conversation_preference`
- `relocation_openness`

### Vedic provenance

For each key field:

- `gothra_source`
- `nakshatra_source`
- `nakshatra_padam_source`
- `raasi_source`
- `pravara_source`

Optional:

- `gothra_confidence`
- `nakshatra_confidence`
- `nakshatra_padam_confidence`
- `raasi_confidence`
- `pravara_confidence`

### Progress

- `journey_stage`
- `next_recommended_action`
- `trust_score`
- `profile_signal_score`

## 17. Implementation Order

### Phase 1

- redesign data model
- add trust and intent fields
- add profile manager mode
- add Vedic provenance fields

### Phase 2

- redesign onboarding
- redesign trust center
- redesign profile summary blocks

### Phase 3

- redesign dashboard and match cards
- add explanation layer
- add candidate-family review flow

### Phase 4

- redesign conversation progression
- add close-out reasons
- add decision workflow support

### Phase 5

- homepage and public marketing redesign
- refined positioning and narrative

## 18. Immediate Deliverables Suggested

The next concrete product deliverables should be:

1. Trust and intent schema spec
2. Onboarding flow redesign spec
3. Dashboard wireframe spec
4. Profile and match card spec
5. Family collaboration flow spec

## 19. Bottom Line

The redesign should not aim to make Pravara prettier first.

It should aim to make Pravara:

- more trustworthy
- more serious
- less tiring
- more evidence-aware
- more family-intelligent
- more decision-oriented

If done correctly, Pravara will stop feeling like “another matrimony platform with Vedic branding” and start feeling like a category-defining system for serious marriage decisions.
