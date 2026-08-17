"use client";

import { useState } from "react";
import { Flag, ShieldOff, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { REPORT_REASONS, REPORT_REASON_LABELS } from "@/lib/safety-labels";

/**
 * Block and report, on a member's profile.
 *
 * Kept quiet by design — a small text control rather than a button competing
 * with "Express Interest". Someone looking for it will find it; nobody browsing
 * happily is prompted to think about abuse.
 *
 * Reporting blocks by default. A member who has just described harassment
 * should not have to take a second action to stop hearing from the person, and
 * should not keep seeing them in matches while the report sits in a queue. The
 * tick is there for the case where someone is flagging a fake profile they have
 * no personal problem with.
 */
export default function SafetyMenu({
  profileId,
  profileName,
  onBlocked,
}: {
  profileId: string;
  profileName?: string;
  onBlocked?: () => void;
}) {
  const [open, setOpen] = useState<null | "block" | "report">(null);
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);

  const who = profileName || "this member";

  function close() {
    setOpen(null);
    setReason("");
    setDetail("");
    setAlsoBlock(true);
  }

  async function submitBlock() {
    setBusy(true);
    try {
      const res = await fetch("/api/safety/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profileId }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${who} can no longer see you or contact you.`);
      close();
      onBlocked?.();
    } catch {
      toast.error("Could not block right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReport() {
    if (!reason) {
      toast.error("Please choose a reason.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profileId, reason, detail, alsoBlock }),
      });
      if (!res.ok) throw new Error();
      toast.success("Thank you. Our team will review this.");
      close();
      if (alsoBlock) onBlocked?.();
    } catch {
      toast.error("Could not submit that report. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 pt-1">
        <button
          type="button"
          onClick={() => setOpen("block")}
          className="flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-stone-300 transition-colors"
        >
          <ShieldOff size={11} /> Block
        </button>
        <button
          type="button"
          onClick={() => setOpen("report")}
          className="flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-stone-300 transition-colors"
        >
          <Flag size={11} /> Report
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif text-lg text-stone-100">
                {open === "block" ? `Block ${who}?` : `Report ${who}`}
              </h3>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-stone-500 hover:text-stone-300"
              >
                <X size={16} />
              </button>
            </div>

            {open === "block" ? (
              <>
                <p className="text-xs leading-relaxed text-stone-400">
                  They will no longer appear in your matches, and neither of you will be able to
                  message the other. They are not told that you blocked them.
                </p>
                <p className="text-xs leading-relaxed text-stone-500">
                  You can undo this at any time from Settings.
                </p>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        reason === r
                          ? "border-haldi-500/60 bg-haldi-900/20"
                          : "border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="sr-only"
                      />
                      <span
                        className={`w-3 h-3 rounded-full border flex-shrink-0 flex items-center justify-center ${
                          reason === r ? "border-haldi-500" : "border-stone-600"
                        }`}
                      >
                        {reason === r && <span className="w-1.5 h-1.5 rounded-full bg-haldi-500" />}
                      </span>
                      <span className="text-xs text-stone-300">{REPORT_REASON_LABELS[r]}</span>
                    </label>
                  ))}
                </div>

                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Anything else we should know? (optional)"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-xs text-stone-200 focus:border-haldi-500 outline-none placeholder:text-stone-700 resize-none"
                />

                <label className="flex items-center gap-2 cursor-pointer">
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      alsoBlock ? "bg-haldi-600 border-haldi-600" : "border-stone-600"
                    }`}
                  >
                    {alsoBlock && <Check size={11} className="text-stone-950" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={alsoBlock}
                    onChange={(e) => setAlsoBlock(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-xs text-stone-400">Also block them</span>
                </label>
              </>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={busy}
                onClick={open === "block" ? submitBlock : submitReport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-haldi-600 hover:bg-haldi-500 text-stone-950 text-xs font-bold transition-colors disabled:opacity-50"
              >
                {busy && <Loader2 size={13} className="animate-spin" />}
                {open === "block" ? "Block" : "Send report"}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="px-4 py-2.5 rounded-lg border border-stone-700 hover:border-stone-600 text-stone-300 text-xs transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
