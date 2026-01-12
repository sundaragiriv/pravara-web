"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { 
  Sparkles, User, LogOut, Search, Check, X, 
  MessageCircle, Star, ShieldCheck, Users, SlidersHorizontal, ChevronDown, Settings
} from "lucide-react";

// --- COMPONENT IMPORTS ---
import MatchesSection from "@/components/MatchesSection";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/NotificationBell";
import ProfileDetailsPanel from "@/components/ProfileDetailsPanel"; // <--- THE NEW SLIDE OVER
import { calculateMatchScore } from "@/utils/matchEngine";
import { notifyInterestSent } from "@/utils/notifications";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<'explorer' | 'requests' | 'connections' | 'shortlist'>('explorer');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // --- NEW: SELECTED PROFILE STATE (For Slide-Over) ---
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  
  // --- DATA STATE ---
  const [matches, setMatches] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [shortlist, setShortlist] = useState<any[]>([]);
  
  // --- USER STATE ---
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState("User");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [completionPercent, setCompletionPercent] = useState(0); 
  
  // --- GUARDIAN STATE ---
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [viewingAs, setViewingAs] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roleLabel, setRoleLabel] = useState(""); 
  
  // --- GLOBAL UNREAD MESSAGES COUNT ---
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0); 
  
  // --- FILTER ENGINE STATE ---
  const [filters, setFilters] = useState({
    minAge: 21,
    maxAge: 40,
    location: "",
    community: "",
    searchTerm: "",
    diet: [] as string[],
    visa: "",
    minHeight: "",
    maxHeight: "",
    gothra: ""
  });

  // --- FILTER HELPER FUNCTIONS ---
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFilter = (key: string, value: string) => {
    setFilters(prev => {
      const current = prev[key as keyof typeof prev] as string[];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(i => i !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const resetFilters = () => {
    setFilters({ 
      minAge: 21, maxAge: 40, location: "", community: "", searchTerm: "",
      diet: [], visa: "", minHeight: "", maxHeight: "", gothra: ""
    });
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- GLOBAL MESSAGE NOTIFICATIONS ---
  useEffect(() => {
    if (!currentUser) return;

    // Fetch initial unread count (simplified - RLS handles connection filtering)
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', currentUser.id)
        .eq('is_read', false);
      
      if (error) {
        console.error('Error fetching unread count:', error);
      } else {
        console.log('Unread count:', count);
        setGlobalUnreadCount(count || 0);
      }
    };

    fetchUnreadCount();

    // Realtime subscription for ALL message events (INSERT and UPDATE)
    const channel = supabase
      .channel('global_notifications')
      .on(
        'postgres_changes',
        { 
          event: '*', // Listen to ALL events (Insert & Update)
          schema: 'public', 
          table: 'messages'
        },
        (payload: any) => {
          console.log('Message event:', payload.eventType, payload);
          
          // If NEW message comes in -> Increment (only if I'm not the sender)
          if (payload.eventType === 'INSERT' && payload.new.sender_id !== currentUser.id) {
            console.log('New message received, incrementing count');
            setGlobalUnreadCount((prev) => prev + 1);
          }
          // If message is READ (Updated) -> Re-fetch to ensure accuracy
          else if (payload.eventType === 'UPDATE') {
            console.log('Message updated (marked as read), re-fetching count');
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  // Force reload Shortlist whenever tab is clicked
  useEffect(() => {
    if (activeTab === 'shortlist' && viewingAs) {
        fetchShortlistOnly();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchShortlistOnly = async () => {
    if (!viewingAs) return;
    const { data: savedItems } = await supabase
        .from('shortlists')
        .select('*, profile:profiles!profile_id (*)')
        .eq('user_id', viewingAs);
    if (savedItems) setShortlist(savedItems);
  };

  const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      let targetUserId = user.id;

      // 1. IDENTITY CHECK (Guardian Logic)
      const { data: collaboration } = await supabase
          .from('collaborators')
          .select('user_id, role')
          .eq('collaborator_email', user.email)
          .maybeSingle();

      if (collaboration) {
          setIsCollaborator(true);
          setViewingAs(collaboration.user_id);
          targetUserId = collaboration.user_id;
          setRoleLabel(`Guardian Mode (${collaboration.role})`);
      } else {
          setViewingAs(user.id);
      }

      // 2. FETCH "MY" PROFILE
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
      
      if (profile) {
          setUserProfile(profile);
          setUserName(profile.full_name?.split(' ')[0] || "User");
          setUserPhoto(profile.image_url);
          
          if (!isCollaborator) {
             const fields = [profile.full_name, profile.image_url, profile.bio, profile.location, profile.profession, profile.education, profile.gothra, profile.audio_bio_url];
             const filled = fields.filter(f => f && f.length > 0).length;
             setCompletionPercent(Math.round((filled / fields.length) * 100));
          }
      }

      // 3. PARALLEL FETCH
      const [profilesResponse, connectionsResponse] = await Promise.all([
          supabase.from('profiles').select('*').neq('id', targetUserId).limit(100),
          supabase.from('connections').select('*').or(`sender_id.eq.${targetUserId},receiver_id.eq.${targetUserId}`)
      ]);

      const rawProfiles = profilesResponse.data || [];
      const myConnections = connectionsResponse.data || [];
      
      if (rawProfiles && profile) {
          const scored = rawProfiles.map(p => {
              const connection = myConnections.find(c => 
                  (c.sender_id === targetUserId && c.receiver_id === p.id) || 
                  (c.sender_id === p.id && c.receiver_id === targetUserId)
              );

              let connectionStatus: 'none' | 'sent' | 'received' | 'connected' | 'rejected' = 'none';

              if (connection) {
                  if (connection.status === 'accepted') connectionStatus = 'connected';
                  else if (connection.status === 'pending') {
                      connectionStatus = connection.sender_id === targetUserId ? 'sent' : 'received';
                  } else if (connection.status === 'rejected') connectionStatus = 'rejected';
              }
              
              return {
                  ...p,
                  score: calculateMatchScore(p, profile),
                  connectionStatus
              };
          });

          setMatches(scored.sort((a, b) => b.score - a.score));
      }

      // 4. FETCH REQUESTS & CONNECTIONS
      if (!isCollaborator) {
          const { data: incoming } = await supabase.from('connections').select(`*, sender:profiles!connections_sender_id_fkey (*)`).eq('receiver_id', user.id).eq('status', 'pending');
          if (incoming) setRequests(incoming);

          const { data: myConns } = await supabase.from('connections').select(`*, sender:profiles!connections_sender_id_fkey (*), receiver:profiles!connections_receiver_id_fkey (*)`).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).eq('status', 'accepted');
          if (myConns) {
              const formatted = myConns.map(c => {
                  const partner = c.sender_id === user.id ? c.receiver : c.sender;
                  return { ...partner, connection_id: c.id, connected_at: c.created_at };
              });
              setConnections(formatted);
          }
      }

      // 5. FETCH SHORTLIST
      const { data: savedItems } = await supabase.from('shortlists').select('*, profile:profiles!profile_id (*)').eq('user_id', targetUserId);
      if (savedItems) setShortlist(savedItems);

      setLoading(false);
  };
  
  const handleRemoveShortlist = async (itemId: string) => {
    setShortlist(prev => prev.filter(i => i.id !== itemId));
    await supabase.from('shortlists').delete().eq('id', itemId);
  };

  const handleResponse = async (connectionId: string, status: 'accepted' | 'rejected') => {
    setRequests(prev => prev.filter(r => r.id !== connectionId)); 
    await supabase.from('connections').update({ status }).eq('id', connectionId);
    fetchData(); 
  };

  const handleShortlist = async (profileId: string) => {
    if (!currentUser) return;

    // A. Find the current status
    const profile = matches.find(m => m.id === profileId);
    const isCurrentlyShortlisted = shortlist.some(s => s.profile.id === profileId);

    // B. Optimistic Update (Update UI Instantly)
    if (isCurrentlyShortlisted) {
      // Remove from local shortlist state
      setShortlist(prev => prev.filter(s => s.profile.id !== profileId));
      // Update the Slide-Over state if it's open
      if (selectedProfile?.id === profileId) {
        setSelectedProfile((prev: any) => ({ ...prev, isShortlisted: false }));
      }
    } else {
      // Add to local shortlist state
      const newShortlistItem = { id: Date.now().toString(), profile: profile }; 
      setShortlist((prev: any) => [newShortlistItem, ...prev]);
      // Update Slide-Over state
      if (selectedProfile?.id === profileId) {
        setSelectedProfile((prev: any) => ({ ...prev, isShortlisted: true }));
      }
    }

    // C. Database Operation (Supabase)
    if (isCurrentlyShortlisted) {
      await supabase.from('shortlists').delete().eq('user_id', currentUser.id).eq('profile_id', profileId);
    } else {
      await supabase.from('shortlists').insert({ user_id: currentUser.id, profile_id: profileId });
    }
  };

  const handleSendInterest = async (receiverId: string) => {
    if (!currentUser) return;
    const senderId = viewingAs || currentUser.id;
    
    // Optimistic Update
    setMatches(prev => prev.map(m => 
      m.id === receiverId ? { ...m, connectionStatus: 'sent' } : m
    ));
    
    const { error } = await supabase.from('connections').insert({
      sender_id: senderId, receiver_id: receiverId, status: 'pending'
    });
    
    if (error) {
      setMatches(prev => prev.map(m => m.id === receiverId ? { ...m, connectionStatus: 'none' } : m));
      console.error(error);
    } else {
      await notifyInterestSent(receiverId, senderId);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // --- POWER FILTER LOGIC ---
  const filteredMatches = matches.filter(m => {
      if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          const textMatch = (m.full_name?.toLowerCase().includes(term) || m.location?.toLowerCase().includes(term) || m.profession?.toLowerCase().includes(term));
          if (!textMatch) return false;
      }
      if (m.age < filters.minAge || m.age > filters.maxAge) return false;
      if (filters.minHeight && m.height && m.height < Number(filters.minHeight)) return false;
      if (filters.maxHeight && m.height && m.height > Number(filters.maxHeight)) return false;
      
      if (filters.diet.length > 0) {
          const profileDiet = m.diet || '';
          const hasMatch = filters.diet.some(d => profileDiet.toLowerCase().includes(d.toLowerCase()));
          if (!hasMatch) return false;
      }
      if (filters.visa && !m.visa_status?.toLowerCase().includes(filters.visa.toLowerCase())) return false;
      if (filters.location && !m.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.gothra) {
          const search = filters.gothra.toLowerCase();
          const text = `${m.sub_community || ''} ${m.gothra || ''} ${m.nakshatra || ''} ${m.rashi || ''}`.toLowerCase();
          if (!text.includes(search)) return false;
      }
      return true;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      
      {/* --- HEADER --- */}
      <nav className="border-b border-stone-900 bg-stone-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-serif text-2xl font-bold bg-gradient-to-r from-haldi-500 to-haldi-700 bg-clip-text text-transparent">P</Link>
            
            <div className="hidden md:flex bg-stone-900 rounded-full p-1 border border-stone-800 items-center">
              <button onClick={() => setActiveTab('explorer')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'explorer' ? 'bg-stone-800 text-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}>Explorer</button>
              {!isCollaborator && (
                <>
                    <Link href="/dashboard/requests" className="px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 text-stone-500 hover:text-stone-300">Requests {requests.length > 0 && <span className="bg-haldi-600 text-stone-950 text-[10px] font-bold px-1.5 rounded-full">{requests.length}</span>}</Link>
                    <Link href="/dashboard/chat" className="px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 text-stone-500 hover:text-stone-300">
                      Chat
                      {globalUnreadCount > 0 && (
                        <span className="bg-haldi-500 text-black text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                          {globalUnreadCount}
                        </span>
                      )}
                    </Link>
                    <div className="w-px h-4 bg-stone-800 mx-2"></div>
                    <Link href="/onboarding" className="px-4 py-1.5 rounded-full text-haldi-500 hover:text-haldi-400 text-sm font-bold flex items-center gap-2 transition-colors"><Sparkles className="w-3 h-3" /> Sutradhar</Link>
                </>
              )}
              <Link href="/dashboard/shortlist" className="ml-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 text-stone-500 hover:text-stone-300">Shortlist {shortlist.length > 0 && <span className="bg-haldi-600 text-stone-950 text-[10px] font-bold px-1.5 rounded-full">{shortlist.length}</span>}</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Global Search Bar */}
             <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input 
                   type="text" 
                   placeholder="Search profiles, locations..."
                   value={filters.searchTerm}
                   onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                   className="bg-stone-900 border border-stone-800 rounded-full py-2 pl-10 pr-4 text-sm text-stone-300 w-64 focus:border-haldi-500/50 focus:outline-none transition-colors"
                />
             </div>

             <NotificationBell />
             
             {/* User Menu with Dropdown */}
             <div className="relative">
                <button 
                   onClick={() => setDropdownOpen(!dropdownOpen)}
                   className="flex items-center gap-3 hover:bg-stone-900/50 rounded-full pr-3 transition-colors group"
                >
                   {/* Avatar with Circular Progress Ring */}
                   <div className="relative">
                      <svg className="w-11 h-11 -rotate-90">
                         <circle cx="22" cy="22" r="20" fill="none" stroke="#292524" strokeWidth="2.5"/>
                         <circle 
                            cx="22" cy="22" r="20" 
                            fill="none" 
                            stroke="#d97706" 
                            strokeWidth="2.5"
                            strokeDasharray={`${completionPercent * 1.256} 125.6`}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                         />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-8 h-8 rounded-full bg-haldi-700 flex items-center justify-center text-stone-950 font-bold overflow-hidden border border-haldi-600">
                            {userPhoto ? <img src={userPhoto} alt="Me" className="w-full h-full object-cover" /> : <span>{userName[0]}</span>}
                         </div>
                      </div>
                   </div>
                   
                   {/* Name and Greeting */}
                   <div className="text-left hidden sm:block">
                      <div className="font-serif text-stone-200 leading-tight">
                         <span className="text-stone-400">Namaste, </span>
                         <span className="text-haldi-500 font-bold">{userName}</span>
                      </div>
                      {currentUser?.id && (
                         <div className="text-[10px] text-stone-600 font-mono mt-0.5">
                            ID: PRV-{currentUser.id.slice(0, 4).toUpperCase()}
                         </div>
                      )}
                   </div>
                   <ChevronDown className="w-4 h-4 text-stone-500 group-hover:text-stone-300 transition-colors hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                   <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      <div className="p-3 border-b border-stone-800 bg-stone-950/50">
                         <div className="text-xs text-stone-500 uppercase tracking-wider">Profile Strength</div>
                         <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                               <div className="h-full bg-haldi-600 rounded-full transition-all duration-1000" style={{ width: `${completionPercent}%` }} />
                            </div>
                            <span className="text-xs font-bold text-haldi-500">{completionPercent}%</span>
                         </div>
                      </div>
                      <Link href="/dashboard/edit-profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800 transition-colors text-stone-300 hover:text-white">
                         <User className="w-4 h-4" /> <span className="text-sm font-medium">Edit Profile</span>
                      </Link>
                      <Link href="/dashboard/edit-profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800 transition-colors text-stone-300 hover:text-white">
                         <SlidersHorizontal className="w-4 h-4" /> <span className="text-sm font-medium">Partner Preferences</span>
                      </Link>
                      <div className="border-t border-stone-800 my-1"></div>
                      <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800 transition-colors text-stone-300 hover:text-white">
                         <Settings className="w-4 h-4" /> <span className="text-sm font-medium">Account Settings</span>
                      </Link>
                      <a href="#" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-stone-800 transition-colors text-stone-300 hover:text-white">
                         <ShieldCheck className="w-4 h-4" /> <span className="text-sm font-medium">Help Center</span>
                      </a>
                      <div className="border-t border-stone-800">
                         <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-red-950/30 transition-colors text-red-400 hover:text-red-300 w-full text-left">
                            <LogOut className="w-4 h-4" /> <span className="text-sm font-medium">Sign Out</span>
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* --- SIDEBAR --- */}
        <div className="w-full lg:w-80 flex-none">
          {activeTab === 'explorer' && (
            <Sidebar 
              isOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
              filters={filters}
              setFilters={setFilters}
              // @ts-ignore
              updateFilter={updateFilter}
              // @ts-ignore
              toggleFilter={toggleFilter}
              // @ts-ignore
              resetFilters={resetFilters}
              matchCount={filteredMatches.length}
            />
          )}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 overflow-y-auto">
          
            {/* 1. EXPLORER TAB (Using Smart Matches Section) */}
            {activeTab === 'explorer' && (
              <MatchesSection 
                matches={filteredMatches}
                isLoading={loading}
                onToggleMobileFilters={() => setMobileFiltersOpen(true)}
                onProfileClick={(profile) => setSelectedProfile(profile)}
                shortlist={shortlist}
                onShortlist={handleShortlist}
              />
            )}

          {/* 2. REQUESTS TAB (Your Original Logic) */}
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

          {/* 3. CONNECTIONS TAB (Your Original Logic) */}
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

          {/* 4. SHORTLIST TAB (Your Original Logic) */}
          {activeTab === 'shortlist' && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {shortlist.length === 0 && <div className="col-span-3 text-center py-12 border border-dashed border-stone-800 rounded-2xl bg-stone-900/20"><Star className="w-8 h-8 text-stone-600 mx-auto mb-3" /><h3 className="text-stone-300 font-medium">Your Treasury is Empty</h3><p className="text-stone-500 text-sm mt-1">Star profiles to save them here.</p></div>}
                {shortlist.map((item) => {
                    const match = item.profile; 
                    const isFamilyRec = item.added_by_email !== currentUser?.email;
                    if (!match) return null; 
                    return (
                        <div key={item.id} className={`relative bg-stone-900 border rounded-2xl overflow-hidden shadow-xl ${isFamilyRec ? 'border-haldi-500/50 shadow-haldi-900/10' : 'border-stone-800'}`}>
                            {isFamilyRec && <div className="bg-haldi-900/20 p-3 border-b border-haldi-500/20 flex items-center gap-3"><Users className="w-3 h-3 text-haldi-500" /><span className="text-haldi-500 text-xs font-bold uppercase">Family Rec</span></div>}
                            <div className="h-64 bg-stone-800 relative">{match.image_url ? <img src={match.image_url} className="w-full h-full object-cover opacity-90" /> : <User className="w-20 h-20 m-auto text-stone-700 absolute inset-0" />}
                                <button onClick={() => handleRemoveShortlist(item.id)} className="absolute top-2 right-2 p-2 bg-stone-950/50 hover:bg-red-900 text-white rounded-full"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-5"><h3 className="text-xl font-serif text-stone-100">{match.full_name}</h3>
                            {/* Updated to open Slide-Over instead of redirecting */}
                            <button onClick={() => setSelectedProfile(match)} className="block mt-4 w-full text-center py-3 rounded-xl bg-stone-100 text-stone-950 font-bold text-sm">View Profile</button>
                            </div>
                        </div>
                    );
                })}
            </div>
          )}
        </div>
      </main>

      {/* --- GLOBAL: PROFILE DETAILS SLIDE-OVER --- */}
      <ProfileDetailsPanel 
        isOpen={!!selectedProfile} 
        onClose={() => setSelectedProfile(null)}
        profile={selectedProfile}
        isPremium={false} // Set to true to test premium view, false to see lock overlay
        // Check if this specific profile is in the shortlist array
        isShortlisted={shortlist.some(s => s.profile?.id === selectedProfile?.id)}
        
        // Pass action handlers to sync state
        onConnect={() => {
          if (selectedProfile) {
            handleSendInterest(selectedProfile.id);
            // Optimistically update the selected profile to show "Pending" immediately
            setSelectedProfile((prev: any) => ({ ...prev, connectionStatus: 'sent' }));
          }
        }}
        onShortlist={() => {
          if (selectedProfile) handleShortlist(selectedProfile.id);
        }}
      />

    </div>
  );
}