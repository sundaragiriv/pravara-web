import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Briefcase, Clock, Edit3, Lock, MapPin, Sparkles, UserCheck } from "lucide-react";

import FounderVouchCard from "@/components/launch/FounderVouchCard";
import { computeProfileStrength, LAUNCH_READY_THRESHOLD } from "@/lib/profile-strength";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type CuratedFounder = {
  id: string;
  full_name: string | null;
  age: number | null;
  location: string | null;
  profession: string | null;
  image_url: string | null;
  sub_community: string | null;
};

/**
 * Founding Dashboard — the curated-live experience for founders during pre-launch.
 * Shows profile strength, a compatible-founder preview, and a read-only wall so
 * the room feels alive — WITHOUT exposing open search/matching (gated until a
 * segment reaches enough density at launch).
 */
export default async function FoundingDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const strength = computeProfileStrength(profile);

  const myGender = (profile?.gender as string | null) ?? null;
  const oppositeGender = myGender === "Male" ? "Female" : myGender === "Female" ? "Male" : null;

  // Curated preview — compatible, non-locked founders (null is_active = active).
  let countQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .neq("id", user.id)
    .or("is_active.is.null,is_active.eq.true");
  if (oppositeGender) countQuery = countQuery.eq("gender", oppositeGender);
  const { count } = await countQuery;

  let sampleQuery = supabase
    .from("profiles")
    .select("id, full_name, age, location, profession, image_url, sub_community")
    .neq("id", user.id)
    .or("is_active.is.null,is_active.eq.true")
    .order("created_at", { ascending: false })
    .limit(6);
  if (oppositeGender) sampleQuery = sampleQuery.eq("gender", oppositeGender);
  const { data: sample } = await sampleQuery;

  const compatibleCount = count ?? 0;
  const founders = (sample as CuratedFounder[] | null) ?? [];
  const firstName = (profile?.full_name as string | null)?.split(" ")[0] || "Founder";

  // Trust loop — vouches this founder has received.
  const { data: endorsementsData } = await supabase
    .from("endorsements")
    .select("id, endorser_name, relation, comment")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  const endorsements = endorsementsData ?? [];
  const vouchPath = `/vouch/${user.id}?name=${encodeURIComponent(firstName)}`;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      {/* Header */}
      <header className="border-b border-stone-900/80 bg-stone-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo3.png"
              alt="Pravara"
              width={130}
              height={44}
              className="object-contain [mix-blend-mode:lighten]"
              priority
            />
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-haldi-500/30 bg-haldi-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-haldi-300">
            <UserCheck className="h-3.5 w-3.5" />
            Founding Member
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-haldi-300">The founding circle</p>
          <h1 className="mt-3 font-serif text-4xl text-stone-50 md:text-5xl">Welcome, {firstName}.</h1>
          <p className="mt-4 text-base leading-relaxed text-stone-300">
            Matching opens in waves once the circle is strong enough. The more complete your profile,
            the earlier you&apos;re matched — and founders get <span className="font-semibold text-haldi-200">3 months
            of premium, free</span>.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ── Profile strength ─────────────────────────────────────────── */}
          <section className="rounded-3xl border border-stone-800 bg-stone-900/50 p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-stone-100">Your profile strength</h2>
              {strength.isLaunchReady ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Launch-ready
                </span>
              ) : (
                <span className="text-sm font-bold text-haldi-300">{strength.score}%</span>
              )}
            </div>

            <div className="launch-progress-shine mt-4 h-2.5 w-full overflow-hidden rounded-full bg-stone-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-haldi-500 via-amber-400 to-haldi-500 transition-[width] duration-700"
                style={{ width: `${Math.max(strength.score, 3)}%` }}
              />
            </div>

            {strength.isLaunchReady ? (
              <p className="mt-4 text-sm leading-relaxed text-stone-300">
                Beautiful — your profile is launch-ready. You&apos;ll be among the first matched when
                your circle opens.
              </p>
            ) : (
              <>
                <p className="mt-4 text-sm leading-relaxed text-stone-400">
                  Reach {LAUNCH_READY_THRESHOLD}% to be launch-ready. Add next:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {strength.missing.slice(0, 5).map((m) => (
                    <span
                      key={m.key}
                      className="rounded-full border border-stone-700 bg-stone-950/60 px-3 py-1 text-xs text-stone-300"
                    >
                      {m.label}
                    </span>
                  ))}
                </div>
              </>
            )}

            <Link
              href="/onboarding"
              className="btn-sheen btn-festive launch-cta-glow mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-stone-950 transition-all hover:scale-[1.02] hover:brightness-105 active:scale-[0.98]"
            >
              <Edit3 className="h-4 w-4" />
              {strength.score === 0 ? "Build my profile" : "Complete my profile"}
            </Link>
          </section>

          {/* ── Match preview ────────────────────────────────────────────── */}
          <section className="rounded-3xl border border-haldi-500/15 bg-gradient-to-br from-haldi-500/10 to-transparent p-7">
            <h2 className="font-serif text-2xl text-stone-100">Your circle is forming</h2>
            {compatibleCount > 0 ? (
              <>
                <p className="mt-4 text-sm leading-relaxed text-stone-300">
                  <span className="font-serif text-4xl text-haldi-300">
                    {compatibleCount.toLocaleString()}
                  </span>
                  <br />
                  compatible {compatibleCount === 1 ? "founder is" : "founders are"} already in the circle —
                  ready to meet you the moment matching opens.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-stone-300">
                You&apos;re among the very first. As founders join your community, your matches will
                appear here — and a complete profile gets you seen first.
              </p>
            )}
            <p className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-stone-500">
              <Lock className="h-3.5 w-3.5" />
              Open search unlocks at launch
            </p>
          </section>
        </div>

        {/* ── Trust loop — vouches ────────────────────────────────────────── */}
        <div className="mt-6">
          <FounderVouchCard vouchPath={vouchPath} endorsements={endorsements} />
        </div>

        {/* ── Curated read-only wall ──────────────────────────────────────── */}
        {founders.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="gold-rule w-10" />
              <h2 className="font-serif text-xl text-stone-100">A glimpse of the circle</h2>
              <span className="gold-rule flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {founders.map((f) => {
                const name = f.full_name?.split(" ")[0] || "A founder";
                return (
                  <div
                    key={f.id}
                    className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/50"
                  >
                    <div className="relative aspect-[4/5] bg-stone-800">
                      {f.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={f.image_url}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl font-serif text-stone-600">
                          {name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-semibold text-stone-100">
                          {name}
                          {f.age ? `, ${f.age}` : ""}
                        </p>
                        {f.location && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400">
                            <MapPin className="h-3 w-3" />
                            {f.location}
                          </p>
                        )}
                        {f.profession && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400">
                            <Briefcase className="h-3 w-3" />
                            {f.profession}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-500">
              <Lock className="h-3 w-3" />
              Full profiles and connections unlock when matching opens.
            </p>
          </section>
        )}

        {/* ── What happens next ───────────────────────────────────────────── */}
        <section className="mt-12 rounded-3xl border border-stone-800 bg-stone-900/40 p-7">
          <h3 className="flex items-center gap-2 text-sm font-bold text-stone-300">
            <Clock className="h-4 w-4 text-haldi-500" />
            What happens next
          </h3>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-stone-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-haldi-500">1.</span>
              Complete your profile — it&apos;s how we match you well and how you&apos;re seen first.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-haldi-500">2.</span>
              We open matching community-by-community as each circle reaches real density.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-haldi-500">3.</span>
              Founders enter first — with 3 months of premium, free, and your matches ready on day one.
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
