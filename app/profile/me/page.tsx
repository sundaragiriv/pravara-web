"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, MapPin, Briefcase, GraduationCap, 
  Sparkles, Edit3, ShieldCheck, User, Camera, Loader2 
} from "lucide-react";

export default function MyProfile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data);
    } else {
      router.push("/login");
    }
    setLoading(false);
  };

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

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile Database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Refresh UI
      await fetchMyProfile();
      alert("Profile photo updated!");

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading your profile...</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans pb-20">
      
      {/* Navigation */}
      <nav className="p-6 sticky top-0 z-50 bg-gradient-to-b from-stone-950/90 to-transparent">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-300 hover:text-haldi-500 transition-colors bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <main className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column: Photo & Actions */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-stone-800 shadow-2xl relative bg-stone-900 flex items-center justify-center group">
               {/* Image Display */}
               {profile.image_url ? (
                 <img 
                   src={profile.image_url} 
                   alt={profile.full_name}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <User className="w-20 h-20 text-stone-700" />
               )}

               {/* Upload Overlay (Hover) */}
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-2"
               >
                 {uploading ? <Loader2 className="w-8 h-8 text-white animate-spin"/> : <Camera className="w-8 h-8 text-white" />}
                 <span className="text-white text-xs font-bold uppercase tracking-wider">Change Photo</span>
               </div>
               
               {/* Hidden Input */}
               <input 
                 type="file" 
                 ref={fileInputRef}
                 onChange={handleImageUpload}
                 accept="image/*"
                 className="hidden"
               />
            </div>

            {/* EDIT BUTTON */}
            <Link 
                href="/onboarding" 
                className="w-full py-4 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
                 <Edit3 className="w-4 h-4" /> Update with Sutradhar
            </Link>
            <p className="text-xs text-center text-stone-500">
                To update your bio or gothra, simply chat with Pravara.
            </p>
          </div>

          {/* Right Column: Details (Same as before) */}
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-4xl font-serif text-stone-100 mb-2">{profile.full_name}</h1>
              <div className="flex flex-wrap gap-4 text-stone-400 text-sm">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-stone-600" /> {profile.location || "Location Not Set"}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-stone-600" /> {profile.profession || "Profession Not Set"}</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-stone-600" /> {profile.education || "Education Not Set"}</span>
              </div>
            </div>

            {/* Data Missing Alert */}
            {(!profile.gothra || !profile.partner_preferences) && (
                <div className="p-4 bg-haldi-900/10 border border-haldi-500/30 rounded-xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-haldi-500 mt-0.5" />
                    <div>
                        <h4 className="text-haldi-500 font-bold text-sm">Profile Incomplete</h4>
                        <p className="text-stone-400 text-sm mt-1">Your profile is missing key details (Gothra, Preferences). This reduces your match quality.</p>
                        <Link href="/onboarding" className="text-stone-200 text-sm underline hover:text-white mt-2 inline-block">Complete Profile &rarr;</Link>
                    </div>
                </div>
            )}

            {/* Cultural Details Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-stone-500 text-xs uppercase mb-1">Gothra</div>
                  <div className="text-stone-200 font-serif text-lg">{profile.gothra || "-"}</div>
               </div>
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-stone-500 text-xs uppercase mb-1">Community</div>
                  <div className="text-stone-200 font-serif text-lg">{profile.sub_community || "-"}</div>
               </div>
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-stone-500 text-xs uppercase mb-1">Partner Preferences</div>
                  <div className="text-stone-200 text-sm leading-relaxed">{profile.partner_preferences || "Not specified yet."}</div>
               </div>
               <div className="p-4 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="text-stone-500 text-xs uppercase mb-1">Status</div>
                  <div className="text-green-500 flex items-center gap-1.5 text-sm font-medium">
                     <ShieldCheck className="w-4 h-4" /> Active Member
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
