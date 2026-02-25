"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Bell, Eye, EyeOff, Shield, Loader2, Save, Crown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import DashboardSubNav from "@/components/navigation/DashboardSubNav";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings State
  const [isVisible, setIsVisible] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [membershipTier, setMembershipTier] = useState("Basic");
  const [subscriptionBilling, setSubscriptionBilling] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

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
        .select('is_visible, notifications_enabled, membership_tier, subscription_billing, subscription_end_date')
        .eq('id', user.id)
        .single();

      if (data) {
        setIsVisible(data.is_visible);
        setNotifications(data.notifications_enabled);
        setMembershipTier(data.membership_tier || "Basic");
        setSubscriptionBilling(data.subscription_billing ?? null);
        setSubscriptionEnd(data.subscription_end_date ?? null);
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
            toast.error("Error saving settings");
        } else {
            // Optional: Show a toast or success message
        }
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans pb-20">
      <DashboardSubNav backLabel="Back to Dashboard" />

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

            {/* CARD 4: Membership */}
            <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Crown className={`w-5 h-5 ${membershipTier === "Concierge" ? "text-purple-400" : membershipTier === "Gold" ? "text-haldi-400" : "text-stone-500"}`} />
                        <h3 className="text-lg font-serif text-stone-200">Membership</h3>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        membershipTier === "Concierge" ? "text-purple-400 border-purple-800 bg-purple-950" :
                        membershipTier === "Gold" ? "text-haldi-400 border-haldi-800 bg-haldi-950" :
                        "text-stone-500 border-stone-700 bg-stone-900"
                    }`}>
                        {membershipTier}
                    </span>
                </div>
                <div className="space-y-2 text-sm">
                    {membershipTier !== "Basic" && subscriptionBilling && (
                        <div className="flex justify-between items-center">
                            <span className="text-stone-400">Billing Cycle</span>
                            <span className="text-stone-300 capitalize">{subscriptionBilling}</span>
                        </div>
                    )}
                    {membershipTier !== "Basic" && subscriptionEnd && (
                        <div className="flex justify-between items-center">
                            <span className="text-stone-400">Renewal Date</span>
                            <span className="text-stone-300">
                                {new Date(subscriptionEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                        </div>
                    )}
                    {membershipTier !== "Basic" && subscriptionEnd && (() => {
                        const daysLeft = Math.ceil((new Date(subscriptionEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        if (daysLeft <= 7 && daysLeft > 0) return (
                            <p className="text-yellow-400 text-xs font-medium">Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</p>
                        );
                        if (daysLeft <= 0) return (
                            <p className="text-red-400 text-xs font-medium">Subscription expired</p>
                        );
                        return null;
                    })()}
                </div>
                <Link href="/membership" className="mt-4 block w-full text-center py-2.5 rounded-xl text-sm font-bold border border-stone-700 text-stone-300 hover:border-haldi-500 hover:text-haldi-400 transition-colors">
                    {membershipTier === "Basic" ? "Upgrade Plan" : "Manage Plan"}
                </Link>
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
