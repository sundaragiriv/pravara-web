"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ChevronDown, ChevronUp, MessageCircle,
  Mail, Clock, Phone, Send, CheckCircle2, Sparkles,
  ShieldCheck, Heart, Crown, Star
} from "lucide-react";

// ── FAQ data ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    category: "Account & Profile",
    items: [
      {
        q: "How do I complete my profile to get better matches?",
        a: "Complete all fields in Edit Profile — especially Nakshatra, Gotra, height, location, and partner preferences. Profiles with photos and voice intros get 3× more interest. Narada AI can help you fill out your bio from a short conversation during onboarding.",
      },
      {
        q: "How do I upload photos or a voice intro?",
        a: "Go to Edit Profile → scroll to the Media section. You can upload up to 6 photos and one audio file (MP3/M4A/OGG, max 10MB) for your voice intro. Photos should be clear, recent, and face-visible for best results.",
      },
      {
        q: "Can a family member manage my profile?",
        a: "Yes. From your profile settings, use 'Invite Family Member' to send an email invite. The guardian can edit your profile and shortlist matches on your behalf — with your approval at each step.",
      },
    ],
  },
  {
    category: "Matchmaking & Compatibility",
    items: [
      {
        q: "How does Ashtakoot Guna Milan work on Pravara?",
        a: "Pravara calculates all 8 Kutas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) for every match pair using Nakshatra data. The score is shown as X/36 on each match card. Sagothra (same Gotra) is flagged separately and always disqualifies a match per tradition.",
      },
      {
        q: "Why are my matches limited?",
        a: "Basic members see up to 10 matches per day. Upgrade to Gold for unlimited matches. If you're not seeing many results, try widening your age range or removing strict location filters in the Matches filter panel.",
      },
      {
        q: "What is the Bhrugu Engine?",
        a: "The Bhrugu Engine is Pravara's deeper compatibility algorithm — available on Gold and Concierge plans. It analyzes Nadi Dosha exceptions, Mangal Dosha patterns, Ashtakoot breakdown, and cultural alignment beyond the surface Guna score.",
      },
    ],
  },
  {
    category: "Messaging & Interests",
    items: [
      {
        q: "How do I start chatting with a match?",
        a: "Send an Interest to a profile. If they accept, a chat opens between you both. Basic members can send 3 interests/month. Gold members have unlimited interests and can chat freely with accepted matches.",
      },
      {
        q: "Why can't I see someone's full profile?",
        a: "Full profiles — including contact info and extended photos — are visible only after mutual interest is accepted. This protects everyone's privacy until both parties express interest.",
      },
    ],
  },
  {
    category: "Billing & Membership",
    items: [
      {
        q: "How do I upgrade or cancel my plan?",
        a: "Go to your profile dropdown → Membership, or visit pravara.com/membership. Upgrades are instant. Cancellations take effect at the end of your billing cycle — you won't be charged again after that.",
      },
      {
        q: "What happens to my data if I delete my account?",
        a: "Deleting your account removes your profile from all matches immediately and marks your data for permanent deletion within 30 days per our privacy policy. You can export your data before deletion via Settings → Privacy.",
      },
    ],
  },
];

const SUBJECTS = [
  "Account or Login issue",
  "Profile or Photo help",
  "Match or Compatibility question",
  "Messaging or Chat issue",
  "Billing or Subscription",
  "Bug or Technical error",
  "Concierge Matchmaker inquiry",
  "Privacy or Data request",
  "Other",
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(FAQS[0].category);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    tier: "Basic",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission — wire to email API or Supabase later
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur border-b border-stone-900">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-400 hover:text-stone-100 text-sm transition-colors">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
          <Link href="/" className="font-serif text-lg text-haldi-400 tracking-wide">
            Pravara
          </Link>
          <Link href="/membership" className="text-stone-500 hover:text-stone-300 text-sm transition-colors">
            Membership
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-haldi-500/10 border border-haldi-500/20 text-haldi-400 text-sm font-medium mb-6">
            <Sparkles size={13} />
            Support Center
          </div>
          <h1 className="text-4xl font-serif text-stone-100 mb-3">
            How can we help?
          </h1>
          <p className="text-stone-400 text-base max-w-lg mx-auto">
            Browse answers below or send us a message — our team responds within 24 hours.
            Concierge members get priority WhatsApp support.
          </p>
        </div>

        {/* Quick contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {[
            {
              icon: Mail,
              title: "Email Support",
              detail: "support@pravara.com",
              sub: "Response within 24 hours",
              href: "mailto:support@pravara.com",
            },
            {
              icon: Clock,
              title: "Response Time",
              detail: "Mon–Fri, 9am–6pm IST",
              sub: "Same-day for urgent issues",
              href: null,
            },
            {
              icon: Crown,
              title: "Concierge Hotline",
              detail: "WhatsApp priority line",
              sub: "Concierge members only",
              href: "/membership",
            },
          ].map(({ icon: Icon, title, detail, sub, href }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-5 bg-stone-900/50 border border-stone-800 rounded-xl"
            >
              <div className="w-9 h-9 rounded-lg bg-haldi-500/10 flex items-center justify-center flex-shrink-0">
                <Icon size={17} className="text-haldi-400" />
              </div>
              <div>
                <p className="text-stone-200 text-sm font-medium">{title}</p>
                {href ? (
                  <a href={href} className="text-haldi-400 text-sm hover:underline">
                    {detail}
                  </a>
                ) : (
                  <p className="text-stone-300 text-sm">{detail}</p>
                )}
                <p className="text-stone-500 text-xs mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── FAQ ── */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-serif text-stone-100 mb-6">Frequently Asked Questions</h2>

            <div className="space-y-3">
              {FAQS.map((cat) => (
                <div key={cat.category} className="border border-stone-800 rounded-xl overflow-hidden">
                  {/* Category header */}
                  <button
                    type="button"
                    onClick={() =>
                      setOpenCategory(openCategory === cat.category ? null : cat.category)
                    }
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-stone-900/50 hover:bg-stone-900 transition-colors"
                  >
                    <span className="text-stone-200 text-sm font-semibold">{cat.category}</span>
                    {openCategory === cat.category ? (
                      <ChevronUp size={14} className="text-stone-500" />
                    ) : (
                      <ChevronDown size={14} className="text-stone-500" />
                    )}
                  </button>

                  {openCategory === cat.category && (
                    <div className="divide-y divide-stone-800/60">
                      {cat.items.map((item) => {
                        const key = `${cat.category}::${item.q}`;
                        return (
                          <div key={key}>
                            <button
                              type="button"
                              onClick={() => setOpenItem(openItem === key ? null : key)}
                              className="w-full flex items-start justify-between px-5 py-3 text-left hover:bg-stone-900/30 transition-colors gap-3"
                            >
                              <span className="text-stone-300 text-sm">{item.q}</span>
                              {openItem === key ? (
                                <ChevronUp size={13} className="text-stone-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <ChevronDown size={13} className="text-stone-600 flex-shrink-0 mt-0.5" />
                              )}
                            </button>
                            {openItem === key && (
                              <div className="px-5 pb-4 text-stone-400 text-sm leading-relaxed">
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

          {/* ── Contact Form ── */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-serif text-stone-100 mb-6">Send us a message</h2>

            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-stone-900/40 border border-stone-800 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
                  <CheckCircle2 size={28} className="text-green-400" />
                </div>
                <h3 className="text-stone-100 font-medium mb-2">Message sent!</h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  We&apos;ll get back to you at <span className="text-stone-200">{form.email}</span> within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "", tier: "Basic" });
                  }}
                  className="mt-6 text-haldi-400 hover:text-haldi-300 text-sm underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-stone-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                    Your Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-stone-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-stone-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                    Membership Tier
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "Basic", icon: Heart, color: "stone" },
                      { id: "Gold", icon: Star, color: "haldi" },
                      { id: "Concierge", icon: Crown, color: "purple" },
                    ].map(({ id, icon: Icon, color }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, tier: id }))}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                          form.tier === id
                            ? color === "haldi"
                              ? "border-haldi-500/60 bg-haldi-500/10 text-haldi-400"
                              : color === "purple"
                              ? "border-purple-500/60 bg-purple-500/10 text-purple-400"
                              : "border-stone-600 bg-stone-800 text-stone-200"
                            : "border-stone-800 text-stone-500 hover:border-stone-700"
                        }`}
                      >
                        <Icon size={12} />
                        {id}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-stone-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                    Subject
                  </label>
                  <select
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-haldi-500/50 transition-colors appearance-none"
                  >
                    <option value="" disabled>Select a topic...</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 text-xs font-medium uppercase tracking-wider block mb-1.5">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-haldi-500 hover:bg-haldi-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-semibold rounded-xl text-sm transition-all"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-700 border-t-haldi-500 rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-stone-600 text-xs text-center">
                  By submitting, you agree to our{" "}
                  <Link href="/legal/privacy" className="text-stone-500 hover:text-stone-400 underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom — Narada AI hint */}
        <div className="mt-16 p-5 bg-haldi-500/5 border border-haldi-500/15 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-haldi-500/15 flex items-center justify-center flex-shrink-0">
            <span className="text-haldi-400 text-lg font-serif">ॐ</span>
          </div>
          <div>
            <p className="text-stone-200 text-sm font-medium mb-1">
              Try asking Sutradhar
            </p>
            <p className="text-stone-400 text-sm leading-relaxed">
              For quick help with your profile, matches, or compatibility questions — click the{" "}
              <span className="text-haldi-400">Sutradhar guide</span> button (bottom right of any page).
              It can answer many questions instantly without waiting for a support reply.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
