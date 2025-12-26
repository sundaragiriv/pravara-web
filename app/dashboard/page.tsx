"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { 
  Sparkles, MapPin, User, LogOut, Search, Bell, Heart, Check, X, 
  Phone, Mail, MessageCircle, Star, ShieldCheck, Users
} from "lucide-react";

// --- CUSTOM ICONS ---
const BhruguIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" />
    <path d="M3 6H21" />
    <path d="M7 12H17" />
    <path d="M7 16H13" />
  </svg>
);

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<'explorer' | 'requests' | 'connections' | 'shortlist'>('explorer');
  
  // Data State
  const [matches, setMatches] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [shortlist, setShortlist] = useState<any[]>([]);
  
  // User Identity State
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [completionPercent, setCompletionPercent] = useState(0); // <--- RESTORED
  
  // Guardian/Collaborator State
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [viewingAs, setViewingAs] = useState<string | null>(null);
  const [roleLabel, setRoleLabel] = useState(""); 
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      // 1. IDENTITY CHECK: Are you a Collaborator?
      // We use .maybeSingle() to check safely without crashing
      const { data: collaboration } = await supabase
          .from('collaborators')
          .select('user_id, role')
          .eq('collaborator_email', user.email)
          .maybeSingle();

      if (collaboration) {
          // --- MODE A: GUARDIAN (Collaborator) ---
          setIsCollaborator(true);
          setViewingAs(collaboration.user_id);
          
          // Fetch Child's Profile Info (To display "Helping [Child]")
          const { data: childProfile } = await supabase.from('profiles').select('*').eq('id', collaboration.user_id).single();
          
          if (childProfile) {
              setUserName(childProfile.full_name);
              setUserPhoto(childProfile.image_url);
              setRoleLabel(`Guardian Mode (${collaboration.role})`);
          }

          // Fetch Matches (Everyone except child)
          const { data: profiles } = await supabase.from('profiles').select('*').neq('id', collaboration.user_id);
          if (profiles) setMatches(profiles.map(p => ({ ...p, score: Math.floor(Math.random() * (98 - 75) + 75) })));
          
          // Fetch Child's Shortlist
          const { data: savedItems } = await supabase.from('shortlists').select('*, profile:profiles!profile_id (*)').eq('user_id', collaboration.user_id);
          if (savedItems) setShortlist(savedItems);

      } else {
          // --- MODE B: USER (The Bachelor/Bachelorette) ---
          setViewingAs(user.id);
          
          // Fetch My Profile
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          
          if (profile) {
              setUserName(profile.full_name?.split(' ')[0] || "User");
              setUserPhoto(profile.image_url);
              
              // RESTORED: Calculate Profile Completion %
              const fields = [profile.full_name, profile.image_url, profile.bio, profile.location, profile.profession, profile.education, profile.gothra, profile.audio_bio_url];
              const filled = fields.filter(f => f && f.length > 0).length;
              setCompletionPercent(Math.round((filled / fields.length) * 100));
          }

          // Fetch Matches
          const { data: profiles } = await supabase.from('profiles').select('*').neq('id', user.id); 
          if (profiles) setMatches(profiles.map(p => ({ ...p, score: Math.floor(Math.random() * (98 - 75) + 75) })));

          // Fetch Requests (Explicit FK)
          const { data: incoming } = await supabase.from('connections').select(`*, sender:profiles!connections_sender_id_fkey (*)`).eq('receiver_id', user.id).eq('status', 'pending');
          if (incoming) setRequests(incoming);

          // Fetch Connections (Explicit FK)
          const { data: myConnections } = await supabase.from('connections').select(`*, sender:profiles!connections_sender_id_fkey (*), receiver:profiles!connections_receiver_id_fkey (*)`).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).eq('status', 'accepted');
          if (myConnections) {
              const formatted = myConnections.map(c => {
                  const partner = c.sender_id === user.id ? c.receiver : c.sender;
                  return { ...partner, connection_id: c.id, connected_at: c.created_at };
              });
              setConnections(formatted);
          }

          // Fetch My Shortlist
          const { data: savedItems } = await supabase.from('shortlists').select('*, profile:profiles!profile_id (*)').eq('user_id', user.id);
          if (savedItems) setShortlist(savedItems);
      }
      setLoading(false);
  };

  // --- ACTIONS ---

  const handleShortlist = async (profileId: string) => {
    if (!currentUser || !viewingAs) return;

    // 1. Optimistic Update: Add to UI immediately so user sees it "stick"
    const profileToSave = matches.find(m => m.id === profileId);
    if (profileToSave) {
        // Create a temporary item to show instantly
        const tempItem = {
            id: `temp-${Date.now()}`,
            profile: profileToSave,
            added_by_email: currentUser.email,
            note: isCollaborator ? "Recommended by Guardian" : "Saved by User",
            user_id: viewingAs
        };
        setShortlist(prev => [tempItem, ...prev]);
        alert("Profile Starred! Added to Treasury.");
    }

    // 2. Database Insert
    const { error } = await supabase.from('shortlists').insert({
        user_id: viewingAs,
        profile_id: profileId,
        added_by_email: currentUser.email,
        note: isCollaborator ? "Recommended by Guardian" : "Saved by User"
    });

    if (error) {
        console.error("Shortlist Error:", error);
        alert("Failed to save to database.");
        // Revert optimistic update if failed (optional, but good practice)
        fetchData();
    } else {
        // Refresh purely to get the real ID from DB, but user already sees it
        fetchData();
    }
  };
  
  const handleRemoveShortlist = async (itemId: string) => {
    // Optimistic Remove
    setShortlist(prev => prev.filter(i => i.id !== itemId));
    await supabase.from('shortlists').delete().eq('id', itemId);
  };

  const handleResponse = async (connectionId: string, status: 'accepted' | 'rejected') => {
    setRequests(prev => prev.filter(r => r.id !== connectionId)); 
    await supabase.from('connections').update({ status }).eq('id', connectionId);
    fetchData(); 
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-stone-900 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif text-2xl font-bold bg-gradient-to-r from-haldi-500 to-haldi-700 bg-clip-text text-transparent">P</Link>
            
            {/* TABS */}
            <div className="hidden md:flex bg-stone-900 rounded-full p-1 border border-stone-800 items-center">
              <button onClick={() => setActiveTab('explorer')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'explorer' ? 'bg-stone-800 text-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}>
                Explorer
              </button>
              
              {!isCollaborator && (
                <>
                    <button onClick={() => setActiveTab('requests')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-stone-800 text-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}>
                        Requests {requests.length > 0 && <span className="bg-haldi-600 text-stone-950 text-[10px] font-bold px-1.5 rounded-full">{requests.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('connections')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'connections' ? 'bg-stone-800 text-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}>
                        Connections
                    </button>
                    {/* RESTORED SUTRADHAR TAB */}
                    <div className="w-px h-4 bg-stone-800 mx-2"></div>
                    <Link href="/onboarding" className="px-4 py-1.5 rounded-full text-haldi-500 hover:text-haldi-400 text-sm font-bold flex items-center gap-2 transition-colors">
                        <Sparkles className="w-3 h-3" /> Sutradhar
                    </Link>
                </>
              )}
              
              <button onClick={() => setActiveTab('shortlist')} className={`ml-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'shortlist' ? 'bg-stone-800 text-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}>
                  Shortlist {shortlist.length > 0 && <span className="bg-haldi-600 text-stone-950 text-[10px] font-bold px-1.5 rounded-full">{shortlist.length}</span>}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                 <div className="text-[10px] text-haldi-500 font-bold uppercase tracking-widest">{isCollaborator ? "Helping" : "Welcome Back"}</div>
                 <div className="font-serif text-stone-200 leading-none">{userName}</div>
             </div>
             <div className="w-9 h-9 rounded-full bg-haldi-700 flex items-center justify-center text-stone-950 font-bold overflow-hidden border border-haldi-600">
               {userPhoto ? <img src={userPhoto} alt="Me" className="w-full h-full object-cover" /> : <span>{userName[0]}</span>}
             </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN LAYOUT --- */}
      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-80 space-y-6 flex-none">
          <div className={`p-6 rounded-2xl border ${isCollaborator ? 'bg-haldi-900/10 border-haldi-500/30' : 'bg-stone-900/50 border-stone-800'}`}>
            <h2 className="font-serif text-xl text-stone-200 mb-2">{isCollaborator ? "Guardian Mode" : `Namaste, ${userName}`}</h2>
            
            {isCollaborator ? (
                <div className="text-sm text-haldi-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {roleLabel}</div>
            ) : (
                /* RESTORED: PROFILE COMPLETION BAR */
                <div>
                   <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest mb-1 text-stone-400">
                      <span>Profile Strength</span>
                      <span className="text-haldi-500">{completionPercent}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-haldi-600 rounded-full transition-all duration-1000" style={{ width: `${completionPercent}%` }} />
                   </div>
                </div>
            )}
          </div>

          {/* RESTORED: NARADA ALERTS */}
          {!isCollaborator && (
             <div className="p-4 rounded-2xl bg-stone-900/30 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 mb-1"><Bell className="w-4 h-4 text-haldi-500" /><span className="text-xs font-bold text-haldi-500 uppercase tracking-widest">Narada Alerts</span></div>
                {requests.length > 0 ? <div className="text-sm text-stone-300">You have <span className="text-haldi-500 font-bold">{requests.length} new interest</span> requests.</div> : <div className="text-sm text-stone-500 italic">No new alerts today.</div>}
             </div>
          )}

          {!isCollaborator && (
            <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800 space-y-3">
               <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center"><User className="w-5 h-5 text-stone-400" /></div><div><div className="text-sm font-bold text-stone-200">My Profile</div><div className="text-xs text-stone-500">Edit & View Details</div></div></div>
               <Link href="/profile/me" className="block w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-center rounded-lg text-sm font-medium transition-colors">View Full Profile</Link>
            </div>
          )}
          <div className="p-4 rounded-2xl border border-stone-800 bg-stone-900/30"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 py-3 rounded-xl transition-all text-sm font-medium"><LogOut className="w-4 h-4" /> Sign Out</button></div>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-serif text-stone-100">
                    {activeTab === 'explorer' && 'Matches'}
                    {activeTab === 'requests' && 'Requests'}
                    {activeTab === 'connections' && 'Connections'}
                    {activeTab === 'shortlist' && 'Your Treasury'}
                </h1>
                <p className="text-stone-400 text-sm mt-1">
                    {activeTab === 'explorer' && (isCollaborator ? 'Shortlist the best ones for your family member.' : 'Curated by Sutradhar based on preferences.')}
                </p>
            </div>
            {activeTab === 'explorer' && (
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input type="text" placeholder="Filter name, job, city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-stone-900 border border-stone-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-stone-200 focus:outline-none focus:border-haldi-500/50" />
                </div>
            )}
          </div>

          {/* 1. EXPLORER GRID (Omni-Search Enabled) */}
          {activeTab === 'explorer' && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {!loading && matches.filter(m => {
                  if (searchTerm === "") return true;
                  const term = searchTerm.toLowerCase();
                  return (m.full_name?.toLowerCase().includes(term) || m.location?.toLowerCase().includes(term) || m.profession?.toLowerCase().includes(term) || m.bio?.toLowerCase().includes(term));
              }).map((match, idx) => (
                <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="group relative bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-haldi-500/30 transition-all shadow-xl">
                   <div className="h-72 bg-stone-800 relative flex items-center justify-center overflow-hidden">
                      {match.image_url ? <img src={match.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" /> : <User className="w-20 h-20 text-stone-700" />}
                      <div className="absolute top-4 right-4 z-10 bg-stone-950/90 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"><Heart className="w-3.5 h-3.5 fill-rose-500" /> {match.score}%</div>
                      <div className="absolute bottom-4 left-4 z-10 bg-stone-950/90 border border-haldi-500/50 text-haldi-500 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"><BhruguIcon className="w-3.5 h-3.5" /> {Math.floor((match.score / 100) * 36)}/36 Gunas</div>
                   </div>
                   <div className="p-5 space-y-4">
                      <div><h3 className="text-xl font-serif text-stone-100">{match.full_name}</h3><div className="flex items-center gap-2 text-sm text-stone-400 mt-1"><MapPin className="w-3 h-3" /> {match.location}</div></div>
                      <div className="flex gap-2 mt-2">
                        <Link href={`/profile/${match.id}`} className="flex-1 text-center py-3 rounded-xl bg-stone-100 text-stone-950 font-semibold text-sm hover:bg-haldi-500 transition-colors">View Profile</Link>
                        <button onClick={() => handleShortlist(match.id)} className="px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-haldi-500 border border-stone-700 transition-colors"><Star className="w-5 h-5" /></button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 2. REQUESTS (Explicit FK) */}
          {activeTab === 'requests' && !isCollaborator && (
             <div className="space-y-4">
                {requests.length === 0 && <div className="text-center py-10 text-stone-500 italic">No pending requests.</div>}
                {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                        <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-xl bg-stone-800 overflow-hidden">{req.sender.image_url ? <img src={req.sender.image_url} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-auto text-stone-600"/>}</div><div><h4 className="text-lg font-serif text-stone-100">{req.sender.full_name}</h4><p className="text-sm text-stone-500">{req.sender.profession}</p></div></div>
                        <div className="flex gap-2"><button onClick={() => handleResponse(req.id, 'rejected')} className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-red-400"><X className="w-5 h-5" /></button><button onClick={() => handleResponse(req.id, 'accepted')} className="px-6 py-3 rounded-xl bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold flex items-center gap-2"><Check className="w-4 h-4" /> Accept</button></div>
                    </div>
                ))}
             </div>
          )}

          {/* 3. CONNECTIONS (Explicit FK) */}
          {activeTab === 'connections' && !isCollaborator && (
             <div className="grid gap-4">
                {connections.map((person) => (
                    <div key={person.id} className="p-6 bg-gradient-to-r from-stone-900 to-stone-950 border border-haldi-900/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="flex items-center gap-4 w-full"><div className="w-20 h-20 rounded-full border-2 border-haldi-600/30 p-1"><div className="w-full h-full rounded-full overflow-hidden bg-stone-800">{person.image_url ? <img src={person.image_url} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-auto text-stone-600"/>}</div></div><div><h3 className="text-xl font-serif text-stone-100">{person.full_name}</h3><div className="flex items-center gap-2 text-haldi-500 text-sm font-bold mt-1"><Sparkles className="w-3 h-3" /> Connected</div></div></div>
                        <Link href="/chat" className="flex-1 md:flex-none py-3 px-5 rounded-xl bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Chat</Link>
                    </div>
                ))}
             </div>
          )}

          {/* 4. SHORTLIST (Optimistic UI Enabled) */}
          {activeTab === 'shortlist' && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {shortlist.length === 0 && <div className="col-span-3 text-center py-12 border border-dashed border-stone-800 rounded-2xl bg-stone-900/20"><Star className="w-8 h-8 text-stone-600 mx-auto mb-3" /><h3 className="text-stone-300 font-medium">Your Treasury is Empty</h3><p className="text-stone-500 text-sm mt-1">Star profiles to save them here.</p></div>}
                {shortlist.map((item) => {
                    const match = item.profile; 
                    const isFamilyRec = item.added_by_email !== currentUser?.email;
                    if (!match) return null; // Safety check
                    return (
                        <div key={item.id} className={`relative bg-stone-900 border rounded-2xl overflow-hidden shadow-xl ${isFamilyRec ? 'border-haldi-500/50 shadow-haldi-900/10' : 'border-stone-800'}`}>
                            {isFamilyRec && <div className="bg-haldi-900/20 p-3 border-b border-haldi-500/20 flex items-center gap-3"><Users className="w-3 h-3 text-haldi-500" /><span className="text-haldi-500 text-xs font-bold uppercase">Family Rec</span></div>}
                            <div className="h-64 bg-stone-800 relative">{match.image_url ? <img src={match.image_url} className="w-full h-full object-cover opacity-90" /> : <User className="w-20 h-20 m-auto text-stone-700 absolute inset-0" />}
                                <button onClick={() => handleRemoveShortlist(item.id)} className="absolute top-2 right-2 p-2 bg-stone-950/50 hover:bg-red-900 text-white rounded-full"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-5"><h3 className="text-xl font-serif text-stone-100">{match.full_name}</h3><Link href={`/profile/${match.id}`} className="block mt-4 w-full text-center py-3 rounded-xl bg-stone-100 text-stone-950 font-bold text-sm">View Profile</Link></div>
                        </div>
                    );
                })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
