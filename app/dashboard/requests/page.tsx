"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Heart, Clock, X, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { notifyInterestAccepted } from '@/utils/notifications';
import { toast } from "sonner";
import DashboardSubNav from '@/components/navigation/DashboardSubNav';
import ProfileDetailsPanel from '@/components/ProfileDetailsPanel';
import { calculateMatchScore } from '@/utils/matchEngine';

// Relative time helper — "3 days ago", "just now", etc.
function timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''} ago`;
}

export default function RequestsPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [profiles, setProfiles] = useState<any[]>([]);
    const [myProfile, setMyProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    useEffect(() => { fetchRequests(); }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch my profile (for match score calculation) in parallel
        const [myRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
        ]);
        if (myRes.data) setMyProfile(myRes.data);

        const columnToCheck = activeTab === 'received' ? 'receiver_id' : 'sender_id';
        const profileToFetch = activeTab === 'received' ? 'sender_id' : 'receiver_id';

        const { data: connections, error } = await supabase
            .from('connections')
            .select(`*, profile:profiles!connections_${profileToFetch}_fkey (*)`)
            .eq(columnToCheck, user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching requests:", error);
            setLoading(false);
            return;
        }

        const formatted = (connections || []).map((c: any) => ({
            ...c.profile,
            connectionId: c.id,
            connectionStatus: activeTab,
            createdAt: c.created_at,
        }));

        setProfiles(formatted);
        setLoading(false);
    };

    const handleAction = (targetId: string) => {
        setProfiles(current => current.filter(p => p.id !== targetId));
        if (selectedProfile?.id === targetId) setIsPanelOpen(false);
    };

    const openPanel = (profile: any) => {
        const score = myProfile ? calculateMatchScore(myProfile, profile) : 0;
        setSelectedProfile({ ...profile, score, connectionStatus: activeTab });
        setIsPanelOpen(true);
    };

    const receivedCount = activeTab === 'received' ? profiles.length : 0;

    return (
        <div className="min-h-screen bg-stone-950 text-stone-50">
            <DashboardSubNav showDashboardNav activeSection="requests" />

            <div className="p-6 md:p-8 max-w-7xl mx-auto">

                {/* Header + Tabs */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-stone-800 pb-5">
                    <div>
                        <h1 className="text-3xl font-serif text-haldi-500 mb-1">Invitations</h1>
                        <p className="text-stone-500 text-sm">Review and respond to connection requests.</p>
                    </div>

                    <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-800 mt-4 md:mt-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab('received')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'received' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                        >
                            <Heart className="w-3.5 h-3.5" />
                            Received
                            {activeTab === 'received' && profiles.length > 0 && (
                                <span className="bg-haldi-500 text-black text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">
                                    {profiles.length}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('sent')}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'sent' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Sent
                            {activeTab === 'sent' && profiles.length > 0 && (
                                <span className="bg-stone-700 text-stone-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">
                                    {profiles.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-4 border-haldi-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-stone-500 text-sm mt-4">Loading...</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && profiles.length === 0 && (
                    <div className="text-center py-20 bg-stone-900/50 rounded-2xl border border-stone-800 border-dashed">
                        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'received'
                                ? <Heart className="text-stone-600 w-7 h-7" />
                                : <Clock className="text-stone-600 w-7 h-7" />}
                        </div>
                        <h3 className="text-stone-300 font-bold text-lg">
                            No {activeTab === 'received' ? 'received' : 'sent'} requests yet
                        </h3>
                        <p className="text-stone-500 text-sm mt-2 max-w-sm mx-auto">
                            {activeTab === 'received'
                                ? "Complete your profile to attract more interests."
                                : "Browse the Explorer and send interests to profiles you like."}
                        </p>
                        <Link href="/dashboard" className="inline-block mt-5 px-5 py-2.5 bg-haldi-500 hover:bg-haldi-600 text-black text-sm font-bold rounded-xl transition-all">
                            Go to Explorer
                        </Link>
                    </div>
                )}

                {/* Cards grid */}
                {!loading && profiles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {profiles.map((profile) => (
                            <RequestCard
                                key={profile.id}
                                profile={profile}
                                myProfile={myProfile}
                                type={activeTab}
                                onAction={handleAction}
                                onViewProfile={() => openPanel(profile)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Quick-view panel */}
            <ProfileDetailsPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                profile={selectedProfile}
                onConnect={() => {}} // Read-only in this context
            />
        </div>
    );
}

// ── REQUEST CARD ──────────────────────────────────────────────────────────────

function RequestCard({ profile, myProfile, type, onAction, onViewProfile }: {
    profile: any;
    myProfile: any;
    type: 'received' | 'sent';
    onAction: (id: string) => void;
    onViewProfile: () => void;
}) {
    const supabase = createClient();
    const [processing, setProcessing] = useState(false);

    const score = myProfile ? calculateMatchScore(myProfile, profile) : 0;
    const isSameGothra = score === 0 && myProfile?.gothra && profile.gothra &&
        myProfile.gothra.toLowerCase().trim() === profile.gothra.toLowerCase().trim();

    const scoreColor = score >= 80 ? 'text-green-400 border-green-700 bg-green-900/20'
        : score >= 60 ? 'text-haldi-400 border-haldi-700 bg-haldi-900/20'
        : 'text-stone-400 border-stone-700 bg-stone-900';

    const acceptRequest = async () => {
        setProcessing(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('connections')
            .update({ status: 'accepted' })
            .eq('sender_id', profile.id)
            .eq('receiver_id', user?.id);

        if (error) {
            toast.error('Failed to accept. Please try again.');
        } else {
            if (user) await notifyInterestAccepted(profile.id, user.id);
            toast.success(`Connected with ${profile.full_name}!`);
            onAction(profile.id);
        }
        setProcessing(false);
    };

    const declineRequest = async () => {
        setProcessing(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('connections')
            .update({ status: 'rejected' })
            .eq('sender_id', profile.id)
            .eq('receiver_id', user?.id);

        if (error) {
            toast.error('Failed to decline. Please try again.');
        } else {
            onAction(profile.id);
        }
        setProcessing(false);
    };

    const withdrawRequest = async () => {
        setProcessing(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('connections')
            .delete()
            .eq('sender_id', user?.id)
            .eq('receiver_id', profile.id);

        if (error) {
            toast.error('Failed to withdraw. Please try again.');
        } else {
            toast.success('Request withdrawn.');
            onAction(profile.id);
        }
        setProcessing(false);
    };

    return (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all group flex flex-col">

            {/* Same-gothra warning banner */}
            {isSameGothra && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border-b border-red-800/50">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-xs font-bold">Same Gothra — Not compatible per Vedic tradition</span>
                </div>
            )}

            {/* Photo + Identity */}
            <div className="flex gap-4 p-4">
                {/* Photo */}
                <button type="button" onClick={onViewProfile} className="flex-shrink-0 w-28 h-32 rounded-xl overflow-hidden border border-stone-800 group-hover:border-stone-700 transition-colors bg-stone-800 relative">
                    {profile.image_url ? (
                        <img src={profile.image_url} className="w-full h-full object-cover object-top" alt={profile.full_name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-8 h-8 text-stone-700" />
                        </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                    </div>
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Name + match score */}
                    <div className="flex items-start justify-between gap-2">
                        <button type="button" onClick={onViewProfile} className="text-left">
                            <h4 className="text-white font-serif text-lg leading-tight hover:text-haldi-400 transition-colors">
                                {profile.full_name}
                            </h4>
                        </button>
                        <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 border rounded-full text-xs font-bold ${scoreColor}`}>
                            <Heart className="w-2.5 h-2.5 fill-current" />
                            {isSameGothra ? 'Gothra ⚠' : `${score}%`}
                        </div>
                    </div>

                    {/* Age + Location */}
                    <p className="text-stone-500 text-xs">
                        {[profile.age ? `${profile.age} yrs` : null, profile.location].filter(Boolean).join(' · ')}
                    </p>

                    {/* Gothra + Community */}
                    <div className="flex flex-wrap gap-1.5">
                        {profile.gothra && (
                            <span className="px-2 py-0.5 bg-haldi-900/20 border border-haldi-500/20 text-haldi-500 text-[10px] uppercase tracking-wider font-bold rounded">
                                {profile.gothra}
                            </span>
                        )}
                        {profile.sub_community && (
                            <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 text-stone-400 text-[10px] uppercase tracking-wider font-bold rounded">
                                {profile.sub_community}
                            </span>
                        )}
                    </div>

                    {/* Profession + key chips */}
                    <p className="text-stone-400 text-xs truncate">{profile.profession || 'Profession N/A'}</p>

                    <div className="flex flex-wrap gap-1.5">
                        {profile.nakshatra && (
                            <span className="text-[10px] px-2 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-400">
                                {profile.nakshatra}
                            </span>
                        )}
                        {profile.diet && (
                            <span className="text-[10px] px-2 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-400">
                                {profile.diet}
                            </span>
                        )}
                        {profile.marital_status && (
                            <span className="text-[10px] px-2 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-400">
                                {profile.marital_status}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Timestamp */}
            {profile.createdAt && (
                <div className="px-4 pb-1">
                    <p className="text-stone-600 text-[10px]">
                        {type === 'received' ? 'Sent interest' : 'You sent interest'} {timeAgo(profile.createdAt)}
                    </p>
                </div>
            )}

            {/* Action buttons */}
            <div className="p-4 pt-3 mt-auto border-t border-stone-800 flex gap-2">
                {/* View Profile */}
                <button
                    type="button"
                    onClick={onViewProfile}
                    className="flex items-center gap-1.5 px-3 py-2 border border-stone-700 rounded-lg text-stone-400 hover:text-white hover:border-stone-500 transition text-xs font-medium"
                >
                    <Eye className="w-3.5 h-3.5" /> Preview
                </button>

                {type === 'received' ? (
                    <>
                        <button
                            type="button"
                            onClick={acceptRequest}
                            disabled={processing || isSameGothra}
                            title={isSameGothra ? "Cannot accept — same Gothra" : undefined}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                                isSameGothra
                                    ? 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'
                                    : 'bg-haldi-500 hover:bg-haldi-600 text-black disabled:opacity-50 disabled:cursor-wait'
                            }`}
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {processing ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                            type="button"
                            onClick={declineRequest}
                            disabled={processing}
                            className="flex items-center gap-1.5 px-3 py-2 border border-stone-700 rounded-lg text-stone-500 hover:text-red-400 hover:border-red-900 transition text-xs font-medium disabled:opacity-50 disabled:cursor-wait"
                        >
                            <X className="w-3.5 h-3.5" /> Decline
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex-1 flex items-center gap-2 text-xs text-haldi-600 bg-haldi-900/10 px-3 py-2 rounded-lg border border-haldi-500/20">
                            <Clock className="w-3 h-3 animate-pulse flex-shrink-0" />
                            Awaiting response
                        </div>
                        <button
                            type="button"
                            onClick={withdrawRequest}
                            disabled={processing}
                            title="Withdraw request"
                            className="flex items-center gap-1.5 px-3 py-2 border border-stone-700 rounded-lg text-stone-500 hover:text-red-400 hover:border-red-900 transition text-xs font-medium disabled:opacity-50 disabled:cursor-wait"
                        >
                            <X className="w-3.5 h-3.5" /> Withdraw
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
