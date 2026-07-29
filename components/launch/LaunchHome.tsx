import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gem, ScrollText, Users } from "lucide-react";

import LaunchAtmosphere from "@/components/launch/LaunchAtmosphere";
import LaunchCtaLink from "@/components/launch/LaunchCtaLink";
import LaunchPageView from "@/components/launch/LaunchPageView";

const ctaClass =
  "btn-sheen btn-festive launch-cta-glow inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 text-sm font-bold uppercase tracking-[0.14em] text-stone-950 transition-all hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haldi-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950";

/** What separates Pravara — kept to three, stated plainly. */
const PILLARS = [
  {
    icon: ScrollText,
    title: "By invitation",
    copy: "Curated founding circle, not open registration.",
  },
  {
    icon: Users,
    title: "Family-aware",
    copy: "Built around gotra, community, and lineage from day one.",
  },
  {
    icon: Gem,
    title: "Depth over volume",
    copy: "Fewer, more intentional matches — not swipe fatigue.",
  },
];

// TODO: placeholder wording — replace with the family's own text before the
// site is actively promoted. Signed copy is doing trust work here, so it should
// be true to how the family actually talks about why Pravara exists.
const FOUNDER_NOTE =
  "Pravara is being built by a family who grew up inside these traditions and want them to survive the next generation intact.";
const FOUNDER_SIGNATURE = "The Sundaragiri Family";

/**
 * Pre-launch microsite home — the minimal "founding circle" invitation splash.
 * Rendered when PRE_LAUNCH_ENABLED is on. The richer post-launch landing lives
 * in components/marketing/MarketingHome.
 */
export default function LaunchHome({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-stone-950 text-stone-50">
      <LaunchPageView path="/" event="launch_home_view" />
      <LaunchAtmosphere />

      {/* `short:` (see tailwind.config) compresses the hero's fixed spacing on
          viewports under 800px tall — small phones and 768p laptops — so the CTA
          clears the fold there. Type scale and everything above 700px are
          untouched. */}
      <main className="relative flex flex-col items-center px-6 py-16 text-center short:py-8">
        {/* Hero height: svh, not vh — on mobile, vh is the URL-bar-hidden
            viewport, which pushes the CTA below the real fold. Subtracting the
            wrapper's py-16 (8rem) plus 3rem keeps the CTA comfortably in view
            while still letting the trust layer peek and invite a scroll. */}
        <section className="mx-auto flex min-h-[calc(100svh-11rem)] w-full max-w-3xl flex-col items-center justify-center">
          {/* Wordmark — login-style treatment: logo over a warm glow; the dark
              matte blends away via mix-blend-lighten. In normal flow → never overlaps. */}
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[230px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-haldi-500/[0.10] blur-[90px]"
            />
            <Image
              src="/logo3.png"
              alt="Pravara — Modern Heritage Matrimony"
              width={300}
              height={120}
              priority
              className="relative h-auto w-[220px] object-contain [mix-blend-mode:lighten] short:w-[150px] md:w-[270px] md:short:w-[170px]"
            />
          </div>

          <p className="mt-10 text-xs uppercase tracking-[0.3em] text-haldi-300 short:mt-4">
            Exclusive pre-launch invitation
          </p>

          <h1 className="mt-6 text-balance font-serif text-4xl leading-[0.96] text-stone-50 short:mt-4 sm:text-5xl md:text-6xl xl:text-7xl">
            For the legacy you carry and the future you are building.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-300 short:mt-4 md:text-lg">
            Pravara is opening through a carefully formed founding circle — where trust, cultural
            depth, and family-aware intelligence arrive before noise.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 short:mt-5 short:gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className={ctaClass}>
                Enter Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <LaunchCtaLink
                href="/register"
                // Unchanged across the copy change so the existing funnel series stays continuous.
                source="hero-begin-journey"
                className={ctaClass}
              >
                Reserve My Founding Seat
                <ArrowRight className="h-4 w-4" />
              </LaunchCtaLink>
            )}

            <p className="text-sm text-stone-400">Founding access is open for the first circle.</p>
          </div>
        </section>

        {/* Trust layer — the hero is an invitation; this is the reason to accept it. */}
        <section className="mx-auto w-full max-w-4xl border-t border-stone-900 pb-20 pt-20">
          <p className="mx-auto max-w-2xl text-balance text-base leading-relaxed text-stone-300 md:text-lg">
            For families rooted in Vedic tradition — in India and across the diaspora.
          </p>

          <div className="mt-14 grid gap-10 text-left sm:grid-cols-3 sm:gap-8">
            {PILLARS.map(({ icon: Icon, title, copy }) => (
              <div key={title}>
                <Icon className="h-5 w-5 text-haldi-400" aria-hidden="true" />
                <h2 className="mt-4 text-sm font-semibold tracking-wide text-stone-100">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">{copy}</p>
              </div>
            ))}
          </div>

          <figure className="mx-auto mt-16 max-w-2xl border-t border-stone-900 pt-10">
            <blockquote className="text-balance font-serif text-lg leading-relaxed text-stone-300 md:text-xl">
              {FOUNDER_NOTE}
            </blockquote>
            <figcaption className="mt-5 text-xs uppercase tracking-[0.28em] text-haldi-300">
              {FOUNDER_SIGNATURE}
            </figcaption>
          </figure>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs uppercase tracking-[0.2em] text-stone-400">
          <Link href="/legal/privacy" className="transition-colors hover:text-stone-200">
            Privacy
          </Link>
          <Link href="/legal/terms" className="transition-colors hover:text-stone-200">
            Terms
          </Link>
          <Link href="/support" className="transition-colors hover:text-stone-200">
            Support
          </Link>
        </div>
      </main>
    </div>
  );
}
