"use client";

import { useState } from "react";
import { ShieldCheck, Check, Minus } from "lucide-react";

import { earnedCount, type VaraahiSignal } from "@/lib/varaahi";

/**
 * The four Varaahi signals, as badges.
 *
 * Each is a plain statement of fact with the reason available on tap. Nothing
 * here is a score, a percentage or a rank — a family reading someone else's
 * profile should learn what is true about it, not how it places against
 * everybody else's.
 *
 * Unearned signals are shown greyed rather than hidden. On your own profile
 * that is the to-do list; on someone else's it is the honest absence, and
 * hiding it would let a thin profile look the same as a thorough one.
 */
export default function VaraahiShield({
  signals,
  variant = "full",
}: {
  signals: VaraahiSignal[];
  /** "compact" for a match card, "full" for a profile. */
  variant?: "compact" | "full";
}) {
  const [open, setOpen] = useState<string | null>(null);
  const earned = earnedCount(signals);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5" title={`Varaahi Shield: ${earned} of 4`}>
        <ShieldCheck size={12} className={earned >= 3 ? "text-haldi-400" : "text-stone-600"} />
        <span className="text-[10px] uppercase tracking-wider text-stone-500">
          {earned}/4
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <ShieldCheck size={17} className="text-haldi-500" />
        <div>
          <h3 className="font-serif text-base text-stone-100">Varaahi Shield</h3>
          <p className="text-[10px] uppercase tracking-widest text-stone-500">
            {earned} of 4 signals
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {signals.map((signal) => (
          <div key={signal.key}>
            <button
              type="button"
              onClick={() => setOpen(open === signal.key ? null : signal.key)}
              aria-expanded={open === signal.key}
              className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors ${
                signal.earned
                  ? "border-haldi-500/25 bg-haldi-900/15 hover:border-haldi-500/40"
                  : "border-stone-800 hover:border-stone-700"
              }`}
            >
              <span
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                  signal.earned ? "bg-haldi-600 text-stone-950" : "bg-stone-800 text-stone-600"
                }`}
              >
                {signal.earned ? <Check size={10} /> : <Minus size={10} />}
              </span>
              <span
                className={`text-xs ${signal.earned ? "text-stone-200" : "text-stone-500"}`}
              >
                {signal.label}
              </span>
            </button>

            {open === signal.key && (
              <p className="px-3 pb-2 pt-1.5 text-[11px] leading-relaxed text-stone-400">
                {signal.detail}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-stone-800 pt-3 text-[10px] leading-relaxed text-stone-600">
        Each signal is earned separately. There is no overall rating — these are facts about the
        profile, not a ranking of the person.
      </p>
    </div>
  );
}
