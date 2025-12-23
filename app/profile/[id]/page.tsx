"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, CheckCircle2, Star, ShieldCheck, Heart, MessageCircle, Video } from "lucide-react";
import { motion } from "framer-motion";

// Mock Data for a single profile (Priya) [cite: 37-42]
const PROFILE = {
  id: "1",
  name: "Priya Sundaresan",
  age: 28,
  location: "Fremont, CA",
  profession: "Senior Software Engineer at Google",
  education: "MS in Computer Science, Stanford University",
  bio: "I appreciate a balance of ambition and grounding. Weekends are for hiking in the Bay Area or learning Carnatic music. Looking for someone who understands that my career and my culture are both non-negotiable.",
  images: ["/api/placeholder/600/800"], // Main photo
  cultural: {
    gothra: "Kashyapa",
    subCommunity: "Iyer (Vadama)",
    nakshatra: "Rohini",
    rashi: "Vrishabha (Taurus)",
    languages: ["Tamil", "English", "Hindi"],
    diet: "Vegetarian"
  },
  compatibility: {
    total: 94,
    guna_milan: 33, // Out of 36
    ai_score: 96,
    pros: ["Excellent Gana alignment", "Both value career + family balance", "Shared dietary preferences"],
    cons: ["Geographic distance (currently)"],
  }
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch data using params.id

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans pb-20">
      
      {/* --- Sticky Header --- */}
      <div className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-900 px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Matches</span>
        </Link>
        <span className="font-serif text-lg text-stone-200">Match #8042</span>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      <main className="container mx-auto max-w-5xl px-4 py-8 grid md:grid-cols-[1.2fr_0.8fr] gap-8">
        
        {/* --- LEFT COLUMN: Photos & Bio --- */}
        <div className="space-y-8">
          
          {/* Photo Card */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-stone-900 border border-stone-800 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
            
            {/* Placeholder for Image */}
            <div className="absolute inset-0 flex items-center justify-center text-stone-700 bg-stone-900">
               <span className="text-sm">[Profile Photo Placeholder]</span>
            </div>

            {/* Quick Actions Overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-serif text-stone-100">{PROFILE.name}, {PROFILE.age}</h1>
                <div className="flex items-center gap-2 text-stone-300 mt-1">
                  <MapPin className="w-4 h-4 text-haldi-500" /> {PROFILE.location}
                </div>
              </div>
              
              {/* Verified Badge [cite: 302-305] */}
              <div className="bg-stone-950/60 backdrop-blur-md border border-haldi-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5" title="ID & Gothra Verified">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-stone-200 uppercase tracking-wide">Verified</span>
              </div>
            </div>
          </div>

          {/* About Section */}
          <section className="bg-stone-900/40 rounded-2xl p-6 border border-stone-800 space-y-4">
            <h2 className="text-lg font-serif text-stone-200 flex items-center gap-2">
              <Star className="w-4 h-4 text-haldi-500" /> About Me
            </h2>
            <p className="text-stone-400 leading-relaxed text-lg font-light">
              "{PROFILE.bio}"
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 text-stone-300 p-3 bg-stone-950 rounded-xl border border-stone-800">
                <Briefcase className="w-5 h-5 text-stone-500" />
                <span className="text-sm">{PROFILE.profession}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-300 p-3 bg-stone-950 rounded-xl border border-stone-800">
                <GraduationCap className="w-5 h-5 text-stone-500" />
                <span className="text-sm line-clamp-1">{PROFILE.education}</span>
              </div>
            </div>
          </section>

          {/* Cultural Details [cite: 555-560] */}
          <section className="bg-stone-900/40 rounded-2xl p-6 border border-stone-800 space-y-4">
             <h2 className="text-lg font-serif text-stone-200">Cultural Roots</h2>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <span className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Gothra</span>
                   <span className="text-stone-200 font-medium">{PROFILE.cultural.gothra}</span>
                </div>
                <div>
                   <span className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Sub-Community</span>
                   <span className="text-stone-200 font-medium">{PROFILE.cultural.subCommunity}</span>
                </div>
                <div>
                   <span className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Mother Tongue</span>
                   <div className="flex flex-wrap gap-1">
                     {PROFILE.cultural.languages.map(l => (
                       <span key={l} className="text-stone-200">{l}, </span>
                     ))}
                   </div>
                </div>
                <div>
                   <span className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Diet</span>
                   <span className="text-stone-200 font-medium">{PROFILE.cultural.diet}</span>
                </div>
             </div>
          </section>
        </div>

        {/* --- RIGHT COLUMN: Compatibility & Actions --- */}
        <div className="space-y-6">
          
          {/* Compatibility Card (The "Intelligence" Part) */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-haldi-500/30 rounded-3xl p-6 relative overflow-hidden">
             {/* Glow Effect */}
             <div className="absolute top-[-50%] right-[-50%] w-64 h-64 bg-haldi-500/10 rounded-full blur-3xl pointer-events-none" />
             
             <div className="text-center mb-6">
               <span className="text-stone-400 text-sm uppercase tracking-widest">Compatibility Score</span>
               <div className="text-6xl font-serif text-haldi-500 font-bold mt-2">{PROFILE.compatibility.total}%</div>
               <p className="text-stone-500 text-sm mt-1">Based on Kundali & AI Personality</p>
             </div>

             {/* The Wheel Visualization */}
             <div className="relative w-48 h-48 mx-auto my-6">
                {/* Background Circle (Static Track) */}
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path 
                    className="text-stone-800" 
                    strokeWidth="3" 
                    stroke="currentColor" 
                    fill="none" 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                  
                  {/* Animated Progress Circle (Guna Milan) */}
                  <motion.path 
                    className="text-haldi-500 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" 
                    strokeWidth="3" 
                    stroke="currentColor" 
                    fill="none" 
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    
                    // ANIMATION LOGIC
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: PROFILE.compatibility.guna_milan / 36, // Calculates 0.91 (33/36)
                      opacity: 1 
                    }}
                    transition={{ 
                      duration: 2,           // Takes 2 seconds to fill
                      ease: "easeOut",       // Slows down at the end
                      delay: 0.2             // Slight pause before starting
                    }}
                  />
                </svg>

                {/* Center Text Animation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <motion.div
                     initial={{ opacity: 0, scale: 0.5 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.5, delay: 1 }} // Pops in after wheel is half full
                   >
                     <span className="text-3xl font-serif font-bold text-stone-100 drop-shadow-md">
                       {PROFILE.compatibility.guna_milan}/36
                     </span>
                   </motion.div>
                   <span className="text-[10px] text-stone-500 uppercase tracking-wide mt-1">Gunas</span>
                </div>
             </div>

             {/* AI Insights [cite: 211-213] */}
             <div className="space-y-3 bg-stone-950/50 rounded-xl p-4 border border-stone-800/50">
                <h3 className="text-xs font-bold text-stone-500 uppercase mb-2">Why it works</h3>
                {PROFILE.compatibility.pros.map((pro, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Nakshatra Details */}
          <div className="bg-stone-900/40 rounded-2xl p-6 border border-stone-800">
             <h3 className="font-serif text-stone-200 mb-4">Astrological Details</h3>
             <div className="flex justify-between items-center py-2 border-b border-stone-800">
                <span className="text-stone-400 text-sm">Nakshatra</span>
                <span className="text-haldi-500 font-medium">{PROFILE.cultural.nakshatra}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-stone-800">
                <span className="text-stone-400 text-sm">Rashi</span>
                <span className="text-stone-200 font-medium">{PROFILE.cultural.rashi}</span>
             </div>
             <div className="flex justify-between items-center py-2 pt-3">
                <span className="text-stone-400 text-sm">Manglik Status</span>
                <span className="text-green-500 text-sm bg-green-900/20 px-2 py-0.5 rounded border border-green-900/30">Non-Manglik</span>
             </div>
          </div>

          {/* Actions: Contact Flow [cite: 306-316] */}
          <div className="sticky top-24 space-y-3">
             <button className="w-full bg-gradient-to-r from-haldi-600 to-amber-700 hover:from-haldi-500 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Send Request
             </button>
             <button className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold py-4 rounded-xl border border-stone-700 transition-all flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Shortlist
             </button>
             <p className="text-center text-xs text-stone-500 mt-2">
                Sending a request uses 1 Contact Credit.
             </p>
          </div>

        </div>
      </main>
    </div>
  );
}
