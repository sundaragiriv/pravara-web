"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ── Pixie dust — mirrors the login page exactly ───────────────────────────────
const LOGO_SPARKLES = [
  { id: 0,  left: "27%", top: "41%", size: 6, delay: 0.0,  dur: 1.9, dx:  4, dy: -22 },
  { id: 1,  left: "48%", top: "36%", size: 4, delay: 0.35, dur: 1.7, dx: -3, dy: -18 },
  { id: 2,  left: "63%", top: "46%", size: 3, delay: 0.7,  dur: 2.1, dx:  5, dy: -24 },
  { id: 3,  left: "34%", top: "53%", size: 5, delay: 1.1,  dur: 1.8, dx: -5, dy: -20 },
  { id: 4,  left: "56%", top: "57%", size: 3, delay: 0.5,  dur: 2.3, dx:  3, dy: -16 },
  { id: 5,  left: "41%", top: "44%", size: 4, delay: 1.5,  dur: 1.9, dx: -4, dy: -26 },
  { id: 6,  left: "71%", top: "49%", size: 3, delay: 0.9,  dur: 1.6, dx:  6, dy: -14 },
  { id: 7,  left: "22%", top: "56%", size: 5, delay: 1.85, dur: 2.0, dx: -2, dy: -20 },
  { id: 8,  left: "59%", top: "39%", size: 4, delay: 0.2,  dur: 2.2, dx:  4, dy: -28 },
  { id: 9,  left: "44%", top: "61%", size: 3, delay: 1.3,  dur: 1.7, dx: -6, dy: -16 },
  { id: 10, left: "31%", top: "43%", size: 6, delay: 2.1,  dur: 1.9, dx:  3, dy: -22 },
  { id: 11, left: "67%", top: "55%", size: 4, delay: 0.6,  dur: 1.8, dx: -4, dy: -18 },
  { id: 12, left: "51%", top: "47%", size: 3, delay: 1.65, dur: 2.1, dx:  5, dy: -20 },
  { id: 13, left: "38%", top: "60%", size: 5, delay: 0.4,  dur: 2.0, dx: -3, dy: -26 },
  { id: 14, left: "75%", top: "41%", size: 3, delay: 1.05, dur: 1.7, dx:  4, dy: -14 },
  { id: 15, left: "25%", top: "50%", size: 4, delay: 2.4,  dur: 1.9, dx: -5, dy: -20 },
];

function PixieDustShimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          width: "62%", height: "38%",
          background: "radial-gradient(ellipse, rgba(255,215,0,0.09) 0%, transparent 72%)",
        }}
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {LOGO_SPARKLES.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.left, top: s.top,
            width: s.size, height: s.size,
            background: "radial-gradient(circle, #ffffff 20%, #ffd700 70%)",
            boxShadow: `0 0 ${s.size + 3}px ${Math.ceil(s.size / 2)}px rgba(255,215,0,0.75)`,
          }}
          animate={{ x: [0, s.dx], y: [0, s.dy], opacity: [0, 1, 0.85, 0], scale: [0, 1.3, 0.9, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, repeatDelay: 1.8 + s.delay * 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const PROFILE_FOR_OPTIONS = [
  { label: "Myself",            value: "Self",            gender: null     },
  { label: "My Son",            value: "Son",             gender: "Male"   },
  { label: "My Daughter",       value: "Daughter",        gender: "Female" },
  { label: "My Brother",        value: "Brother",         gender: "Male"   },
  { label: "My Sister",         value: "Sister",          gender: "Female" },
  { label: "A Relative / Friend", value: "Relative/Friend", gender: null   },
];

const COUNTRY_CODES = [
  { code: "+1",   flag: "🇺🇸", label: "USA / Canada" },
  { code: "+91",  flag: "🇮🇳", label: "India"        },
  { code: "+44",  flag: "🇬🇧", label: "UK"           },
  { code: "+61",  flag: "🇦🇺", label: "Australia"    },
  { code: "+971", flag: "🇦🇪", label: "UAE"          },
  { code: "+65",  flag: "🇸🇬", label: "Singapore"    },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();
  const [profileFor, setProfileFor]   = useState("Self");
  const [email,      setEmail]        = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone,      setPhone]        = useState("");
  const [password,   setPassword]     = useState("");
  const [loading,    setLoading]      = useState(false);
  const [error,      setError]        = useState<string | null>(null);

  const inferredGender =
    PROFILE_FOR_OPTIONS.find((o) => o.value === profileFor)?.gender ?? null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("No user created");

      if (authData.session) {
        const profilePayload: Record<string, string> = {
          id: authData.user.id,
          email,
          phone: `${countryCode}${phone}`,
          profile_created_for: profileFor,
        };
        if (inferredGender) profilePayload.gender = inferredGender;

        const { error: profileError } = await supabase
          .from("profiles")
          .insert(profilePayload);
        if (profileError) console.error("Profile creation error:", profileError);

        router.push("/onboarding");
      } else {
        setError("Please check your email to confirm your account!");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-stone-950 font-sans">

      {/* ── LEFT COLUMN: Full-bleed Logo (mirrors login) ── */}
      <div className="relative hidden lg:flex items-center justify-center h-screen overflow-hidden border-r border-stone-900 bg-stone-900">
        {/* Ambient glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-haldi-500/[0.06] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-kumkum-900/15 rounded-full blur-[120px] pointer-events-none" />

        <PixieDustShimmer />

        {/* Logo fills panel */}
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <Image
            src="/logo3.png"
            alt="Pravara"
            fill
            className="object-contain [mix-blend-mode:lighten] p-16"
            priority
          />
        </div>

        {/* Golden tagline at bottom */}
        <div className="absolute bottom-12 left-0 right-0 text-center px-8">
          <p className="font-serif text-2xl font-bold tracking-wide text-gold-shine">
            Tradition meets Intelligence
          </p>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Form ── */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 overflow-y-auto">
        <div className="max-w-md mx-auto w-full space-y-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <Image
              src="/logo3.png"
              alt="Pravara"
              width={130}
              height={44}
              className="object-contain [mix-blend-mode:lighten]"
              priority
            />
          </div>

          {/* Heading */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-serif text-stone-50 mb-1">Create Account</h1>
            <p className="text-stone-400 text-sm">Join the private beta — your journey begins here.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* ── Creating profile for ── */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Creating this profile for
              </label>
              <select
                value={profileFor}
                onChange={(e) => setProfileFor(e.target.value)}
                required
                title="Creating this profile for"
                aria-label="Creating this profile for"
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-haldi-500 transition-colors appearance-none cursor-pointer"
              >
                {PROFILE_FOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-stone-900">
                    {opt.label}
                  </option>
                ))}
              </select>
              {inferredGender && (
                <p className="text-[11px] text-haldi-600 mt-1.5 ml-1">
                  ✦ Profile gender auto-set to <strong>{inferredGender}</strong> — editable in onboarding
                </p>
              )}
            </div>

            {/* ── Email ── */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500 transition-colors"
              />
            </div>

            {/* ── Mobile Number ── */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Mobile Number <span className="text-haldi-600 normal-case font-normal">— required</span>
              </label>
              <div className="flex">
                {/* Country code selector */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  title="Country code"
                  aria-label="Country code"
                  className="bg-stone-800 border border-stone-700 border-r-0 rounded-l-xl px-3 py-3 text-stone-300 text-sm focus:outline-none focus:border-haldi-500 transition-colors appearance-none cursor-pointer flex-shrink-0"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-stone-900">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="Mobile number"
                  required
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-r-xl px-4 py-3 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500 transition-colors min-w-0"
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500 transition-colors"
              />
            </div>

            {/* ── CTA ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Begin My Journey with Narada AI <ArrowRight className="w-5 h-5" /></>
              )}
            </button>

            {/* ── Legal consent ── */}
            <p className="text-center text-stone-500 text-[11px] leading-relaxed px-1">
              By clicking &ldquo;Begin My Journey with Narada AI&rdquo;, you confirm you are 18 years
              or older and agree to our{" "}
              <Link href="/terms" className="text-haldi-600 hover:text-haldi-400 underline underline-offset-2 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-haldi-600 hover:text-haldi-400 underline underline-offset-2 transition-colors">
                Privacy Policy
              </Link>
              . Pravara may use your contact information for account and service notifications.
            </p>
          </form>

          <div className="text-center pt-2 border-t border-stone-900">
            <p className="text-stone-500 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-haldi-500 hover:text-haldi-400 font-medium transition-colors">
                Resume Journey
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
