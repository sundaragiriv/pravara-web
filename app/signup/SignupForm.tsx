"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowRight, Mail, CheckCircle2 } from "lucide-react";

// Brand icons kept inline to mirror the login screen exactly.
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden>
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#7FBA00" />
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#FFB900" />
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#F25022" />
      <path d="M24 24H12.6V12.6H24V24z" fill="#00A4EF" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName.trim() },
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    // If email confirmation is required, no session is returned — show the
    // "check your inbox" state. If confirmations are disabled, a session exists
    // and the auth callback / middleware will route the user onward.
    if (data.session) {
      window.location.assign("/onboarding");
      return;
    }
    setSent(true);
  };

  const handleSocialSignup = async (provider: "google" | "azure" | "apple") => {
    setSocialLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
      <div className="max-w-md mx-auto w-full space-y-8">
        <div className="lg:hidden flex justify-center mb-8">
          <Image
            src="/logo3.png"
            alt="Pravara"
            width={130}
            height={44}
            className="object-contain [mix-blend-mode:lighten]"
            priority
          />
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-haldi-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-haldi-500" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-serif text-stone-50 mb-2">Confirm your email</h1>
              <p className="text-stone-400 text-sm leading-relaxed">
                We sent a confirmation link to{" "}
                <span className="text-stone-200 font-medium">{email}</span>. Click it to activate
                your account and start your profile.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-haldi-500 hover:text-haldi-400 text-sm font-medium"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-serif text-stone-50 mb-2">Begin your journey</h1>
              <p className="text-stone-400">Create your Pravara account.</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialSignup("google")}
                disabled={!!socialLoading}
                className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium py-3 rounded-xl transition-all"
              >
                {socialLoading === "google" ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup("azure")}
                disabled={!!socialLoading}
                className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium py-3 rounded-xl transition-all"
              >
                {socialLoading === "azure" ? <Loader2 className="w-5 h-5 animate-spin" /> : <MicrosoftIcon />}
                Continue with Microsoft
              </button>
              <button
                type="button"
                onClick={() => handleSocialSignup("apple")}
                disabled={!!socialLoading}
                className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium py-3 rounded-xl transition-all"
              >
                {socialLoading === "apple" ? <Loader2 className="w-5 h-5 animate-spin" /> : <AppleIcon />}
                Continue with Apple
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-stone-950 px-3 text-stone-500 tracking-widest">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-haldi-500 transition-colors"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-haldi-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-haldi-500 transition-colors"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-haldi-500 transition-colors"
                  placeholder="Re-enter your password"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs leading-relaxed text-stone-500 text-center">
                By creating an account you agree to Pravara&apos;s{" "}
                <Link href="/legal/terms" className="text-haldi-500 hover:text-haldi-400">Terms</Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="text-haldi-500 hover:text-haldi-400">Privacy Policy</Link>.
              </p>
            </form>

            <div className="text-center pt-4 border-t border-stone-900">
              <p className="text-stone-500 text-sm flex items-center justify-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                Already have an account?{" "}
                <Link href="/login" className="text-haldi-500 hover:text-haldi-400 font-medium">
                  Login
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
