import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

// Re-exported so server code has one import for both halves.
export { REPORT_REASONS, REPORT_REASON_LABELS, REPORT_REASON_SHORT } from "@/lib/safety-labels";
export type { ReportReason } from "@/lib/safety-labels";

/**
 * Blocking, on the server side.
 *
 * A block is stored one-directional — she blocked him — but it has to work in
 * both directions. If it only hid him from her, he would still see her in his
 * matches, still be able to open her profile, and still be able to start a
 * conversation. So every read here unions both columns.
 *
 * The database enforces the message-send side of this (see
 * `create_safety_tables.sql`). What lives here is the visibility side: keeping
 * blocked people out of lists in the first place, so nobody has to discover a
 * block by bumping into it.
 */

/**
 * Every user id the caller must not see, in either direction.
 *
 * Returns an empty set rather than throwing when the tables are absent, so a
 * deploy that reaches an environment before the migration does degrades to
 * "no blocks recorded" instead of taking down the match list. It logs loudly,
 * because silently showing blocked people is not something to discover later.
 */
export async function getHiddenUserIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

  if (error) {
    console.error(
      "Block list unavailable — matches are NOT being filtered:",
      error.message,
      `[code: ${error.code ?? "?"}]`,
    );
    return new Set();
  }

  const hidden = new Set<string>();
  for (const row of data ?? []) {
    hidden.add(row.blocker_id === userId ? row.blocked_id : row.blocker_id);
  }
  return hidden;
}

/** Whether these two may see or reach each other at all. */
export async function isBlockedBetween(
  supabase: SupabaseClient,
  a: string,
  b: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("blocks")
    .select("id")
    .or(
      `and(blocker_id.eq.${a},blocked_id.eq.${b}),and(blocker_id.eq.${b},blocked_id.eq.${a})`,
    )
    .limit(1);

  if (error) {
    console.error("Block check failed:", error.message);
    // Fail closed. If we cannot tell whether someone is blocked, the safe
    // answer is that they are — an unnecessary "not available" is a far
    // smaller harm than delivering a message somebody blocked.
    return true;
  }

  return (data?.length ?? 0) > 0;
}
