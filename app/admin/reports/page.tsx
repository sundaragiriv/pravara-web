"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldAlert, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";
import { REPORT_REASON_SHORT, type ReportReason } from "@/lib/safety-labels";

/**
 * The abuse queue.
 *
 * Reports were being collected with nowhere to go, which is the same shape of
 * problem as the ID uploads: a member takes a serious action, and it lands in a
 * table nobody opens. A queue that shows counts against the reported member is
 * the point — one report is a disagreement, four from different people is a
 * pattern, and only the queue can tell them apart.
 *
 * Read and write are both governed by the admin policies in
 * `create_safety_tables.sql`; this page cannot see anything a non-admin session
 * would be allowed to see.
 */

type Report = {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: ReportReason;
  detail: string | null;
  status: "open" | "reviewing" | "actioned" | "dismissed";
  admin_notes: string | null;
  created_at: string;
};

type Named = { id: string; full_name: string | null; email: string | null };

const STATUSES = ["open", "reviewing", "actioned", "dismissed"] as const;

const STATUS_STYLE: Record<string, string> = {
  open: "bg-red-900/30 border-red-600/40 text-red-300",
  reviewing: "bg-amber-900/25 border-amber-600/40 text-amber-300",
  actioned: "bg-emerald-900/25 border-emerald-600/40 text-emerald-300",
  dismissed: "bg-stone-800 border-stone-700 text-stone-400",
};

export default function AdminReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [names, setNames] = useState<Record<string, Named>>({});
  const [filter, setFilter] = useState<string>("open");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Bumped after a status change to re-run the fetch. The effect owns all the
  // loading, which is what keeps setState out of the effect body itself.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchReports = async () => {
      let query = supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (filter !== "all") query = query.eq("status", filter);

      const { data, error } = await query;
      if (cancelled) return;

      if (error) {
        // Almost always means the migration has not been run in this environment.
        toast.error("Could not load reports. Has create_safety_tables.sql been run?");
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as Report[];
      setReports(rows);

      const ids = [...new Set(rows.flatMap((r) => [r.reporter_id, r.reported_id]))];
      if (ids.length) {
        const { data: people } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", ids);
        if (cancelled) return;
        setNames(Object.fromEntries((people ?? []).map((p: Named) => [p.id, p])));
      }

      setLoading(false);
    };

    void fetchReports();
    return () => {
      cancelled = true;
    };
  }, [supabase, filter, refreshKey]);

  async function setStatus(id: string, status: Report["status"]) {
    setSavingId(id);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("reports")
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id ?? null })
      .eq("id", id);

    setSavingId(null);

    if (error) {
      toast.error("Could not update that report.");
      return;
    }

    toast.success(`Marked ${status}.`);
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

  /** How many times this member has been reported, across all statuses. */
  const timesReported = (userId: string) =>
    reports.filter((r) => r.reported_id === userId).length;

  const nameOf = (id: string) => names[id]?.full_name || names[id]?.email || "Unknown";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 mb-6"
        >
          <ArrowLeft size={13} /> Admin
        </Link>

        <div className="flex items-center gap-2.5 mb-1">
          <ShieldAlert className="text-haldi-500" size={20} />
          <h1 className="font-serif text-2xl text-stone-100">Reports</h1>
        </div>
        <p className="text-xs text-stone-500 mb-6">
          Members who reported someone are never told what was decided.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {["open", ...STATUSES.filter((s) => s !== "open"), "all"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setLoading(true); setFilter(s); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-bold border transition-colors ${
                filter === s
                  ? "border-haldi-500/60 bg-haldi-900/20 text-haldi-400"
                  : "border-stone-800 text-stone-500 hover:border-stone-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-stone-500 text-sm py-10">
            <Loader2 size={15} className="animate-spin" /> Loading…
          </div>
        ) : reports.length === 0 ? (
          <p className="text-sm text-stone-500 py-10">Nothing here.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => {
              const count = timesReported(r.reported_id);
              return (
                <div
                  key={r.id}
                  className="border border-stone-800 rounded-xl bg-stone-900/40 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-stone-200 font-medium">
                          {nameOf(r.reported_id)}
                        </span>
                        <Link
                          href={`/profile/${r.reported_id}`}
                          className="text-stone-600 hover:text-haldi-500"
                          aria-label="Open profile"
                        >
                          <ExternalLink size={12} />
                        </Link>
                        {count > 1 && (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-red-900/40 border border-red-600/50 text-red-300">
                            {count} reports
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${STATUS_STYLE[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        {REPORT_REASON_SHORT[r.reason]} · reported by {nameOf(r.reporter_id)} ·{" "}
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.filter((s) => s !== r.status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={savingId === r.id}
                          onClick={() => setStatus(r.id, s)}
                          className="px-2.5 py-1 rounded-lg border border-stone-700 hover:border-stone-600 text-[10px] uppercase tracking-wider text-stone-400 hover:text-stone-200 transition-colors disabled:opacity-40"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {r.detail && (
                    <p className="text-xs leading-relaxed text-stone-400 bg-stone-950/60 border border-stone-800 rounded-lg p-3">
                      {r.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
