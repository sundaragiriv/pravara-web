"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Success! Go to Dashboard (or Onboarding if they aren't done)
      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-stone-950 text-stone-50 font-sans overflow-hidden">
      
      {/* Left Side (Brand) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-stone-900 overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-haldi-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-kumkum-900/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-haldi-500 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-haldi-500 to-haldi-700 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(251,191,36,0.5)]">
              <span className="font-serif text-3xl text-stone-950 font-bold">P</span>
           </div>
           <h1 className="text-4xl font-serif text-stone-200 leading-tight">
             Welcome back to Pravara.
           </h1>
        </div>

        <div className="relative z-10">
          <p className="font-serif italic text-stone-500">"Tradition meets Intelligence"</p>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-stone-100">Log In</h2>
            <p className="text-stone-400">Continue your search.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-200 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-500 group-focus-within:text-haldi-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-100 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-stone-300 ml-1">Password</label>
                <a href="#" className="text-xs text-haldi-500 hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-stone-500 group-focus-within:text-haldi-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-100 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/50 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-stone-100 hover:bg-white text-stone-950 font-bold py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log In"}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-haldi-500 hover:text-haldi-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
