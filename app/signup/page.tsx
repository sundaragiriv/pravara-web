"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Mail, Lock, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user created");

      // 2. Create Profile Entry (only required fields)
      // Skip if email confirmation is required (user won't be authenticated yet)
      if (authData.session) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: email,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't throw - profile can be created later via trigger or webhook
        }
      }

      // 3. Success! Redirect to Onboarding (or show "check email" message)
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
      
      {/* --- LEFT SIDE: The "Heritage" Brand Panel --- */}
      {/* Hidden on mobile, full width on desktop */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-stone-900 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-haldi-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-kumkum-900/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-haldi-500 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="relative z-10 space-y-8 max-w-lg">
           {/* Logo Mark */}
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-haldi-500 to-haldi-700 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(251,191,36,0.5)]">
              <span className="font-serif text-3xl text-stone-950 font-bold">P</span>
           </div>
           
           <h1 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-stone-50 to-stone-400 leading-tight">
             Begin your journey to a meaningful union.
           </h1>
           
           <div className="space-y-4 pt-4">
             <div className="flex items-center gap-3 text-stone-400">
               <CheckCircle2 className="w-5 h-5 text-haldi-500" />
               <span>AI Sutradhar that learns your values</span>
             </div>
             <div className="flex items-center gap-3 text-stone-400">
               <CheckCircle2 className="w-5 h-5 text-haldi-500" />
               <span>Verified profiles (No catfishing)</span>
             </div>
             <div className="flex items-center gap-3 text-stone-400">
               <CheckCircle2 className="w-5 h-5 text-haldi-500" />
               <span>Kundali & Gothra compatibility built-in</span>
             </div>
           </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10">
          <p className="font-serif italic text-stone-500">"Tradition meets Intelligence"</p>
        </div>
      </div>

      {/* --- RIGHT SIDE: The Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Mobile Background Effects (Visible only on small screens) */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-haldi-500/10 rounded-full blur-[80px] pointer-events-none lg:hidden" />
        
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Header (Only shows on mobile) */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 text-stone-500 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-haldi-500 to-haldi-700 flex items-center justify-center mb-4">
              <span className="font-serif text-2xl text-stone-950 font-bold">P</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-stone-100">Create Account</h2>
            <p className="text-stone-400">Enter your details to access the private beta.</p>
          </div>

          {/* Form Logic Connected Here */}
          <form onSubmit={handleSignup} className="space-y-5">
            
            {/* Error Message Display */}
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
                  required
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/50 transition-all"
                />
              </div>
            </div>

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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-haldi-600 to-haldi-700 hover:from-haldi-500 hover:to-haldi-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-haldi-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Start My Search
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-haldi-500 hover:text-haldi-400 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
