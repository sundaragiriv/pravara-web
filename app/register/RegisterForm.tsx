"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Copy, Check, Crown, Mail, Sparkles } from "lucide-react";

import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import PetalBurst from "@/components/launch/PetalBurst";
import type { FounderProgress } from "@/lib/launch";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  PRIORITY_COUNTRIES,
  getCountry,
  isPlausibleNationalNumber,
  toE164,
} from "@/lib/countries";
import { COHORT_TARGET, FOUNDER_PREMIUM_MONTHS } from "@/lib/offer";

type RegisterFormState = {
  full_name: string;
  age: string;
  gender: "" | "Male" | "Female" | "Other";
  email: string;
  /** National number only — the dial code comes from `country`. */
  phone: string;
  /** ISO 3166-1 alpha-2. Drives the dial code and is stored on the registration. */
  country: string;
};

const INITIAL_STATE: RegisterFormState = {
  full_name: "",
  age: "",
  gender: "",
  email: "",
  phone: "",
  country: DEFAULT_COUNTRY,
};

type RegisterFormProps = {
  founderProgress: FounderProgress;
  /** Left-column pitch. Dropped on success — by then it's arguing for something already done. */
  aside: React.ReactNode;
};

/** Shown on the confirmation screen so "what now?" is answered without asking. */
const WHAT_HAPPENS_NEXT = [
  {
    icon: Mail,
    title: "A confirmation email",
    copy: "Arriving within a minute. Check spam if it doesn't.",
  },
  {
    icon: Sparkles,
    title: "Early access when matching opens",
    copy: "Founders are let in before anyone else, in about three months.",
  },
  {
    icon: Crown,
    title: `Priority for the first ${COHORT_TARGET.toLocaleString()}`,
    copy: `Founding seats keep their benefits — including ${FOUNDER_PREMIUM_MONTHS} months of premium, free.`,
  },
];

const fieldClass =
  "w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:border-haldi-500 focus:outline-none focus:ring-2 focus:ring-haldi-400/70";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-300";

export default function RegisterForm({ founderProgress, aside }: RegisterFormProps) {
  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "new" | "already">(null);
  const [copied, setCopied] = useState(false);
  // Remember what they submitted so we can carry it into account creation.
  const [lead, setLead] = useState<{ name: string; email: string } | null>(null);

  const dialCode = getCountry(form.country)?.dial ?? "1";
  // Only complain once they have typed enough to mean it.
  const phoneInvalid = form.phone.trim().length > 3 && !isPlausibleNationalNumber(form.phone);
  const phonePlaceholder =
    form.country === "IN" ? "98765 43210" : form.country === "GB" ? "7700 900123" : "555 123 4567";

  function updateField<K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function copyInvite() {
    try {
      const url = `${window.location.origin}/register`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/launch-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          // The API and database store E.164; the split field is a UI concern.
          phone: toE164(dialCode, form.phone),
          country: form.country,
          source: "launch-register-page",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; alreadyRegistered?: boolean }
        | null;

      if (response.status === 409 && payload?.alreadyRegistered) {
        setLead({ name: form.full_name, email: form.email });
        setDone("already");
        return;
      }
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to complete registration right now.");
      }

      setLead({ name: form.full_name, email: form.email });
      trackMetaEvent("Lead");
      setDone("new");
      setForm(INITIAL_STATE);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to complete registration right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Confirmation (new join OR already-registered) ─────────────────────────
  if (done) {
    const already = done === "already";
    const buildHref = lead
      ? `/signup?email=${encodeURIComponent(lead.email)}&name=${encodeURIComponent(lead.name)}`
      : "/signup";
    return (
      <div className="relative mx-auto max-w-2xl rounded-3xl border border-emerald-500/25 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_40%),rgba(6,95,70,0.16)] p-8 shadow-2xl shadow-black/30">
        {!already && <PetalBurst />}
        <div className="flex items-center gap-3 text-emerald-200">
          <CheckCircle2 className="h-6 w-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            {already ? "You're already in the Founder Circle" : "You're in the Founder Circle"}
          </p>
        </div>
        <h2 className="mt-6 font-serif text-3xl text-stone-50 md:text-4xl">
          {already ? "Your seat is already reserved." : "Your founding seat is reserved."}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-stone-300">
          Now make it count — build your founding profile so you&apos;re matched with the right people the
          moment we open. Founders with a complete profile get{" "}
          <span className="font-semibold text-haldi-200">first access</span> and{" "}
          <span className="font-semibold text-haldi-200">{FOUNDER_PREMIUM_MONTHS} months of premium, free</span>.
        </p>

        {/* Primary next step — convert the lead into a real, matchable profile */}
        <div className="mt-7">
          <Link
            href={buildHref}
            className="btn-sheen btn-festive launch-cta-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-stone-950 transition-all hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-haldi-300 focus:ring-offset-2 focus:ring-offset-stone-950"
          >
            Build my founding profile
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-center text-xs text-stone-500">
            About 3 minutes — guided by Narada, our AI.
          </p>
        </div>

        {/* What happens next — answers the question before it's asked */}
        <div className="mt-8 border-t border-stone-800/80 pt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
            What happens next
          </p>
          <ul className="mt-5 space-y-4">
            {WHAT_HAPPENS_NEXT.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="flex gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-haldi-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-stone-200">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-400">{copy}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Referral — the fastest way to fill the circle */}
        <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-950/60 p-5">
          <p className="text-sm font-semibold text-stone-200">Bring someone worthy of the first circle</p>
          <p className="mt-1 text-sm text-stone-400">
            Founders are chosen, not crowded. Share your invite link with someone you&apos;d vouch for.
          </p>
          <button
            type="button"
            onClick={copyInvite}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-haldi-500/40 bg-haldi-500/10 px-5 py-2.5 text-sm font-semibold text-haldi-200 transition-colors hover:bg-haldi-500/20 focus:outline-none focus:ring-2 focus:ring-haldi-400/70"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Invite link copied" : "Copy invite link"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-stone-500 transition-colors hover:text-stone-300">
            Maybe later — return home
          </Link>
        </div>
      </div>
    );
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
      {aside}

      <div className="relative mx-auto w-full max-w-2xl rounded-3xl border border-haldi-500/15 bg-[linear-gradient(180deg,rgba(18,15,13,0.88),rgba(10,8,7,0.94))] p-8 shadow-2xl shadow-black/40 backdrop-blur-md lg:mx-0">
        {/* Toran corners — the invitation-card convention of marking the four
            corners in gold. Pure borders, so they cost nothing to paint. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-3 h-6 w-6 rounded-tl-2xl border-l border-t border-haldi-500/30"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 h-6 w-6 rounded-tr-2xl border-r border-t border-haldi-500/30"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 rounded-bl-2xl border-b border-l border-haldi-500/30"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 rounded-br-2xl border-b border-r border-haldi-500/30"
        />
      {/* Progress toward the first circle of 1,000 — only once the number
          reads as momentum rather than emptiness (see FOUNDER_COUNT_DISPLAY_THRESHOLD). */}
      {founderProgress.show ? (
        <div>
          <div className="flex items-baseline justify-between text-xs uppercase tracking-[0.18em]">
            <span className="font-semibold text-haldi-300">Founder Circle</span>
            <span className="text-stone-400">
              {founderProgress.joined.toLocaleString()} of {founderProgress.target.toLocaleString()} founders
              joined
            </span>
          </div>
          <div className="launch-progress-shine mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-haldi-500 via-amber-400 to-haldi-500 transition-[width] duration-700"
              style={{ width: `${Math.max(founderProgress.pct, 4)}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* Toran — a small auspicious gold flourish framing the invitation */}
      <div
        className={`${founderProgress.show ? "mt-6" : ""} flex items-center justify-center gap-3`}
        aria-hidden="true"
      >
        <span className="gold-rule w-14" />
        <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-gradient-to-br from-amber-200 to-haldi-500 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
        <span className="gold-rule w-14" />
      </div>

      <h2 className="mt-4 font-serif text-3xl leading-tight text-stone-50">Reserve your founding seat</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-400">
        A short entry now — name, how to reach you, and a couple of basics. The rest comes later, when
        matching opens.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate={false}>
        {error ? (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="reg-full-name" className={labelClass}>
            Full name
          </label>
          <input
            id="reg-full-name"
            name="full_name"
            type="text"
            autoComplete="name"
            value={form.full_name}
            onChange={(event) => updateField("full_name", event.target.value)}
            required
            placeholder="Your full name"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="reg-email" className={labelClass}>
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="reg-country" className={labelClass}>
            Country
          </label>
          <select
            id="reg-country"
            name="country"
            autoComplete="country"
            value={form.country}
            onChange={(event) => updateField("country", event.target.value)}
            required
            className={fieldClass}
          >
            {/* Launch markets first — scrolling past 80 countries to reach India
                is a real cost on a phone, and they will be most registrations. */}
            <optgroup label="Most common">
              {PRIORITY_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="All countries">
              {COUNTRIES.map((c) => (
                <option key={`all-${c.code}`} value={c.code}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label htmlFor="reg-phone" className={labelClass}>
            Phone
          </label>
          <div className="flex gap-2">
            {/* The dial code is derived, not typed — it cannot disagree with the
                country, and there is nothing to get wrong. */}
            <span
              className="inline-flex shrink-0 items-center rounded-xl border border-stone-800 bg-stone-900/70 px-3 text-sm tabular-nums text-stone-300"
              aria-hidden="true"
            >
              +{dialCode}
            </span>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
              aria-describedby="reg-phone-hint"
              placeholder={phonePlaceholder}
              className={fieldClass}
            />
          </div>
          <p id="reg-phone-hint" className="mt-2 text-xs text-stone-500">
            {phoneInvalid
              ? "That doesn't look like a complete number — check the digits."
              : `Without the country code. We'll store it as +${dialCode}…`}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-gender" className={labelClass}>
              Gender
            </label>
            <select
              id="reg-gender"
              name="gender"
              value={form.gender}
              onChange={(event) => updateField("gender", event.target.value as RegisterFormState["gender"])}
              required
              className={`${fieldClass} ${form.gender === "" ? "text-stone-600" : ""}`}
            >
              <option value="" disabled>
                Select…
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="reg-age" className={labelClass}>
              Age
            </label>
            <input
              id="reg-age"
              name="age"
              type="number"
              min={18}
              max={80}
              value={form.age}
              onChange={(event) => updateField("age", event.target.value)}
              required
              placeholder="29"
              className={fieldClass}
            />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-stone-400">
          By registering you confirm you are 18 or older and agree to Pravara&apos;s{" "}
          <Link href="/legal/terms" className="text-haldi-400 transition-colors hover:text-haldi-300">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-haldi-400 transition-colors hover:text-haldi-300">
            Privacy Policy
          </Link>
          . We&apos;ll only use your details for launch and service communication.
        </p>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="btn-sheen btn-festive launch-cta-glow inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-stone-950 transition-all hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-haldi-300 focus:ring-offset-2 focus:ring-offset-stone-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Reserving your seat
              </>
            ) : (
              <>
                Join the Founder Circle
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* One line, not two — the button shouldn't be sandwiched between
              two pieces of microcopy that both promise a confirmation email. */}
          <p className="mt-3 text-center text-xs leading-relaxed text-stone-500">
            Takes under a minute. Confirmation by email — we&apos;ll reach out when matching opens.
          </p>
        </div>
      </form>
      </div>
    </div>
  );
}
