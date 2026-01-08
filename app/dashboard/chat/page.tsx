"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Send, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
    const supabase = createClient();
    const [matches, setMatches] = useState<any[]>([]);
    const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    
    // Auto-scroll ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. INITIAL LOAD: Get User & Accepted Matches
    useEffect(() => {
        const loadInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUser(user);

            // Fetch Connections where status = 'accepted'
            const { data: connections, error } = await supabase
                .from('connections')
                .select(`
                    id, 
                    sender_id, 
                    receiver_id, 
                    updated_at,
                    sender:profiles!connections_sender_id_fkey(id, full_name, image_url),
                    receiver:profiles!connections_receiver_id_fkey(id, full_name, image_url)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .eq('status', 'accepted')
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Error fetching connections:', error);
                return;
            }

            // Format matches to hide "sender/receiver" logic
            const formattedMatches = (connections || []).map((c: any) => {
                const isSender = c.sender_id === user.id;
                const partner = isSender ? c.receiver : c.sender;
                return {
                    connectionId: c.id,
                    partnerId: partner.id,
                    name: partner.full_name || 'Unknown',
                    image: partner.image_url || "/placeholder.jpg",
                    lastActive: new Date(c.updated_at).toLocaleDateString()
                };
            });

            setMatches(formattedMatches);
            
            // Auto-select first match if available
            if (formattedMatches.length > 0) {
                setActiveConnectionId(formattedMatches[0].connectionId);
            }
        };

        loadInitialData();
    }, []);

    // 2. FETCH MESSAGES & SUBSCRIBE TO REALTIME
    useEffect(() => {
        if (!activeConnectionId) return;

        // A. Load History
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

        // B. Subscribe to NEW messages (The Magic 🪄)
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

        return () => {
            supabase.removeChannel(channel);
        };
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
        setNewMessage(""); // Clear input immediately (Optimistic)

        await supabase.from('messages').insert({
            connection_id: activeConnectionId,
            sender_id: currentUser.id,
            content: text
        });
    };

    const activeMatch = matches.find(m => m.connectionId === activeConnectionId);

    return (
        <div className="min-h-screen bg-stone-950">
            {/* Back Button */}
            <div className="p-4">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-haldi-500 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Dashboard</span>
                </Link>
            </div>

            <div className="h-[calc(100vh-100px)] flex bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden mx-4 md:mx-8 mb-6">
                
                {/* --- SIDEBAR: MATCH LIST --- */}
                <div className="w-full md:w-80 border-r border-stone-800 flex flex-col bg-stone-950/50">
                    <div className="p-4 border-b border-stone-800">
                        <h2 className="text-haldi-500 font-serif font-bold text-xl">Messages</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {matches.length === 0 ? (
                            <div className="p-6 text-center text-stone-500 text-sm">
                                No connections yet. Go to <Link href="/dashboard/requests" className="text-haldi-500 hover:underline">Requests</Link> to accept invites!
                            </div>
                        ) : (
                            matches.map(match => (
                                <div 
                                    key={match.connectionId}
                                    onClick={() => setActiveConnectionId(match.connectionId)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-stone-900 transition-colors border-b border-stone-800/50 ${activeConnectionId === match.connectionId ? 'bg-stone-900 border-l-2 border-l-haldi-500' : ''}`}
                                >
                                    <img src={match.image} alt={match.name} className="w-10 h-10 rounded-full object-cover border border-stone-700" />
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
                {activeConnectionId && activeMatch ? (
                    <div className="flex-1 flex flex-col bg-stone-900 relative">
                        
                        {/* Header */}
                        <div className="h-16 border-b border-stone-800 flex items-center justify-between px-6 bg-stone-900/90 backdrop-blur z-10">
                            <div className="flex items-center gap-3">
                                <img src={activeMatch.image} alt={activeMatch.name} className="w-8 h-8 rounded-full border border-haldi-500/30" />
                                <div>
                                    <h3 className="text-stone-200 font-bold">{activeMatch.name}</h3>
                                    <p className="text-[10px] text-stone-500">Active {activeMatch.lastActive}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-stone-500">
                                <Phone className="w-5 h-5 cursor-pointer hover:text-haldi-500 transition-colors" title="Voice Call (Coming Soon)" />
                                <Video className="w-5 h-5 cursor-pointer hover:text-haldi-500 transition-colors" title="Video Call (Coming Soon)" />
                                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-stone-300 transition-colors" />
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-stone-900 to-stone-950">
                            {messages.length === 0 && (
                                <div className="text-center text-stone-500 text-sm py-10">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === currentUser?.id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-haldi-600 text-black font-medium rounded-tr-none' : 'bg-stone-800 text-stone-200 rounded-tl-none'}`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${isMe ? 'text-black/60' : 'text-stone-500'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
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
                                <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-haldi-500 rounded-full text-black hover:bg-haldi-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // Empty State (No Match Selected)
                    <div className="hidden md:flex flex-1 items-center justify-center flex-col text-stone-600 bg-stone-950">
                        <div className="w-20 h-20 rounded-full bg-stone-900 flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 opacity-50" />
                        </div>
                        <p>Select a match to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
