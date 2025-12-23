"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, CheckCircle2, Star, ShieldCheck, Heart, MessageCircle, Video, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// --- CUSTOM ICON: Manmadha (Bow & Arrow) ---
const ManmadhaIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3" />
    <path d="M2 12H2.01" />
    <path d="M5 12H17" />
    <path d="M17 12 L15 10" />
    <path d="M17 12 L15 14" />
  </svg>
);

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error);
      }
      console.log("Fetching profile for ID:", id, "Result:", data);
      
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-50 flex items-center justify-center">
        <div className="text-stone-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-50 flex items-center justify-center">
        <div className="text-stone-500">Profile not found</div>
      </div>
    );
  }

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
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80 z-10" />
            
            {/* Profile Image */}
            {profile.image_url && profile.image_url.startsWith('http') ? (
              <img 
                src={profile.image_url} 
                alt={profile.full_name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-700 bg-stone-900">
                <User className="w-24 h-24 text-stone-700" />
              </div>
            )}

            {/* Quick Actions Overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-20">
              <div>
                <h1 className="text-3xl font-serif text-stone-100">{profile.full_name}</h1>
                <div className="flex items-center gap-2 text-stone-300 mt-1">
                  <MapPin className="w-4 h-4 text-haldi-500" /> {profile.location || "Location not specified"}
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
              <Star className="w-4 h-4 text-haldi-500" /> About
            </h2>
            {profile.partner_preferences && (
              <p className="text-stone-400 leading-relaxed text-lg font-light">
                Looking for: {profile.partner_preferences}
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {profile.profession && (
                <div className="flex items-center gap-3 text-stone-300 p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <Briefcase className="w-5 h-5 text-stone-500" />
                  <span className="text-sm">{profile.profession}</span>
                </div>
              )}
              {profile.education && (
                <div className="flex items-center gap-3 text-stone-300 p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <GraduationCap className="w-5 h-5 text-stone-500" />
                  <span className="text-sm line-clamp-1">{profile.education}</span>
                </div>
              )}
            </div>
          </section>

          {/* Cultural Details */}
          <section className="bg-stone-900/40 rounded-2xl p-6 border border-stone-800 space-y-4">
             <h2 className="text-lg font-serif text-stone-200">Cultural Roots</h2>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <span className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Gothra</span>
                   <span className="text-stone-200 font-medium">{profile.gothra || "Not specified"}</span>
                </div>
                <div>
                   <span className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Gender</span>
                   <span className="text-stone-200 font-medium capitalize">{profile.gender || "Not specified"}</span>
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
               <span className="text-stone-400 text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                 <ManmadhaIcon className="w-4 h-4 text-haldi-500" />
                 Manmadha Score
               </span>
               <div className="text-6xl font-serif text-haldi-500 font-bold mt-2">94%</div>
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
                      pathLength: 33 / 36, // Calculates 0.91 (33/36)
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
                       33/36
                     </span>
                   </motion.div>
                   <span className="text-[10px] text-stone-500 uppercase tracking-wide mt-1">Gunas</span>
                </div>
             </div>

             {/* AI Insights [cite: 211-213] */}
             <div className="space-y-3 bg-stone-950/50 rounded-xl p-4 border border-stone-800/50">
                <h3 className="text-xs font-bold text-stone-500 uppercase mb-2">Why it works</h3>
                {["Excellent Gana alignment", "Strong cultural compatibility", "Shared values"].map((pro, i) => (
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
                <span className="text-haldi-500 font-medium">Rohini</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-stone-800">
                <span className="text-stone-400 text-sm">Rashi</span>
                <span className="text-stone-200 font-medium">Vrishabha (Taurus)</span>
             </div>
             <div className="flex justify-between items-center py-2 pt-3">
                <span className="text-stone-400 text-sm">Manglik Status</span>
                <span className="text-green-500 text-sm bg-green-900/20 px-2 py-0.5 rounded border border-green-900/30">Non-Manglik</span>
             </div>
          </div>

          {/* Manmadha Insight Section */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-haldi-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Heart className="w-24 h-24 text-haldi-500" /></div>
             
             <div className="relative z-10">
                <h3 className="text-haldi-500 font-serif text-lg mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> 
                  The Manmadha Insight
                </h3>
                <p className="text-stone-400 text-sm italic leading-relaxed">
                  "While the stars align for your Gothras, the <strong className="text-stone-300">Manmadha Score</strong> of {90 + Math.floor(Math.random()*5)}% suggests a rare emotional spark. You both share a deep value for {profile.partner_preferences ? 'ambition' : 'tradition'}, which is often the foundation of lasting affection."
                </p>
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
