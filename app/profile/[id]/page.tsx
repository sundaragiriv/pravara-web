"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  MapPin, Briefcase, GraduationCap, ArrowLeft, 
  Heart, Check, User, Sparkles, Star 
} from "lucide-react";
import Link from "next/link";
import VoicePlayer from "@/components/VoicePlayer";
import ProfileGallery from "@/components/ProfileGallery";
import VaraahiShield from "@/components/VaraahiShield";

export default function UserProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  
  // Guardian State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewingAs, setViewingAs] = useState<string | null>(null);
  const [isCollaborator, setIsCollaborator] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // 1. Guardian Check (Safe Fetch)
        const { data: collaboration } = await supabase
           .from('collaborators')
           .select('user_id')
           .eq('collaborator_email', user.email)
           .maybeSingle();
        
        if (collaboration) {
            setIsCollaborator(true);
            setViewingAs(collaboration.user_id);
        } else {
            setViewingAs(user.id);
        }

        // 2. Connection Status (Safe Fetch)
        const { data: connection } = await supabase
          .from('connections')
          .select('status')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${id},receiver_id.eq.${id}`)
          .maybeSingle();
        
        if (connection) setConnectionStatus(connection.status);
      }

      // 3. Fetch Match Profile (Safe Fetch)
      const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      
      if (data) {
          setProfile(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleConnect = async () => {
    const supabase = createClient();
    if (!currentUser) return router.push("/login");

    const { error } = await supabase.from('connections').insert({
      sender_id: currentUser.id,
      receiver_id: id,
      status: 'pending'
    });

    if (!error) {
      setConnectionStatus('pending');
      alert("Interest Sent!");
    }
  };

  const handleShortlist = async () => {
    const supabase = createClient();
    if (!currentUser || !viewingAs) return;

    const { error } = await supabase.from('shortlists').insert({
        user_id: viewingAs,
        profile_id: id,
        added_by_email: currentUser.email,
        note: isCollaborator ? "Recommended from Profile Page" : "Saved from Profile Page"
    });

    if (!error) {
        alert(isCollaborator ? "Added to family shortlist!" : "Profile Starred!");
    } else {
        console.error(error);
        alert("Could not shortlist. Check console.");
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading...</div>;
  if (!profile) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Profile not found</div>;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans pb-20">
      <nav className="p-6 sticky top-0 z-50 bg-gradient-to-b from-stone-950/90 to-transparent">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-300 hover:text-haldi-500 transition-colors bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <main className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          <div className="w-full md:w-1/3 space-y-6">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-stone-800 relative bg-stone-900 flex items-center justify-center">
               {profile.image_url ? <img src={profile.image_url} className="w-full h-full object-cover" /> : <User className="w-20 h-20 text-stone-700" />}
            </div>

            <div className="flex gap-3">
                {connectionStatus === 'pending' ? (
                    <button disabled className="flex-1 py-4 bg-stone-800 text-stone-400 font-bold rounded-xl border border-stone-700 cursor-not-allowed">Interest Sent</button>
                ) : connectionStatus === 'accepted' ? (
                    <button disabled className="flex-1 py-4 bg-green-900/30 text-green-500 font-bold rounded-xl border border-green-900/50 flex items-center justify-center gap-2"><Check className="w-5 h-5" /> Connected</button>
                ) : (
                    <button onClick={handleConnect} className="flex-1 py-4 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl transition-all shadow-lg shadow-haldi-900/20 flex items-center justify-center gap-2"><Heart className="w-5 h-5 fill-current" /> Send Interest</button>
                )}
                <button onClick={handleShortlist} className="w-16 flex items-center justify-center rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-haldi-500 border border-stone-700 transition-colors"><Star className="w-6 h-6" /></button>
            </div>

            {profile.audio_bio_url && <div className="pt-4"><VoicePlayer audioUrl={profile.audio_bio_url} /></div>}
            <div className="pt-4"><VaraahiShield profileId={profile.id} isOwnProfile={false} /></div>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-4xl font-serif text-stone-100 mb-2">{profile.full_name}</h1>
              <div className="flex flex-wrap gap-4 text-stone-400 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-stone-600" /> {profile.location || "N/A"}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-stone-600" /> {profile.profession || "N/A"}</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-stone-600" /> {profile.education || "N/A"}</span>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
                <h3 className="text-haldi-500 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4" /> About</h3>
                <p className="text-stone-300 leading-relaxed font-serif text-lg">"{profile.bio || "No bio added yet."}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800"><div className="text-stone-500 text-xs uppercase mb-1">Gothra</div><div className="text-stone-200 font-serif text-lg">{profile.gothra || "-"}</div></div>
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800"><div className="text-stone-500 text-xs uppercase mb-1">Community</div><div className="text-stone-200 font-serif text-lg">{profile.sub_community || "-"}</div></div>
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 col-span-2"><div className="text-stone-500 text-xs uppercase mb-1">Partner Preferences</div><div className="text-stone-200 text-sm leading-relaxed">{profile.partner_preferences || "Not specified."}</div></div>
            </div>

            <div className="pt-8 border-t border-stone-800"><ProfileGallery profileId={profile.id} editable={false} /></div>
          </div>
        </div>
      </main>
    </div>
  );
}