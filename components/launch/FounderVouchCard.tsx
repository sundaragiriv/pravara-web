"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Quote, ShieldCheck } from "lucide-react";

export type Endorsement = {
  id: string;
  endorser_name: string;
  relation: string;
  comment: string;
};

/**
 * Founder-facing trust loop: share a personal vouch link with family/friends
 * (copy or WhatsApp), and see the endorsements that come back. Each shared link
 * is also a referral touchpoint — the people who vouch are the next founders.
 */
export default function FounderVouchCard({
  vouchPath,
  endorsements,
}: {
  vouchPath: string;
  endorsements: Endorsement[];
}) {
  const [copied, setCopied] = useState(false);

  const fullUrl = () =>
    typeof window !== "undefined" ? `${window.location.origin}${vouchPath}` : vouchPath;
  const message =
    "I've joined Pravara's founding circle — a Vedic matrimony, by invitation. Would you vouch for me? It takes a minute:";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(`${message} ${fullUrl()}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="rounded-3xl border border-stone-800 bg-stone-900/50 p-7">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-2xl text-stone-100">
          <ShieldCheck className="h-5 w-5 text-haldi-400" />
          Trust &amp; vouches
        </h2>
        {endorsements.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
            {endorsements.length} {endorsements.length === 1 ? "vouch" : "vouches"}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-stone-400">
        Founders vouched-for by family and friends are trusted more — and seen first. Invite two or
        three people who&apos;d gladly speak for you.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={shareWhatsApp}
          className="btn-sheen btn-festive launch-cta-glow inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-stone-950 transition-all hover:scale-[1.01] hover:brightness-105 active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4" />
          Ask on WhatsApp
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-haldi-500/40 bg-haldi-500/10 px-5 py-3 text-sm font-semibold text-haldi-200 transition-colors hover:bg-haldi-500/20"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Link copied" : "Copy vouch link"}
        </button>
      </div>

      {endorsements.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {endorsements.map((e) => (
            <li key={e.id} className="rounded-2xl border border-stone-800 bg-stone-950/50 p-4">
              <div className="flex items-start gap-3">
                <Quote className="mt-0.5 h-4 w-4 flex-shrink-0 text-haldi-500/70" />
                <div>
                  <p className="text-sm leading-relaxed text-stone-200">{e.comment}</p>
                  <p className="mt-1.5 text-xs text-stone-500">
                    <span className="font-semibold text-stone-400">{e.endorser_name}</span> · {e.relation}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed border-stone-800 bg-stone-950/40 p-4 text-center text-sm text-stone-500">
          No vouches yet — your first one makes your profile noticeably more trusted.
        </p>
      )}
    </section>
  );
}
