import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, TriangleAlert, Users } from "lucide-react";

import { isAllowlistedAdminEmail } from "@/lib/env";
import { computeProfileStrength, LAUNCH_READY_THRESHOLD } from "@/lib/profile-strength";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// A community segment needs at least this many of EACH gender before open
// matching is worth turning on — otherwise members land in an empty/lopsided
// room. Tune to taste.
const SEGMENT_MIN_PER_GENDER = 10;

type ProfileRow = Record<string, unknown> & {
  gender: string | null;
  sub_community: string | null;
  location: string | null;
};

type LeadRow = { gender: string | null; location: string | null };

function tally<T>(rows: T[], pick: (r: T) => string | null | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const key = (pick(r) || "").trim();
    if (!key) continue;
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return m;
}

export default async function CohortPage() {
  // ── Admin gate (server-side) ──────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!isAllowlistedAdminEmail(user.email) && me?.is_admin !== true) redirect("/dashboard");

  // ── Data (service role → full cohort, bypasses RLS) ───────────────────────
  const admin = createAdminClient();
  const [{ count: leadCount }, { data: leadsData }, { data: profilesData }] = await Promise.all([
    admin.from("launch_registrations").select("id", { count: "exact", head: true }),
    admin.from("launch_registrations").select("gender, location"),
    admin.from("profiles").select("*"),
  ]);

  const leads = (leadsData as LeadRow[] | null) ?? [];
  const profiles = (profilesData as ProfileRow[] | null) ?? [];

  // Funnel
  const leadsTotal = leadCount ?? leads.length;
  const activated = profiles.length;
  const strengths = profiles.map((p) => computeProfileStrength(p).score);
  const launchReady = strengths.filter((s) => s >= LAUNCH_READY_THRESHOLD).length;
  const conversion = leadsTotal > 0 ? Math.round((activated / leadsTotal) * 100) : 0;

  // Gender balance (activated profiles)
  const males = profiles.filter((p) => p.gender === "Male").length;
  const females = profiles.filter((p) => p.gender === "Female").length;
  const others = profiles.filter((p) => p.gender && p.gender !== "Male" && p.gender !== "Female").length;
  const genderKnown = males + females;
  const malePct = genderKnown ? Math.round((males / genderKnown) * 100) : 50;

  // By community — the unit that actually has to reach density to open
  const communities = new Map<string, { m: number; f: number }>();
  for (const p of profiles) {
    const c = (p.sub_community || "").trim();
    if (!c) continue;
    const entry = communities.get(c) ?? { m: 0, f: 0 };
    if (p.gender === "Male") entry.m += 1;
    else if (p.gender === "Female") entry.f += 1;
    communities.set(c, entry);
  }
  const communityRows = [...communities.entries()]
    .map(([name, v]) => ({
      name,
      ...v,
      total: v.m + v.f,
      ready: v.m >= SEGMENT_MIN_PER_GENDER && v.f >= SEGMENT_MIN_PER_GENDER,
    }))
    .sort((a, b) => b.total - a.total);

  // Strength distribution
  const buckets = [
    { label: "Just started (0–25%)", n: strengths.filter((s) => s < 25).length },
    { label: "Building (25–50%)", n: strengths.filter((s) => s >= 25 && s < 50).length },
    { label: "Nearly there (50–75%)", n: strengths.filter((s) => s >= 50 && s < LAUNCH_READY_THRESHOLD).length },
    { label: "Launch-ready (75%+)", n: launchReady },
  ];

  const topLocations = [...tally(profiles, (p) => p.location).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const leadLocations = [...tally(leads, (l) => l.location).entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const readySegments = communityRows.filter((c) => c.ready).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <header className="border-b border-stone-900 bg-stone-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-100">
            <ArrowLeft size={15} /> Admin
          </Link>
          <span className="font-serif text-lg tracking-wide text-haldi-400">Cohort Density & Balance</span>
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Funnel */}
        <section className="grid gap-4 sm:grid-cols-4">
          <Stat label="Leads (registered)" value={leadsTotal} />
          <Stat label="Activated profiles" value={activated} sub={`${conversion}% of leads`} />
          <Stat label="Launch-ready" value={launchReady} sub={`${activated ? Math.round((launchReady / activated) * 100) : 0}% of profiles`} />
          <Stat label="Ready segments" value={readySegments} sub={`≥${SEGMENT_MIN_PER_GENDER} of each gender`} />
        </section>

        {/* Gender balance */}
        <section className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-300">
            <Users size={15} className="text-haldi-400" /> Gender balance
          </h2>
          <p className="mb-4 text-xs text-stone-500">
            Matching needs balance — a lopsided cohort can&apos;t match well. Aim near 50/50 per segment.
          </p>
          <div className="flex h-7 w-full overflow-hidden rounded-full bg-stone-800 text-xs font-bold">
            <div className="flex items-center justify-center bg-sky-600/70" style={{ width: `${malePct}%` }}>
              {males} M
            </div>
            <div className="flex items-center justify-center bg-rose-600/70" style={{ width: `${100 - malePct}%` }}>
              {females} F
            </div>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            {malePct}% male / {100 - malePct}% female{others ? ` · ${others} other` : ""}
            {genderKnown > 0 && (malePct >= 65 || malePct <= 35) ? (
              <span className="ml-2 text-amber-400">⚠ skewed — rebalance outreach</span>
            ) : genderKnown > 0 ? (
              <span className="ml-2 text-emerald-400">✓ healthy</span>
            ) : null}
          </p>
        </section>

        {/* By community */}
        <section className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-300">
            Density by community
          </h2>
          {communityRows.length === 0 ? (
            <p className="text-sm text-stone-500">No community data yet — founders add it during onboarding.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-800 text-left text-xs uppercase tracking-wider text-stone-500">
                    <th className="py-2 pr-4">Community</th>
                    <th className="py-2 pr-4 text-right">Grooms</th>
                    <th className="py-2 pr-4 text-right">Brides</th>
                    <th className="py-2 pr-4 text-right">Total</th>
                    <th className="py-2 text-right">Open matching?</th>
                  </tr>
                </thead>
                <tbody>
                  {communityRows.map((c) => (
                    <tr key={c.name} className="border-b border-stone-900">
                      <td className="py-2.5 pr-4 text-stone-200">{c.name}</td>
                      <td className="py-2.5 pr-4 text-right text-stone-300">{c.m}</td>
                      <td className="py-2.5 pr-4 text-right text-stone-300">{c.f}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-stone-100">{c.total}</td>
                      <td className="py-2.5 text-right">
                        {c.ready ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 size={14} /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-stone-500">
                            <TriangleAlert size={14} /> Building
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Strength distribution + locations */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-stone-300">
              Profile strength
            </h2>
            <div className="space-y-3">
              {buckets.map((b) => {
                const pct = activated ? Math.round((b.n / activated) * 100) : 0;
                return (
                  <div key={b.label}>
                    <div className="mb-1 flex justify-between text-xs text-stone-400">
                      <span>{b.label}</span>
                      <span>{b.n}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-800">
                      <div className="h-full rounded-full bg-haldi-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-stone-300">
              <MapPin size={15} className="text-haldi-400" /> Top locations
            </h2>
            {topLocations.length === 0 && leadLocations.length === 0 ? (
              <p className="text-sm text-stone-500">No location data yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(topLocations.length ? topLocations : leadLocations).map(([loc, n]) => (
                  <li key={loc} className="flex justify-between text-stone-300">
                    <span>{loc}</span>
                    <span className="text-stone-500">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-stone-600">
          Open matching is gated per community until it clears {SEGMENT_MIN_PER_GENDER} of each gender —
          adjust SEGMENT_MIN_PER_GENDER in app/admin/cohort/page.tsx.
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
      <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-2 font-serif text-3xl text-stone-100">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
    </div>
  );
}
