"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { 
  Sparkles, MapPin, Briefcase, User, ScrollText, 
  LogOut, Search, Bell, ShieldCheck
} from "lucide-react";

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

export default function Dashboard() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserName] = useState("User");
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Get Current User (to exclude self from matches)
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 2. Fetch Current User's Name
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.full_name) {
          // Get first name only
          setUserName(profile.full_name.split(' ')[0]);
        }
      }

      // 3. Fetch Profiles (Real Data!)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '0000'); // Exclude myself

      if (data) {
        // 3. Transform data for UI (Add deterministic match scores)
        const formattedMatches = data.map(profile => {
          // Generate deterministic score from profile ID (consistent on server & client)
          const hash = profile.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const score = 75 + (hash % 24); // Score between 75-98
          
          return {
            ...profile,
            score,
            compatibility: {
              astrology: "Excellent (33/36)", // Mock for now
            }
          };
        });
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
            <div className="text-right hidden sm:block">
              <div className="text-xs text-haldi-500 font-medium uppercase tracking-wider">Namaste</div>
              <div className="font-serif text-stone-200">{userName}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-haldi-700 flex items-center justify-center text-stone-950 font-bold">
              {userName[0]}
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-6 flex-none">
          
          {/* Welcome Widget */}
          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
            <h2 className="font-serif text-xl text-stone-200 mb-2">Welcome Back</h2>
            <p className="text-sm text-stone-500 mb-4">Your search is active.</p>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-haldi-600 rounded-full" />
            </div>
          </div>

          {/* NEW: Narada Alerts */}
          <div className="p-4 rounded-2xl bg-stone-900/30 border border-stone-800 space-y-3">
            <div className="flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-haldi-500" />
                <span className="text-xs font-bold text-haldi-500 uppercase tracking-widest">Narada Alerts</span>
            </div>
            <div className="text-sm text-stone-400">
                <p className="line-clamp-2 italic">"The stars indicate a favorable time to connect with Priya today."</p>
            </div>
            <button className="text-xs text-haldi-600 hover:text-haldi-500 font-medium mt-1">View signals &rarr;</button>
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

          {/* My Profile Widget */}
          <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-stone-400" />
                </div>
                <div>
                    <div className="text-sm font-bold text-stone-200">My Profile</div>
                    <div className="text-xs text-stone-500">Edit & View Details</div>
                </div>
            </div>
            <Link 
            href="/profile/me" 
            className="block w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-center rounded-lg text-sm font-medium transition-colors"
            >
            View Full Profile
            </Link>
         </div>

          {/* Logout */}
          <div className="p-4 rounded-2xl border border-stone-800 bg-stone-900/30">
            <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 py-3 rounded-xl transition-all text-sm font-medium"
            >
            <LogOut className="w-4 h-4" />
            Sign Out
            </button>
          </div>
        </aside>

        {/* Match Grid */}
        <div className="flex-1">
          {/* Header & Filter Section */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-serif text-stone-100">Top Recommendations</h1>
              <p className="text-stone-400 text-sm mt-1">Curated by Sutradhar based on your preferences.</p>
            </div>

            {/* Quick Filter */}
            <div className="relative w-full md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 group-focus-within:text-haldi-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Filter by name, job..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-stone-200 focus:outline-none focus:border-haldi-500/50 focus:ring-1 focus:ring-haldi-500/20 transition-all placeholder:text-stone-600"
              />
            </div>
          </div>

          {loading ? (
             <div className="text-stone-500">Loading matches...</div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {matches
                .filter((m) => {
                  const term = searchTerm.toLowerCase();
                  return (
                    term === "" ||
                    m.full_name?.toLowerCase().includes(term) ||
                    m.profession?.toLowerCase().includes(term) ||
                    m.location?.toLowerCase().includes(term) ||
                    m.gothra?.toLowerCase().includes(term)
                  );
                })
                .map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-haldi-500/30 transition-all shadow-2xl shadow-black/50"
                >
                  {/* NEW: Manmadha Score Badge */}
                  <div className="absolute top-4 right-4 z-10 bg-stone-950/90 backdrop-blur-md border border-haldi-500/50 text-haldi-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-haldi-900/20">
                    <ManmadhaIcon className="w-4 h-4 text-haldi-500" />
                    <span>{match.score}% Score</span>
                  </div>
                  
                  {/* Image Area */}
                  <div className="h-72 bg-stone-800 relative flex items-center justify-center overflow-hidden">
                    {match.image_url && match.image_url.startsWith('http') ? (
                       <img 
                         src={match.image_url} 
                         alt={match.full_name} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                       />
                    ) : (
                       <User className="w-20 h-20 text-stone-700" />
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-stone-900 to-transparent" />
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
              
              {/* No Matches Found State */}
              {matches.length > 0 && matches.filter(m => 
                  m.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                  <div className="col-span-full text-center py-12 text-stone-500">
                      No matches found for "{searchTerm}".
                  </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
