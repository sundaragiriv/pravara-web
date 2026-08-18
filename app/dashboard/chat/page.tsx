"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Send, User, Sparkles, Phone, Video, MoreVertical,
  ArrowLeft, Loader2, MessageCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ── Timestamp formatter ────────────────────────────────────────────────────
function formatMsgTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' · ' + time;
}

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  // Mobile: 'sidebar' shows the conversation list; 'chat' shows the message area
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 1. Load Connections and Unread Counts
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);

      const { data: conns } = await supabase
        .from('connections')
        .select(`
          id,
          sender_id,
          receiver_id,
          sender:profiles!connections_sender_id_fkey(id, full_name, image_url, profession, location, sub_community),
          receiver:profiles!connections_receiver_id_fkey(id, full_name, image_url, profession, location, sub_community)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (conns) {
        const formatted = conns.map((c: any) => {
          const partner = c.sender_id === user.id ? c.receiver : c.sender;
          return { connection_id: c.id, partner };
        });
        setConversations(formatted);

        const counts: Record<string, number> = {};
        for (const conv of formatted) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('connection_id', conv.connection_id)
            .neq('sender_id', user.id)
            .eq('is_read', false);
          if (count && count > 0) counts[conv.partner.id] = count;
        }
        setUnreadCounts(counts);
      }
    };
    init();
  }, []);

  // 2. Load Messages & Subscribe
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', activeChat)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('connection_id', activeChat)
        .neq('sender_id', currentUser.id)
        .eq('is_read', false)
        .select();
    };
    fetchMessages();

    const channel = supabase
      .channel('all_chat_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as any;
          if (newMsg.connection_id === activeChat) {
            if (newMsg.sender_id === currentUser.id) {
              // Own message: swap out the optimistic temp entry so it isn't duplicated
              setMessages(prev => {
                const tempIdx = prev.findIndex(m => typeof m.id === 'string' && m.id.startsWith('temp-'));
                if (tempIdx >= 0) {
                  const updated = [...prev];
                  updated[tempIdx] = newMsg;
                  return updated;
                }
                return [...prev, newMsg];
              });
            } else {
              setMessages(prev => [...prev, newMsg]);
              await supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
            }
          } else if (newMsg.sender_id !== currentUser.id) {
            const conversation = conversations.find(c => c.connection_id === newMsg.connection_id);
            if (conversation) {
              setUnreadCounts(prev => ({
                ...prev,
                [conversation.partner.id]: (prev[conversation.partner.id] || 0) + 1,
              }));
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat, currentUser, conversations]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat || !currentUser) return;
    const text = input;
    setInput("");
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      connection_id: activeChat,
      sender_id: currentUser.id,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    const { error } = await supabase.from('messages').insert({
      connection_id: activeChat,
      sender_id: currentUser.id,
      content: text,
    });
    if (error) console.error("Send failed:", error);
  };

  const getActivePartner = () => conversations.find(c => c.connection_id === activeChat)?.partner;

  const openChat = (connectionId: string, partnerId: string) => {
    setActiveChat(connectionId);
    setUnreadCounts(prev => ({ ...prev, [partnerId]: 0 }));
    setMobileView('chat');
  };

  const askSutradhar = async () => {
    if (!activeChat || !currentUser) return;
    setHintLoading(true);
    try {
      const partner = getActivePartner();
      const response = await fetch('/api/sutradhar-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myProfile: { name: "Me" }, partnerProfile: partner }),
      });
      const data = await response.json();
      setInput(data.hint);
    } catch (err) {
      console.error(err);
    } finally {
      setHintLoading(false);
    }
  };

  const partner = getActivePartner();

  return (
    // fixed inset-0 overlays the DashboardLayout footer and root-level SutradharWidget
    <div className="fixed inset-0 z-[100] flex bg-stone-950 text-stone-50 overflow-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <div className={`
        flex-shrink-0 w-full md:w-80 border-r border-stone-800 flex flex-col bg-stone-900/40
        ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/80">
          <Image
            src="/logo3.png"
            alt="Pravara"
            width={96}
            height={32}
            className="object-contain [mix-blend-mode:lighten]"
            priority
          />
          <Link
            href="/dashboard"
            className="p-2 hover:bg-stone-800 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-stone-400" />
          </Link>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <div className="text-center text-stone-500 mt-16 px-6">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-stone-700" />
              <p className="text-sm font-medium">No connections yet</p>
              <p className="text-xs mt-1 text-stone-600">Send interest to start chatting.</p>
            </div>
          )}

          {conversations.map((c) => (
            <button
              key={c.connection_id}
              onClick={() => openChat(c.connection_id, c.partner.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                activeChat === c.connection_id
                  ? 'bg-haldi-900/20 border border-haldi-500/30'
                  : 'hover:bg-stone-800/60 border border-transparent'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-stone-800 overflow-hidden border border-stone-700 flex-shrink-0">
                {c.partner.image_url
                  ? <img src={c.partner.image_url} className="w-full h-full object-cover" alt={c.partner.full_name} />
                  : <User className="w-5 h-5 m-auto text-stone-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-stone-200 truncate text-sm font-medium">{c.partner.full_name}</div>
                <div className="text-xs text-stone-500 truncate">{c.partner.profession || c.partner.location || 'Connected'}</div>
              </div>
              {unreadCounts[c.partner.id] > 0 && (
                <span className="bg-haldi-500 text-black text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                  {unreadCounts[c.partner.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── CHAT AREA ────────────────────────────────────────────────────── */}
      <div className={`
        flex-1 flex flex-col bg-stone-950 min-w-0
        ${mobileView === 'sidebar' ? 'hidden md:flex' : 'flex'}
      `}>
        {!activeChat ? (
          /* Empty state — no conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Sparkles className="w-14 h-14 mb-4 text-stone-600" />
            <p className="font-serif text-xl text-stone-400">Select a conversation to begin</p>
            <p className="text-sm text-stone-600 mt-1">Choose from the list on the left</p>
          </div>
        ) : (
          <>
            {/* ── Chat header ─── */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-stone-800 bg-stone-900/80 backdrop-blur-md flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                {/* Mobile: back to sidebar */}
                <button
                  type="button"
                  title="Back to conversations"
                  className="md:hidden p-1.5 -ml-1 hover:bg-stone-800 rounded-full transition-colors text-stone-400"
                  onClick={() => setMobileView('sidebar')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-stone-800 overflow-hidden border border-stone-700 flex-shrink-0">
                  {partner?.image_url
                    ? <img src={partner.image_url} className="w-full h-full object-cover" alt={partner.full_name} />
                    : <User className="w-5 h-5 m-auto text-stone-500" />}
                </div>
                <div>
                  <h2 className="font-bold text-stone-100 text-sm leading-tight">{partner?.full_name}</h2>
                  <p className="text-xs text-stone-500">{partner?.profession || partner?.location || ''}</p>
                </div>
              </div>
              <div className="flex gap-4 text-stone-500">
                <Phone className="w-4.5 h-4.5 hover:text-haldi-500 cursor-pointer transition-colors" />
                <Video className="w-4.5 h-4.5 hover:text-haldi-500 cursor-pointer transition-colors" />
                <MoreVertical className="w-4.5 h-4.5 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* ── Messages ─── */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-5 py-6 space-y-3"
            >
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-3xl mb-3">🪷</div>
                  <p className="text-stone-400 text-sm font-medium">You are connected!</p>
                  <p className="text-stone-600 text-xs mt-1">
                    Begin your conversation with {partner?.full_name?.split(' ')[0]}.
                  </p>
                </div>
              )}

              {messages.map((m) => {
                const isMe = m.sender_id === currentUser?.id;
                return (
                  <div key={m.id} className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-haldi-600 text-stone-950 rounded-br-sm shadow-sm shadow-haldi-900/30'
                        : 'bg-stone-800 text-stone-200 rounded-bl-sm border border-stone-700/50'
                    }`}>
                      {m.content}
                    </div>
                    {m.created_at && (
                      <span className="text-[10px] text-stone-600 px-1">
                        {formatMsgTime(m.created_at)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Input area ─── */}
            <div className="flex-shrink-0 px-4 py-3 bg-stone-900/80 border-t border-stone-800 flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-2xl px-3 py-2 focus-within:border-haldi-500/40 transition-colors">
                <input
                  className="flex-1 bg-transparent px-2 text-stone-200 placeholder-stone-600 focus:outline-none text-sm"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
                  }}
                />
                <button
                  type="button"
                  title="Send message"
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-9 h-9 bg-haldi-600 hover:bg-haldi-500 disabled:opacity-40 rounded-xl flex items-center justify-center text-stone-950 transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Sutradhar hint (only shows when a chat is open) */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={askSutradhar}
                  disabled={hintLoading}
                  className="text-[10px] text-haldi-500/60 hover:text-haldi-400 flex items-center gap-1.5 transition-colors uppercase tracking-widest font-bold py-1 px-3 rounded-full hover:bg-haldi-900/10 disabled:opacity-40"
                >
                  {hintLoading
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Consulting the stars...</>
                    : <><Sparkles className="w-3 h-3" /> Ask Sutradhar for a hint</>
                  }
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
