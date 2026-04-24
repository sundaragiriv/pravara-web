"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowRight, ArrowLeft, Mail } from "lucide-react";
import { motion } from "framer-motion";

// ── Pixie dust — fixed positions within the logo's visual area ────────────────
// x/y are % offsets within the panel. The logo lives roughly 20–80% wide, 35–65% tall.
// dx/dy are pixel drift values (sparkles float up and slightly sideways as they fade).
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
      {/* Soft ambient pulse centred on the logo — makes it feel "elevated" */}
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

      {/* Individual pixie dust sparkles — each appears, drifts, fades independently */}
      {LOGO_SPARKLES.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: "radial-gradient(circle, #ffffff 20%, #ffd700 70%)",
            boxShadow: `0 0 ${s.size + 3}px ${Math.ceil(s.size / 2)}px rgba(255,215,0,0.75)`,
          }}
          animate={{
            x: [0, s.dx],
            y: [0, s.dy],
            opacity: [0, 1, 0.85, 0],
            scale: [0, 1.3, 0.9, 0],
          }}
          transition={{
            duration: s.dur,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 1.8 + s.delay * 0.4,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Inline brand SVGs ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden>
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#7FBA00"/>
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#FFB900"/>
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#F25022"/>
      <path d="M24 24H12.6V12.6H24V24z" fill="#00A4EF"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

type View = "login" | "forgot" | "forgot-sent";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setView("forgot-sent");
    }
  };

  const handleSocialLogin = async (provider: "google" | "azure" | "apple") => {
    setSocialLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-stone-950 font-sans">

      {/* ── LEFT COLUMN: Full-bleed Logo ────────────────────────────────────── */}
      <div className="relative hidden lg:flex items-center justify-center h-screen overflow-hidden border-r border-stone-900 bg-stone-900">
        {/* Ambient glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-haldi-500/[0.06] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-kumkum-900/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Pixie dust shimmer */}
        <PixieDustShimmer />

        {/* Logo fills the entire panel */}
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <Image
            src="/logo3.png"
            alt="Pravara"
            fill
            className="object-contain [mix-blend-mode:lighten] p-16"
            priority
          />
        </div>

        {/* Golden shining tagline */}
        <div className="absolute bottom-12 left-0 right-0 text-center px-8">
          <p className="font-serif text-2xl font-bold tracking-wide text-gold-shine">
            Tradition meets Intelligence
          </p>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Interaction ────────────────────────────────────────── */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-md mx-auto w-full space-y-8">

          {/* Mobile logo */}
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

          {/* ── Forgot-sent confirmation ─────────────────────────────────── */}
          {view === "forgot-sent" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-haldi-900/20 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-haldi-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-serif text-stone-50 mb-2">Check your inbox</h1>
                <p className="text-stone-400 text-sm leading-relaxed">
                  We sent a reset link to{" "}
                  <span className="text-stone-200 font-medium">{email}</span>.
                  It expires in 1 hour.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setView("login"); setError(null); }}
                className="flex items-center gap-2 text-haldi-500 hover:text-haldi-400 text-sm font-medium mx-auto transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </div>
          )}

          {/* ── Forgot Password form ─────────────────────────────────────── */}
          {view === "forgot" && (
            <>
              <div>
                <button
                  type="button"
                  onClick={() => { setView("login"); setError(null); }}
                  className="flex items-center gap-2 text-stone-500 hover:text-stone-300 text-sm mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-3xl font-serif text-stone-50 mb-2">Reset Password</h1>
                <p className="text-stone-400 text-sm">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-haldi-500 transition-colors"
                    placeholder="name@example.com"
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
                  className="w-full bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <><Mail className="w-5 h-5" /> Send Reset Link</>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── Main Login form ──────────────────────────────────────────── */}
          {view === "login" && (
            <>
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-serif text-stone-50 mb-2">Welcome Back</h1>
                <p className="text-stone-400">Enter your credentials to access Sutradhar.</p>
              </div>

              {/* Social logins */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={!!socialLoading}
                  className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium py-3 rounded-xl transition-all"
                >
                  {socialLoading === "google" ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("azure")}
                  disabled={!!socialLoading}
                  className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium py-3 rounded-xl transition-all"
                >
                  {socialLoading === "azure" ? <Loader2 className="w-5 h-5 animate-spin" /> : <MicrosoftIcon />}
                  Continue with Microsoft
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("apple")}
                  disabled={!!socialLoading}
                  className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-200 font-medium py-3 rounded-xl transition-all"
                >
                  {socialLoading === "apple" ? <Loader2 className="w-5 h-5 animate-spin" /> : <AppleIcon />}
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-stone-950 px-3 text-stone-500 tracking-widest">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-haldi-500 transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Password</label>
                      <button
                        type="button"
                        onClick={() => { setView("forgot"); setError(null); }}
                        className="text-xs text-haldi-500 hover:text-haldi-400 transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-stone-200 focus:outline-none focus:border-haldi-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Resume Journey"}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="text-center pt-4 border-t border-stone-900">
                <p className="text-stone-500 text-sm">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-haldi-500 hover:text-haldi-400 font-medium">
                    Begin here
                  </Link>
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
