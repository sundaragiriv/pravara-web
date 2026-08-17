"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck, ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";

/**
 * The identity review queue.
 *
 * The upload existed for a long time with nothing on the other end: it wrote
 * `govt_id_url`, set `varaahi_status` to `pending_verification`, and stopped.
 * Nothing read that status, and the admin console's `is_verified` toggle was a
 * separate switch the upload never touched. Members handed over government
 * identity documents, saw "Verification In Progress", and waited on a process
 * that did not exist.
 *
 * Two things matter about how this works. Approving writes through to
 * `is_verified`, so the two halves are finally one thing. And the document is
 * deleted on decision — we keep the verdict and the date, not the passport
 * scan. Holding identity documents a day longer than the decision takes is a
 * liability with no upside, and the privacy policy already commits us to
 * minimisation.
 */

type Pending = {
  id: string;
  full_name: string | null;
  email: string | null;
  govt_id_url: string | null;
  varaahi_status: string | null;
  is_verified: boolean | null;
  created_at: string | null;
};

export default function AdminVerificationPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, govt_id_url, varaahi_status, is_verified, created_at")
        .eq("varaahi_status", "pending_verification")
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        toast.error("Could not load the queue.");
        setLoading(false);
        return;
      }

      setRows((data ?? []) as Pending[]);
      setLoading(false);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase, refreshKey]);

  /**
   * Documents live in a private bucket, so viewing one needs a signed URL.
   * Deliberately short-lived and fetched on demand rather than rendered into
   * the page for every row — an admin screen that quietly lists everybody's
   * identity documents is its own kind of leak.
   */
  async function reveal(row: Pending) {
    if (!row.govt_id_url) return;
    const { data, error } = await supabase.storage
      .from("varaahi_docs")
      .createSignedUrl(row.govt_id_url, 120);

    if (error || !data) {
      toast.error("Could not open that document.");
      return;
    }
    setPreviews((prev) => ({ ...prev, [row.id]: data.signedUrl }));
  }

  async function decide(row: Pending, approved: boolean) {
    setBusyId(row.id);

    // Remove the document first. If this fails we stop, rather than record a
    // decision and leave the scan behind — the wrong order would quietly build
    // up exactly the pile this queue exists to prevent.
    if (row.govt_id_url) {
      const { error: rmError } = await supabase.storage.from("varaahi_docs").remove([row.govt_id_url]);
      if (rmError) {
        setBusyId(null);
        toast.error("Could not remove the document — not recording a decision.", {
          description: rmError.message,
        });
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        is_verified: approved,
        varaahi_status: approved ? "verified" : "rejected",
        govt_id_url: null,
      })
      .eq("id", row.id);

    setBusyId(null);

    if (error) {
      toast.error("Could not save that decision.");
      return;
    }

    toast.success(approved ? "Verified." : "Rejected.");
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-stone-950 pb-20 font-sans text-stone-200">
      <div className="mx-auto max-w-4xl px-6 pt-10">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300"
        >
          <ArrowLeft size={13} /> Admin
        </Link>

        <div className="mb-1 flex items-center gap-2.5">
          <ShieldCheck className="text-haldi-500" size={20} />
          <h1 className="font-serif text-2xl text-stone-100">Identity verification</h1>
        </div>
        <p className="mb-8 text-xs leading-relaxed text-stone-500">
          Documents are deleted the moment a decision is recorded. We keep the verdict, not the scan.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-stone-500">
            <Loader2 size={15} className="animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <p className="py-10 text-sm text-stone-500">Nothing waiting.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-200">
                        {row.full_name || row.email || "Unnamed"}
                      </span>
                      <Link
                        href={`/profile/${row.id}`}
                        className="text-stone-600 hover:text-haldi-500"
                        aria-label="Open profile"
                      >
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-500">{row.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {!previews[row.id] && row.govt_id_url && (
                      <button
                        type="button"
                        onClick={() => reveal(row)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 px-2.5 py-1 text-[10px] uppercase tracking-wider text-stone-400 transition-colors hover:border-stone-600 hover:text-stone-200"
                      >
                        <Eye size={11} /> View document
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => decide(row, true)}
                      className="rounded-lg bg-haldi-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-950 transition-colors hover:bg-haldi-500 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => decide(row, false)}
                      className="rounded-lg border border-stone-700 px-3 py-1 text-[10px] uppercase tracking-wider text-stone-400 transition-colors hover:border-red-600/50 hover:text-red-300 disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {previews[row.id] && (
                  <a
                    href={previews[row.id]}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block text-xs text-haldi-400 underline underline-offset-2"
                  >
                    Open document (link expires in two minutes)
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
