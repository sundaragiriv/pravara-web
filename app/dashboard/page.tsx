"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Bell, 
  MessageCircle, 
  User, 
  Search, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  ScrollText,
  Star
} from "lucide-react";

// Mock Data based on User Personas [cite: 37-52]
const MATCHES = [
  {
    id: 1,
    name: "Priya S.",
    age: 28,
    location: "Fremont, CA",
    profession: "Senior Software Engineer",
    image: "/api/placeholder/400/500", // You can replace with real images later
    score: 94,
    tags: ["Iyer", "Kashyapa", "Stanford"],
    compatibility: {
      astrology: "Excellent (33/36)",
      values: "High Alignment",
    }
  },
  {
    id: 2,
    name: "Ananya K.",
    age: 27,
    location: "Austin, TX",
    profession: "Pediatrician",
    image: "/api/placeholder/400/500",
    score: 88,
    tags: ["Smartha", "Bharadwaj", "Music Lover"],
    compatibility: {
      astrology: "Good (28/36)",
      values: "Moderate Alignment",
    }
  },
  {
    id: 3,
    name: "Meera R.",
    age: 29,
    location: "London, UK",
    profession: "Investment Banker",
    image: "/api/placeholder/400/500",
    score: 82,
    tags: ["Madhwa", "Gautama", "Vegetarian"],
    compatibility: {
      astrology: "Average (22/36)",
      values: "High Alignment",
    }
  }
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      
      {/* --- Top Navigation --- */}
      <nav className="border-b border-stone-900 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo & Lens Switcher */}
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif text-2xl font-bold bg-gradient-to-r from-haldi-500 to-haldi-700 bg-clip-text text-transparent">
              P
            </Link>
            
            {/* The "Bifocal" Switcher [cite: 529] */}
            <div className="hidden md:flex bg-stone-900 rounded-full p-1 border border-stone-800">
              <button className="px-4 py-1.5 rounded-full bg-stone-800 text-stone-200 shadow-sm text-sm font-medium transition-all">
                Explorer
              </button>
              <Link href="/onboarding" className="px-4 py-1.5 rounded-full text-stone-500 hover:text-stone-300 text-sm font-medium transition-all flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Sutradhar
              </Link>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-stone-400 hover:text-haldi-500 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-stone-950"></span>
            </button>
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-haldi-600 to-amber-700 flex items-center justify-center text-stone-950 font-serif font-bold">
              V
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left: Sidebar (Panchang & Status) [cite: 539-541] */}
        <aside className="w-full lg:w-80 space-y-6">
          
          {/* Welcome Card */}
          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
            <h2 className="font-serif text-xl text-stone-200 mb-2">Namaste, Vikram</h2>
            <p className="text-sm text-stone-500 mb-4">Your profile is 85% complete.</p>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div className="w-[85%] h-full bg-haldi-600 rounded-full" />
            </div>
          </div>

          {/* Daily Panchang Widget [cite: 269-272] */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-haldi-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-haldi-500/10 transition-colors" />
            
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="w-4 h-4 text-haldi-500" />
              <span className="text-xs font-bold tracking-wider text-haldi-500 uppercase">Daily Panchang</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-400">Tithi</span>
                <span className="text-stone-200 font-medium">Shukla Paksha</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-400">Nakshatra</span>
                <span className="text-stone-200 font-medium">Rohini</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-400">Abhijit</span>
                <span className="text-green-500 font-medium">11:45 AM - 12:30 PM</span>
              </div>
            </div>
          </div>

        </aside>

        {/* Right: Match Grid [cite: 526, 531] */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif text-stone-100">Top Recommendations</h1>
            <button className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200 transition-colors">
              <Search className="w-4 h-4" /> Filters
            </button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {MATCHES.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-haldi-500/30 transition-all hover:shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]"
              >
                {/* Match Score Badge [cite: 536] */}
                <div className="absolute top-4 right-4 z-10 bg-stone-950/80 backdrop-blur-md border border-stone-800 text-stone-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-haldi-500" />
                  {match.score}% Match
                </div>

                {/* Profile Image Area (Placeholder) */}
                <div className="h-64 bg-stone-800 relative">
                  {/* Blur effect for privacy until connected [cite: 533] */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-16 h-16 text-stone-700" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-serif text-stone-100 group-hover:text-haldi-500 transition-colors">{match.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-stone-400 mt-1">
                      <MapPin className="w-3 h-3" /> {match.location}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-stone-300">
                      <Briefcase className="w-4 h-4 text-stone-500" />
                      {match.profession}
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {match.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-stone-800 text-stone-400 text-xs border border-stone-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Compatibility Snippet [cite: 537] */}
                  <div className="pt-3 border-t border-stone-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-500">Astrology</span>
                      <span className="text-haldi-500 font-medium">{match.compatibility.astrology}</span>
                    </div>
                    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-haldi-600 to-amber-600 rounded-full" />
                    </div>
                  </div>

                  <Link 
                    href={`/profile/${match.id}`}
                    className="block w-full text-center py-3 mt-2 rounded-xl bg-stone-100 text-stone-950 font-semibold text-sm hover:bg-haldi-500 hover:text-stone-950 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
