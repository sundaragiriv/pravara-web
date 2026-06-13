import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, TrendingDown, Users } from "lucide-react";

import { isAllowlistedAdminEmail } from "@/lib/env";
import { computeProfileStrength, LAUNCH_READY_THRESHOLD } from "@/lib/profile-strength";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

async function countEvent(admin: ReturnType<typeof createAdminClient>, event: string): Promise<number> {
  const { count } = await admin
    .from("launch_analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("event_name", event);
  return count ?? 0;
}

export default async function FunnelPage() {
  // Admin gate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!isAllowlistedAdminEmail(user.email) && me?.is_admin !== true) redirect("/dashboard");

  const admin = createAdminClient();

  // Funnel stages
  const [homeViews, registerViews, registerClicks] = await Promise.all([
    countEvent(admin, "launch_home_view"),
    countEvent(admin, "launch_register_view"),
    countEvent(admin, "launch_register_click"),
  ]);

  const { count: leads } = await admin
    .from("launch_registrations")
    .select("id", { count: "exact", head: true });

  // Accounts created from founders + launch-ready profiles
  const { data: profiles } = await admin.from("profiles").select("*");
  const accounts = (profiles ?? []).filter((p) => (p as Record<string, unknown>).founding_member).length;
  const launchReady = (profiles ?? []).filter(
    (p) => computeProfileStrength(p as Record<string, unknown>).score >= LAUNCH_READY_THRESHOLD,
  ).length;

  const stages = [
    { label: "Home visits", value: homeViews, note: "launch_home_view events" },
    { label: "Saw register form", value: registerViews, note: "reached /register" },
    { label: "Started registering", value: registerClicks, note: "clicked the CTA" },
    { label: "Registered (leads)", value: leads ?? 0, note: "rows in launch_registrations" },
    { label: "Created account", value: accounts, note: "founding_member profiles" },
    { label: "Launch-ready", value: launchReady, note: `profile strength ≥ ${LAUNCH_READY_THRESHOLD}%` },
  ];

  const top = stages[0].value || 1;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <header className="border-b border-stone-900 bg-stone-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-100">
            <ArrowLeft size={15} /> Admin
          </Link>
          <span className="font-serif text-lg tracking-wide text-haldi-400">Funnel Analytics</span>
          <Link href="/admin/cohort" className="text-sm text-stone-400 hover:text-haldi-400">
            Cohort →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        <p className="flex items-center gap-2 text-sm text-stone-400">
          <Users size={15} className="text-haldi-400" />
          Where founders enter and where they drop off. (Event counts are totals, not unique visitors — refine later.)
        </p>

        <section className="space-y-3">
          {stages.map((s, i) => {
            const pctOfTop = Math.round((s.value / top) * 100);
            const prev = i > 0 ? stages[i - 1].value : null;
            const dropPct =
              prev && prev > 0 ? Math.round(((prev - s.value) / prev) * 100) : null;
            return (
              <div key={s.label} className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-2xl text-stone-100">{s.value.toLocaleString()}</span>
                    <span className="ml-2 text-sm text-stone-300">{s.label}</span>
                  </div>
                  {dropPct !== null && dropPct > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                      <TrendingDown size={13} /> {dropPct}% drop from previous
                    </span>
                  )}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-haldi-500 to-amber-400"
                    style={{ width: `${Math.max(pctOfTop, 1)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-500">{s.note}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Stat label="Visit → Register" value={pct(leads ?? 0, homeViews)} />
          <Stat label="Register → Account" value={pct(accounts, leads ?? 0)} />
          <Stat label="Account → Launch-ready" value={pct(launchReady, accounts)} />
        </section>
      </main>
    </div>
  );
}

function pct(part: number, whole: number): string {
  if (!whole) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5 text-center">
      <p className="font-serif text-3xl text-haldi-300">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-stone-500">{label}</p>
    </div>
  );
}
