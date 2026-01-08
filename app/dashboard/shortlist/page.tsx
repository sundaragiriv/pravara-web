"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trash2, Heart, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ConnectionButton from '@/components/ConnectionButton';

export default function ShortlistPage() {
    const supabase = createClient();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShortlist();
    }, []);

    const fetchShortlist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Shortlist Items + Profile Details
        const { data, error } = await supabase
            .from('shortlists')
            .select(`
                id,
                created_at,
                profile:profiles!profile_id (
                    id, full_name, image_url, 
                    age, height, location, profession, 
                    gothra, sub_community
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching shortlist:", error);
            setLoading(false);
            return;
        }

        // 2. We also need connection status for the button (Sent/None)
        // Fetch connections for these specific profiles to enable the Smart Button
        const profileIds = data?.map((item: any) => item.profile.id) || [];
        
        let connectionsMap: any = {};
        if (profileIds.length > 0) {
            const { data: connections } = await supabase
                .from('connections')
                .select('receiver_id, status')
                .eq('sender_id', user.id)
                .in('receiver_id', profileIds);
            
            connections?.forEach((c: any) => {
                connectionsMap[c.receiver_id] = c.status === 'pending' ? 'sent' : c.status === 'accepted' ? 'connected' : 'none';
            });
        }

        // 3. Format Data
        const formatted = (data || []).map((item: any) => ({
            ...item.profile,
            shortlist_id: item.id,
            connectionStatus: connectionsMap[item.profile.id] || 'none',
            added_at: item.created_at
        }));

        setProfiles(formatted);
        setLoading(false);
    };

    const handleRemove = async (shortlistId: string) => {
        // Optimistic UI Update
        setProfiles(current => current.filter(p => p.shortlist_id !== shortlistId));
        
        // Database Delete
        const { error } = await supabase.from('shortlists').delete().eq('id', shortlistId);
        if (error) {
            console.error('Error removing from shortlist:', error);
            // Revert on error
            fetchShortlist();
        }
    };

    // Re-using the handler logic from Dashboard
    const handleSendInterest = async (targetId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('connections').insert({
            sender_id: user.id,
            receiver_id: targetId,
            status: 'pending'
        });

        if (error) {
            console.error('Error sending interest:', error);
            return;
        }

        // Update local state to gray out button
        setProfiles(current => current.map(p => 
            p.id === targetId ? { ...p, connectionStatus: 'sent' } : p
        ));
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-50">
            <div className="p-8 max-w-7xl mx-auto">
                
                {/* Back Button */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-haldi-500 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Dashboard</span>
                </Link>

                <div className="mb-8 border-b border-stone-800 pb-4">
                    <h1 className="text-3xl font-serif text-haldi-500 mb-2">My Shortlist</h1>
                    <p className="text-stone-400 text-sm">Profiles you have bookmarked for later.</p>
                </div>

                {/* LOADING STATE */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-4 border-haldi-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-stone-500 text-sm mt-4">Loading shortlist...</p>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && profiles.length === 0 && (
                    <div className="text-center py-20 bg-stone-900/50 rounded-2xl border border-stone-800 border-dashed">
                        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-stone-600" />
                        </div>
                        <h3 className="text-stone-300 font-bold text-lg">Your shortlist is empty</h3>
                        <p className="text-stone-500 text-sm mt-2">Tap the Star icon on profiles to save them here.</p>
                    </div>
                )}

                {/* GRID */}
                {!loading && profiles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profiles.map((profile) => (
                            <div key={profile.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-stone-700 transition-all group">
                                {/* Image Header */}
                                <div className="h-48 relative overflow-hidden">
                                    <Link href={`/profile/${profile.id}`}>
                                        <img 
                                            src={profile.image_url || "/placeholder.jpg"} 
                                            alt={profile.full_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer" 
                                        />
                                    </Link>
                                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent opacity-80"></div>
                                    
                                    {/* Remove Button (Top Right) */}
                                    <button 
                                        onClick={() => handleRemove(profile.shortlist_id)}
                                        className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-sm rounded-full text-stone-400 hover:text-red-500 hover:bg-black transition-colors z-10"
                                        title="Remove from shortlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Added date badge */}
                                    <div className="absolute bottom-2 left-2 text-[10px] text-stone-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                                        Added {new Date(profile.added_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 -mt-10 relative">
                                    <div className="mb-3">
                                        {profile.gothra && (
                                            <span className="text-[10px] text-haldi-500 bg-haldi-900/20 px-2 py-0.5 rounded border border-haldi-500/20 uppercase tracking-widest">
                                                {profile.gothra}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <Link href={`/profile/${profile.id}`}>
                                        <h3 className="text-xl font-serif text-white mb-1 hover:text-haldi-400 transition-colors cursor-pointer">
                                            {profile.full_name}
                                        </h3>
                                    </Link>
                                    <div className="flex flex-col gap-1 text-xs text-stone-400 mb-4">
                                        {profile.profession && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-3 h-3"/> {profile.profession}
                                            </span>
                                        )}
                                        {profile.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3"/> {profile.location}
                                            </span>
                                        )}
                                        {profile.age && (
                                            <span className="text-stone-500">
                                                {profile.age} yrs{profile.height ? `, ${profile.height}` : ''}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <ConnectionButton 
                                        profileId={profile.id}
                                        initialStatus={profile.connectionStatus}
                                        onSendInterest={handleSendInterest}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
