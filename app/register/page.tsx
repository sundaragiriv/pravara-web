import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, Users } from "lucide-react";

import Footer from "@/components/Footer";
import MarketingNav from "@/components/navigation/MarketingNav";
import { FOUNDING_MEMBER_TARGET, getLaunchRegistrationCount } from "@/lib/launch";

import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register Free | Pravara Founding Cohort",
  description:
    "Join the first 500 Pravara members and get early launch access before matching opens.",
};

export default async function RegisterPage() {
  const foundingCount = await getLaunchRegistrationCount();
  const seatsRemaining = Math.max(FOUNDING_MEMBER_TARGET - foundingCount, 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <MarketingNav isLoggedIn={false} launchMode foundingCount={foundingCount} />

      <main className="px-6 pb-24 pt-28 lg:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="relative overflow-hidden rounded-[2.5rem] border border-stone-800 bg-stone-900/55 p-8 shadow-2xl shadow-black/30 backdrop-blur lg:p-10">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-4rem] top-[-4rem] h-56 w-56 rounded-full bg-haldi-500/10 blur-[120px]" />
                <div className="absolute bottom-[-5rem] right-[-4rem] h-64 w-64 rounded-full bg-kumkum-900/20 blur-[120px]" />
              </div>

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-haldi-500/25 bg-haldi-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-haldi-300">
                  <Sparkles className="h-4 w-4" />
                  Founding 500 intake
                </div>

                <h1 className="mt-6 font-serif text-5xl leading-[1.04] text-stone-50">
                  Register now. Enter before the matching lights switch on.
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-300">
                  Pravara is opening in stages. We are building the first trusted member base now, then
                  opening matching once the room has enough real people, enough quality, and enough density
                  to matter.
                </p>

                <div className="mt-8 rounded-[2rem] border border-haldi-500/20 bg-gradient-to-br from-haldi-500/10 via-stone-900/80 to-stone-950 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Founding progress</p>
                      <p className="mt-2 text-4xl font-bold text-stone-100">{foundingCount}</p>
                    </div>
                    <div className="rounded-full border border-haldi-500/25 bg-haldi-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-haldi-300">
                      {seatsRemaining} seats remaining
                    </div>
                  </div>

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-stone-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-haldi-500 via-haldi-400 to-kumkum-500"
                      style={{ width: `${Math.min((foundingCount / FOUNDING_MEMBER_TARGET) * 100, 100)}%` }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-stone-400">
                    Once the first 500 are in place, we can turn on matching with a real base instead of an
                    empty catalog.
                  </p>
                </div>

                <div className="mt-8 grid gap-4">
                  {[
                    {
                      icon: Users,
                      title: "Early access advantage",
                      copy: "Founding members are first in line when launch access begins.",
                    },
                    {
                      icon: BadgeCheck,
                      title: "One month premium at launch",
                      copy: "The first cohort is eligible for complimentary premium access during opening month.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Better room, better start",
                      copy: "We are optimizing for quality, trust, and signal before scale.",
                    },
                  ].map(({ icon: Icon, title, copy }) => (
                    <div key={title} className="rounded-2xl border border-stone-800 bg-stone-950/55 p-5">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-haldi-500/20 bg-haldi-500/10 p-3">
                          <Icon className="h-5 w-5 text-haldi-300" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
                          <p className="mt-2 text-sm leading-relaxed text-stone-400">{copy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-2 text-sm text-stone-400">
                  <Link href="/" className="inline-flex items-center gap-2 text-haldi-400 hover:text-haldi-300">
                    Back to launch homepage
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>

            <section>
              <RegisterForm foundingCount={foundingCount} foundingTarget={FOUNDING_MEMBER_TARGET} />
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
