"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Mail, Lock, ArrowRight, CheckCircle2, Loader2, AlertCircle, Phone, Users } from "lucide-react";

// Who the profile is being created for → inferred gender
const PROFILE_FOR_OPTIONS = [
  { label: "Myself", value: "Self", gender: null },
  { label: "My Son", value: "Son", gender: "Male" },
  { label: "My Daughter", value: "Daughter", gender: "Female" },
  { label: "My Brother", value: "Brother", gender: "Male" },
  { label: "My Sister", value: "Sister", gender: "Female" },
  { label: "A Relative / Friend", value: "Relative/Friend", gender: null },
];

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profileFor, setProfileFor] = useState("Self");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive inferred gender from profileFor selection
  const inferredGender =
    PROFILE_FOR_OPTIONS.find((o) => o.value === profileFor)?.gender ?? null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // 1. Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user created");

      // 2. Create Profile Entry with new fields
      if (authData.session) {
        const profilePayload: Record<string, string> = {
          id: authData.user.id,
          email,
          phone,
          profile_created_for: profileFor,
        };

        // Auto-set gender if it can be inferred (Son/Daughter/Brother/Sister)
        if (inferredGender) {
          profilePayload.gender = inferredGender;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .insert(profilePayload);

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      }

      // 3. Redirect or show confirmation
      if (authData.session) {
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
    <div className="min-h-screen w-full flex bg-stone-950 text-stone-50 font-sans overflow-hidden">

      {/* ── LEFT PANEL: Heritage Brand ── */}
      <div className="hidden lg:flex w-1/2 relative flex-col p-12 bg-stone-900 overflow-hidden">

        {/* Ambient gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-haldi-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-kumkum-900/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Back link */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-haldi-500 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* ── LOGO — Hero of the left panel ── */}
        <div className="relative z-10 flex flex-col items-center mt-16 mb-10">
          <Image
            src="/logo3.png"
            alt="Pravara"
            width={240}
            height={82}
            className="object-contain [mix-blend-mode:lighten]"
            priority
          />
          {/* Gold divider */}
          <div className="mt-5 w-24 h-px bg-gradient-to-r from-transparent via-haldi-500/60 to-transparent" />
          <p className="mt-4 font-serif italic text-haldi-500/80 text-sm tracking-wide">
            "Tradition meets Intelligence"
          </p>
        </div>

        {/* Headline + bullets */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <h1 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-stone-50 to-stone-400 leading-tight">
            Begin your journey to a meaningful union.
          </h1>

          <div className="space-y-4 pt-2">
            {[
              "AI Sutradhar that learns your values",
              "Verified profiles — no catfishing",
              "Nakshatra, Gothra & Kundali compatibility built-in",
              "Family Guardian Mode for trusted matchmaking",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-stone-400">
                <CheckCircle2 className="w-5 h-5 text-haldi-500 flex-shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">

        {/* Mobile ambient effect */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-haldi-500/10 rounded-full blur-[80px] pointer-events-none lg:hidden" />

        <div className="w-full max-w-md space-y-7">

          {/* Mobile header */}
          <div className="lg:hidden mb-6">
            <Link href="/" className="flex items-center gap-2 text-stone-500 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <Image
              src="/logo3.png"
              alt="Pravara"
              width={160}
              height={54}
              className="object-contain [mix-blend-mode:lighten] mb-4"
              priority
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-serif text-stone-100">Create Account</h2>
            <p className="text-stone-400 text-sm">
              Join the private beta — your journey begins here.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ── Creating profile for ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300 ml-1">
                Creating this profile for
              </label>
              <div className="relative group">
                <Users className="absolute left-4 top-3.5 w-5 h-5 text-stone-500 group-focus-within:text-haldi-500 transition-colors pointer-events-none" />
                <select
                  value={profileFor}
                  onChange={(e) => setProfileFor(e.target.value)}
                  required
                  title="Creating this profile for"
                  aria-label="Creating this profile for"
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-100 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/50 transition-all appearance-none cursor-pointer"
                >
                  {PROFILE_FOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-stone-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {/* Chevron */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {/* Auto-inferred gender hint */}
              {inferredGender && (
                <p className="text-xs text-haldi-600 ml-1">
                  ✦ Profile gender auto-set to <strong>{inferredGender}</strong> — you can update this in onboarding
                </p>
              )}
            </div>

            {/* ── Email ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-500 group-focus-within:text-haldi-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/50 transition-all"
                />
              </div>
            </div>

            {/* ── Mobile Number ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300 ml-1">
                Mobile Number <span className="text-haldi-600">*</span>
              </label>
              <div className="relative group flex">
                {/* Country code prefix */}
                <span className="flex items-center px-3 bg-stone-800 border border-r-0 border-stone-700 rounded-l-xl text-stone-400 text-sm font-medium">
                  +91
                </span>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-stone-500 group-focus-within:text-haldi-500 transition-colors" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    required
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit mobile number"
                    className="w-full bg-stone-900/50 border border-stone-800 rounded-r-xl py-3 pl-10 pr-4 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ── Password ── */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-500 group-focus-within:text-haldi-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/50 transition-all"
                />
              </div>
            </div>

            {/* ── CTA ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-haldi-600 to-haldi-700 hover:from-haldi-500 hover:to-haldi-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-haldi-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating Account…
                </>
              ) : (
                <>
                  Begin My Journey with Narada AI
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* ── Legal text ── */}
            <p className="text-center text-stone-500 text-[11px] leading-relaxed px-2">
              By clicking &ldquo;Begin My Journey with Narada AI&rdquo;, you confirm that you are
              18 years or older and agree to our{" "}
              <Link href="/terms" className="text-haldi-600 hover:text-haldi-400 underline underline-offset-2">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-haldi-600 hover:text-haldi-400 underline underline-offset-2">
                Privacy Policy
              </Link>
              . Pravara may use your contact information to send important account and
              service notifications.
            </p>
          </form>

          <p className="text-center text-stone-500 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-haldi-500 hover:text-haldi-400 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
