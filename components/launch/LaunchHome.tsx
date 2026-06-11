import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import LaunchAtmosphere from "@/components/launch/LaunchAtmosphere";
import LaunchCtaLink from "@/components/launch/LaunchCtaLink";
import LaunchPageView from "@/components/launch/LaunchPageView";

const ctaClass =
  "btn-sheen btn-festive launch-cta-glow inline-flex items-center justify-center gap-2 rounded-full px-10 py-4 text-sm font-bold uppercase tracking-[0.14em] text-stone-950 transition-all hover:scale-[1.02] hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haldi-300 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950";

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

      <main className="relative flex min-h-screen flex-col items-center justify-center gap-12 px-6 py-16 text-center">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
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
              className="relative h-auto w-[220px] object-contain [mix-blend-mode:lighten] md:w-[270px]"
            />
          </div>

          <p className="mt-14 text-xs uppercase tracking-[0.3em] text-haldi-300">
            Exclusive pre-launch invitation
          </p>

          <h1 className="mt-6 text-balance font-serif text-4xl leading-[0.96] text-stone-50 sm:text-5xl md:text-6xl xl:text-7xl">
            For the legacy you carry and the future you are building.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-stone-300 md:text-lg">
            Pravara is opening through a carefully formed founding circle — where trust, cultural
            depth, and family-aware intelligence arrive before noise.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className={ctaClass}>
                Enter Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <LaunchCtaLink href="/register" source="hero-begin-journey" className={ctaClass}>
                Begin the Journey
                <ArrowRight className="h-4 w-4" />
              </LaunchCtaLink>
            )}

            <p className="text-sm text-stone-400">Founding access is open for the first circle.</p>
          </div>
        </div>

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
