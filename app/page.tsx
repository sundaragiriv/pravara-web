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
import { FOUNDING_MEMBER_TARGET, getLaunchRegistrationCount } from "@/lib/launch";

export const dynamic = "force-dynamic";

export default async function Home() {
  const foundingCount = await getLaunchRegistrationCount();
  const seatsRemaining = Math.max(FOUNDING_MEMBER_TARGET - foundingCount, 0);
  const progress = Math.min((foundingCount / FOUNDING_MEMBER_TARGET) * 100, 100);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <MarketingNav isLoggedIn={false} launchMode foundingCount={foundingCount} />

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
                  Founding 500 now open
                </div>

                <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] text-stone-50 md:text-7xl">
                  Serious marriage deserves a better beginning.
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-stone-300 md:text-xl">
                  Pravara is opening carefully with a founding cohort of 500 members so every early match
                  begins with real intent, cultural depth, and room for meaningful discovery.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-haldi-500 px-7 py-4 text-sm font-bold text-stone-950 transition-all hover:scale-[1.02] hover:bg-haldi-400"
                  >
                    Register Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="inline-flex items-center justify-center rounded-full border border-stone-800 bg-stone-900/40 px-7 py-4 text-sm text-stone-400">
                    Founding members get launch access first
                  </span>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: BadgeCheck,
                      title: "Founding-only rollout",
                      copy: "We are admitting the first members in a controlled cohort instead of opening a noisy empty marketplace.",
                    },
                    {
                      icon: HeartHandshake,
                      title: "One month premium at launch",
                      copy: "Founding registrations are eligible for early launch benefits when access opens.",
                    },
                    {
                      icon: Lock,
                      title: "Trust first",
                      copy: "We are building for serious intent, not mass traffic, fake profiles, or low-quality matching noise.",
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Founding cohort</p>
                    <h2 className="mt-3 font-serif text-3xl text-stone-100">
                      Fill the room first. Turn on the light right after.
                    </h2>
                  </div>
                  <div className="rounded-full border border-haldi-500/30 bg-haldi-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-haldi-300">
                    {seatsRemaining} seats left
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between text-sm text-stone-400">
                    <span>{foundingCount} registered</span>
                    <span>{FOUNDING_MEMBER_TARGET} target</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-stone-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-haldi-500 via-haldi-400 to-kumkum-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    ["Profile depth", "We start collecting the right data before matching goes live."],
                    ["Signal quality", "Early members give the first real inventory its shape and seriousness."],
                    ["Trust layer", "Identity, family context, and cultural signals can be reviewed before launch."],
                    ["Launch readiness", "When the board is full enough, the matching lights turn on with actual momentum."],
                  ].map(([title, copy]) => (
                    <div key={title} className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
                      <p className="text-sm font-semibold text-stone-100">{title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-400">{copy}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-3xl border border-haldi-500/15 bg-gradient-to-br from-haldi-500/10 to-transparent p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-haldi-300">What we are not doing</p>
                  <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-300">
                    <li>We are not opening an empty app and hoping traffic fixes the product.</li>
                    <li>We are not pushing members into poor-quality matches before there is meaningful density.</li>
                    <li>We are not pretending the launch is complete before the inventory is worth trusting.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-900 bg-stone-900/30 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.24em] text-haldi-300">Launch strategy</p>
              <h2 className="mt-4 font-serif text-4xl text-stone-100">
                Why we are opening with a founding cohort instead of a public free-for-all
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Users,
                  title: "Real density before real matching",
                  copy: "A marriage platform without enough serious people creates false hope, dead ends, and weak first impressions. We want the first wave to land into a room with substance.",
                },
                {
                  icon: Landmark,
                  title: "Cultural detail needs context",
                  copy: "Gothra, family involvement, and Vedic depth mean more when there are enough comparable profiles to make matching meaningful.",
                },
                {
                  icon: Stars,
                  title: "Experience first, scale second",
                  copy: "The first 500 members shape the quality of the platform. That lets us polish trust, profile quality, and signal strength before opening wider.",
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
              <p className="text-xs uppercase tracking-[0.24em] text-haldi-300">What happens when you register</p>
              <h2 className="mt-4 font-serif text-4xl text-stone-100">We build the right pool before we open matching.</h2>
            </div>

            <div className="grid gap-5">
              {[
                {
                  step: "01",
                  title: "You join the founding list",
                  copy: "You register with the essentials so we know who is serious, where they are, and what kind of early cohort we are building.",
                },
                {
                  step: "02",
                  title: "We shape the first trusted base",
                  copy: "We use the founding registrations to calibrate launch quality, profile mix, and the first meaningful matching density.",
                },
                {
                  step: "03",
                  title: "We turn matching on when the room is ready",
                  copy: "Once the early base is strong enough, founding members get first access, launch communication, and opening benefits.",
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
            <p className="text-xs uppercase tracking-[0.24em] text-haldi-300">Founding member call</p>
            <h2 className="mt-4 font-serif text-4xl text-stone-100 md:text-5xl">
              Register free now. Be inside when the platform opens.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-300">
              Join the first 500 members shaping the early Pravara experience. We will build the launch room,
              turn the lights on when it is ready, and invite founding members first.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-haldi-500 px-7 py-4 text-sm font-bold text-stone-950 transition-all hover:scale-[1.02] hover:bg-haldi-400"
              >
                Register Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-sm text-stone-400">
                {foundingCount} on the list | {seatsRemaining} seats remaining
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
