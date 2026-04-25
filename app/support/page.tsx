"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Crown,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";

type SupportForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
  tier: "Basic" | "Gold" | "Concierge";
};

const FAQS = [
  {
    category: "Account & Profile",
    items: [
      {
        q: "How do I improve my profile quality?",
        a: "Complete your profile basics, add clear photos, include Vedic details where relevant, and write a short bio that reflects your values and family context.",
      },
      {
        q: "Can a family member help manage my profile?",
        a: "Yes. Pravara supports family-assisted matchmaking flows. Some collaboration features exist today, and the broader workflow is still being refined.",
      },
      {
        q: "How do I update my photos or details?",
        a: "Use the edit profile area inside the dashboard. If something is blocked or unclear, contact support and include the issue you are seeing.",
      },
    ],
  },
  {
    category: "Matches & Compatibility",
    items: [
      {
        q: "Why am I seeing fewer matches than expected?",
        a: "Match volume depends on who is active, how complete your profile is, and how narrow your filters are. Broadening preferences usually helps.",
      },
      {
        q: "What is the compatibility score based on?",
        a: "Pravara uses profile context and Vedic data where available, including Nakshatra-based matching logic. The exact depth depends on the data present for both profiles.",
      },
      {
        q: "Can I chat with a match immediately?",
        a: "Chat availability depends on the current connection flow and account state. If you run into a mismatch between the UI and what you expect, contact support.",
      },
    ],
  },
  {
    category: "Membership & Billing",
    items: [
      {
        q: "Can I change my plan online?",
        a: "Self-serve billing is still being finalized. Membership questions and plan changes are currently handled directly by the Pravara team.",
      },
      {
        q: "What payment methods are live right now?",
        a: "Automated checkout is not publicly live yet. Any available membership option will be communicated clearly before payment is requested.",
      },
      {
        q: "How do I request account deletion or a data action?",
        a: "Send a support request with the email tied to your account. Privacy and account requests are handled manually while the broader operational workflow is being tightened.",
      },
    ],
  },
];

const SUBJECTS = [
  "Account or login issue",
  "Profile or photo help",
  "Match or compatibility question",
  "Messaging or chat issue",
  "Membership or billing question",
  "Bug or technical error",
  "Privacy or data request",
  "Other",
] as const;

const initialForm: SupportForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  tier: "Basic",
};

export default function SupportPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(FAQS[0].category);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [form, setForm] = useState<SupportForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error || "Unable to send support request.");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to send support request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-900 bg-stone-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-stone-100"
          >
            <ArrowLeft size={15} />
            Back to Home
          </Link>
          <Link href="/" className="font-serif text-lg tracking-wide text-haldi-400">
            Pravara
          </Link>
          <Link
            href="/membership"
            className="text-sm text-stone-500 transition-colors hover:text-stone-300"
          >
            Membership
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-14 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-haldi-500/20 bg-haldi-500/10 px-4 py-1.5 text-sm font-medium text-haldi-400">
            <Sparkles size={13} />
            Support Center
          </div>
          <h1 className="mb-3 text-4xl font-serif text-stone-100">How can we help?</h1>
          <p className="mx-auto max-w-lg text-base text-stone-400">
            Browse the most common questions below or prepare an email with the support form.
            For privacy, billing, or account issues, email remains the primary support channel.
          </p>
        </div>

        <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Mail,
              title: "Email Support",
              detail: "support@pravara.com",
              sub: "Primary support channel",
              href: "mailto:support@pravara.com",
            },
            {
              icon: Clock,
              title: "Response Window",
              detail: "Handled as quickly as possible",
              sub: "Availability may vary during rollout",
              href: null,
            },
            {
              icon: Crown,
              title: "Membership Help",
              detail: "Plan and concierge questions",
              sub: "Use support for current membership guidance",
              href: "/membership",
            },
          ].map(({ icon: Icon, title, detail, sub, href }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-xl border border-stone-800 bg-stone-900/50 p-5"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-haldi-500/10">
                <Icon size={17} className="text-haldi-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-200">{title}</p>
                {href ? (
                  <a href={href} className="text-sm text-haldi-400 hover:underline">
                    {detail}
                  </a>
                ) : (
                  <p className="text-sm text-stone-300">{detail}</p>
                )}
                <p className="mt-0.5 text-xs text-stone-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="mb-6 text-xl font-serif text-stone-100">Frequently Asked Questions</h2>

            <div className="space-y-3">
              {FAQS.map((category) => (
                <div key={category.category} className="overflow-hidden rounded-xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenCategory(openCategory === category.category ? null : category.category)
                    }
                    className="flex w-full items-center justify-between bg-stone-900/50 px-5 py-3.5 text-left transition-colors hover:bg-stone-900"
                  >
                    <span className="text-sm font-semibold text-stone-200">{category.category}</span>
                    {openCategory === category.category ? (
                      <ChevronUp size={14} className="text-stone-500" />
                    ) : (
                      <ChevronDown size={14} className="text-stone-500" />
                    )}
                  </button>

                  {openCategory === category.category && (
                    <div className="divide-y divide-stone-800/60">
                      {category.items.map((item) => {
                        const key = `${category.category}::${item.q}`;
                        return (
                          <div key={key}>
                            <button
                              type="button"
                              onClick={() => setOpenItem(openItem === key ? null : key)}
                              className="flex w-full items-start justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-stone-900/30"
                            >
                              <span className="text-sm text-stone-300">{item.q}</span>
                              {openItem === key ? (
                                <ChevronUp size={13} className="mt-0.5 flex-shrink-0 text-stone-600" />
                              ) : (
                                <ChevronDown size={13} className="mt-0.5 flex-shrink-0 text-stone-600" />
                              )}
                            </button>
                            {openItem === key && (
                              <div className="px-5 pb-4 text-sm leading-relaxed text-stone-400">
                                {item.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-6 text-xl font-serif text-stone-100">Send a support request</h2>

            {submitted ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-800 bg-stone-900/40 px-6 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-green-500/30 bg-green-500/15">
                  <CheckCircle2 size={28} className="text-green-400" />
                </div>
                <h3 className="mb-2 font-medium text-stone-100">Request sent</h3>
                <p className="text-sm leading-relaxed text-stone-400">
                  We received your request for <span className="text-stone-200">{form.email}</span>.
                  The Pravara team will review it as soon as possible.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm(initialForm);
                    setSubmitError("");
                  }}
                  className="mt-6 text-sm text-haldi-400 underline hover:text-haldi-300"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                    Your Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-sm text-stone-100 transition-colors placeholder:text-stone-600 focus:border-haldi-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-sm text-stone-100 transition-colors placeholder:text-stone-600 focus:border-haldi-500/50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                    Membership Tier
                  </label>
                  <div className="flex gap-2">
                    {(["Basic", "Gold", "Concierge"] as SupportForm["tier"][]).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, tier }))}
                        className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                          form.tier === tier
                            ? tier === "Gold"
                              ? "border-haldi-500/60 bg-haldi-500/10 text-haldi-400"
                              : tier === "Concierge"
                                ? "border-purple-500/60 bg-purple-500/10 text-purple-400"
                                : "border-stone-600 bg-stone-800 text-stone-200"
                            : "border-stone-800 text-stone-500 hover:border-stone-700"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                    Subject
                  </label>
                  <select
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-sm text-stone-100 transition-colors focus:border-haldi-500/50 focus:outline-none"
                  >
                    <option value="" disabled>
                      Select a topic...
                    </option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    className="w-full resize-none rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-sm text-stone-100 transition-colors placeholder:text-stone-600 focus:border-haldi-500/50 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-haldi-500 py-3 text-sm font-semibold text-stone-950 transition-all hover:bg-haldi-400 disabled:bg-stone-800 disabled:text-stone-500"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-700 border-t-haldi-500" />
                      Sending request...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Request
                    </>
                  )}
                </button>

                {submitError && (
                  <p className="text-sm text-red-400">
                    {submitError} If needed, email{" "}
                    <a href="mailto:support@pravara.com" className="underline">
                      support@pravara.com
                    </a>
                    .
                  </p>
                )}

                <p className="text-center text-xs text-stone-600">
                  By submitting, you agree to our{" "}
                  <Link href="/legal/privacy" className="text-stone-500 underline hover:text-stone-400">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="mt-16 flex items-start gap-4 rounded-2xl border border-haldi-500/15 bg-haldi-500/5 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-haldi-500/15">
            <span className="font-serif text-lg text-haldi-400">Om</span>
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-stone-200">Try Sutradhar first</p>
            <p className="text-sm leading-relaxed text-stone-400">
              For quick help with profile, match, or compatibility questions, use Sutradhar where it is
              available in the app. It can often answer common questions before you need support.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
