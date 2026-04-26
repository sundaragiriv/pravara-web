"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type RegisterFormState = {
  full_name: string;
  age: string;
  gender: "Male" | "Female" | "Other";
  profession: string;
  location: string;
  email: string;
  phone: string;
};

const INITIAL_STATE: RegisterFormState = {
  full_name: "",
  age: "",
  gender: "Male",
  profession: "",
  location: "",
  email: "",
  phone: "",
};

type RegisterFormProps = {
  foundingCount: number;
  foundingTarget: number;
};

export default function RegisterForm({ foundingCount, foundingTarget }: RegisterFormProps) {
  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const seatsRemaining = useMemo(
    () => Math.max(foundingTarget - foundingCount, 0),
    [foundingCount, foundingTarget],
  );

  function updateField<K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
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
          source: "launch-register-page",
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to complete registration right now.");
      }

      setSuccess(true);
      setForm(INITIAL_STATE);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to complete registration right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-[2rem] border border-emerald-500/25 bg-emerald-500/10 p-8 shadow-2xl shadow-black/25">
        <div className="flex items-center gap-3 text-emerald-200">
          <CheckCircle2 className="h-6 w-6" />
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">You are on the founding list</p>
        </div>
        <h2 className="mt-6 font-serif text-4xl text-stone-50">Your seat is reserved for launch access.</h2>
        <p className="mt-4 text-base leading-relaxed text-stone-300">
          We have your details. Founding members will receive launch communication first, along with the
          one-month premium access offer once matching opens.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            "We review the early cohort mix so matching opens with real density.",
            "We send confirmation and launch updates to the email you registered with.",
            "You stay in the first wave when the matching room is ready to open.",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4 text-sm text-stone-300">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-haldi-500 px-6 py-3 text-sm font-bold text-stone-950 transition-colors hover:bg-haldi-400"
          >
            Return Home
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center justify-center rounded-full border border-stone-700 px-6 py-3 text-sm font-semibold text-stone-200 transition-colors hover:border-stone-500 hover:text-white"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-stone-800 bg-stone-950/70 p-8 shadow-2xl shadow-black/35 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-haldi-300">Register free</p>
          <h2 className="mt-3 font-serif text-3xl text-stone-50">Join the first 500 serious members.</h2>
        </div>
        <div className="rounded-full border border-haldi-500/25 bg-haldi-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-haldi-300">
          {seatsRemaining} seats left
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-stone-400">
        Register now with the essentials. We are building the first real member base before opening
        matching, so the early experience starts with actual momentum instead of empty browsing.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Full name
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={(event) => updateField("full_name", event.target.value)}
              required
              placeholder="Your full name"
              className="w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:border-haldi-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Age
            </label>
            <input
              type="number"
              min={18}
              max={80}
              value={form.age}
              onChange={(event) => updateField("age", event.target.value)}
              required
              placeholder="29"
              className="w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:border-haldi-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(event) => updateField("gender", event.target.value as RegisterFormState["gender"])}
              className="w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 focus:border-haldi-500 focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Profession
            </label>
            <input
              type="text"
              value={form.profession}
              onChange={(event) => updateField("profession", event.target.value)}
              required
              placeholder="Product manager"
              className="w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:border-haldi-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              required
              placeholder="New York, USA"
              className="w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:border-haldi-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:border-haldi-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
              placeholder="+1 555 123 4567"
              className="w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:border-haldi-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4 text-sm text-stone-400">
          By registering, you confirm you are 18 or older and agree to Pravara&apos;s{" "}
          <Link href="/legal/terms" className="text-haldi-400 transition-colors hover:text-haldi-300">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className="text-haldi-400 transition-colors hover:text-haldi-300">
            Privacy Policy
          </Link>
          . We will use your contact details for launch and service communication.
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-haldi-500 px-6 py-4 text-sm font-bold text-stone-950 transition-all hover:scale-[1.01] hover:bg-haldi-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Reserving your seat
            </>
          ) : (
            <>
              Register Free
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
