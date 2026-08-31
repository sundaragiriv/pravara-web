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

  /**
   * A column the database does not have yet must not cost a registration.
   *
   * Code and SQL do not deploy together, and if the code lands first every
   * registration fails on an unknown column. That is the most expensive failure
   * this route has — during an advertising push it is paid traffic hitting a
   * 500 on the one page that matters.
   *
   * Only the column actually named in the error is dropped, then the insert is
   * retried. A first attempt dropped every recently-added column at once, which
   * saved the row but also discarded `country` — a column that exists and is
   * precisely what says which of three ad markets a registration came from.
   * Losing that for the length of a deploy window is a real cost, and an
   * avoidable one.
   *
   * `full_name` and `age` are never dropped: they are derived, they predate all
   * of this, and a row without them is not worth saving.
   */
  const dropped: string[] = [];
  const degraded: Record<string, unknown> = { ...row };

  // Bounded rather than while(true): each pass must remove one column, so the
  // number of columns is the natural limit, and a malformed error message can
  // never spin here.
  for (let attempt = 0; attempt < Object.keys(row).length && isMissingColumnError(error); attempt++) {
    const named = /'([a-z_]+)' column|column "?([a-z_]+)"?/i.exec(error?.message ?? "");
    const column = named?.[1] ?? named?.[2];
    if (!column || !(column in degraded) || column === "full_name" || column === "age") break;

    delete degraded[column];
    dropped.push(column);
    ({ data, error } = await insert(degraded));
  }

  if (dropped.length) {
    console.warn(
      `launch_registrations is missing ${dropped.join(", ")} — registration saved without ` +
        "those fields. Run the pending migrations in supabase/migrations/.",
    );
  }

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Which seat this registration took — used to tell a founder "yours is the 47th
 * of 1,000". Counted at send time rather than stored, because the exact value
 * only matters once, in one email.
 *
 * Returns null on any failure: a wrong seat number is worse than no seat
 * number, since it is the one claim in that email a reader could disprove.
 */
export async function getSeatNumber(registrationId: string): Promise<number | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("launch_registrations")
      .select("created_at")
      .eq("id", registrationId)
      .single();

    if (error || !data) return null;

    const { count, error: countError } = await supabase
      .from("launch_registrations")
      .select("*", { count: "exact", head: true })
      .lte("created_at", data.created_at);

    if (countError || count === null) return null;
    return count;
  } catch {
    return null;
  }
}
