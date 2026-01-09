"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Send, Phone, Video, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
    const supabase = createClient();
    const [matches, setMatches] = useState<any[]>([]);
    const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. INITIAL LOAD (The Robust 2-Step Fetch)
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setCurrentUser(user);

                // STEP 1: Fetch Connections (Just IDs) - Cannot fail due to bad FK names
                const { data: connections, error: connError } = await supabase
                    .from('connections')
                    .select('id, sender_id, receiver_id, updated_at, status')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .eq('status', 'accepted')
                    .order('updated_at', { ascending: false });

                if (connError) throw connError;

                if (!connections || connections.length === 0) {
                    setMatches([]);
                    setLoading(false);
                    return;
                }

                // STEP 2: Calculate Partner IDs and Fetch Profiles
                const partnerIds = connections.map(c => 
                    c.sender_id === user.id ? c.receiver_id : c.sender_id
                );

                // Fetch all partner profiles in one go
                const { data: profiles, error: profError } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name, image_url')
                    .in('id', partnerIds);

                if (profError) throw profError;

                // STEP 3: Merge Data
                const formattedMatches = connections.map(c => {
                    const partnerId = c.sender_id === user.id ? c.receiver_id : c.sender_id;
                    const partner = profiles?.find(p => p.id === partnerId) || { first_name: 'Unknown', last_name: 'User', image_url: null };
                    
                    return {
                        connectionId: c.id,
                        partnerId: partnerId,
                        name: `${partner.first_name} ${partner.last_name}`.trim(),
                        image: partner.image_url || null,
                        lastActive: new Date(c.updated_at).toLocaleDateString()
                    };
                });

                setMatches(formattedMatches);
                
                // Auto-select first match if available
                if (formattedMatches.length > 0) {
                    setActiveConnectionId(formattedMatches[0].connectionId);
                }
            } catch (error: any) {
                console.error('Error loading chat:', error.message);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // 2. FETCH MESSAGES & SUBSCRIBE TO REALTIME
    useEffect(() => {
        if (!activeConnectionId) return;

        const fetchHistory = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('connection_id', activeConnectionId)
                .order('created_at', { ascending: true });
            setMessages(data || []);
            scrollToBottom();
        };

        fetchHistory();

        const channel = supabase
            .channel(`chat:${activeConnectionId}`)
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `connection_id=eq.${activeConnectionId}` },
                (payload) => {
                    setMessages(current => [...current, payload.new]);
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeConnectionId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !activeConnectionId) return;

        const text = newMessage;
        setNewMessage(""); // Optimistic clear

        // Insert message
        const { error } = await supabase.from('messages').insert({
            connection_id: activeConnectionId,
            sender_id: currentUser.id,
            content: text
        });

        if (error) {
            console.error("Send error:", error.message);
            alert("Failed to send message");
            setNewMessage(text); // Revert if failed
        }
    };

    const activeMatch = matches.find(m => m.connectionId === activeConnectionId);

    if (loading) return <div className="h-screen flex items-center justify-center bg-stone-950 text-haldi-500"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-stone-950 flex flex-col">
            {/* Back Button */}
            <div className="p-4 border-b border-stone-800 flex justify-between items-center">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-haldi-500 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Dashboard</span>
                </Link>
            </div>

            <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full md:px-6 md:py-4">
                <div className="flex w-full bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl">
                    
                    {/* --- SIDEBAR: MATCH LIST --- */}
                    <div className={`w-full md:w-80 border-r border-stone-800 flex flex-col bg-stone-950/50 ${activeConnectionId ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-stone-800">
                            <h2 className="text-haldi-500 font-serif font-bold text-xl">Messages</h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {matches.length === 0 ? (
                                <div className="p-6 text-center text-stone-500 text-sm flex flex-col items-center">
                                    <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                                    <p>No connections yet.</p>
                                    <Link href="/dashboard" className="text-haldi-500 hover:underline mt-2 block">Find Matches</Link>
                                </div>
                            ) : (
                                matches.map(match => (
                                    <div 
                                        key={match.connectionId}
                                        onClick={() => setActiveConnectionId(match.connectionId)}
                                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-stone-900 transition-colors border-b border-stone-800/50 ${activeConnectionId === match.connectionId ? 'bg-stone-900 border-l-2 border-l-haldi-500' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-800 border border-stone-700">
                                            {match.image ? (
                                                <img src={match.image} alt={match.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">?</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-stone-200 font-medium text-sm truncate">{match.name}</h4>
                                            <p className="text-stone-500 text-xs truncate">Click to chat</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* --- MAIN CHAT WINDOW --- */}
                    <div className={`flex-1 flex flex-col bg-stone-900 relative ${!activeConnectionId ? 'hidden md:flex' : 'flex'}`}>
                        {activeConnectionId && activeMatch ? (
                            <>
                                {/* Header */}
                                <div className="h-16 border-b border-stone-800 flex items-center justify-between px-6 bg-stone-900/90 backdrop-blur z-10">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setActiveConnectionId(null)} className="md:hidden text-stone-400">
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-800 border border-haldi-500/30">
                                            {activeMatch.image ? <img src={activeMatch.image} className="w-full h-full object-cover" /> : null}
                                        </div>
                                        <div>
                                            <h3 className="text-stone-200 font-bold text-sm md:text-base">{activeMatch.name}</h3>
                                            <p className="text-[10px] text-stone-500">Connected</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-stone-500">
                                        <Phone className="w-5 h-5 cursor-pointer hover:text-haldi-500 transition-colors" />
                                        <Video className="w-5 h-5 cursor-pointer hover:text-haldi-500 transition-colors" />
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-stone-900 to-stone-950">
                                    {messages.length === 0 && (
                                        <div className="text-center text-stone-500 text-sm py-10">
                                            <p>No messages yet.</p>
                                            <p className="text-xs text-haldi-600 mt-1">Start the conversation!</p>
                                        </div>
                                    )}
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender_id === currentUser?.id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-haldi-500 text-black font-medium rounded-tr-none' : 'bg-stone-800 text-stone-200 rounded-tl-none'}`}>
                                                    <p>{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-black/60' : 'text-stone-500'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-stone-800 bg-stone-950">
                                    <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-full px-4 py-2 focus-within:border-haldi-500 transition-colors">
                                        <input 
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 bg-transparent text-stone-200 outline-none text-sm placeholder-stone-600"
                                        />
                                        <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-haldi-500 rounded-full text-black hover:bg-haldi-600 transition-colors disabled:opacity-50">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            // Empty State
                            <div className="hidden md:flex flex-1 items-center justify-center flex-col text-stone-600 bg-stone-950">
                                <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center mb-4">
                                    <MessageCircle className="w-8 h-8 opacity-50" />
                                </div>
                                <p>Select a match to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}