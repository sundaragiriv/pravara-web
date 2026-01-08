"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Heart, Clock, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notifyInterestAccepted } from '@/utils/notifications';

export default function RequestsPage() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // FETCH LOGIC: Get the connections, then get the profile details
        // 1. If Tab is 'received', I need rows where receiver_id = ME
        // 2. If Tab is 'sent', I need rows where sender_id = ME
        
        const columnToCheck = activeTab === 'received' ? 'receiver_id' : 'sender_id';
        const profileToFetch = activeTab === 'received' ? 'sender_id' : 'receiver_id';

        const { data: connections, error } = await supabase
            .from('connections')
            .select(`
                *,
                profile:profiles!connections_${profileToFetch}_fkey (*) 
            `) // Expand the OTHER person's profile
            .eq(columnToCheck, user.id)
            .eq('status', 'pending'); // Only show pending requests here

        if (error) {
            console.error("Error fetching requests:", error);
            setLoading(false);
            return;
        }

        // Format data to match our Card UI structure
        const formatted = (connections || []).map((c: any) => ({
            ...c.profile, // Flatten profile details up
            connectionId: c.id, // Store connection ID for updates
            connectionStatus: activeTab // Force status so we know context
        }));

        setProfiles(formatted);
        setLoading(false);
    };

    // HANDLER: When "Accept" or "Reject" is clicked, update UI instantly
    const handleAction = (targetId: string) => {
        setProfiles(current => current.filter(p => p.id !== targetId));
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-50">
            <div className="p-8 max-w-7xl mx-auto">
                
                {/* --- BACK BUTTON --- */}
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-haldi-500 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Dashboard</span>
                </Link>

                {/* --- HEADER & TABS --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-stone-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-serif text-haldi-500 mb-2">Invitations</h1>
                        <p className="text-stone-400 text-sm">Manage your incoming and outgoing interests.</p>
                    </div>

                    <div className="flex bg-stone-900 p-1 rounded-xl border border-stone-800 mt-4 md:mt-0">
                        <button 
                            onClick={() => setActiveTab('received')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'received' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                        >
                            Received {activeTab === 'received' && profiles.length > 0 && <span className="ml-2 bg-haldi-500 text-black text-[10px] px-1.5 py-0.5 rounded-full">{profiles.length}</span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('sent')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sent' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                        >
                            Sent {activeTab === 'sent' && profiles.length > 0 && <span className="ml-2 bg-stone-700 text-stone-300 text-[10px] px-1.5 py-0.5 rounded-full">{profiles.length}</span>}
                        </button>
                    </div>
                </div>

                {/* --- LOADING STATE --- */}
                {loading && (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-4 border-haldi-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-stone-500 text-sm mt-4">Loading requests...</p>
                    </div>
                )}

                {/* --- EMPTY STATE --- */}
                {!loading && profiles.length === 0 && (
                    <div className="text-center py-20 bg-stone-900/50 rounded-2xl border border-stone-800 border-dashed">
                        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            {activeTab === 'received' ? <Heart className="text-stone-600" /> : <Clock className="text-stone-600" />}
                        </div>
                        <h3 className="text-stone-300 font-bold text-lg">No {activeTab} requests yet</h3>
                        <p className="text-stone-500 text-sm mt-2 max-w-md mx-auto">
                            {activeTab === 'received' 
                                ? "Optimize your profile to get more visibility." 
                                : "Go to the Explorer and start sending interests to profiles you like!"}
                        </p>
                    </div>
                )}

                {/* --- REQUEST CARDS GRID --- */}
                {!loading && profiles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profiles.map((profile) => (
                            <RequestCard 
                                key={profile.id} 
                                profile={profile} 
                                type={activeTab}
                                onAction={handleAction} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: A Simpler Card for Requests ---
function RequestCard({ profile, type, onAction }: any) {
    const supabase = createClient();
    const [processing, setProcessing] = useState(false);

    const acceptRequest = async () => {
        setProcessing(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('connections')
            .update({ status: 'accepted' })
            .eq('sender_id', profile.id)
            .eq('receiver_id', user?.id);
        
        if (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request. Please try again.');
        } else {
            // Trigger notification to sender
            if (user) {
                await notifyInterestAccepted(profile.id, user.id);
            }
            onAction(profile.id); // Remove from list
        }
        setProcessing(false);
    };

    const rejectRequest = async () => {
        setProcessing(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('connections')
            .update({ status: 'rejected' })
            .eq('sender_id', profile.id)
            .eq('receiver_id', user?.id);
        
        if (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request. Please try again.');
        } else {
            onAction(profile.id); // Remove from list
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
            console.error('Error withdrawing request:', error);
            alert('Failed to withdraw request. Please try again.');
        } else {
            onAction(profile.id); // Remove from list
        }
        setProcessing(false);
    };

    return (
        <div className="flex bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-haldi-500/30 transition-all group">
            {/* Left: Image */}
            <Link href={`/profile/${profile.id}`} className="w-32 h-auto relative flex-shrink-0">
                {profile.image_url ? (
                    <img src={profile.image_url} className="w-full h-full object-cover" alt={profile.full_name} />
                ) : (
                    <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-stone-700" />
                    </div>
                )}
            </Link>

            {/* Right: Info & Actions */}
            <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <Link href={`/profile/${profile.id}`}>
                            <h4 className="text-white font-serif text-lg leading-tight hover:text-haldi-400 transition-colors cursor-pointer">
                                {profile.full_name}
                            </h4>
                        </Link>
                        {/* Gothra Badge */}
                        {profile.gothra && (
                            <span className="text-[10px] text-haldi-500 bg-haldi-900/20 px-2 py-0.5 rounded border border-haldi-500/20 uppercase">
                                {profile.gothra}
                            </span>
                        )}
                    </div>
                    <p className="text-stone-500 text-xs mt-1">
                        {profile.age ? `${profile.age} yrs` : ''}{profile.age && profile.location ? ', ' : ''}{profile.location || ''}
                    </p>
                    <p className="text-stone-400 text-xs mt-2 truncate">{profile.profession || 'Profession not specified'}</p>
                </div>

                <div className="mt-4">
                    {type === 'received' ? (
                        <div className="flex gap-2">
                            <button 
                                onClick={acceptRequest}
                                disabled={processing}
                                className="flex-1 bg-haldi-500 hover:bg-haldi-600 text-black text-xs font-bold py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-wait"
                            >
                                {processing ? 'Processing...' : 'Accept'}
                            </button>
                            <button 
                                onClick={rejectRequest}
                                disabled={processing}
                                className="px-3 py-2 border border-stone-700 rounded text-stone-500 hover:text-red-400 hover:border-red-900 transition-colors disabled:opacity-50 disabled:cursor-wait"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <div className="flex-1 flex items-center gap-2 text-xs text-haldi-600 bg-haldi-900/10 px-3 py-2 rounded border border-haldi-500/20">
                                <Clock className="w-3 h-3 animate-pulse" />
                                <span>Awaiting Response...</span>
                            </div>
                            <button 
                                onClick={withdrawRequest}
                                disabled={processing}
                                className="px-3 py-2 border border-stone-700 rounded text-stone-500 hover:text-red-400 hover:border-red-900 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                title="Withdraw request"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
