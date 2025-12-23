"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client"; 
import { 
  Sparkles, MapPin, Briefcase, User, ScrollText
} from "lucide-react";

export default function Dashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Get Current User (to exclude self from matches)
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 2. Fetch Profiles (Real Data!)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '0000'); // Exclude myself

      if (data) {
        // 3. Transform data for UI (Add fake match scores for MVP)
        const formattedMatches = data.map(profile => ({
          ...profile,
          score: Math.floor(Math.random() * (98 - 75) + 75), // Random score 75-98%
          compatibility: {
            astrology: "Excellent (33/36)", // Mock for now
          }
        }));
        setMatches(formattedMatches);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      
      {/* --- Top Navigation --- */}
      <nav className="border-b border-stone-900 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif text-2xl font-bold bg-gradient-to-r from-haldi-500 to-haldi-700 bg-clip-text text-transparent">P</Link>
            <div className="hidden md:flex bg-stone-900 rounded-full p-1 border border-stone-800">
              <button className="px-4 py-1.5 rounded-full bg-stone-800 text-stone-200 shadow-sm text-sm font-medium">Explorer</button>
              <Link href="/onboarding" className="px-4 py-1.5 rounded-full text-stone-500 hover:text-stone-300 text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Sutradhar
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Initials Avatar */}
            <div className="w-9 h-9 rounded-full bg-haldi-700 flex items-center justify-center text-stone-950 font-bold">
               {currentUser?.email?.[0].toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
            <h2 className="font-serif text-xl text-stone-200 mb-2">Welcome Back</h2>
            <p className="text-sm text-stone-500 mb-4">Your profile is active.</p>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-haldi-600 rounded-full" />
            </div>
          </div>
          {/* Panchang Widget */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800">
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="w-4 h-4 text-haldi-500" />
              <span className="text-xs font-bold text-haldi-500 uppercase">Daily Panchang</span>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-stone-400">Tithi</span><span className="text-stone-200">Shukla Paksha</span></div>
                <div className="flex justify-between"><span className="text-stone-400">Nakshatra</span><span className="text-stone-200">Rohini</span></div>
            </div>
          </div>
        </aside>

        {/* Match Grid */}
        <div className="flex-1">
          <h1 className="text-2xl font-serif text-stone-100 mb-6">Top Recommendations</h1>

          {loading ? (
             <div className="text-stone-500">Loading matches...</div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {matches.map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-haldi-500/30 transition-all"
                >
                  <div className="absolute top-4 right-4 z-10 bg-stone-950/80 backdrop-blur-md border border-stone-800 text-stone-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-haldi-500" />
                    {match.score}% Match
                  </div>
                  
                  <div className="h-64 bg-stone-800 relative flex items-center justify-center">
                    {match.image_url && match.image_url.startsWith('http') ? (
                       // If we had real images, we'd use <img src={match.image_url} />
                       // For now, stick to the icon placeholder unless you have real URLs
                       <User className="w-16 h-16 text-stone-700" />
                    ) : (
                       <User className="w-16 h-16 text-stone-700" />
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-xl font-serif text-stone-100">{match.full_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-stone-400 mt-1">
                        <MapPin className="w-3 h-3" /> {match.location || "Location N/A"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-stone-300">
                      <Briefcase className="w-4 h-4 text-stone-500" />
                      {match.profession || "Not specified"}
                    </div>
                    
                    {/* Mini-Wheel Bar */}
                    <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                        <div className="text-xs text-stone-500">Astrology Match <br/><span className="text-haldi-500">Excellent</span></div>
                        <div className="text-xl font-serif text-stone-200">33/36</div>
                    </div>

                    <Link 
                      href={`/profile/${match.id}`}
                      className="block w-full text-center py-3 mt-2 rounded-xl bg-stone-100 text-stone-950 font-semibold text-sm hover:bg-haldi-500 transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
