"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Bell, Eye, EyeOff, Shield, Loader2, Save 
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings State
  const [isVisible, setIsVisible] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setUserEmail(user.email || "");
      const { data } = await supabase
        .from('profiles')
        .select('is_visible, notifications_enabled')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setIsVisible(data.is_visible);
        setNotifications(data.notifications_enabled);
      }
    } else {
      router.push("/login");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { error } = await supabase
            .from('profiles')
            .update({
                is_visible: isVisible,
                notifications_enabled: notifications
            })
            .eq('id', user.id);
        
        if (error) {
            alert("Error saving settings");
        } else {
            // Optional: Show a toast or success message
        }
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans pb-20">
      
      {/* Navigation */}
      <nav className="p-6 sticky top-0 z-50 bg-gradient-to-b from-stone-950/90 to-transparent">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-300 hover:text-haldi-500 transition-colors bg-stone-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-stone-800">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </nav>

      <main className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-serif text-stone-100 mb-2">Account Settings</h1>
        <p className="text-stone-400 mb-8">Manage your privacy and preferences.</p>

        <div className="space-y-6">
            
            {/* CARD 1: Visibility (Ghost Mode) */}
            <div className={`p-6 rounded-2xl border transition-all ${isVisible ? 'bg-stone-900/50 border-stone-800' : 'bg-stone-900 border-haldi-500/30'}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {isVisible ? <Eye className="w-5 h-5 text-haldi-500" /> : <EyeOff className="w-5 h-5 text-stone-400" />}
                            <h3 className="text-lg font-serif text-stone-200">Profile Visibility</h3>
                        </div>
                        <p className="text-sm text-stone-400 leading-relaxed">
                            {isVisible 
                                ? "Your profile is currently visible to matches in the Explorer. " 
                                : "You are currently hidden. You can browse, but new people won't find you."}
                        </p>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                        onClick={() => setIsVisible(!isVisible)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isVisible ? 'bg-haldi-600' : 'bg-stone-700'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* CARD 2: Notifications (Narada) */}
            <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-stone-400" />
                            <h3 className="text-lg font-serif text-stone-200">Narada Alerts</h3>
                        </div>
                        <p className="text-sm text-stone-400">
                            Receive updates when you get new matches or interest requests.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setNotifications(!notifications)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${notifications ? 'bg-haldi-600' : 'bg-stone-700'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* CARD 3: Account Info (Read Only) */}
            <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800 opacity-60">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-stone-500" />
                    <h3 className="text-lg font-serif text-stone-200">Login Security</h3>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-400">Email Address</span>
                    <span className="text-stone-300 font-mono">{userEmail}</span>
                </div>
            </div>

        </div>

        {/* Action Bar */}
        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-stone-100 hover:bg-white text-stone-950 font-bold rounded-xl transition-all flex items-center gap-2"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>

      </main>
    </div>
  );
}
