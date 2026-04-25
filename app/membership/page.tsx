"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Heart,
  Loader2,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

type Tier = "Basic" | "Gold" | "Concierge";
type BillingMode = "monthly" | "annual";

type TierConfig = {
  id: Tier;
  name: string;
  icon: React.ElementType;
  monthlyPrice: number;
  annualPrice: number;
  badge: string | null;
  description: string;
  features: string[];
  notIncluded: string[];
};

const TIERS: TierConfig[] = [
  {
    id: "Basic",
    name: "Basic",
    icon: Heart,
    monthlyPrice: 0,
    annualPrice: 0,
    badge: null,
    description: "Explore Pravara with the core profile, discovery, and connection experience.",
    features: [
      "Create and maintain your profile",
      "Discover compatible profiles",
      "View core compatibility signals",
      "Send a limited number of interests",
      "Use the product during rollout",
    ],
    notIncluded: [
      "Expanded compatibility insights",
      "Priority placement",
      "High-touch concierge support",
    ],
  },
  {
    id: "Gold",
    name: "Gold",
    icon: Star,
    monthlyPrice: 29,
    annualPrice: 249,
    badge: "Most Popular",
    description: "Deeper matching tools and a richer guided experience for active members and families.",
    features: [
      "Everything in Basic",
      "Deeper compatibility context",
      "Higher visibility in discovery flows",
      "Expanded filtering and matchmaking tools",
      "Priority consideration for future releases",
    ],
    notIncluded: ["Dedicated concierge workflow"],
  },
  {
    id: "Concierge",
    name: "Concierge",
    icon: Crown,
    monthlyPrice: 79,
    annualPrice: 699,
    badge: "White Glove",
    description: "A high-touch matchmaking layer for members who want a guided, hands-on experience.",
    features: [
      "Everything in Gold",
      "Direct coordination with the Pravara team",
      "Manual guidance during rollout",
      "Priority handling for complex requirements",
      "Access to concierge-specific onboarding",
    ],
    notIncluded: [],
  },
];

const TIER_ORDER: Tier[] = ["Basic", "Gold", "Concierge"];

const FAQS = [
  {
    q: "Can I upgrade or downgrade online right now?",
    a: "Self-serve billing is still being finalized. For now, plan changes are handled directly by the Pravara team.",
  },
  {
    q: "What payment methods are currently live?",
    a: "Automated checkout is not publicly live yet. When billing is enabled, the accepted methods and renewal rules will be shown clearly before purchase.",
  },
  {
    q: "Are launch offers or founding-member plans available?",
    a: "Some rollout or founding-member offers may be handled manually. If an offer applies to you, it will be communicated directly and clearly.",
  },
  {
    q: "What does Concierge mean at this stage?",
    a: "Concierge is a high-touch service tier. During rollout, access is handled directly by the Pravara team rather than through automated checkout.",
  },
  {
    q: "How do cancellations work while billing is being finalized?",
    a: "Until billing is fully enabled, membership changes and cancellations are handled directly by the Pravara team.",
  },
];

const VALID_COUPONS: Record<string, number> = {
  PRAVARA10: 10,
  VEDIC20: 20,
  FOUNDING15: 15,
};

export default function MembershipPage() {
  const router = useRouter();
  const supabase = createClient();

  const [billing, setBilling] = useState<BillingMode>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [loadingTier, setLoadingTier] = useState(true);
  const [currentTier, setCurrentTier] = useState<Tier>("Basic");
  const [upgrading, setUpgrading] = useState<Tier | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const discount = couponApplied ? (VALID_COUPONS[coupon.toUpperCase()] ?? 0) : 0;

  useEffect(() => {
    async function fetchTier() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
        setBilling(data.subscription_billing as BillingMode);
      }

      setLoadingTier(false);
    }

    fetchTier();
  }, [router, supabase]);

  const getPrice = (tier: TierConfig) => {
    if (tier.monthlyPrice === 0) return "Free";
    const base = billing === "annual" ? tier.annualPrice : tier.monthlyPrice;
    if (discount > 0) return `$${(base * (1 - discount / 100)).toFixed(0)}`;
    return `$${base}`;
  };

  const getPeriodLabel = (tier: TierConfig) => {
    if (tier.monthlyPrice === 0) return "during rollout";
    return billing === "annual" ? "/year" : "/month";
  };

  const annualSavings = (tier: TierConfig) => {
    if (tier.monthlyPrice === 0) return null;
    return tier.monthlyPrice * 12 - tier.annualPrice;
  };

  const getCtaLabel = (tierId: Tier) => {
    if (tierId === currentTier) return "Current Plan";
    const isUpgrade = TIER_ORDER.indexOf(tierId) > TIER_ORDER.indexOf(currentTier);
    return isUpgrade ? `Ask about ${tierId}` : `Switch to ${tierId}`;
  };

  const handleChangePlan = async (targetTier: Tier) => {
    if (!userId) return;

    setUpgrading(targetTier);
    toast.message(
      `Self-serve ${targetTier} changes are not live yet. Contact support and we will help you with the right plan.`,
    );
    setUpgrading(null);
    router.push("/support");
  };

  if (loadingTier) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950">
        <Loader2 size={28} className="animate-spin text-haldi-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-900 bg-stone-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
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
            href="/support"
            className="text-sm text-stone-500 transition-colors hover:text-stone-300"
          >
            Need help?
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-14 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-haldi-500/20 bg-haldi-500/10 px-4 py-1.5 text-sm font-medium text-haldi-400">
            <Sparkles size={13} />
            Pravara Membership
          </div>
          <h1 className="mb-4 text-4xl font-serif text-stone-100 md:text-5xl">
            Choose the level of support that fits your journey
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-stone-400">
            Membership pricing is visible for planning purposes. Automated checkout is still being
            finalized, so plan changes are currently handled directly by the Pravara team.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-sm text-stone-500">
            You are on the
            <span
              className={`font-bold uppercase tracking-wide ${
                currentTier === "Concierge"
                  ? "text-purple-400"
                  : currentTier === "Gold"
                    ? "text-haldi-400"
                    : "text-stone-400"
              }`}
            >
              {currentTier}
            </span>
            plan
          </div>
        </div>

        <div className="mb-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`text-sm font-medium transition-colors ${
              billing === "monthly" ? "text-stone-100" : "text-stone-500"
            }`}
          >
            Monthly view
          </button>
          <button
            type="button"
            aria-label="Toggle billing period preview"
            onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
            className={`relative h-6 w-12 rounded-full transition-colors ${
              billing === "annual" ? "bg-haldi-500" : "bg-stone-700"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                billing === "annual" ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              billing === "annual" ? "text-stone-100" : "text-stone-500"
            }`}
          >
            Annual view
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400">
              Planning only
            </span>
          </button>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
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
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  isCurrent
                    ? isGold
                      ? "border-haldi-500/60 bg-haldi-500/8 ring-1 ring-haldi-500/30"
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
                {isCurrent && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold tracking-wider ${
                      isConcierge
                        ? "bg-purple-600 text-white"
                        : isGold
                          ? "bg-haldi-500 text-stone-950"
                          : "bg-stone-700 text-stone-200"
                    }`}
                  >
                    Current Plan
                  </div>
                )}

                {!isCurrent && tier.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold tracking-wider ${
                      isGold ? "bg-haldi-500 text-stone-950" : "bg-purple-600 text-white"
                    }`}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isGold
                        ? "bg-haldi-500/20"
                        : isConcierge
                          ? "bg-purple-500/20"
                          : "bg-stone-800"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        isGold
                          ? "text-haldi-400"
                          : isConcierge
                            ? "text-purple-400"
                            : "text-stone-400"
                      }
                    />
                  </div>
                  <h2 className="text-lg font-serif text-stone-100">{tier.name}</h2>
                </div>

                <div className="mb-1">
                  <span className="text-4xl font-bold text-stone-100">{getPrice(tier)}</span>
                  <span className="ml-1 text-sm text-stone-500">{getPeriodLabel(tier)}</span>
                </div>
                {billing === "annual" && savings && (
                  <p className="mb-2 text-xs text-green-400">Preview savings: ${savings}/year</p>
                )}

                <p className="mb-6 text-sm text-stone-400">{tier.description}</p>

                <button
                  type="button"
                  disabled={isCurrent || isLoadingThis}
                  onClick={() => !isCurrent && handleChangePlan(tier.id)}
                  className={`mb-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    isCurrent
                      ? "cursor-default bg-stone-800 text-stone-500"
                      : isUpgrade
                        ? isGold
                          ? "bg-haldi-500 text-stone-950 shadow-md shadow-haldi-500/30 hover:bg-haldi-400"
                          : "bg-purple-600 text-white hover:bg-purple-500"
                        : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                  }`}
                >
                  {isLoadingThis ? <Loader2 size={15} className="animate-spin" /> : getCtaLabel(tier.id)}
                </button>

                <ul className="flex-1 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-stone-300">
                      <Check
                        size={14}
                        className={`mt-0.5 flex-shrink-0 ${
                          isGold
                            ? "text-haldi-400"
                            : isConcierge
                              ? "text-purple-400"
                              : "text-green-500"
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                  {tier.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-stone-600 line-through">
                      <span className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mb-16 max-w-md">
          <p className="mb-3 text-center text-sm text-stone-500">Founding access code</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(event) => {
                setCoupon(event.target.value);
                setCouponApplied(false);
                setCouponError("");
              }}
              placeholder="Enter invitation code"
              className="flex-1 rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-sm text-stone-100 transition-colors placeholder:text-stone-600 focus:border-haldi-500/50 focus:outline-none"
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
                  setCouponError("Unknown code. Contact support if you were given a manual offer.");
                }
              }}
              className="rounded-xl bg-stone-800 px-5 py-2.5 text-sm font-medium text-stone-200 transition-colors hover:bg-stone-700"
            >
              Check
            </button>
          </div>
          {couponApplied && (
            <p className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <Check size={12} />
              {discount}% planning discount recognized.
            </p>
          )}
          {couponError && <p className="mt-2 text-xs text-red-400">{couponError}</p>}
        </div>

        <div className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: Shield, label: "Staged Rollout", sub: "Billing is being enabled carefully" },
            { icon: Zap, label: "Manual Activation", sub: "The team currently handles plan changes" },
            { icon: MessageCircle, label: "Support Assisted", sub: "Membership requests go through support" },
            { icon: Users, label: "Founding Access", sub: "Some early offers may be handled manually" },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-xl border border-stone-800/60 bg-stone-900/40 p-4 text-center"
            >
              <Icon size={20} className="mb-2 text-haldi-400" />
              <p className="text-sm font-medium text-stone-200">{label}</p>
              <p className="mt-0.5 text-xs text-stone-500">{sub}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-serif text-stone-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, index) => (
              <div key={faq.q} className="overflow-hidden rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-stone-200 transition-colors hover:bg-stone-900/50"
                >
                  {faq.q}
                  {openFaq === index ? (
                    <ChevronUp size={15} className="ml-3 flex-shrink-0 text-stone-500" />
                  ) : (
                    <ChevronDown size={15} className="ml-3 flex-shrink-0 text-stone-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="border-t border-stone-800 px-5 pb-4 text-sm leading-relaxed text-stone-400">
                    <div className="pt-3">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-stone-900 pt-10 text-center">
          <p className="text-sm text-stone-500">
            Questions about membership?{" "}
            <a href="mailto:support@pravara.com" className="text-haldi-400 hover:underline">
              support@pravara.com
            </a>{" "}
            or visit the{" "}
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
