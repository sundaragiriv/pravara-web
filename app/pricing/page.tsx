"use client";

import Link from "next/link";
import { Check, X, Sparkles, Crown, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      
      {/* Header */}
      <nav className="p-6 flex items-center justify-between border-b border-stone-900 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard" className="font-serif text-2xl font-bold bg-gradient-to-r from-haldi-500 to-haldi-700 bg-clip-text text-transparent">
          P
        </Link>
        <Link href="/dashboard" className="text-sm text-stone-400 hover:text-stone-200">
          Close
        </Link>
      </nav>

      <main className="container mx-auto px-4 py-16">
        
        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-100">
            Invest in your <span className="text-haldi-500">legacy</span>.
          </h1>
          <p className="text-stone-400 text-lg">
            Choose the plan that best honors your search for a life partner.
          </p>
        </div>

        {/* Pricing Grid  */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* 1. FREE TIER */}
          <div className="p-8 rounded-3xl bg-stone-900/30 border border-stone-800 flex flex-col relative">
            <div className="mb-6">
              <h3 className="text-xl font-serif text-stone-200">Guest</h3>
              <div className="text-3xl font-bold text-stone-100 mt-2">$0<span className="text-sm font-normal text-stone-500">/mo</span></div>
              <p className="text-sm text-stone-500 mt-2">For getting started</p>
            </div>
            
            <button className="w-full py-3 rounded-xl border border-stone-700 text-stone-300 font-medium hover:bg-stone-800 transition-colors mb-8">
              Current Plan
            </button>

            <div className="space-y-4 flex-1">
              <Feature text="AI Sutradhar (Limited)" included={true} />
              <Feature text="3 Contacts / Month" included={true} />
              <Feature text="Basic Kundali Matching" included={true} />
              <Feature text="In-App Chat" included={false} />
              <Feature text="Video Calling" included={false} />
              <Feature text="Background Check" included={false} />
            </div>
          </div>

          {/* 2. GOLD TIER (Most Popular) [cite: 509] */}
          <motion.div 
            initial={{ y: 0 }}
            whileHover={{ y: -10 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border border-haldi-500/50 flex flex-col relative shadow-[0_0_50px_-20px_rgba(251,191,36,0.2)]"
          >
            {/* Badge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-haldi-600 text-stone-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Most Popular
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-serif text-haldi-500">Gold</h3>
              <div className="text-3xl font-bold text-stone-100 mt-2">$49<span className="text-sm font-normal text-stone-500">/mo</span></div>
              <p className="text-sm text-stone-500 mt-2">For serious seekers</p>
            </div>
            
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-haldi-600 to-amber-600 text-stone-950 font-bold hover:shadow-lg hover:from-haldi-500 hover:to-amber-500 transition-all mb-8">
              Upgrade to Gold
            </button>

            <div className="space-y-4 flex-1">
              <Feature text="Unlimited AI Sutradhar" included={true} highlight />
              <Feature text="Unlimited Contacts" included={true} highlight />
              <Feature text="Full 36-Point Kundali" included={true} />
              <Feature text="In-App Chat (Text)" included={true} />
              <Feature text="2x Profile Visibility" included={true} />
              <Feature text="Video Calling" included={false} />
            </div>
          </motion.div>

          {/* 3. CONCIERGE TIER */}
          <div className="p-8 rounded-3xl bg-stone-900/30 border border-stone-800 flex flex-col relative overflow-hidden">
             {/* Subtle background pattern */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-kumkum-900/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-6 relative z-10">
              <h3 className="text-xl font-serif text-stone-200 flex items-center gap-2">
                Concierge <Crown className="w-4 h-4 text-haldi-600" />
              </h3>
              <div className="text-3xl font-bold text-stone-100 mt-2">$299<span className="text-sm font-normal text-stone-500">/mo</span></div>
              <p className="text-sm text-stone-500 mt-2">Hand-held guidance</p>
            </div>
            
            <button className="w-full py-3 rounded-xl bg-stone-100 text-stone-950 font-bold hover:bg-white transition-colors mb-8 relative z-10">
              Apply for Concierge
            </button>

            <div className="space-y-4 flex-1 relative z-10">
              <Feature text="Everything in Gold" included={true} />
              <Feature text="Dedicated Human Matchmaker" included={true} />
              <Feature text="Family Background Check" included={true} />
              <Feature text="Astrologer Consultation (1/mo)" included={true} />
              <Feature text="Scheduled Video Calls" included={true} />
            </div>
          </div>

        </div>

        {/* Trust Footer [cite: 513] */}
        <div className="mt-16 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-stone-500 text-sm">
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure Payment</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Cancel Anytime</span>
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> 7-Day Money-Back Guarantee</span>
            </div>
        </div>
      </main>
    </div>
  );
}

// Helper component for list items
function Feature({ text, included, highlight = false }: { text: string, included: boolean, highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-3 text-sm ${included ? (highlight ? 'text-stone-100 font-medium' : 'text-stone-300') : 'text-stone-600'}`}>
      {included ? (
        <Check className={`w-5 h-5 shrink-0 ${highlight ? 'text-haldi-500' : 'text-haldi-600/70'}`} />
      ) : (
        <X className="w-5 h-5 shrink-0" />
      )}
      <span className={!included ? 'line-through decoration-stone-700' : ''}>{text}</span>
    </div>
  );
}
