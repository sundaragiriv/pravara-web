"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full flex bg-stone-950 text-stone-50 font-sans overflow-hidden">
      
      {/* --- LEFT SIDE: The "Heritage" Brand Panel --- */}
      {/* Hidden on mobile, full width on desktop */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-stone-900 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-haldi-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-kumkum-900/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

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

          {/* Form */}
          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-stone-500 group-focus-within:text-haldi-500 transition-colors" />
                <input 
                  type="email" 
                  placeholder="you@example.com"
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
                  placeholder="••••••••"
                  className="w-full bg-stone-900/50 border border-stone-800 rounded-xl py-3 pl-12 pr-4 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/50 transition-all"
                />
              </div>
            </div>

            <Link href="/onboarding" className="w-full">
              <button 
                type="button"
                className="w-full bg-gradient-to-r from-haldi-600 to-haldi-700 hover:from-haldi-500 hover:to-haldi-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-haldi-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Start My Search
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-stone-950 px-2 text-stone-500">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons (Placeholders) */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors">
               <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M14.25.18l.9.2.73.26.59.3.5.32.52.34.5.36.5.38.48.4.45.41.42.41.4.42.37.42.36.42.32.43.3.42.28.42.25.41.22.41.2.4.16.4.15.39.12.4.1.38.08.38.06.38.04.36.02.34.01.32.01.3v3.81l-.01.3-.01.32-.02.34-.04.36-.06.38-.08.38-.1.38-.12.4-.15.39-.16.4-.2.4-.22.41-.25.41-.28.42-.3.42-.32.43-.36.42-.37.42-.4.42-.42.41-.45.41-.48.4-.5.38-.5.36-.52.34-.5.32-.59.3-.73.26-.9.2H9.75l-.9-.2-.73-.26-.59-.3-.5-.32-.52-.34-.5-.36-.5-.38-.48-.4-.45-.41-.42-.41-.4-.42-.37-.42-.36-.42-.32-.43-.3-.42-.28-.42-.25-.41-.22-.41-.2-.4-.16-.4-.15-.39-.12-.4-.1-.38-.08-.38-.06-.38-.04-.36-.02-.34-.01-.32-.01-.3V5.88l.01-.3.01-.32.02-.34.04-.36.06-.38.08-.38.1-.38.12-.4.15-.39.16-.4.2-.4.22-.41.25-.41.28-.42.3-.42.32-.43.36-.42.37-.42.4-.42.42-.41.45-.41.48-.4.5-.38.5-.36.52-.34.5-.32.59-.3.73-.26.9-.2h4.5zM12 2.63c2.45 0 4.63.88 6.34 2.34l-2.5 2.5c-.88-.85-2.13-1.44-3.84-1.44-3.28 0-5.94 2.66-5.94 5.94s2.66 5.94 5.94 5.94c3.03 0 4.88-1.94 5.09-4.44h-5.09V10.2h8.72c.1.53.16 1.13.16 1.72 0 4.28-2.88 7.34-7.38 7.34-4.28 0-7.81-3.53-7.81-7.81s3.53-7.81 7.81-7.81z"/></svg>
              Apple
            </button>
          </div>

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
