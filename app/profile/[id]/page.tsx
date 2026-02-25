"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    MapPin, Briefcase, Star, Heart, ShieldCheck,
    Users, Camera, Quote, Video, Music,
    MessageCircle, GraduationCap, Home, Lock, Clock, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import AstroMatchCard from '@/components/AstroMatchCard';
import { calculateMatchScore } from '@/utils/matchEngine';
import { toast } from "sonner";
import BhruguLoader from '@/components/BhruguLoader';
import DashboardSubNav from '@/components/navigation/DashboardSubNav';
import { useShortlist } from '@/contexts/ShortlistContext';

export default function ProfileDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const supabase = createClient();

    const { isShortlisted, toggle: toggleShortlist } = useShortlist();

    // --- STATE ---
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<any>('none');
    const [matchScore, setMatchScore] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);

    useEffect(() => { if (id) fetchProfileDetails(); }, [id]);

    const fetchProfileDetails = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        const [targetRes, myRes, connRes, photosRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', id).single(),
            user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null }),
            user ? supabase.from('connections').select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .or(`sender_id.eq.${id},receiver_id.eq.${id}`).maybeSingle() : Promise.resolve({ data: null }),
            // Fetch profile_photos table for gallery
            supabase.from('profile_photos').select('image_url').eq('profile_id', id).order('created_at', { ascending: true }),
        ]);

        if (targetRes.data) {
            setProfile(targetRes.data);
            if (myRes.data) {
                setMatchScore(calculateMatchScore(myRes.data, targetRes.data));
                const tier = myRes.data.membership_tier;
                setIsPremium(tier === 'Gold' || tier === 'Concierge');
            }
            if (connRes.data) {
                const c = connRes.data;
                if (c.status === 'accepted') setConnectionStatus('connected');
                else if (c.sender_id === user?.id) setConnectionStatus('sent');
                else setConnectionStatus('received');
            }

            // Merge gallery_images (profile row array) + profile_photos table, deduplicate
            const inlinePhotos: string[] = targetRes.data.gallery_images || [];
            const tablePhotos: string[] = (photosRes.data || []).map((p: { image_url: string }) => p.image_url);
            const merged = Array.from(new Set([...inlinePhotos, ...tablePhotos]));
            setGalleryPhotos(merged);
        }
        setLoading(false);
    };


    const handleSendInterest = async (targetId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setConnectionStatus('sent');
        await supabase.from('connections').insert({ sender_id: user.id, receiver_id: targetId, status: 'pending' });
    };

    const displayValue = (val: any) =>
        (!val || val === '-' || val === 'null' || val === '')
            ? <span className="text-stone-600 italic text-xs">Not Added</span>
            : val;

    const renderPartnerPreferences = (prefs: any) => {
        if (!prefs) return <span className="text-stone-500 italic">Open to all matches.</span>;
        let data = prefs;
        if (typeof prefs === 'string' && (prefs.startsWith('{') || prefs.startsWith('['))) {
            try { data = JSON.parse(prefs); } catch (e) { return prefs; }
        }
        if (typeof data === 'object') {
            return (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(data).map(([key, val]) => (
                        <span key={key} className="px-3 py-1 bg-stone-800 border border-stone-700 rounded-full text-xs text-stone-300 capitalize">
                            {key.replace(/_/g, ' ')}: <span className="text-haldi-500 font-bold">{String(val)}</span>
                        </span>
                    ))}
                </div>
            );
        }
        return prefs;
    };

    if (loading) return (
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
            <BhruguLoader />
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">
            Profile not found.
        </div>
    );

    const displayName = profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unknown';
    const matchColor = matchScore >= 80 ? 'text-green-400 border-green-700 bg-green-900/20' : matchScore >= 60 ? 'text-haldi-400 border-haldi-700 bg-haldi-900/20' : 'text-stone-400 border-stone-700 bg-stone-900';

    return (
        <div className="min-h-screen bg-stone-950 pb-20 font-sans">
            <DashboardSubNav backLabel="Back to Dashboard" backHref="/dashboard" />

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <div className="relative border-b border-stone-800 overflow-hidden">
                {/* Very subtle blurred photo as background texture */}
                {profile.image_url && (
                    <div className="absolute inset-0 pointer-events-none">
                        <img src={profile.image_url} className="w-full h-full object-cover blur-3xl opacity-[0.06] scale-110" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-stone-950" />
                    </div>
                )}

                <div className="relative max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">

                        {/* ── Photo ── */}
                        <div className="relative flex-shrink-0">
                            <div className="w-44 h-52 rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl overflow-hidden">
                                <img
                                    src={profile.image_url || "/placeholder.jpg"}
                                    className="w-full h-full object-cover object-top"
                                    alt={displayName}
                                />
                            </div>
                            {/* Match score — bottom of photo */}
                            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 border text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl whitespace-nowrap ${matchColor}`}>
                                <Heart className="w-3 h-3 fill-current" />
                                {matchScore}% Match
                            </div>
                        </div>

                        {/* ── Identity + Actions ── */}
                        <div className="flex-1 min-w-0 space-y-4 pt-1">

                            {/* Name row + action buttons */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-serif text-white leading-tight">
                                        {displayName}
                                        {profile.age && (
                                            <span className="text-stone-500 font-sans font-normal text-2xl ml-3">{profile.age}</span>
                                        )}
                                    </h1>

                                    {/* Vedic identity badges */}
                                    <div className="flex flex-wrap gap-2 mt-2.5">
                                        {profile.gothra && (
                                            <span className="px-2.5 py-0.5 bg-haldi-900/30 border border-haldi-500/20 text-haldi-500 text-[10px] uppercase tracking-wider font-bold rounded">
                                                {profile.gothra}
                                            </span>
                                        )}
                                        {profile.sub_community && (
                                            <span className="px-2.5 py-0.5 bg-stone-800 border border-stone-700 text-stone-400 text-[10px] uppercase tracking-wider font-bold rounded">
                                                {profile.sub_community}
                                            </span>
                                        )}
                                        {profile.pravara && (
                                            <span className="px-2.5 py-0.5 bg-stone-800 border border-stone-700 text-stone-400 text-[10px] uppercase tracking-wider font-bold rounded">
                                                {profile.pravara}
                                            </span>
                                        )}
                                        {profile.marital_status && (
                                            <span className="px-2.5 py-0.5 bg-stone-800 border border-stone-700 text-stone-500 text-[10px] uppercase tracking-wider font-bold rounded">
                                                {profile.marital_status}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="h-11 w-40">
                                        {connectionStatus === 'connected' ? (
                                            <button
                                                type="button"
                                                onClick={() => router.push(`/dashboard/chat?id=${profile.id}`)}
                                                className="w-full h-full bg-haldi-500 hover:bg-haldi-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-haldi-500/20 text-sm"
                                            >
                                                <MessageCircle className="w-4 h-4" /> Message
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleSendInterest(profile.id)}
                                                disabled={connectionStatus === 'sent'}
                                                className={`w-full h-full font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm ${
                                                    connectionStatus === 'sent'
                                                        ? 'border-2 border-haldi-500 text-haldi-500 bg-transparent'
                                                        : 'bg-haldi-500 hover:bg-haldi-600 text-black shadow-lg shadow-haldi-500/20'
                                                }`}
                                            >
                                                {connectionStatus === 'sent' ? (
                                                    <><Clock className="w-4 h-4" /> Pending</>
                                                ) : (
                                                    <><Heart className="w-4 h-4 fill-black" /> Connect</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleShortlist(id)}
                                        className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all ${
                                            isShortlisted(id)
                                                ? 'bg-haldi-500/10 border-haldi-500 text-haldi-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                                : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:bg-stone-800'
                                        }`}
                                    >
                                        <Star className={`w-5 h-5 ${isShortlisted(id) ? 'fill-haldi-500' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Location / Profession / Education row */}
                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-stone-400 text-sm">
                                {profile.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                                        {profile.location}
                                    </span>
                                )}
                                {profile.profession && (
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                                        {profile.profession}
                                        {profile.employer ? ` · ${profile.employer}` : ''}
                                    </span>
                                )}
                                {profile.education && (
                                    <span className="flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                                        {profile.education}
                                    </span>
                                )}
                                {profile.visa_status && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="text-stone-500 text-xs font-medium">Visa</span>
                                        {profile.visa_status}
                                    </span>
                                )}
                            </div>

                            {/* Quick-stats chips — the 6 things families check first */}
                            <div className="flex flex-wrap gap-2 pt-1">
                                {profile.height && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-300">
                                        <span className="text-stone-500 font-medium">Height</span> {profile.height}
                                    </span>
                                )}
                                {profile.diet && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-300">
                                        <span className="text-stone-500 font-medium">Diet</span> {profile.diet}
                                    </span>
                                )}
                                {profile.nakshatra && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-300">
                                        <Sparkles className="w-3 h-3 text-haldi-600" />
                                        {profile.nakshatra}{profile.nakshatra_padam ? ` Pada ${profile.nakshatra_padam}` : ''}
                                    </span>
                                )}
                                {profile.raasi && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-300">
                                        <span className="text-stone-500 font-medium">Raasi</span> {profile.raasi}
                                    </span>
                                )}
                                {profile.religious_level && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 rounded-full text-xs text-stone-300">
                                        <span className="text-stone-500 font-medium">Faith</span> {profile.religious_level}
                                    </span>
                                )}
                                {profile.smoking === 'No' && profile.drinking === 'No' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-900/20 border border-green-800/50 rounded-full text-xs text-green-400 font-medium">
                                        No Drink · No Smoke
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT GRID ────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* LEFT SIDEBAR */}
                <div className="space-y-6">
                    <div className="bg-green-900/10 border border-green-800/50 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 p-4 opacity-10">
                            <ShieldCheck className="w-32 h-32 text-green-500" />
                        </div>
                        <h3 className="text-green-500 text-[10px] uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Varaahi Verified
                        </h3>
                        <h2 className="text-lg font-serif text-white mb-1">Trust Circle</h2>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">0</span>
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest">Vouches</span>
                        </div>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-stone-800 pb-3">
                            <Users className="w-4 h-4 text-stone-400" />
                            <h4 className="text-stone-300 text-xs font-bold uppercase tracking-wider">Managed By</h4>
                        </div>
                        <span className="px-3 py-1.5 bg-stone-800 rounded-lg text-sm text-white font-medium capitalize">
                            {profile.profile_manager || 'Self'}
                        </span>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-stone-800 pb-3">
                            <Home className="w-4 h-4 text-stone-400" />
                            <h4 className="text-stone-300 text-xs font-bold uppercase tracking-wider">Family Info</h4>
                        </div>
                        <ul className="space-y-4">
                            <li className="text-sm">
                                <span className="block text-xs text-stone-500 mb-0.5">Father</span>
                                <span className="text-stone-300">{displayValue(profile.father_occupation)}</span>
                            </li>
                            <li className="text-sm">
                                <span className="block text-xs text-stone-500 mb-0.5">Mother</span>
                                <span className="text-stone-300">{displayValue(profile.mother_occupation)}</span>
                            </li>
                            <li className="text-sm">
                                <span className="block text-xs text-stone-500 mb-0.5">Siblings</span>
                                <span className="text-stone-300">{displayValue(profile.siblings)}</span>
                            </li>
                            <li className="text-sm">
                                <span className="block text-xs text-stone-500 mb-0.5">Native Place</span>
                                <span className="text-stone-300">{displayValue(profile.family_native || profile.native_place)}</span>
                            </li>
                        </ul>
                    </div>

                    {/* BHRUGU MATCH CARD */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 relative">
                        <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
                            <h4 className="text-haldi-500 font-serif text-base font-bold tracking-wide">Vedic Compatibility</h4>
                            <span className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-wider shadow-[0_0_10px_rgba(74,222,128,0.1)]">Strict Match</span>
                        </div>
                        <div className={!isPremium ? "blur-sm select-none opacity-50 pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
                            <AstroMatchCard
                                data={{
                                    totalScore: profile.gunas || 28,
                                    nadiScore: 8,
                                    bhakootScore: 7,
                                    ganaScore: 3,
                                    yoniScore: 3,
                                    isManglik: false,
                                    partnerIsManglik: false
                                }}
                            />
                        </div>
                        {!isPremium && (
                            <div className="absolute inset-0 top-12 z-10 flex flex-col items-center justify-center text-center">
                                <div className="bg-stone-900/95 border border-haldi-500/30 p-4 rounded-xl shadow-2xl max-w-[200px]">
                                    <Lock className="text-haldi-500 mx-auto mb-2" size={20} />
                                    <p className="text-stone-300 text-xs font-bold mb-1">Vedic Compatibility Report</p>
                                    <p className="text-stone-500 text-[10px] mb-2">Available on Gold & Concierge</p>
                                    <Link
                                        href="/membership"
                                        className="block bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold py-1.5 px-4 rounded-full text-xs transition text-center"
                                    >
                                        Upgrade
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTER: Details & Gallery */}
                <div className="lg:col-span-3 space-y-8">

                    {/* About Me */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-8 relative">
                        <Quote className="absolute top-6 right-6 w-8 h-8 text-stone-800 fill-stone-800" />
                        <h3 className="text-haldi-500 text-xs uppercase tracking-widest font-bold mb-4">About Me</h3>
                        <p className="text-stone-300 leading-relaxed text-lg font-serif italic">
                            "{profile.bio || "No bio added yet. I believe actions speak louder than words."}"
                        </p>
                    </div>

                    {/* Gallery — right after bio, before details */}
                    <div className="border border-stone-800 border-dashed rounded-2xl p-6">
                        <h3 className="text-stone-300 font-bold mb-4 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-haldi-500" /> Life & Moments
                            {galleryPhotos.length > 0 && (
                                <span className="ml-auto text-xs text-stone-500 font-normal">{galleryPhotos.length} photo{galleryPhotos.length !== 1 ? 's' : ''}</span>
                            )}
                        </h3>
                        {galleryPhotos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {galleryPhotos.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-stone-800 group cursor-pointer">
                                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-stone-600">
                                <Camera className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm italic">No photos added yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Voice / Video */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`border border-stone-800 rounded-xl p-4 flex items-center gap-4 ${profile.voice_intro_url ? 'bg-stone-900 cursor-pointer hover:border-haldi-500/50' : 'bg-stone-900/50 opacity-50'}`}>
                            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400">
                                <Music className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-stone-300 font-bold text-sm">Voice Intro</h4>
                                <p className="text-stone-500 text-xs">{profile.voice_intro_url ? "Click to play" : "Not added yet"}</p>
                            </div>
                        </div>
                        <div className={`border border-stone-800 rounded-xl p-4 flex items-center gap-4 ${profile.video_intro_url ? 'bg-stone-900 cursor-pointer hover:border-purple-500/50' : 'bg-stone-900/50 opacity-50'}`}>
                            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-400">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-stone-300 font-bold text-sm">Video Bio</h4>
                                <p className="text-stone-500 text-xs">{profile.video_intro_url ? "Click to watch" : "Not added yet"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Birth Details + Lifestyle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                            <h3 className="text-stone-400 text-xs uppercase tracking-widest font-bold mb-4 border-b border-stone-800 pb-2">Birth Details</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between"><span className="text-stone-500">Age / DOB</span> <span className="text-stone-200">{profile.age} yrs / {displayValue(profile.dob)}</span></li>
                                <li className="flex justify-between"><span className="text-stone-500">Time</span> <span className="text-stone-200">{displayValue(profile.birth_time)}</span></li>
                                <li className="flex justify-between"><span className="text-stone-500">Place</span> <span className="text-stone-200">{displayValue(profile.birth_place)}</span></li>
                                <li className="flex justify-between"><span className="text-stone-500">Nakshatra</span> <span className="text-stone-200">{displayValue(profile.nakshatra)}</span></li>
                            </ul>
                        </div>
                        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                            <h3 className="text-stone-400 text-xs uppercase tracking-widest font-bold mb-4 border-b border-stone-800 pb-2">Lifestyle</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between"><span className="text-stone-500">Diet</span> <span className="text-stone-200">{displayValue(profile.diet)}</span></li>
                                <li className="flex justify-between"><span className="text-stone-500">Drink / Smoke</span> <span className="text-stone-200">{displayValue(profile.drinking)} / {displayValue(profile.smoking)}</span></li>
                                <li className="flex justify-between"><span className="text-stone-500">Marital Status</span> <span className="text-stone-200">{displayValue(profile.marital_status)}</span></li>
                                <li className="flex justify-between"><span className="text-stone-500">Height</span> <span className="text-stone-200">{displayValue(profile.height)}</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Partner Preferences */}
                    <div className="bg-black border border-stone-800 rounded-2xl p-8">
                        <h3 className="text-haldi-500 text-xs uppercase tracking-widest font-bold mb-4">Partner Preferences</h3>
                        <div className="text-stone-300">
                            {renderPartnerPreferences(profile.partner_preferences)}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
