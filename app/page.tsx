import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Heart, SearchX, AlertTriangle, ScrollText } from "lucide-react";
import ChatDemo from "./components/ChatDemo";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  // Check if user is logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans selection:bg-haldi-500/30">
      
      {/* --- NEW: Navigation Bar --- */}
      <nav className="fixed top-0 w-full z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-900">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Smart Logo Area */}
          <div className="flex items-center gap-2">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-haldi-600 rounded-lg flex items-center justify-center text-stone-950 font-bold font-serif text-xl group-hover:scale-105 transition-transform">
                P
              </div>
              <span className="font-serif text-xl tracking-wide text-stone-100 group-hover:text-haldi-500 transition-colors">
                Pravara
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-8">
            {user ? (
              // IF LOGGED IN: Show Dashboard Button
              <Link 
                href="/dashboard" 
                className="bg-stone-100 hover:bg-white text-stone-950 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              // IF LOGGED OUT: Show Login/Signup
              <>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-400">
                  <Link href="/pricing" className="hover:text-haldi-500 transition-colors">Membership</Link>
                  <Link href="/login" className="hover:text-haldi-500 transition-colors">Sign In</Link>
                </div>
                
                <Link 
                  href="/signup" 
                  className="bg-stone-100 hover:bg-white text-stone-950 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-haldi-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/50 border border-stone-800 text-haldi-500 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Matchmaking for the Modern Era</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-stone-50 to-stone-400 leading-[1.1] mb-8 max-w-4xl mx-auto">
            Tradition meets Intelligence. <br/>
            <span className="text-stone-500">Find your perfect union.</span>
          </h1>
          
          <p className="text-lg text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The first matrimonial platform that understands your values, gothra, and compatibility using an AI Sutradhar, not just filters.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="group relative px-8 py-4 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-full transition-all hover:scale-105 min-w-[200px] flex items-center justify-center gap-2"
              >
                Return to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/signup" 
                  className="group relative px-8 py-4 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-full transition-all hover:scale-105 min-w-[200px] flex items-center justify-center gap-2"
                >
                  Start My Search
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/login"
                  className="px-8 py-4 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-medium rounded-full transition-all min-w-[200px]"
                >
                  Resume Journey
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Trust Badges (Visual Enrichment) --- */}
      <div className="border-y border-stone-900 bg-stone-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
           <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-haldi-500" />
                 <span className="font-serif text-lg">Verified Profiles</span>
              </div>
              <div className="flex items-center gap-3">
                 <Sparkles className="w-6 h-6 text-haldi-500" />
                 <span className="font-serif text-lg">AI Kundali Match</span>
              </div>
              <div className="flex items-center gap-3">
                 <Heart className="w-6 h-6 text-haldi-500" />
                 <span className="font-serif text-lg">Privacy First</span>
              </div>
           </div>
        </div>
      </div>

      {/* --- Sutradhar Demo Section --- */}
      <section className="relative z-10 w-full px-4 pb-24">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-200">
              Meet Your Digital Sutradhar
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              No more endless scrolling. Just a meaningful conversation that helps us understand who you truly are.
            </p>
          </div>
          <ChatDemo />
        </div>
      </section>

      {/* --- NEW: Problem/Features Section --- */}
      <section className="relative z-10 w-full bg-stone-900/30 border-y border-stone-800/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-100 mb-6">
              We know the questions that keep families awake
            </h2>
            <p className="text-stone-400 text-lg">
              Existing apps treat marriage like casual dating. We treat it like the union of two families.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1: Endless Scrolling */}
            <div className="p-8 rounded-2xl bg-stone-950/50 border border-stone-800 hover:border-haldi-500/30 transition-colors group">
              <div className="w-12 h-12 bg-stone-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-haldi-900/20 transition-colors">
                <SearchX className="w-6 h-6 text-stone-400 group-hover:text-haldi-500" />
              </div>
              <h3 className="text-xl font-serif text-stone-200 mb-3">Endless Scrolling Fatigue</h3>
              <p className="text-stone-500 leading-relaxed">
                Browsing hundreds of incompatible profiles with no guidance is exhausting. We replaced the search bar with a conversation.
              </p>
            </div>

            {/* Card 2: Cultural Mistakes */}
            <div className="p-8 rounded-2xl bg-stone-900/80 border border-stone-700 shadow-xl relative overflow-hidden group">
               {/* Highlight this card slightly as the 'Core' differentiator */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-haldi-600 to-kumkum-600" />
              <div className="w-12 h-12 bg-stone-950 rounded-lg flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-kumkum-500" />
              </div>
              <h3 className="text-xl font-serif text-stone-100 mb-3">Cultural Integrity</h3>
              <p className="text-stone-400 leading-relaxed">
                Generic platforms often miss critical nuances like Gothra and Sub-community. Our algorithms block same-Gothra matches automatically.
              </p>
            </div>

            {/* Card 3: Kundali */}
            <div className="p-8 rounded-2xl bg-stone-950/50 border border-stone-800 hover:border-haldi-500/30 transition-colors group">
              <div className="w-12 h-12 bg-stone-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-haldi-900/20 transition-colors">
                <ScrollText className="w-6 h-6 text-stone-400 group-hover:text-haldi-500" />
              </div>
              <h3 className="text-xl font-serif text-stone-200 mb-3">Vedic Compatibility</h3>
              <p className="text-stone-500 leading-relaxed">
                Don't wait until the end to find out the charts don't match. We integrate Kundali analysis right from the first connection.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}