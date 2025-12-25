"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, MapPin, Briefcase, GraduationCap, 
  Sparkles, Heart, ShieldCheck, Check, Loader2, ScrollText 
} from "lucide-react";
import CompatibilityReport from "@/components/CompatibilityReport";
import KundaliCanvas from "@/components/KundaliCanvas";

export default function MatchProfile() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        
        if (user) {
          const { data: myRequest } = await supabase
            .from('connections')
            .select('status')
            .eq('sender_id', user.id)
            .eq('receiver_id', profileData.id)
            .maybeSingle();

          if (myRequest) setConnectionStatus(myRequest.status);
        }
      }
      setLoading(false);
    };

    if (params.id) fetchData();
  }, [params.id]);

  const sendInterest = async () => {
    if (!profile) return;
    setSending(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('connections')
        .insert({
          sender_id: user.id,
          receiver_id: profile.id,
          status: 'pending'
        });

      if (!error) {
        setConnectionStatus('pending');
      } else {
        console.error("Connection Error:", error);
        alert("Unable to send request!");
      }
    }
    setSending(false);
  };

  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading...</div>;
  if (!profile) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Profile not found</div>;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans pb-20">
      <nav className="p-6 sticky top-0 z-50 bg-gradient-to-b from-stone-950/90 to-transparent">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-300 hover:text-haldi-500 transition-colors bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      <main className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl relative">
              <div className="absolute top-4 right-4 bg-stone-950/80 backdrop-blur-md border border-haldi-500/30 text-haldi-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                <Heart className="w-3 h-3 fill-haldi-500" />92% Score
              </div>
              <img src={profile.image_url || "/api/placeholder/400/500"} alt={profile.full_name} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {connectionStatus === 'pending' ? (
                <button disabled className="py-4 bg-stone-800 text-stone-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-stone-700">
                  <Check className="w-5 h-5" /> Request Sent
                </button>
              ) : connectionStatus === 'accepted' ? (
                <button className="py-4 bg-green-900/50 text-green-400 border border-green-800 font-bold rounded-xl flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" /> Connected!
                </button>
              ) : (
                <button onClick={sendInterest} disabled={sending} className="py-4 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl transition-all shadow-lg shadow-haldi-900/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
                  {sending ? "Sending..." : "Send Interest"}
                </button>
              )}
              <p className="text-center text-xs text-stone-500">{connectionStatus === 'pending' ? "Sutradhar has delivered your proposal." : "Sending interest notifies them via Narada Alerts."}</p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-4xl font-serif text-stone-100 mb-2">{profile.full_name}</h1>
              <div className="flex flex-wrap gap-4 text-stone-400 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location || "Private"}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {profile.profession || "Professional"}</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {profile.education || "University Grad"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-haldi-500 text-xs font-bold uppercase">About</h2>
              <p className="text-stone-300 leading-relaxed text-lg">{profile.bio || "Ask Sutradhar to find out more!"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-stone-500 text-xs uppercase mb-1">Gothra</div>
                <div className="text-stone-200 font-serif text-lg">{profile.gothra || "Not Specified"}</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-stone-500 text-xs uppercase mb-1">Community</div>
                <div className="text-stone-200 font-serif text-lg">{profile.sub_community || "Brahmin"}</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-stone-500 text-xs uppercase mb-1">Diet</div>
                <div className="text-stone-200 font-serif text-lg">Vegetarian</div>
              </div>
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                <div className="text-stone-500 text-xs uppercase mb-1">Verification</div>
                <div className="text-green-500 flex items-center gap-1.5 text-sm font-medium">
                  <ShieldCheck className="w-4 h-4" /> Varaahi Verified
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-haldi-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Heart className="w-24 h-24 text-haldi-500" /></div>
              <div className="relative z-10">
                <h3 className="text-haldi-500 font-serif text-lg mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />The Manmadha Insight
                </h3>
                <p className="text-stone-400 text-sm italic leading-relaxed">"While the stars align for your Gothras, the Manmadha Score suggests a rare emotional spark."</p>
                <button 
                  onClick={() => setShowReport(true)}
                  className="mt-4 w-full py-2 bg-stone-950/50 hover:bg-stone-950 text-haldi-500 border border-haldi-500/30 rounded-lg text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <ScrollText className="w-4 h-4" /> View Detailed Report
                </button>
              </div>
            </div>

            {/* Kundali Canvas */}
            <KundaliCanvas score={33} />
          </div>
        </div>
      </main>

      {profile && (
        <CompatibilityReport 
          isOpen={showReport} 
          onClose={() => setShowReport(false)} 
          matchName={profile.full_name} 
          matchId={profile.id} 
        />
      )}
    </div>
  );
}
