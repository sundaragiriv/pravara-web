"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Sparkles, User, Check, X,
  MessageCircle, Star, ShieldCheck, Users, SlidersHorizontal
} from "lucide-react";

// --- TYPE IMPORTS ---
import type {
  Profile,
  MatchProfile,
  ShortlistItem,
  RequestItem,
  ConnectedProfile,
  DashboardFilters
} from "@/types";

// --- COMPONENT IMPORTS ---
import MatchesSection from "@/components/MatchesSection";
import Sidebar from "@/components/Sidebar";
import DashboardSubNav from "@/components/navigation/DashboardSubNav";
import ProfileDetailsPanel from "@/components/ProfileDetailsPanel";
import { calculateGunaScore } from "@/utils/matchEngine";
import { notifyInterestSent } from "@/utils/notifications";
import { useShortlist } from "@/contexts/ShortlistContext";
import { getCollaboratorPermissions } from "@/utils/collaborator-permissions";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { toggle: toggleShortlist, count: shortlistCount } = useShortlist();

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<'explorer' | 'requests' | 'connections' | 'shortlist'>('explorer');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // --- NEW: SELECTED PROFILE STATE (For Slide-Over) ---
  const [selectedProfile, setSelectedProfile] = useState<MatchProfile | null>(null);

  // --- DATA STATE ---
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [connections, setConnections] = useState<ConnectedProfile[]>([]);
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);

  // --- USER STATE ---
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  
  // --- GUARDIAN STATE ---
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [viewingAs, setViewingAs] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roleLabel, setRoleLabel] = useState("");
  const [collaboratorPerms, setCollaboratorPerms] = useState(getCollaboratorPermissions("Parent"));
  
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

  // --- DEBOUNCED FILTER FETCH ---
  const filterDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // --- FILTER HELPER FUNCTIONS ---
  const updateFilter = (key: string, value: string | number | string[]) => {
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

  // --- SERVER-SIDE FILTERED FETCH ---
  const fetchFilteredMatches = useCallback(async () => {
    if (!viewingAs || !userProfile) return;

    const params = new URLSearchParams();
    params.set('excludeUser', viewingAs);
    params.set('minAge', filters.minAge.toString());
    params.set('maxAge', filters.maxAge.toString());
    if (filters.location) params.set('location', filters.location);
    if (filters.diet.length > 0) params.set('diet', filters.diet.join(','));
    if (filters.visa) params.set('visa', filters.visa);
    if (filters.gothra) params.set('gothra', filters.gothra);
    if (filters.searchTerm) params.set('search', filters.searchTerm);
    if (filters.minHeight) params.set('minHeight', filters.minHeight);
    if (filters.maxHeight) params.set('maxHeight', filters.maxHeight);

    setMatchesLoading(true);
    try {
      const response = await fetch(`/api/matches?${params.toString()}`);
      if (!response.ok) { setMatchesLoading(false); return; }

      const { profiles: rawProfiles } = await response.json();

      // Get connection statuses
      const { data: myConnections } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${viewingAs},receiver_id.eq.${viewingAs}`);

      const scored = rawProfiles.map((p: Profile) => {
        const connection = myConnections?.find((c: { sender_id: string; receiver_id: string }) =>
          (c.sender_id === viewingAs && c.receiver_id === p.id) ||
          (c.sender_id === p.id && c.receiver_id === viewingAs)
        );

        let connectionStatus: 'none' | 'sent' | 'received' | 'connected' | 'rejected' = 'none';
        if (connection) {
          if (connection.status === 'accepted') connectionStatus = 'connected';
          else if (connection.status === 'pending') {
            connectionStatus = connection.sender_id === viewingAs ? 'sent' : 'received';
          } else if (connection.status === 'rejected') connectionStatus = 'rejected';
        }

        const gunaResult = userProfile ? calculateGunaScore(p, userProfile) : undefined;
        return {
          ...p,
          score: gunaResult?.legacyScore ?? 0,
          gunaResult,
          connectionStatus
        };
      });

      setMatches(scored.sort((a: MatchProfile, b: MatchProfile) => b.score - a.score));
    } catch (error) {
      console.error('Filter fetch error:', error);
    } finally {
      setMatchesLoading(false);
    }
  }, [viewingAs, userProfile, filters, supabase]);

  // Debounced filter effect
  useEffect(() => {
    if (!userProfile) return;

    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
    }

    filterDebounceRef.current = setTimeout(() => {
      fetchFilteredMatches();
    }, 300);

    return () => {
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
    };
  }, [filters, fetchFilteredMatches, userProfile]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- GLOBAL MESSAGE NOTIFICATIONS ---
  // Fetch unread count function (extracted for reuse)
  const fetchUnreadCount = async (userId: string) => {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
    } else {
      setGlobalUnreadCount(count || 0);
    }
  };

  // Refetch unread count whenever user returns to this page (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUser) {
        fetchUnreadCount(currentUser.id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

  // Initial fetch and realtime subscription
  useEffect(() => {
    if (!currentUser) return;

    // Fetch immediately when currentUser is available
    fetchUnreadCount(currentUser.id);

    // Realtime subscription for ALL message events (INSERT and UPDATE)
    const channel = supabase
      .channel('global_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT' && payload.new.sender_id !== currentUser.id) {
            setGlobalUnreadCount((prev) => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            fetchUnreadCount(currentUser.id);
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
          setCollaboratorPerms(getCollaboratorPermissions(collaboration.role));
      } else {
          setViewingAs(user.id);
      }

      // 2. FETCH "MY" PROFILE
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
      
      if (profile) {
          setUserProfile(profile);
      }

      // 3. Matches will be fetched by the debounced filter effect when userProfile is set

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

  // Shortlist toggle — delegates to ShortlistContext (global source of truth).
  // Context handles optimistic update, DB write, and rollback on error.
  const handleShortlist = (profileId: string) => {
    if (isCollaborator && !collaboratorPerms.shortlist) {
      toast.error("Your role doesn't allow shortlisting");
      return;
    }
    toggleShortlist(profileId);
    // Refresh the shortlist tab data so it stays in sync if the tab is currently open
    if (activeTab === 'shortlist') fetchShortlistOnly();
  };

  const handleSendInterest = async (receiverId: string) => {
    if (!currentUser) return;
    if (isCollaborator && !collaboratorPerms.sendInterest) {
      toast.error("Your role doesn't allow sending interest");
      return;
    }
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
      console.error('handleSendInterest failed:', error.code, error.message, error.details);
      if (error.code === '23505') {
        toast.info('Interest already sent to this person');
      } else {
        toast.error('Could not send interest — please try again');
      }
    } else {
      await notifyInterestSent(receiverId, senderId);
    }
  };

  // Server-side filtering is now handled by /api/matches

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      
      {/* --- SHARED NAVBAR --- */}
      <DashboardSubNav
        showDashboardNav
        activeSection="explore"
        searchValue={filters.searchTerm}
        onSearchChange={(v) => setFilters(f => ({ ...f, searchTerm: v }))}
        requestsBadge={requests.length}
        chatBadge={globalUnreadCount}
        shortlistBadge={shortlistCount}
      />

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* --- SIDEBAR --- */}
        {activeTab === 'explorer' && (
          <div className={`flex-none transition-all duration-300 ${sidebarCollapsed ? 'lg:w-10' : 'w-full lg:w-72'}`}>
            {/* Collapse toggle (desktop only) */}
            <div className="hidden lg:flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(c => !c)}
                title={sidebarCollapsed ? 'Show filters' : 'Hide filters'}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-haldi-400 transition-colors"
              >
                <SlidersHorizontal size={13} />
                {!sidebarCollapsed && <span>Hide Filters</span>}
              </button>
            </div>

            <div className={`${sidebarCollapsed ? 'hidden lg:hidden' : 'block'}`}>
              <Sidebar
                isOpen={mobileFiltersOpen}
                onClose={() => setMobileFiltersOpen(false)}
                filters={filters}
                setFilters={setFilters}
                updateFilter={updateFilter}
                toggleFilter={toggleFilter}
                resetFilters={resetFilters}
                matchCount={matches.length}
              />
            </div>
          </div>
        )}

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 overflow-y-auto min-w-0">
          
            {/* 1. EXPLORER TAB (Using Smart Matches Section) */}
            {activeTab === 'explorer' && (
              <MatchesSection
                matches={matches}
                isLoading={loading || matchesLoading}
                onToggleMobileFilters={() => setMobileFiltersOpen(true)}
                onProfileClick={(profile) => setSelectedProfile(profile)}
                onSendInterest={handleSendInterest}
              />
            )}

          {/* 2. REQUESTS TAB (Your Original Logic) */}
          {activeTab === 'requests' && !isCollaborator && (
             <div className="space-y-4">
                {requests.length === 0 && <div className="text-center py-10 text-stone-500 italic">No pending requests.</div>}
                {requests.map((req) => (
                   <div key={req.id} className="flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-stone-800 overflow-hidden">
                          {req.sender.image_url ? <img src={req.sender.image_url} alt={req.sender.full_name} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-auto text-stone-600"/>}
                        </div>
                        <div><h4 className="text-lg font-serif text-stone-100">{req.sender.full_name}</h4><p className="text-sm text-stone-500">{req.sender.profession}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" aria-label="Decline request" onClick={() => handleResponse(req.id, 'rejected')} className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-red-400"><X className="w-5 h-5" /></button>
                        <button type="button" onClick={() => handleResponse(req.id, 'accepted')} className="px-6 py-3 rounded-xl bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold flex items-center gap-2"><Check className="w-4 h-4" /> Accept</button>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {/* 3. CONNECTIONS TAB (Your Original Logic) */}
          {activeTab === 'connections' && !isCollaborator && (
             <div className="grid gap-4">
                {connections.map((person) => (
                   <div key={person.id} className="p-6 bg-gradient-to-r from-stone-900 to-stone-950 border border-haldi-900/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                      <div className="flex items-center gap-4 w-full">
                        <div className="w-20 h-20 rounded-full border-2 border-haldi-600/30 p-1" aria-hidden="true">
                          <div className="w-full h-full rounded-full overflow-hidden bg-stone-800">
                            {person.image_url ? <img src={person.image_url} alt="" className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-auto text-stone-600"/>}
                          </div>
                        </div>
                        <div><h3 className="text-xl font-serif text-stone-100">{person.full_name}</h3><div className="flex items-center gap-2 text-haldi-500 text-sm font-bold mt-1"><Sparkles className="w-3 h-3" /> Connected</div></div>
                      </div>
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
                            <div className="h-64 bg-stone-800 relative">
                              {match.image_url ? <img src={match.image_url} alt="" className="w-full h-full object-cover opacity-90" /> : <User className="w-20 h-20 m-auto text-stone-700 absolute inset-0" aria-hidden="true" />}
                              <button type="button" aria-label={`Remove ${match.full_name} from shortlist`} onClick={() => handleRemoveShortlist(item.id)} className="absolute top-2 right-2 p-2 bg-stone-950/50 hover:bg-red-900 text-white rounded-full"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-5"><h3 className="text-xl font-serif text-stone-100">{match.full_name}</h3>
                            <button type="button" onClick={() => setSelectedProfile({ ...match, score: 0 })} className="block mt-4 w-full text-center py-3 rounded-xl bg-stone-100 text-stone-950 font-bold text-sm">View Profile</button>
                            </div>
                        </div>
                    );
                })}
            </div>
          )}
        </div>
      </main>

      {/* --- GLOBAL: PROFILE DETAILS SLIDE-OVER --- */}
      {/* Shortlist star now reads from ShortlistContext — no props needed */}
      <ProfileDetailsPanel
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        profile={selectedProfile}
        gunaResult={selectedProfile?.gunaResult}
        isPremium={userProfile?.membership_tier === 'Gold' || userProfile?.membership_tier === 'Concierge'}
        onConnect={() => {
          if (selectedProfile) {
            handleSendInterest(selectedProfile.id);
            setSelectedProfile((prev: any) => ({ ...prev, connectionStatus: 'sent' }));
          }
        }}
      />

    </div>
  );
}