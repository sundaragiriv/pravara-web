import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  Landmark,
  Lock,
  Sparkles,
  Stars,
  Users,
} from "lucide-react";

import Footer from "@/components/Footer";
import MarketingNav from "@/components/navigation/MarketingNav";
import type { FounderProgress } from "@/lib/launch";
import { COHORT_TARGET } from "@/lib/offer";

/**
 * The landing page once the platform is open — rendered when PRE_LAUNCH_ENABLED
 * is OFF.
 *
 * It used to carry the founding-cohort copy wholesale: "Founding 1,000 now
 * open", a seat counter, "fill the room first, turn on the light right after".
 * All of that describes the period BEFORE launch, and this page only ever
 * renders after it. A visitor arriving the day matching opens was being told
 * the room was still being filled.
 *
 * Rewritten around what the platform actually does. The claims here are the
 * ones nothing else makes: Gothra and Pravara enforced rather than offered as
 * a filter, the full Ashtakoot computed rather than a compatibility percentage
 * invented, and the family included by design rather than tolerated.
 *
 * `founderProgress` is still accepted and still passed to the nav — the founding
 * circle is a real thing that happened, and the count remains meaningful there —
 * but the page body no longer sells seats in it.
 */
export default function MarketingHome({
  founderProgress,
  isLoggedIn,
}: {
  founderProgress: FounderProgress;
  isLoggedIn: boolean;
}) {
  // Same rule as /register: below FOUNDER_COUNT_DISPLAY_THRESHOLD the server
  // sends no number at all, so there is nothing here to leak. "998 seats left"
  // gives the count away by subtraction just as surely as "2 registered" does,
  // so the whole progress module goes rather than just the raw figure.
  const seatsRemaining = founderProgress.show
    ? Math.max(COHORT_TARGET - founderProgress.joined, 0)
    : null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <MarketingNav isLoggedIn={isLoggedIn} founderProgress={founderProgress} />

      <main>
        <section className="relative overflow-hidden px-6 pb-24 pt-28 lg:pb-32 lg:pt-40">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-haldi-500/12 blur-[140px]" />
            <div className="absolute right-[-8rem] top-24 h-[22rem] w-[22rem] rounded-full bg-kumkum-900/20 blur-[120px]" />
            <div className="absolute bottom-0 left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-stone-700/20 blur-[120px]" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-haldi-500/25 bg-haldi-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-haldi-300">
                  <Sparkles className="h-4 w-4" />
                  Vedic matrimony, now open
                </div>

                <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] text-stone-50 md:text-7xl">
                  Serious marriage deserves a better beginning.
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-stone-300 md:text-xl">
                  For families who still know their gotra — wherever they now call home. The lineage
                  rules your family would check by hand are checked here before a match is ever shown
                  to you.
                </p>

                {/* A member who is already signed in was being asked to
                    register, twice, with a seat counter beside it. LaunchHome
                    has swapped to "Enter Dashboard" for logged-in visitors
                    since it was written; this page never got the same
                    treatment, so joining the platform made the front page
                    start ignoring you. */}
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href={isLoggedIn ? "/dashboard" : "/register"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-haldi-500 px-7 py-4 text-sm font-bold text-stone-950 transition-all hover:scale-[1.02] hover:bg-haldi-400"
                  >
                    {isLoggedIn ? "Enter Dashboard" : "Register Free"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="inline-flex items-center justify-center rounded-full border border-stone-800 bg-stone-900/40 px-7 py-4 text-sm text-stone-400">
                    {isLoggedIn
                      ? "Your matches are waiting"
                      : "Free to join · nothing about you is public"}
                  </span>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: BadgeCheck,
                      title: "Gothra, enforced",
                      copy: "Not a filter you have to remember to set. Same-gotra matches are never shown, and shared Pravara lineages are caught even where the gotras differ.",
                    },
                    {
                      icon: HeartHandshake,
                      title: "Your family, included",
                      copy: "A parent or sibling can join your search properly — see the same matches, help shortlist — without reading your messages.",
                    },
                    {
                      icon: Lock,
                      title: "Nothing public",
                      copy: "Your profile is not searchable outside Pravara. Your contact details are never shown to another member.",
                    },
                  ].map(({ icon: Icon, title, copy }) => (
                    <div key={title} className="rounded-3xl border border-stone-800 bg-stone-900/45 p-5">
                      <Icon className="mb-4 h-5 w-5 text-haldi-400" />
                      <h2 className="text-sm font-semibold text-stone-100">{title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-stone-400">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-stone-800 bg-stone-900/60 p-7 shadow-2xl shadow-black/35 backdrop-blur">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">How a match is judged</p>
                  <h2 className="mt-3 font-serif text-3xl text-stone-100">
                    The way your family would judge it.
                  </h2>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Gothra & Pravara", "Sapinda exogamy applied before anything is shown. Shared rishi lineages are caught even when the gotras differ."],
                    ["Bhrugu Match", "The full 36-point Ashtakoot, computed from Nakshatra and Raasi. Nadi and Bhakoot doshas named, not buried."],
                    ["Varaahi Shield", "Identity checked by a person, vouches from people who know the family, and whether family is taking part."],
                    ["Sutradhar", "An assistant that answers from what Pravara actually says, and tells you when it does not know."],
                  ].map(([title, copy]) => (
                    <div key={title} className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
                      <p className="text-sm font-semibold text-stone-100">{title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-400">{copy}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-3xl border border-haldi-500/15 bg-gradient-to-br from-haldi-500/10 to-transparent p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-haldi-300">What we will not do</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-300">
                    <li>We will never rank one community above another, or tell you what yours is.</li>
                    <li>We will never sell your data, or show your contact details to another member.</li>
                    <li>We will never put a profile in front of you that the lineage rules exclude.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-900 bg-stone-900/30 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-haldi-300">Why Pravara</p>
              <h2 className="mt-4 font-serif text-4xl text-stone-100">
                Built for the questions a matrimony site usually leaves to you
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Landmark,
                  title: "The lineage rules are the engine",
                  copy: "Elsewhere gotra is a dropdown you filter on and hope the other family did too. Here sapinda exogamy is applied before a profile reaches you, and Pravara lineages are checked as well — the overlaps that different gotras can still hide.",
                },
                {
                  icon: Users,
                  title: "A marriage is between families",
                  copy: "Guardian mode lets a parent or sibling take part properly, with their own view and their own limits. Private conversations stay private. The software stops pretending you are searching alone.",
                },
                {
                  icon: Stars,
                  title: "Compatibility you can check",
                  copy: "The Bhrugu Match is the real 36-point Ashtakoot, shown kuta by kuta with the doshas named. No invented percentage, and no number where the birth details to compute one are missing.",
                },
              ].map(({ icon: Icon, title, copy }) => (
                <article key={title} className="rounded-[2rem] border border-stone-800 bg-stone-950/50 p-7">
                  <Icon className="h-6 w-6 text-haldi-400" />
                  <h3 className="mt-6 font-serif text-2xl text-stone-100">{title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-stone-400">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-haldi-300">How it works</p>
              <h2 className="mt-4 font-serif text-4xl text-stone-100">Three steps, and none of them are a form.</h2>
            </div>

            <div className="grid gap-5">
              {[
                {
                  step: "01",
                  title: "Tell Sutradhar your story",
                  copy: "A conversation, not a form. It asks what a family would ask — where you are from, what your household keeps, what you are looking for — and writes the profile from your answers.",
                },
                {
                  step: "02",
                  title: "We rule out what tradition rules out",
                  copy: "Gothra and Pravara are applied before you see anyone. What remains is scored on the full Ashtakoot, so the first profile you meet has already passed the checks your family would run.",
                },
                {
                  step: "03",
                  title: "Bring your family in",
                  copy: "Invite a parent or sibling to take part properly. They see what you see and can help you shortlist. What you say in a conversation stays between the two of you.",
                },
              ].map(({ step, title, copy }) => (
                <div key={step} className="grid gap-4 rounded-[2rem] border border-stone-800 bg-stone-900/45 p-6 md:grid-cols-[auto_1fr]">
                  <div className="h-12 w-12 rounded-full border border-haldi-500/25 bg-haldi-500/10 text-center text-sm font-bold leading-[3rem] text-haldi-300">
                    {step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-stone-100">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-stone-400">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-haldi-500/20 bg-gradient-to-br from-haldi-500/10 via-stone-900 to-stone-950 px-8 py-12 text-center shadow-2xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.24em] text-haldi-300">
              {isLoggedIn ? "Your search" : "Begin"}
            </p>
            <h2 className="mt-4 font-serif text-4xl text-stone-100 md:text-5xl">
              {isLoggedIn
                ? "You are already inside. Pick up where you left off."
                : "For the legacy you carry and the future you are building."}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-300">
              {isLoggedIn
                ? "Your matches are ranked by Gothra, Pravara and the full Bhrugu calculation — not by who paid to be seen."
                : "Creating a profile is free, and takes about three minutes. You will not be asked for a card, and nothing about you is public."}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-haldi-500 px-7 py-4 text-sm font-bold text-stone-950 transition-all hover:scale-[1.02] hover:bg-haldi-400"
              >
                {isLoggedIn ? "Enter Dashboard" : "Register Free"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* The seat counter is acquisition copy. Shown to a member it
                  reads as though they still have to get in. */}
              {!isLoggedIn && (
                <p className="text-sm text-stone-400">
                  {founderProgress.show
                    ? `${founderProgress.joined.toLocaleString()} on the list · ${seatsRemaining?.toLocaleString()} seats remaining`
                    : "Founding access is open for the first circle."}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
