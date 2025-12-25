"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";

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
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-stone-950 font-sans">
      
      {/* LEFT COLUMN: The Brand Statement */}
      <div className="relative hidden lg:flex h-screen overflow-hidden border-r border-stone-900 bg-stone-900">
        {/* The Royal Logo Image */}
        <img 
          src="/pravara-gold-logo.png" 
          alt="Pravara Royal Logo" 
          className="w-full h-full object-cover"
        />
        {/* Subtle Overlay to ensure it doesn't overpower */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/30 via-transparent to-stone-950/30 pointer-events-none" />
      </div>

      {/* RIGHT COLUMN: The Interaction */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-md mx-auto w-full space-y-8">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex justify-center mb-8">
             <div className="w-12 h-12 bg-haldi-600 rounded-lg flex items-center justify-center text-stone-950 font-bold font-serif text-2xl">
               P
             </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-serif text-stone-50 mb-2">Welcome Back</h1>
            <p className="text-stone-400">Enter your credentials to access Sutradhar.</p>
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
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Password</label>
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

        </div>
      </div>
    </div>
  );
}
