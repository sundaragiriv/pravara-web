"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check, Crown, Star, Sparkles, ArrowLeft,
  ChevronDown, ChevronUp, Zap, Shield, MessageCircle, Users, Heart, Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type Tier = "Basic" | "Gold" | "Concierge";

// ── Tier definitions ──────────────────────────────────────────────────────────
const TIERS: {
  id: Tier;
  name: string;
  icon: React.ElementType;
  color: string;
  monthlyPrice: number;
  annualPrice: number;
  badge: string | null;
  description: string;
  features: string[];
  notIncluded: string[];
}[] = [
  {
    id: "Basic",
    name: "Basic",
    icon: Heart,
    color: "stone",
    monthlyPrice: 0,
    annualPrice: 0,
    badge: null,
    description: "Explore Pravara and discover compatible matches with core features.",
    features: [
      "View up to 10 matches/day",
      "Basic Nakshatra compatibility score",
      "Send 3 interests/month",
      "Profile visible to all members",
      "Community feed access",
    ],
    notIncluded: [
      "Full Ashtakoot Guna Milan report",
      "Unlimited interests",
      "Chat with matches",
      "Vedic Compatibility Engine",
      "Concierge matchmaker",
    ],
  },
  {
    id: "Gold",
    name: "Gold",
    icon: Star,
    color: "haldi",
    monthlyPrice: 29,
    annualPrice: 249,
    badge: "Most Popular",
    description: "Full matchmaking power — AI-curated matches, chat, and deep Vedic reports.",
    features: [
      "Unlimited daily matches",
      "Full Ashtakoot Guna Milan (all 8 Kutas)",
      "Unlimited interests",
      "Chat with accepted matches",
      "Vedic Compatibility report (horoscope matching)",
      "Priority profile placement",
      "Advanced filters (Nakshatra, Gotra, diet, visa)",
      "Read receipts & message timestamps",
    ],
    notIncluded: [
      "Personal Concierge matchmaker",
      "Curated shortlist by expert",
    ],
  },
  {
    id: "Concierge",
    name: "Concierge",
    icon: Crown,
    color: "purple",
    monthlyPrice: 79,
    annualPrice: 699,
    badge: "White Glove",
    description: "A personal Vedic matchmaker + full platform access. For the discerning family.",
    features: [
      "Everything in Gold",
      "Dedicated Vedic matchmaker",
      "Weekly curated shortlist (5 profiles)",
      "Background verification support",
      "Horoscope matching by Jyotishi",
      "Family profile review",
      "WhatsApp concierge support",
      "Early access to new features",
    ],
    notIncluded: [],
  },
];

const TIER_ORDER: Tier[] = ["Basic", "Gold", "Concierge"];

const FAQS = [
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Yes. Upgrades are effective immediately with prorated billing. Downgrades take effect at the end of your current billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and UPI/Indian payment methods (Razorpay coming soon). All payments are processed securely.",
  },
  {
    q: "Is there a free trial for Gold?",
    a: "New members get a 7-day free trial of Gold features. No credit card required to start.",
  },
  {
    q: "What is Vedic Compatibility?",
    a: "Pravara's deep horoscope-matching engine (Bhrugu Engine) — analyzes Ashtakoot across all 8 Kutas, Nadi Dosha exceptions, Mangal Dosha, and cultural alignment beyond the surface Guna score.",
  },
  {
    q: "How does Concierge matchmaking work?",
    a: "A trained Vedic compatibility advisor reviews your profile, understands your family's preferences, and curates 5 verified matches each week, handling introductions.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from Settings at any time — you retain access until the end of your billing period. No refunds for partial months.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function MembershipPage() {
  const router = useRouter();
  const supabase = createClient();

  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingTier, setLoadingTier] = useState(true);
  const [currentTier, setCurrentTier] = useState<Tier>("Basic");
  const [upgrading, setUpgrading] = useState<Tier | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const VALID_COUPONS: Record<string, number> = {
    PRAVARA10: 10,
    VEDIC20: 20,
    FOUNDING15: 15,
  };

  const discount = couponApplied ? (VALID_COUPONS[coupon.toUpperCase()] ?? 0) : 0;

  // ── Fetch current user tier ────────────────────────────────────────────────
  useEffect(() => {
    async function fetchTier() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("membership_tier, subscription_billing")
        .eq("id", user.id)
        .single();

      if (data?.membership_tier) {
        setCurrentTier(data.membership_tier as Tier);
      }
      if (data?.subscription_billing) {
        setBilling(data.subscription_billing as "monthly" | "annual");
      }
      setLoadingTier(false);
    }
    fetchTier();
  }, []);

  // ── Handle upgrade/downgrade ───────────────────────────────────────────────
  const handleChangePlan = async (targetTier: Tier) => {
    if (!userId) return;
    setUpgrading(targetTier);

    // TODO: Wire Stripe/Razorpay checkout here.
    // For now: update membership_tier directly (dev/demo mode).
    const now = new Date();
    const endDate = new Date(now);
    if (billing === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    const updatePayload: Record<string, unknown> = {
      membership_tier: targetTier,
      subscription_billing: targetTier === "Basic" ? null : billing,
      subscription_start_date: targetTier === "Basic" ? null : now.toISOString(),
      subscription_end_date: targetTier === "Basic" ? null : endDate.toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId);

    if (error) {
      toast.error("Could not update plan. Please try again.");
    } else {
      setCurrentTier(targetTier);
      const isUpgrade = TIER_ORDER.indexOf(targetTier) > TIER_ORDER.indexOf(currentTier);
      toast.success(
        isUpgrade
          ? `Welcome to ${targetTier}! Your new features are active.`
          : `Plan changed to ${targetTier}. Changes take effect next cycle.`
      );
    }
    setUpgrading(null);
  };

  const getPrice = (tier: (typeof TIERS)[0]) => {
    if (tier.monthlyPrice === 0) return "Free";
    const base = billing === "annual" ? tier.annualPrice : tier.monthlyPrice;
    if (discount > 0) return `$${(base * (1 - discount / 100)).toFixed(0)}`;
    return `$${base}`;
  };

  const getPeriodLabel = (tier: (typeof TIERS)[0]) => {
    if (tier.monthlyPrice === 0) return "forever";
    return billing === "annual" ? "/year" : "/month";
  };

  const getCtaLabel = (tierId: Tier) => {
    if (tierId === currentTier) return "Current Plan";
    const isUpgrade = TIER_ORDER.indexOf(tierId) > TIER_ORDER.indexOf(currentTier);
    return isUpgrade ? `Upgrade to ${tierId}` : `Downgrade to ${tierId}`;
  };

  const isCtaDisabled = (tierId: Tier) => tierId === currentTier;

  const annualSavings = (tier: (typeof TIERS)[0]) => {
    if (tier.monthlyPrice === 0) return null;
    return tier.monthlyPrice * 12 - tier.annualPrice;
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loadingTier) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 size={28} className="text-haldi-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur border-b border-stone-900">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-400 hover:text-stone-100 text-sm transition-colors">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
          <Link href="/" className="font-serif text-lg text-haldi-400 tracking-wide">
            Pravara
          </Link>
          <Link href="/support" className="text-stone-500 hover:text-stone-300 text-sm transition-colors">
            Need help?
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-haldi-500/10 border border-haldi-500/20 text-haldi-400 text-sm font-medium mb-6">
            <Sparkles size={13} />
            Pravara Membership
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-100 mb-4">
            Choose your path to <span className="text-haldi-400">your perfect union</span>
          </h1>
          <p className="text-stone-400 text-lg max-w-xl mx-auto">
            From exploring to fully guided — every tier unlocks a deeper experience of Vedic-rooted matchmaking.
          </p>
          {/* Current plan indicator */}
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-stone-500">
            You are on the
            <span className={`font-bold uppercase tracking-wide ${
              currentTier === "Concierge" ? "text-purple-400" :
              currentTier === "Gold" ? "text-haldi-400" :
              "text-stone-400"
            }`}>
              {currentTier}
            </span>
            plan
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-stone-100" : "text-stone-500"}`}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-label="Toggle billing period"
            onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors ${billing === "annual" ? "bg-haldi-500" : "bg-stone-700"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billing === "annual" ? "translate-x-6" : "translate-x-0.5"}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${billing === "annual" ? "text-stone-100" : "text-stone-500"}`}
          >
            Annual
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">
              Save up to 30%
            </span>
          </button>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isGold = tier.id === "Gold";
            const isConcierge = tier.id === "Concierge";
            const isCurrent = tier.id === currentTier;
            const savings = annualSavings(tier);
            const isUpgrade = TIER_ORDER.indexOf(tier.id) > TIER_ORDER.indexOf(currentTier);
            const isLoadingThis = upgrading === tier.id;

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all ${
                  isCurrent
                    ? isGold
                      ? "border-haldi-500/60 bg-haldi-500/8 shadow-xl shadow-haldi-500/10 ring-1 ring-haldi-500/30"
                      : isConcierge
                      ? "border-purple-500/60 bg-purple-500/8 ring-1 ring-purple-500/30"
                      : "border-stone-600 bg-stone-900/70 ring-1 ring-stone-600/50"
                    : isGold
                    ? "border-haldi-500/30 bg-haldi-500/5"
                    : isConcierge
                    ? "border-purple-500/25 bg-purple-500/5"
                    : "border-stone-800 bg-stone-900/50"
                }`}
              >
                {/* Current plan ribbon */}
                {isCurrent && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wider ${
                    isConcierge ? "bg-purple-600 text-white" :
                    isGold ? "bg-haldi-500 text-stone-950" :
                    "bg-stone-700 text-stone-200"
                  }`}>
                    ✓ Current Plan
                  </div>
                )}
                {!isCurrent && tier.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wider ${
                    isGold ? "bg-haldi-500 text-stone-950" : "bg-purple-600 text-white"
                  }`}>
                    {tier.badge}
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isGold ? "bg-haldi-500/20" : isConcierge ? "bg-purple-500/20" : "bg-stone-800"
                  }`}>
                    <Icon size={18} className={isGold ? "text-haldi-400" : isConcierge ? "text-purple-400" : "text-stone-400"} />
                  </div>
                  <h2 className="text-lg font-serif text-stone-100">{tier.name}</h2>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-4xl font-bold text-stone-100">{getPrice(tier)}</span>
                  <span className="text-stone-500 text-sm ml-1">{getPeriodLabel(tier)}</span>
                </div>
                {billing === "annual" && savings && (
                  <p className="text-green-400 text-xs mb-2">Save ${savings}/year vs monthly</p>
                )}

                <p className="text-stone-400 text-sm mb-6">{tier.description}</p>

                {/* CTA */}
                <button
                  type="button"
                  disabled={isCtaDisabled(tier.id) || isLoadingThis}
                  onClick={() => !isCtaDisabled(tier.id) && handleChangePlan(tier.id)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all mb-6 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-stone-800 text-stone-500 cursor-default"
                      : isUpgrade
                      ? isGold
                        ? "bg-haldi-500 hover:bg-haldi-400 text-stone-950 shadow-md shadow-haldi-500/30"
                        : "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-stone-800 hover:bg-stone-700 text-stone-400"
                  }`}
                >
                  {isLoadingThis ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    getCtaLabel(tier.id)
                  )}
                </button>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-300">
                      <Check size={14} className={`mt-0.5 flex-shrink-0 ${
                        isGold ? "text-haldi-400" : isConcierge ? "text-purple-400" : "text-green-500"
                      }`} />
                      {f}
                    </li>
                  ))}
                  {tier.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone-600 line-through">
                      <span className="mt-0.5 flex-shrink-0 w-3.5 h-3.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Coupon code */}
        <div className="max-w-md mx-auto mb-16">
          <p className="text-center text-stone-500 text-sm mb-3">Have a promo code?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => {
                setCoupon(e.target.value);
                setCouponApplied(false);
                setCouponError("");
              }}
              placeholder="Enter coupon code"
              className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                const code = coupon.trim().toUpperCase();
                if (VALID_COUPONS[code]) {
                  setCouponApplied(true);
                  setCouponError("");
                } else {
                  setCouponApplied(false);
                  setCouponError("Invalid code. Try PRAVARA10.");
                }
              }}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
          {couponApplied && (
            <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
              <Check size={12} />
              {discount}% discount applied!
            </p>
          )}
          {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Shield, label: "Secure Payments", sub: "256-bit SSL encrypted" },
            { icon: Zap, label: "Instant Activation", sub: "Upgrade takes effect immediately" },
            { icon: MessageCircle, label: "Cancel Anytime", sub: "No long-term commitment" },
            { icon: Users, label: "500+ Families", sub: "Joined in the first 6 months" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center p-4 bg-stone-900/40 border border-stone-800/60 rounded-xl">
              <Icon size={20} className="text-haldi-400 mb-2" />
              <p className="text-stone-200 text-sm font-medium">{label}</p>
              <p className="text-stone-500 text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-serif text-stone-100 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-stone-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-stone-200 text-sm font-medium hover:bg-stone-900/50 transition-colors"
                >
                  {faq.q}
                  {openFaq === i ? (
                    <ChevronUp size={15} className="text-stone-500 flex-shrink-0 ml-3" />
                  ) : (
                    <ChevronDown size={15} className="text-stone-500 flex-shrink-0 ml-3" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-stone-400 text-sm leading-relaxed border-t border-stone-800">
                    <div className="pt-3">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center mt-16 pt-10 border-t border-stone-900">
          <p className="text-stone-500 text-sm">
            Questions?{" "}
            <a href="mailto:support@pravara.com" className="text-haldi-400 hover:underline">
              support@pravara.com
            </a>
            {" "}or visit our{" "}
            <Link href="/support" className="text-haldi-400 hover:underline">
              Support Center
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
