import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase-admin";
import { COHORT_TARGET } from "@/lib/offer";

export type LaunchRegistrationInput = {
  full_name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  /** Collected later at onboarding — optional at pre-registration. */
  profession?: string;
  location?: string;
  email: string;
  phone: string;
  /** ISO 3166-1 alpha-2, captured at registration. */
  country?: string;
  source?: string;
};

/** @deprecated Read COHORT_TARGET from `@/lib/offer` directly. Kept as an alias. */
export const FOUNDING_MEMBER_TARGET = COHORT_TARGET;

/**
 * Below this many registrations the public counter is hidden entirely.
 * A small real number ("2 of 1,000") reads as a dead product to a cold
 * visitor — worse than no number at all. Above it, the count becomes
 * genuine social proof.
 */
export const FOUNDER_COUNT_DISPLAY_THRESHOLD = 75;

/** How long (seconds) the public count is cached before we re-query. */
const FOUNDER_COUNT_TTL_SECONDS = 60;

async function fetchLaunchRegistrationCount(): Promise<number | null> {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("launch_registrations")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error(
        "Launch registration count error:",
        error.message,
        `[code: ${error.code ?? "?"}]`,
        error.details ?? "",
      );
      return null;
    }

    return count ?? 0;
  } catch (error) {
    console.error(
      "Launch registration count unavailable:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

/** Per-request memoised count (exact, unthresholded — server/admin use only). */
export const getLaunchRegistrationCount = cache(fetchLaunchRegistrationCount);

/** Cross-request count for public pages, revalidated every 60s. */
const getCachedLaunchRegistrationCount = unstable_cache(
  fetchLaunchRegistrationCount,
  ["launch-registration-count"],
  { revalidate: FOUNDER_COUNT_TTL_SECONDS, tags: ["launch-registrations"] },
);

/**
 * What the public UI is allowed to render. When the circle is still small we
 * return `{ show: false }` and deliberately omit the number, so the real count
 * never reaches the client payload at all.
 */
export type FounderProgress =
  | { show: false }
  | { show: true; joined: number; target: number; pct: number };

export async function getFounderProgress(): Promise<FounderProgress> {
  const joined = await getCachedLaunchRegistrationCount();

  if (joined === null || joined < FOUNDER_COUNT_DISPLAY_THRESHOLD) {
    return { show: false };
  }

  return {
    show: true,
    joined,
    target: FOUNDING_MEMBER_TARGET,
    pct: Math.min(100, Math.round((joined / FOUNDING_MEMBER_TARGET) * 100)),
  };
}

/**
 * A missing column surfaces two different ways depending on who notices first:
 * PostgREST rejects it against its cached schema (PGRST204) before Postgres ever
 * sees the statement, and Postgres raises undefined_column (42703) when it does.
 * Checking only 42703 silently misses the common case — verified by hitting it.
 */
function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /could not find the .* column/i.test(error.message ?? "")
  );
}

export async function createLaunchRegistration(input: LaunchRegistrationInput) {
  const supabase = createAdminClient();

  const row = {
    ...input,
    // profession/location are onboarding-stage; keep the NOT NULL columns satisfied.
    profession: input.profession ?? "",
    location: input.location ?? "",
    source: input.source || "launch-homepage",
  };

  const insert = (payload: Record<string, unknown>) =>
    supabase
      .from("launch_registrations")
      .insert(payload)
      .select("id, full_name, email, created_at")
      .single();

  let { data, error } = await insert(row);

  // The country column arrives in a migration (add_registration_country.sql).
  // If the code reaches an environment before the SQL does, drop the field and
  // save the registration rather than lose it — a deploy-ordering mistake must
  // never cost a real signup. Remove this fallback once every environment has
  // the column.
  if (isMissingColumnError(error) && "country" in row) {
    console.warn(
      "launch_registrations.country missing — saving without it. Run supabase/migrations/add_registration_country.sql.",
    );
    const withoutCountry = { ...row };
    delete (withoutCountry as { country?: string }).country;
    ({ data, error } = await insert(withoutCountry));
  }

  if (error) {
    throw error;
  }

  return data;
}
