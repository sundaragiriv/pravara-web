import Link from "next/link";
import { ArrowRight, Sparkles, SearchX, AlertTriangle, ScrollText } from "lucide-react";
import ChatDemo from "./components/ChatDemo";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden bg-stone-950">
      
      {/* --- Ambient Background Effects [cite: 60, 83] --- */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-haldi-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-kumkum-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Hero Section --- */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 text-center space-y-8">
        
        {/* Subtle Cultural Motif/Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/50 border border-stone-800 backdrop-blur-md text-haldi-500 text-sm font-medium animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>Tradition meets Intelligence</span>
        </div>

        {/* Hero Headline [cite: 487] */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-stone-200 to-stone-400 drop-shadow-sm leading-tight">
          परिवार की तरह, <br className="hidden md:block" />
          <span className="text-haldi-500/90">Technology</span> से बेहतर
        </h1>

        {/* Subheadline [cite: 488] */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-400 font-light leading-relaxed">
          Where AI understands your heart, and tradition guides your path.
          Join the platform designed for the global Brahmin diaspora.
        </p>

        {/* CTA Button [cite: 489] */}
        <div className="pt-4">
          <Link 
            href="/signup"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-haldi-600 to-haldi-700 text-white rounded-full font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]"
          >
            Begin Your Journey
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          
          {/* Social Proof Text [cite: 490] */}
          <p className="mt-6 text-sm text-stone-600">
            Join 100+ founding members in the private beta
          </p>
        </div>
      </section>

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

      {/* --- Footer Texture Overlay --- */}
      <div className="absolute inset-0 bg-stone-950 opacity-10 pointer-events-none mix-blend-overlay"></div>
    </main>
  );
}