import "server-only";

import { getSiteUrl } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * Who has asked not to be emailed, and the link that lets them ask.
 *
 * Every non-transactional message goes through here twice: once to check the
 * address is still subscribed, and once to mint the unsubscribe URL that has to
 * be in the footer and in the List-Unsubscribe header.
 *
 * Auth mail — password resets, signup confirmations — deliberately does NOT go
 * through this. Someone who opted out of the founding-circle updates still has
 * to be able to get back into their account, and an unsubscribe link on a
 * password reset would be both wrong and alarming.
 */

export type MailPreference = {
  email: string;
  token: string;
  unsubscribed: boolean;
};

/**
 * The preference row for an address, created if it does not exist.
 *
 * Upsert with ignoreDuplicates so two emails going out at once cannot race into
 * a unique violation — the second simply reads what the first wrote.
 */
export async function mailPreferenceFor(email: string): Promise<MailPreference | null> {
  const address = email.trim().toLowerCase();
  if (!address) return null;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("email_preferences")
    .upsert({ email: address }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("email_preferences upsert failed:", error.code, error.message);
    return null;
  }

  const { data, error: readError } = await supabase
    .from("email_preferences")
    .select("email, token, unsubscribed_at")
    .eq("email", address)
    .single();

  if (readError || !data) {
    console.error("email_preferences read failed:", readError?.message);
    return null;
  }

  return { email: data.email, token: data.token, unsubscribed: Boolean(data.unsubscribed_at) };
}

/** The page a reader lands on from the footer link. It asks; it does not act. */
export function unsubscribeUrl(token: string): string {
  return `${getSiteUrl()}/unsubscribe/${token}`;
}

/** The endpoint a mail client POSTs to for one-click. It acts. */
export function unsubscribePostUrl(token: string): string {
  return `${getSiteUrl()}/api/unsubscribe/${token}`;
}

/**
 * Headers that make the unsubscribe work from the mail client's own chrome.
 *
 * RFC 8058: a client that sees List-Unsubscribe-Post sends a POST to the URL
 * and shows its built-in "Unsubscribe" button next to the sender. That button
 * is the reason this exists — it is the alternative to "Report spam", and which
 * of the two a reader reaches for decides whether the domain keeps arriving in
 * inboxes at all.
 *
 * The mailto is a fallback for clients that honour the older header only.
 */
export function unsubscribeHeaders(token: string, contactEmail: string) {
  return {
    "List-Unsubscribe": `<${unsubscribePostUrl(token)}>, <mailto:${contactEmail}?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

/**
 * Records an opt-out. Idempotent — unsubscribing twice is not an error, and the
 * original timestamp is what matters, so it is not overwritten.
 */
export async function unsubscribeByToken(
  token: string,
  via: "one-click" | "link" | "manual",
): Promise<{ ok: boolean; email?: string; alreadyDone?: boolean }> {
  const supabase = createAdminClient();

  const { data: existing, error: readError } = await supabase
    .from("email_preferences")
    .select("email, unsubscribed_at")
    .eq("token", token)
    .single();

  if (readError || !existing) return { ok: false };
  if (existing.unsubscribed_at) return { ok: true, email: existing.email, alreadyDone: true };

  const { error } = await supabase
    .from("email_preferences")
    .update({ unsubscribed_at: new Date().toISOString(), unsubscribed_via: via })
    .eq("token", token);

  if (error) {
    console.error("unsubscribe failed:", error.message);
    return { ok: false };
  }

  return { ok: true, email: existing.email };
}

/** Puts someone back on the list, for the reader who unsubscribed by accident. */
export async function resubscribeByToken(token: string): Promise<{ ok: boolean; email?: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_preferences")
    .update({ unsubscribed_at: null, unsubscribed_via: null })
    .eq("token", token)
    .select("email")
    .single();

  if (error || !data) return { ok: false };
  return { ok: true, email: data.email };
}

/** The address behind a token, for showing it back on the confirmation page. */
export async function emailForToken(token: string): Promise<MailPreference | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("email_preferences")
    .select("email, token, unsubscribed_at")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  return { email: data.email, token: data.token, unsubscribed: Boolean(data.unsubscribed_at) };
}
