import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Crown, KeyRound, Sparkles } from "lucide-react";

import LaunchAtmosphere from "@/components/launch/LaunchAtmosphere";
import LaunchPageView from "@/components/launch/LaunchPageView";
import { getFounderProgress } from "@/lib/launch";
import { COHORT_TARGET, FOUNDER_PREMIUM_MONTHS } from "@/lib/offer";
import { createClient } from "@/utils/supabase/server";

import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

/** What a founding seat actually buys — the left column's argument. */
const FOUNDER_BENEFITS = [
  {
    icon: Sparkles,
    title: `${FOUNDER_PREMIUM_MONTHS} months of premium, free`,
    copy: "Applied automatically when matching opens.",
  },
  {
    icon: KeyRound,
    title: "First access",
    copy: "Founders are matched before registration opens wider.",
  },
  {
    icon: Crown,
    title: `A seat in the first ${COHORT_TARGET.toLocaleString()}`,
    copy: "The founding circle closes once it's full.",
  },
];

export const metadata: Metadata = {
  // Root layout applies the `%s · Pravara` template — don't repeat the brand here.
  title: "Join the Founder Circle",
  description:
    `Pravara is Vedic matrimony, by invitation. Join the first ${COHORT_TARGET.toLocaleString()} founders and get ${FOUNDER_PREMIUM_MONTHS} months of premium free when matching opens.`,
  alternates: { canonical: "/register" },
  // Without these the share card showed this page's own OG image next to the
  // generic site title — the picture said "Join the Founder Circle" and the
  // headline said "Modern Heritage Matrimony".
  openGraph: {
    title: "Join the Founder Circle",
    description: `${COHORT_TARGET.toLocaleString()} seats. Vedic matrimony, by invitation.`,
    url: "/register",
    type: "website",
  },
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const founderProgress = await getFounderProgress();

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-50">
      <LaunchPageView path="/register" event="launch_register_view" />
      <LaunchAtmosphere className="opacity-80" />

      <main className="relative px-6 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          {/* 3-column grid, not justify-between: the outer columns stay equal so
              the logo is optically centred even when the right label is hidden
              on small screens (where all three would otherwise collide). */}
          <div className="mb-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Link
              href="/"
              // min-h-[44px] and the negative margin keep the visual position
              // while giving a thumb something to land on. The link was 17px
              // tall, well under the 44px both Apple and Google call the
              // minimum, and it is the only way back from this page.
              className="-my-3 inline-flex min-h-[44px] items-center gap-2 justify-self-start whitespace-nowrap py-3 text-[0.7rem] uppercase tracking-[0.28em] text-stone-400 transition-colors hover:text-haldi-300"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Back to invitation</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <Image
              src="/logo3.png"
              alt="Pravara"
              width={180}
              height={66}
              className="w-[130px] object-contain [mix-blend-mode:lighten] sm:w-[180px]"
              priority
            />

            <div className="hidden justify-self-end whitespace-nowrap text-xs uppercase tracking-[0.28em] text-haldi-300 sm:block">
              Founder Circle
            </div>
          </div>

          {/* Split layout: the argument on the left, the form on the right, so a
              desktop visitor can read why and act without scrolling. Stacks to
              argument-then-form on mobile, which is the right order anyway. */}
          <RegisterForm
            founderProgress={founderProgress}
            aside={
              <div className="text-center lg:text-left">
                <p className="text-xs uppercase tracking-[0.32em] text-haldi-300">
                  Vedic matrimony, by invitation
                </p>
                <h1 className="mt-5 text-balance font-serif text-5xl leading-[0.96] text-stone-50 md:text-6xl">
                  Join the Founder Circle.
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-300 lg:mx-0">
                  We&apos;re opening with a first circle of {COHORT_TARGET.toLocaleString()} founders. Register once now — when
                  matching opens in about three months, founders get{" "}
                  <span className="font-semibold text-haldi-200">{FOUNDER_PREMIUM_MONTHS} months of premium, free</span>.
                </p>

                {/* No toran here — the form card already carries one, and two on
                    one screen turns a flourish into a pattern. */}
                <ul className="mx-auto mt-8 max-w-md space-y-4 text-left lg:mx-0">
                  {FOUNDER_BENEFITS.map(({ icon: Icon, title, copy }) => (
                    <li key={title} className="flex gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-haldi-400" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold text-stone-200">{title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-stone-400">{copy}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
        </div>
      </main>
    </div>
  );
}
