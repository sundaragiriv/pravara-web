"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Loader2 } from "lucide-react";

/**
 * The opt-out toggle itself.
 *
 * Stored in localStorage under a stable key so that any tracker added later has
 * one place to check before it loads. Deliberately a plain, boring switch: an
 * opt-out that is hard to find or hard to operate is the thing CPRA exists to
 * prevent, and dressing it up would be working against its purpose.
 *
 * Also honours Global Privacy Control. A browser sending GPC is making the same
 * request in machine-readable form, and treating it as equivalent is required in
 * California — so the switch reads as already on, and says why.
 */

export const DO_NOT_SELL_KEY = "pravara_do_not_sell";

/** For any future tracker: call this before loading anything. */
export function hasOptedOutOfSale(): boolean {
  if (typeof window === "undefined") return false;
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  if (gpc === true) return true;
  return window.localStorage.getItem(DO_NOT_SELL_KEY) === "1";
}

/**
 * The stored preference is browser state, not React state, so it is read
 * through useSyncExternalStore rather than copied into an effect. That keeps
 * the server snapshot ("not opted out") distinct from the client one, and it
 * means a change made in another tab is picked up here.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notify() {
  for (const listener of listeners) listener();
}

function getSnapshot(): string {
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  const stored = window.localStorage.getItem(DO_NOT_SELL_KEY) === "1";
  return `${gpc ? "1" : "0"}:${stored ? "1" : "0"}`;
}

/** Nothing is known before hydration, so the server renders the loading state. */
function getServerSnapshot(): string {
  return "pending";
}

export default function DoNotSellControl() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [justSaved, setJustSaved] = useState(false);

  const ready = snapshot !== "pending";
  const viaGpc = snapshot.startsWith("1:");
  const optedOut = viaGpc || snapshot.endsWith(":1");

  function toggle(next: boolean) {
    if (next) {
      window.localStorage.setItem(DO_NOT_SELL_KEY, "1");
    } else {
      window.localStorage.removeItem(DO_NOT_SELL_KEY);
    }
    notify();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2500);
  }

  if (!ready) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-stone-800 bg-stone-900/40 p-5 text-sm text-stone-500">
        <Loader2 size={14} className="animate-spin" /> Loading your setting…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
      <label className="flex cursor-pointer items-start gap-3.5">
        <span
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
            optedOut ? "border-haldi-500 bg-haldi-600" : "border-stone-600"
          } ${viaGpc ? "opacity-60" : ""}`}
        >
          {optedOut && <Check size={13} className="text-stone-950" />}
        </span>
        <input
          type="checkbox"
          checked={optedOut}
          disabled={viaGpc}
          onChange={(e) => toggle(e.target.checked)}
          className="sr-only"
        />
        <span>
          <span className="block text-sm font-semibold text-stone-100">
            Do not sell or share my personal information
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-stone-400">
            Applies to this browser. Includes cross-context behavioural advertising.
          </span>
        </span>
      </label>

      {viaGpc && (
        <p className="mt-4 border-t border-stone-800 pt-4 text-xs leading-relaxed text-haldi-300">
          Your browser is sending a Global Privacy Control signal, so this is already on and we are
          honouring it. You cannot switch it off here while that signal is being sent.
        </p>
      )}

      {justSaved && !viaGpc && (
        <p className="mt-4 border-t border-stone-800 pt-4 text-xs text-stone-400">
          Saved. {optedOut ? "Your preference is recorded." : "Opt-out removed."}
        </p>
      )}
    </div>
  );
}
