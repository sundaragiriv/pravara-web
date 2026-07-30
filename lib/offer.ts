/**
 * The offer — cohort size, founding benefit, and plan prices, in one place.
 *
 * Every page that states a number about what Pravara sells must read it from
 * here. These figures were previously typed as prose into each component, which
 * is how the marketing page ended up promising a "founding cohort of 500" while
 * rendering a progress bar out of 1,000, and "one month premium" while seven
 * other places promised three.
 *
 * Deliberately NOT server-only: the membership page is a client component and
 * needs the same numbers the server renders.
 */

/** Size of the founding circle. The registration counter fills toward this. */
export const COHORT_TARGET = 1000;

/** Months of Gold a founding registration earns when matching opens. */
export const FOUNDER_PREMIUM_MONTHS = 3;

/** Roughly how long until matching opens, for copy that promises a timeframe. */
export const MONTHS_UNTIL_MATCHING = 3;

/** Free trial granted to every new account, no code required. */
export const TRIAL_DAYS = 7;

/**
 * Tier ids are constrained in the database
 * (`membership_plans.tier CHECK (tier IN ('Basic','Gold','Concierge'))`), so the
 * id is fixed and only the display name is ours to choose.
 */
export type TierId = "Basic" | "Gold" | "Concierge";

export type PlanTerm = {
  /** Months covered by one payment. */
  months: number;
  /** Total charged for the term, in USD. */
  price: number;
};

export type Plan = {
  id: TierId;
  /** What a member sees. "Basic" is an implementation detail. */
  name: string;
  /** Monthly price in USD. 0 for the free tier. */
  monthlyPrice: number;
  /**
   * Longer terms, priced to undercut the field on the SKUs people actually buy.
   * Shaadi.com and BharatMatrimony both sell 3 months at $54; neither sells a
   * true monthly plan. Dil Mil's monthly is $34.99.
   */
  terms: PlanTerm[];
};

export const PLANS: Plan[] = [
  {
    id: "Basic",
    name: "Registered",
    monthlyPrice: 0,
    terms: [],
  },
  {
    id: "Gold",
    name: "Gold",
    monthlyPrice: 29.99,
    terms: [
      { months: 3, price: 47 },
      { months: 6, price: 82 },
    ],
  },
  {
    id: "Concierge",
    // NOTE: priced per instruction. Flagged as PAY-03 in docs/LAUNCH-BACKLOG.md —
    // if Concierge means real human matchmaking time, this does not cover it.
    name: "Concierge",
    monthlyPrice: 99.99,
    terms: [],
  },
];

export const TIER_ORDER: TierId[] = ["Basic", "Gold", "Concierge"];

export function getPlan(id: TierId): Plan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown tier: ${id}`);
  return plan;
}

/** "$29.99" / "$47" — trims a trailing .00 so whole prices read cleanly. */
export function formatPrice(usd: number): string {
  return usd % 1 === 0 ? `$${usd}` : `$${usd.toFixed(2)}`;
}

/** Effective monthly rate for a term, for "works out at $15.67/mo" copy. */
export function monthlyEquivalent(term: PlanTerm): number {
  return term.price / term.months;
}
