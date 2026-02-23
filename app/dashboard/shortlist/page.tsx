"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trash2, Heart, MapPin, Briefcase, Star, AlertTriangle, Eye } from 'lucide-react';
import Link from 'next/link';
import ConnectionButton from '@/components/ConnectionButton';
import { useShortlist } from '@/contexts/ShortlistContext';
import DashboardSubNav from '@/components/navigation/DashboardSubNav';
import ProfileDetailsPanel from '@/components/ProfileDetailsPanel';
import { calculateMatchScore } from '@/utils/matchEngine';

// ── Relative time helper ────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export default function ShortlistPage() {
    const supabase = createClient();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [myProfile, setMyProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const { remove: removeFromShortlist } = useShortlist();

    useEffect(() => {
        fetchShortlist();
    }, []);

    const fetchShortlist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch my profile (for match score) in parallel
        const [myRes, shortlistRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase
                .from('shortlists')
                .select(`
                    id,
                    created_at,
                    profile:profiles!profile_id (
                        id, full_name, image_url,
                        age, height, location, profession,
                        gothra, sub_community, nakshatra, raasi, diet, marital_status
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }),
        ]);

        if (myRes.data) setMyProfile(myRes.data);

        if (shortlistRes.error) {
            console.error("Error fetching shortlist:", shortlistRes.error);
            setLoading(false);
            return;
        }

        // Fetch connection statuses
        const profileIds = shortlistRes.data?.map((item: any) => item.profile.id) || [];
        let connectionsMap: any = {};
        if (profileIds.length > 0) {
            const { data: connections } = await supabase
                .from('connections')
                .select('receiver_id, status')
                .eq('sender_id', user.id)
                .in('receiver_id', profileIds);

            connections?.forEach((c: any) => {
                connectionsMap[c.receiver_id] = c.status === 'pending' ? 'sent'
                    : c.status === 'accepted' ? 'connected' : 'none';
            });
        }

        const formatted = (shortlistRes.data || []).map((item: any) => ({
            ...item.profile,
            shortlist_id: item.id,
            connectionStatus: connectionsMap[item.profile.id] || 'none',
            added_at: item.created_at,
        }));

        setProfiles(formatted);
        setLoading(false);
    };

    const handleRemove = async (profileId: string) => {
        setProfiles(current => current.filter(p => p.id !== profileId));
        await removeFromShortlist(profileId);
    };

    const handleSendInterest = async (targetId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from('connections').insert({
            sender_id: user.id,
            receiver_id: targetId,
            status: 'pending',
        });
        if (!error) {
            setProfiles(current => current.map(p =>
                p.id === targetId ? { ...p, connectionStatus: 'sent' } : p
            ));
        }
    };

    const openPanel = (profile: any) => {
        const score = myProfile ? calculateMatchScore(myProfile, profile) : 0;
        setSelectedProfile({ ...profile, score });
        setIsPanelOpen(true);
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-50">
            <DashboardSubNav showDashboardNav activeSection="shortlist" />

            <div className="p-6 md:p-8 max-w-7xl mx-auto">

                {/* Page header */}
                <div className="mb-8 border-b border-stone-800 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <Star className="w-6 h-6 text-haldi-500 fill-haldi-500/20" />
                        <h1 className="text-3xl font-serif text-haldi-500">My Shortlist</h1>
                    </div>
                    <p className="text-stone-400 text-sm pl-9">
                        {profiles.length > 0
                            ? `${profiles.length} profile${profiles.length !== 1 ? 's' : ''} saved — click any to view their full story.`
                            : 'Profiles you bookmark across the platform appear here.'}
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-4 border-haldi-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-stone-500 text-sm mt-4">Loading your shortlist…</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && profiles.length === 0 && (
                    <div className="text-center py-20 bg-stone-900/50 rounded-2xl border border-stone-800 border-dashed">
                        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="text-stone-600 w-7 h-7" />
                        </div>
                        <h3 className="text-stone-300 font-bold text-lg">Your shortlist is empty</h3>
                        <p className="text-stone-500 text-sm mt-2 mb-6">
                            Tap the ★ icon on any profile card to save it here.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl text-sm transition-all"
                        >
                            Browse Matches
                        </Link>
                    </div>
                )}

                {/* Cards grid */}
                {!loading && profiles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {profiles.map((profile) => (
                            <ShortlistCard
                                key={profile.id}
                                profile={profile}
                                myProfile={myProfile}
                                onRemove={handleRemove}
                                onSendInterest={handleSendInterest}
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
                onConnect={() => selectedProfile && handleSendInterest(selectedProfile.id)}
            />
        </div>
    );
}

// ── SHORTLIST CARD ──────────────────────────────────────────────────────────

function ShortlistCard({ profile, myProfile, onRemove, onSendInterest, onViewProfile }: {
    profile: any;
    myProfile: any;
    onRemove: (id: string) => void;
    onSendInterest: (id: string) => Promise<void>;
    onViewProfile: () => void;
}) {
    const score = myProfile ? calculateMatchScore(myProfile, profile) : 0;

    const isSameGothra = score === 0
        && myProfile?.gothra && profile.gothra
        && myProfile.gothra.toLowerCase().trim() === profile.gothra.toLowerCase().trim();

    const scoreColor = score >= 80
        ? 'text-green-400 border-green-700 bg-green-900/20'
        : score >= 60
            ? 'text-haldi-400 border-haldi-700 bg-haldi-900/20'
            : 'text-stone-400 border-stone-700 bg-stone-900';

    return (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-stone-700 transition-all group flex flex-col">

            {/* Same-gothra warning */}
            {isSameGothra && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border-b border-red-800/50">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <span className="text-red-400 text-xs font-bold">
                        Same Gothra — Not compatible per Vedic tradition
                    </span>
                </div>
            )}

            {/* Photo + Info */}
            <div className="flex gap-4 p-4">

                {/* Portrait photo */}
                <button
                    type="button"
                    onClick={onViewProfile}
                    className="flex-shrink-0 w-28 h-36 rounded-xl overflow-hidden border border-stone-800 group-hover:border-stone-700 transition-colors bg-stone-800 relative"
                >
                    {profile.image_url ? (
                        <img
                            src={profile.image_url}
                            className="w-full h-full object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-500"
                            alt={profile.full_name}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-8 h-8 text-stone-700" />
                        </div>
                    )}
                    {/* Added date */}
                    <div className="absolute bottom-1 left-1 right-1 text-[9px] text-stone-400 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-center">
                        {timeAgo(profile.added_at)}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                    </div>
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Name + score badge */}
                    <div className="flex items-start justify-between gap-2">
                        <button type="button" onClick={onViewProfile} className="text-left min-w-0">
                            <h4 className="text-white font-serif text-lg leading-tight hover:text-haldi-400 transition-colors truncate">
                                {profile.full_name}
                            </h4>
                        </button>
                        <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 border rounded-full text-xs font-bold ${scoreColor}`}>
                            <Heart className="w-2.5 h-2.5 fill-current" />
                            {isSameGothra ? 'Gothra ⚠' : `${score}%`}
                        </div>
                    </div>

                    {/* Age + location */}
                    <p className="text-stone-500 text-xs">
                        {[profile.age ? `${profile.age} yrs` : null, profile.location]
                            .filter(Boolean).join(' · ')}
                    </p>

                    {/* Gothra + community chips */}
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

                    {/* Profession */}
                    <p className="text-stone-400 text-xs truncate flex items-center gap-1">
                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                        {profile.profession || 'Profession N/A'}
                    </p>

                    {/* Nakshatra / diet / marital chips */}
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
                    </div>
                </div>
            </div>

            {/* Action strip */}
            <div className="px-4 pb-4 pt-3 border-t border-stone-800 mt-auto flex gap-2">
                <ConnectionButton
                    profileId={profile.id}
                    initialStatus={profile.connectionStatus}
                    onSendInterest={onSendInterest}
                />
                <button
                    type="button"
                    onClick={() => onRemove(profile.id)}
                    title="Remove from shortlist"
                    className="flex items-center gap-1.5 px-3 py-2 border border-stone-700 rounded-xl text-stone-500 hover:text-red-400 hover:border-red-900 transition text-xs font-medium flex-shrink-0"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
