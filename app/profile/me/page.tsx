"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, MapPin, Briefcase, GraduationCap, 
  Edit3, User, Camera, Loader2 
} from "lucide-react";
import VoiceRecorder from "@/components/VoiceRecorder";
import VoicePlayer from "@/components/VoicePlayer";
import ProfileGallery from "@/components/ProfileGallery";
import VaraahiShield from "@/components/VaraahiShield";
import KutumbaInvite from "@/components/KutumbaInvite";

export default function MyProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 1. Fetch Logic - STRICTLY AUTH BASED (No params)
  const fetchMyProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Use .maybeSingle() to avoid 406 crash if profile is missing
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      if (data) {
        setProfile(data);
      } else {
        router.push("/onboarding"); // No profile? Go create one.
      }
    } else {
      router.push("/login");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleAudioUpdate = (url: string) => fetchMyProfile();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ image_url: publicUrl }).eq('id', user.id);
      await fetchMyProfile();

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading...</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans pb-20">
      <nav className="p-6 sticky top-0 z-50 bg-gradient-to-b from-stone-950/90 to-transparent">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-300 hover:text-haldi-500 transition-colors bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      {/* Responsive Container: Wide on desktop (max-w-7xl) */}
      <main className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* --- LEFT COLUMN: Manager Tools --- */}
          <div className="w-full md:w-1/3 space-y-6">
            
            {/* 1. Main Photo with Edit Overlay */}
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl relative bg-stone-900 flex items-center justify-center group">
               {profile.image_url ? (
                 <img src={profile.image_url} alt={profile.full_name} className="w-full h-full object-cover" />
               ) : (
                 <User className="w-20 h-20 text-stone-700" />
               )}
               <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-2">
                 {uploading ? <Loader2 className="w-8 h-8 text-white animate-spin"/> : <Camera className="w-8 h-8 text-white" />}
                 <span className="text-white text-xs font-bold uppercase tracking-wider">Change Photo</span>
               </div>
               <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

            {/* 2. Sutradhar Update Link */}
            <Link href="/onboarding" className="w-full py-4 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                 <Edit3 className="w-4 h-4" /> Update with Sutradhar
            </Link>

            {/* 3. Voice Manager */}
            <div className="pt-6 border-t border-stone-800">
                <div className="mb-4">
                    <h3 className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Voice Bio</h3>
                    {profile.audio_bio_url && <VoicePlayer audioUrl={profile.audio_bio_url} />}
                </div>
                <VoiceRecorder onUploadComplete={handleAudioUpdate} />
            </div>
          </div>

          {/* --- RIGHT COLUMN: Content & Family --- */}
          <div className="flex-1 w-full space-y-8">
            
            {/* 1. Identity Header */}
            <div>
              <h1 className="text-4xl font-serif text-stone-100 mb-2">{profile.full_name}</h1>
              <div className="flex flex-wrap gap-4 text-stone-400 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-stone-600" /> {profile.location || "Location Not Set"}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-stone-600" /> {profile.profession || "Profession Not Set"}</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-stone-600" /> {profile.education || "Education Not Set"}</span>
              </div>
            </div>

            {/* 2. Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-stone-500 text-xs uppercase mb-1">Gothra</div>
                  <div className="text-stone-200 font-serif text-lg">{profile.gothra || "-"}</div>
               </div>
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-stone-500 text-xs uppercase mb-1">Community</div>
                  <div className="text-stone-200 font-serif text-lg">{profile.sub_community || "-"}</div>
               </div>
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 sm:col-span-2">
                  <div className="text-stone-500 text-xs uppercase mb-1">Partner Preferences</div>
                  <div className="text-stone-200 text-sm leading-relaxed">{profile.partner_preferences || "Not specified yet."}</div>
               </div>
            </div>

            {/* 3. Gallery Manager */}
            <div className="pt-8 border-t border-stone-800">
               <ProfileGallery profileId={profile.id} editable={true} />
            </div>

            {/* 4. Trust & Family (The new pillars) */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-stone-800">
               <VaraahiShield profileId={profile.id} isOwnProfile={true} />
               <KutumbaInvite />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}