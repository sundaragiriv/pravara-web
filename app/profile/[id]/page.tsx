"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    MapPin, Briefcase, Star, Heart, ArrowLeft, ShieldCheck, 
    Users, Camera, Quote, PlayCircle, Video, Music, 
    MessageCircle, GraduationCap, Home, CheckCircle 
} from 'lucide-react';
import Link from 'next/link';
import ConnectionButton from '@/components/ConnectionButton';
import AstroMatchCard from '@/components/AstroMatchCard';
import { calculateMatchScore } from '@/utils/matchEngine';

export default function ProfileDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string; 
    const supabase = createClient();

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState<any>('none');
    const [isShortlisted, setIsShortlisted] = useState(false);
    const [matchScore, setMatchScore] = useState(0);

    useEffect(() => { if (id) fetchProfileDetails(); }, [id]);

    const fetchProfileDetails = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const [targetRes, myRes, connRes, shortRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', id).single(),
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('connections').select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .or(`sender_id.eq.${id},receiver_id.eq.${id}`).maybeSingle(),
            supabase.from('shortlists').select('*').eq('user_id', user.id).eq('profile_id', id).maybeSingle()
        ]);

        if (targetRes.data) {
            setProfile(targetRes.data);
            if (myRes.data) setMatchScore(calculateMatchScore(myRes.data, targetRes.data));
            if (connRes.data) {
                const c = connRes.data;
                setConnectionStatus(c.status === 'accepted' ? 'connected' : (c.sender_id === user.id ? 'sent' : 'received'));
            }
            setIsShortlisted(!!shortRes.data);
        }
        setLoading(false);
    };

    const toggleShortlist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return alert("Please login");
        if (isShortlisted) {
            await supabase.from('shortlists').delete().eq('user_id', user.id).eq('profile_id', id);
            setIsShortlisted(false);
        } else {
            await supabase.from('shortlists').insert({ user_id: user.id, profile_id: id });
            setIsShortlisted(true);
        }
    };

    const handleSendInterest = async (targetId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('connections').insert({ sender_id: user.id, receiver_id: targetId, status: 'pending' });
        setConnectionStatus('sent');
    };

    // --- HELPER: Handle Missing Data Nicely ---
    const displayValue = (val: any) => (!val || val === '-' || val === 'null' || val === '') ? <span className="text-stone-600 italic text-xs">Not Added</span> : val;

    // --- HELPER: Render Prefs Tags ---
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

    if (loading) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-haldi-500"><div className="animate-pulse">Loading Profile...</div></div>;
    if (!profile) return <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-500">Profile not found.</div>;

    return (
        <div className="min-h-screen bg-stone-950 pb-20 font-sans">
            
            {/* --- 1. THE SOCIAL COVER --- */}
            <div className="relative group">
                {/* Background Blur */}
                <div className="h-72 w-full overflow-hidden relative">
                    <img src={profile.image_url || "/placeholder.jpg"} className="w-full h-full object-cover blur-2xl opacity-40 scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
                    
                    <Link href="/dashboard" className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-black/60 transition-colors border border-white/10 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                </div>

                {/* Main Header Content */}
                <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10 flex flex-col md:flex-row items-end gap-8 pb-8 border-b border-stone-800">
                    
                    {/* Avatar with Status Dot */}
                    <div className="relative">
                        <div className="w-48 h-48 rounded-3xl border-[6px] border-stone-950 bg-stone-900 shadow-2xl overflow-hidden relative">
                            <img src={profile.image_url || "/placeholder.jpg"} className="w-full h-full object-cover object-top" />
                        </div>
                        {/* Match Score */}
                        <div className="absolute -top-3 -right-3 bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 border border-stone-700 shadow-xl z-20">
                             <Heart className={`w-3 h-3 ${matchScore > 80 ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
                             {matchScore}% Match
                        </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="flex-1 w-full pb-2">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            
                            {/* Profile Details */}
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <span className="px-2.5 py-0.5 bg-haldi-900/30 border border-haldi-500/20 text-haldi-500 text-[10px] uppercase tracking-wider font-bold rounded">
                                        {profile.gothra || "Vedic Roots"}
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-stone-800 border border-stone-700 text-stone-400 text-[10px] uppercase tracking-wider font-bold rounded">
                                        {profile.sub_community || "Community"}
                                    </span>
                                </div>
                                
                                <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                                    {profile.first_name} <span className="text-stone-500">{profile.last_name}</span>
                                </h1>
                                
                                <div className="flex flex-wrap gap-4 text-stone-400 text-sm">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-stone-500" /> {profile.location}</span>
                                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-stone-500" /> {displayValue(profile.profession)}</span>
                                    <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-stone-500" /> {displayValue(profile.education || "Education N/A")}</span>
                                </div>
                            </div>

                            {/* --- ACTION BAR (The Fix) --- */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                
                                {/* 1. The Main Action */}
                                <div className="h-12 md:w-48 w-full">
                                    {connectionStatus === 'connected' ? (
                                        <button 
                                            onClick={() => router.push(`/dashboard/chat?id=${profile.id}`)}
                                            className="w-full h-full bg-haldi-500 hover:bg-haldi-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-haldi-500/20"
                                        >
                                            <MessageCircle className="w-5 h-5" /> Message
                                        </button>
                                    ) : (
                                        <ConnectionButton 
                                            profileId={profile.id}
                                            initialStatus={connectionStatus}
                                            onSendInterest={handleSendInterest}
                                        />
                                    )}
                                </div>

                                {/* 2. The Shortlist Star */}
                                <button 
                                    onClick={toggleShortlist}
                                    className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all ${isShortlisted ? 'bg-haldi-500/10 border-haldi-500 text-haldi-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:bg-stone-800'}`}
                                >
                                    <Star className={`w-6 h-6 ${isShortlisted ? 'fill-haldi-500' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. MAIN CONTENT GRID --- */}
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* LEFT SIDEBAR: Trust, Collaborators, Family */}
                <div className="space-y-6">
                    {/* TRUST CIRCLE */}
                    <div className="bg-green-900/10 border border-green-800/50 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 p-4 opacity-10"><ShieldCheck className="w-32 h-32 text-green-500" /></div>
                        <h3 className="text-green-500 text-[10px] uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> Varaahi Verified
                        </h3>
                        <h2 className="text-lg font-serif text-white mb-1">Trust Circle</h2>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">0</span>
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest">Vouches</span>
                        </div>
                    </div>

                    {/* COLLABORATORS */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4 border-b border-stone-800 pb-3">
                            <Users className="w-4 h-4 text-stone-400" />
                            <h4 className="text-stone-300 text-xs font-bold uppercase tracking-wider">Managed By</h4>
                        </div>
                        <span className="px-3 py-1.5 bg-stone-800 rounded-lg text-sm text-white font-medium capitalize">
                            {profile.profile_manager || 'Self'}
                        </span>
                    </div>

                    {/* --- NEW: FAMILY DETAILS (Kutumba) --- */}
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
                                <span className="text-stone-300">{displayValue(profile.family_native)}</span>
                            </li>
                        </ul>
                    </div>

                    {/* --- VEDIC COMPATIBILITY CARD --- */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-3">
                            <h4 className="text-haldi-500 text-xs font-bold uppercase tracking-wider">Vedic Compatibility</h4>
                            <span className="px-2 py-1 bg-stone-800 rounded text-[10px] text-stone-400">Strict Match</span>
                        </div>
                        <AstroMatchCard 
                            data={{
                                totalScore: 28,
                                nadiScore: 8,
                                bhakootScore: 7,
                                ganaScore: 3,
                                yoniScore: 3,
                                isManglik: false,
                                partnerIsManglik: false
                            }} 
                        />
                    </div>
                </div>

                {/* CENTER: Details & Gallery */}
                <div className="lg:col-span-3 space-y-8">
                    
                    {/* ABOUT SECTION */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-8 relative">
                        <Quote className="absolute top-6 right-6 w-8 h-8 text-stone-800 fill-stone-800" />
                        <h3 className="text-haldi-500 text-xs uppercase tracking-widest font-bold mb-4">About Me</h3>
                        <p className="text-stone-300 leading-relaxed text-lg font-serif italic">
                            "{profile.bio || "No bio added yet. I believe actions speak louder than words."}"
                        </p>
                    </div>

                    {/* MEDIA PREVIEW (Voice/Video) */}
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

                    {/* INFO GRIDS */}
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
                                <li className="flex justify-between"><span className="text-stone-500">Drink/Smoke</span> <span className="text-stone-200">{displayValue(profile.drinking)} / {displayValue(profile.smoking)}</span></li>
                                <li className="flex justify-between"><span className="text-stone-500">Marital Status</span> <span className="text-stone-200">{displayValue(profile.marital_status)}</span></li>
                                <li className="flex justify-between"><span className="text-stone-500">Height</span> <span className="text-stone-200">{displayValue(profile.height)}</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* PARTNER PREFERENCES */}
                    <div className="bg-black border border-stone-800 rounded-2xl p-8">
                        <h3 className="text-haldi-500 text-xs uppercase tracking-widest font-bold mb-4">Partner Preferences</h3>
                        <div className="text-stone-300">
                            {renderPartnerPreferences(profile.partner_preferences)}
                        </div>
                    </div>

                    {/* GALLERY */}
                    <div className="border border-stone-800 border-dashed rounded-2xl p-8">
                        <h3 className="text-stone-300 font-bold mb-4 flex items-center gap-2">
                             <Camera className="w-5 h-5 text-haldi-500" /> Life & Moments
                        </h3>
                        {(profile.gallery_images && profile.gallery_images.length > 0) ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {profile.gallery_images.map((img: string, idx: number) => (
                                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-stone-800 group cursor-pointer">
                                        <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-stone-600">
                                <p className="text-sm italic">No extra photos added.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}