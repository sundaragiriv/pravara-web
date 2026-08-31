import type { Metadata } from "next";
import Link from "next/link";

import { emailForToken, resubscribeByToken } from "@/lib/email-preferences";
import { CONTACT_EMAIL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Email preferences",
  // Nothing here should ever appear in a search result: the URL identifies a
  // person, even though it does not spell out their address.
  robots: { index: false, follow: false },
};

/**
 * The page behind the unsubscribe link.
 *
 * It asks rather than acts. Fetching this URL must never change anything —
 * scanners and security gateways follow links in mail — so the actual opt-out
 * is a POST, from the button below or from the mail client's own Unsubscribe
 * control. See the route handler beside this file.
 *
 * Resubscribing is offered on the same page because the most common reason
 * someone lands here having already unsubscribed is that they did it by
 * accident, or a gateway did it for them.
 */
export default async function UnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string; resubscribe?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;

  if (query.resubscribe === "1") await resubscribeByToken(token);

  const preference = await emailForToken(token);

  const shell = (children: React.ReactNode) => (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-6 py-16 text-stone-100">
      <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-stone-900/50 p-8">
        {children}
      </div>
    </main>
  );

  if (!preference) {
    return shell(
      <>
        <h1 className="font-serif text-2xl text-stone-100">This link is not valid</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          It may have already been used, or the address may have been removed. Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-haldi-400 underline">
            {CONTACT_EMAIL}
          </a>{" "}
          and a person will sort it out.
        </p>
      </>,
    );
  }

  const done = query.done === "1" || preference.unsubscribed;

  if (done) {
    return shell(
      <>
        <h1 className="font-serif text-2xl text-stone-100">You have been unsubscribed</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          We will not send founding-circle updates to{" "}
          <span className="text-stone-200">{preference.email}</span> again.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          Emails about your account — a password reset, or confirming a new address — will still
          reach you. Those are not updates you can turn off without losing access to the account.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/unsubscribe/${token}?resubscribe=1`}
            className="rounded-full border border-stone-700 px-5 py-2.5 text-sm text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100"
          >
            Actually, keep me subscribed
          </Link>
          <Link
            href="/"
            className="rounded-full bg-haldi-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition-colors hover:bg-haldi-400"
          >
            Back to Pravara
          </Link>
        </div>
      </>,
    );
  }

  return shell(
    <>
      <h1 className="font-serif text-2xl text-stone-100">Stop these emails?</h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-400">
        This will stop founding-circle updates to{" "}
        <span className="text-stone-200">{preference.email}</span> — the milestone notes and the
        reminders to finish your profile.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-stone-400">
        Emails about your account will still reach you, and your seat in the circle is not
        affected.
      </p>

      {/* A form, so the decision is a POST. Loading this page changes nothing. */}
      <form action={`/api/unsubscribe/${token}`} method="POST" className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-full bg-haldi-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition-colors hover:bg-haldi-400"
        >
          Unsubscribe
        </button>
        <Link
          href="/"
          className="rounded-full border border-stone-700 px-5 py-2.5 text-sm text-stone-300 transition-colors hover:border-stone-600 hover:text-stone-100"
        >
          Keep them coming
        </Link>
      </form>
    </>,
  );
}
