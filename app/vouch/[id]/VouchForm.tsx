"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, HeartHandshake, Loader2 } from "lucide-react";

const fieldClass =
  "w-full rounded-xl border border-stone-800 bg-stone-950 px-4 py-3 text-stone-200 placeholder:text-stone-600 focus:border-haldi-500 focus:outline-none focus:ring-2 focus:ring-haldi-400/60";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-400";

export default function VouchForm({ profileId, name }: { profileId: string; name: string }) {
  const [endorser, setEndorser] = useState("");
  const [relation, setRelation] = useState("Friend");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const who = name?.trim() ? name.trim() : "this founder";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!endorser.trim() || !comment.trim()) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.from("endorsements").insert({
      profile_id: profileId,
      endorser_name: endorser.trim(),
      relation,
      comment: comment.trim(),
    });
    setLoading(false);
    if (error) {
      setError("Could not submit your vouch right now. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/25 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_45%),rgba(6,95,70,0.14)] p-8 text-center shadow-2xl shadow-black/40">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="mt-6 font-serif text-3xl text-stone-50">Thank you.</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          Your words now stand beside {who} in the founding circle. Vouches like yours are how Pravara
          stays a place of trust.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center justify-center rounded-full border border-haldi-500/40 bg-haldi-500/10 px-6 py-2.5 text-sm font-semibold text-haldi-200 transition-colors hover:bg-haldi-500/20"
        >
          Discover Pravara
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-haldi-500/15 bg-[linear-gradient(180deg,rgba(18,15,13,0.9),rgba(10,8,7,0.95))] p-8 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-haldi-900/30 text-haldi-400">
          <HeartHandshake className="h-6 w-6" />
        </div>
        {/* Toran flourish */}
        <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="gold-rule w-12" />
          <span className="h-2 w-2 rotate-45 rounded-[2px] bg-gradient-to-br from-amber-200 to-haldi-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          <span className="gold-rule w-12" />
        </div>
        <h1 className="mt-4 font-serif text-3xl text-stone-50">Vouch for {who}</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          A few honest words from someone who knows them helps the right family take them seriously.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {error && (
          <div role="alert" className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="vouch-name" className={labelClass}>Your name</label>
          <input
            id="vouch-name"
            type="text"
            value={endorser}
            onChange={(e) => setEndorser(e.target.value)}
            required
            placeholder="e.g. Anjali Rao"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="vouch-relation" className={labelClass}>How you know them</label>
          <select
            id="vouch-relation"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className={fieldClass}
          >
            <option>Friend</option>
            <option>Sibling</option>
            <option>Parent</option>
            <option>Relative</option>
            <option>Colleague</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="vouch-comment" className={labelClass}>Your endorsement</label>
          <textarea
            id="vouch-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="What makes them someone worth knowing?"
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-sheen btn-festive launch-cta-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-stone-950 transition-all hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit my vouch"}
        </button>
      </form>
    </div>
  );
}
