"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { 
  Sparkles, MapPin, Briefcase, User, ScrollText, 
  LogOut, Search, Bell, Heart, Check, X, Phone, Mail, MessageCircle
} from "lucide-react";

// --- CUSTOM ICON: Manmadha (Bow & Arrow) ---
const ManmadhaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3" />
    <path d="M2 12H2.01" /><path d="M5 12H17" /><path d="M17 12 L15 10" /><path d="M17 12 L15 14" />
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  // NOW 3 TABS: Explorer, Requests, Connections
  const [activeTab, setActiveTab] = useState<'explorer' | 'requests' | 'connections'>('explorer');
  
  const [matches, setMatches] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]); // NEW
  
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserName] = useState("User");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // 1. Fetch User Name
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile?.full_name) setUserName(profile.full_name.split(' ')[0]);

        // 2. Fetch EXPLORER (Strangers)
        const { data: profiles } = await supabase.from('profiles').select('*').neq('id', user.id); 
        if (profiles) {
          setMatches(profiles.map(p => ({ ...p, score: Math.floor(Math.random() * (98 - 75) + 75) })));
        }

        // 3. Fetch REQUESTS (Incoming Pending)
        const { data: incoming } = await supabase
            .from('connections')
            .select(`*, sender:profiles!sender_id (*)`)
            .eq('receiver_id', user.id)
            .eq('status', 'pending');
        if (incoming) setRequests(incoming);

        // 4. Fetch CONNECTIONS (Accepted Matches) - NEW
        // We need to check both "Sent by me" and "Received by me" where status is accepted
        const { data: myConnections } = await supabase
            .from('connections')
            .select(`
                *,
                sender:profiles!sender_id (*),
                receiver:profiles!receiver_id (*)
            `)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .eq('status', 'accepted');

        if (myConnections) {
            // Normalize the data: The "Partner" is whoever is NOT me.
            const formatted = myConnections.map(c => {
                const partner = c.sender_id === user.id ? c.receiver : c.sender;
                return { ...partner, connection_id: c.id, connected_at: c.created_at };
            });
            setConnections(formatted);
        }
      }
      setLoading(false);
  };

  const handleResponse = async (connectionId: string, status: 'accepted' | 'rejected') => {
    const supabase = createClient();
    setRequests(prev => prev.filter(r => r.id !== connectionId)); // UI Optimistic
    await supabase.from('connections').update({ status }).eq('id', connectionId);
    fetchData(); // Refresh to move it to "Connections" tab
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      
      {/* Navigation */}
      <nav className="border-b border-stone-900 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif text-2xl font-bold bg-gradient-to-r from-haldi-500 to-haldi-700 bg-clip-text text-transparent">P</Link>
            
            {/* 3-WAY TAB SWITCHER + SUTRADHAR */}
            <div className="hidden md:flex bg-stone-900 rounded-full p-1 border border-stone-800 items-center">
              <button 
                onClick={() => setActiveTab('explorer')} 
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'explorer' ? 'bg-stone-800 text-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Explorer
              </button>
              
              <button 
                onClick={() => setActiveTab('requests')} 
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-stone-800 text-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Requests
                {requests.length > 0 && <span className="bg-haldi-600 text-stone-950 text-[10px] font-bold px-1.5 rounded-full">{requests.length}</span>}
              </button>
              
              <button 
                onClick={() => setActiveTab('connections')} 
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'connections' ? 'bg-stone-800 text-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Connections
              </button>

              {/* SEPARATOR */}
              <div className="w-px h-4 bg-stone-800 mx-2"></div>

              {/* SUTRADHAR LINK (RESTORED) */}
              <Link 
                href="/onboarding" 
                className="px-4 py-1.5 rounded-full text-haldi-500 hover:text-haldi-400 text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-3 h-3" /> Sutradhar
              </Link>
            </div>
          </div>
          {/* User Profile... */}
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                 <div className="text-[10px] text-haldi-500 font-bold uppercase tracking-widest">Namaste</div>
                 <div className="font-serif text-stone-200 leading-none">{userName}</div>
             </div>
             <div className="w-9 h-9 rounded-full bg-haldi-700 flex items-center justify-center text-stone-950 font-bold">{userName[0]}</div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-6 flex-none">
          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
            <h2 className="font-serif text-xl text-stone-200 mb-2">Welcome Back</h2>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden"><div className="w-[85%] h-full bg-haldi-600 rounded-full" /></div>
          </div>
          <div className="p-4 rounded-2xl bg-stone-900/30 border border-stone-800 space-y-3">
            <div className="flex items-center gap-2 mb-1"><Bell className="w-4 h-4 text-haldi-500" /><span className="text-xs font-bold text-haldi-500 uppercase tracking-widest">Narada Alerts</span></div>
            {requests.length > 0 ? <div className="text-sm text-stone-300">You have <span className="text-haldi-500 font-bold">{requests.length} new interest</span> requests.</div> : <div className="text-sm text-stone-500 italic">No new alerts today.</div>}
          </div>
          <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 space-y-3">
             <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center"><User className="w-5 h-5 text-stone-400" /></div><div><div className="text-sm font-bold text-stone-200">My Profile</div><div className="text-xs text-stone-500">Edit & View Details</div></div></div>
             <Link href="/profile/me" className="block w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-center rounded-lg text-sm font-medium transition-colors">View Full Profile</Link>
          </div>
          <div className="p-4 rounded-2xl border border-stone-800 bg-stone-900/30"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 py-3 rounded-xl transition-all text-sm font-medium"><LogOut className="w-4 h-4" /> Sign Out</button></div>
        </aside>

        {/* Dynamic Content */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-serif text-stone-100">
                    {activeTab === 'explorer' && 'Top Recommendations'}
                    {activeTab === 'requests' && 'Member Requests'}
                    {activeTab === 'connections' && 'Your Connections'}
                </h1>
                <p className="text-stone-400 text-sm mt-1">
                    {activeTab === 'explorer' && 'Curated by Sutradhar based on your preferences.'}
                    {activeTab === 'requests' && 'Members who have expressed interest in you.'}
                    {activeTab === 'connections' && 'Accepted matches. Contact details are now unlocked.'}
                </p>
            </div>
            {activeTab === 'explorer' && (
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input type="text" placeholder="Filter by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-stone-900 border border-stone-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-stone-200 focus:outline-none focus:border-haldi-500/50" />
                </div>
            )}
          </div>

          {/* 1. EXPLORER GRID */}
          {activeTab === 'explorer' && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading && <div className="text-stone-500">Loading matches...</div>}
              {!loading && matches.filter(m => searchTerm === "" || m.full_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((match, idx) => (
                <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="group relative bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-haldi-500/30 transition-all shadow-xl flex flex-col">
                   <div className="absolute top-4 right-4 z-10 bg-stone-950/90 backdrop-blur-md border border-haldi-500/50 text-haldi-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg"><ManmadhaIcon className="w-4 h-4 text-haldi-500" /><span>{match.score}% Score</span></div>
                   <div className="h-72 bg-stone-800 relative flex items-center justify-center overflow-hidden flex-shrink-0">
                      {match.image_url ? <img src={match.image_url} alt={match.full_name || "Profile"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" /> : <User className="w-20 h-20 text-stone-700" />}
                      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-stone-900 to-transparent" />
                   </div>
                   <div className="p-5 flex flex-col flex-grow">
                      <div className="min-h-[72px] flex flex-col justify-start">
                        <h3 className="text-xl font-serif text-stone-100 leading-tight">{match.full_name || "Name Not Set"}</h3>
                        <div className="flex items-center gap-2 text-sm text-stone-400 mt-2"><MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{match.location || "Location N/A"}</span></div>
                      </div>

                      {/* Bhrugu Index Row */}
                      <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                          <div className="text-xs text-stone-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <ScrollText className="w-3 h-3 text-haldi-600" />
                              Bhrugu Patrika
                          </div>
                          <div className="font-serif text-stone-200 text-lg">
                              {Math.floor((match.score / 100) * 36)}<span className="text-stone-500 text-xs">/36</span>
                          </div>
                      </div>

                      <Link href={`/profile/${match.id}`} className="block w-full text-center py-3 mt-4 rounded-xl bg-stone-100 text-stone-950 font-semibold text-sm hover:bg-haldi-500 transition-colors">View Profile</Link>
                   </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 2. REQUESTS LIST */}
          {activeTab === 'requests' && (
             <div className="space-y-4">
                {requests.length === 0 ? <div className="text-center py-12 border border-dashed border-stone-800 rounded-2xl bg-stone-900/20"><Sparkles className="w-8 h-8 text-stone-600 mx-auto mb-3" /><h3 className="text-stone-300 font-medium">No Pending Requests</h3></div> : requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-2xl hover:border-haldi-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-stone-800 overflow-hidden">{req.sender.image_url ? <img src={req.sender.image_url} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-auto text-stone-600"/>}</div>
                            <div><h4 className="text-lg font-serif text-stone-100">{req.sender.full_name}</h4><p className="text-sm text-stone-500">{req.sender.profession} • {req.sender.location}</p></div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleResponse(req.id, 'rejected')} className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-red-400 hover:border-red-900 transition-colors"><X className="w-5 h-5" /></button>
                            <button onClick={() => handleResponse(req.id, 'accepted')} className="px-6 py-3 rounded-xl bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold flex items-center gap-2 transition-all shadow-lg shadow-haldi-900/20"><Check className="w-4 h-4" /> Accept</button>
                        </div>
                    </div>
                ))}
             </div>
          )}

          {/* 3. NEW: CONNECTIONS (The Reveal) */}
          {activeTab === 'connections' && (
             <div className="grid gap-4">
                {connections.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-stone-800 rounded-2xl bg-stone-900/20">
                        <Heart className="w-8 h-8 text-stone-600 mx-auto mb-3" />
                        <h3 className="text-stone-300 font-medium">No Connections Yet</h3>
                        <p className="text-stone-500 text-sm mt-1">Accept requests to unlock contact details here.</p>
                    </div>
                ) : (
                    connections.map((person) => (
                        <div key={person.id} className="p-6 bg-gradient-to-r from-stone-900 to-stone-950 border border-haldi-900/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            {/* Gold Glow Effect */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-haldi-600" />
                            
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-20 h-20 rounded-full border-2 border-haldi-600/30 p-1">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-stone-800">
                                       {person.image_url ? <img src={person.image_url} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-auto text-stone-600"/>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif text-stone-100">{person.full_name}</h3>
                                    <div className="flex items-center gap-2 text-haldi-500 text-sm font-bold mt-1">
                                        <Sparkles className="w-3 h-3" /> Connected via Pravara
                                    </div>
                                    <p className="text-stone-500 text-sm mt-1">You can now contact this member.</p>
                                </div>
                            </div>

                            {/* THE REVEAL: Contact Buttons */}
                            <div className="flex gap-3 w-full md:w-auto">
                                <a href="tel:555-0123" className="flex-1 md:flex-none py-3 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center justify-center gap-2 transition-colors">
                                    <Phone className="w-4 h-4" /> <span className="text-sm font-bold">Call</span>
                                </a>
                                <a href="mailto:contact@example.com" className="flex-1 md:flex-none py-3 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center justify-center gap-2 transition-colors">
                                    <Mail className="w-4 h-4" /> <span className="text-sm font-bold">Email</span>
                                </a>
                                <button className="flex-1 md:flex-none py-3 px-5 rounded-xl bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold flex items-center justify-center gap-2 transition-all">
                                    <MessageCircle className="w-4 h-4" /> <span className="text-sm">Chat</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
             </div>
          )}

        </div>
      </main>
    </div>
  );
}
