"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, User, Sparkles, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SangamChat() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 1. Load Connections
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
          sender:profiles!connections_sender_id_fkey(id, full_name, image_url, profession), 
          receiver:profiles!connections_receiver_id_fkey(id, full_name, image_url, profession)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (conns) {
        const formatted = conns.map((c: any) => {
          const partner = c.sender_id === user.id ? c.receiver : c.sender;
          return { connection_id: c.id, partner };
        });
        setConversations(formatted);
      }
    };
    init();
  }, []);

  // 2. Load Messages & Subscribe
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('connection_id', activeChat)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // REALTIME MAGIC
    const channel = supabase
      .channel('chat_room')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `connection_id=eq.${activeChat}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat || !currentUser) return;
    
    const text = input;
    setInput(""); // Clear input immediately

    // OPTIMISTIC UPDATE: Show message immediately in UI before DB confirms
    const optimisticMsg = {
        id: `temp-${Date.now()}`,
        connection_id: activeChat,
        sender_id: currentUser.id,
        content: text,
        created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    // Send to Database
    const { error } = await supabase.from('messages').insert({
      connection_id: activeChat,
      sender_id: currentUser.id,
      content: text
    });

    if (error) {
        console.error("Send failed:", error);
        alert("Failed to send message");
    }
  };

  const getActivePartner = () => conversations.find(c => c.connection_id === activeChat)?.partner;

  return (
    <div className="flex h-screen bg-stone-950 text-stone-50 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 border-r border-stone-800 flex flex-col bg-stone-900/30">
        <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
           <h1 className="font-serif text-xl text-haldi-500 font-bold flex items-center gap-2">
             <Sparkles className="w-5 h-5" /> Sangam
           </h1>
           <Link href="/dashboard" className="p-2 hover:bg-stone-800 rounded-full transition-colors">
             <ArrowLeft className="w-5 h-5 text-stone-400" />
           </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {conversations.length === 0 && <div className="text-center text-stone-500 mt-10 text-sm">No connections yet.</div>}
          
          {conversations.map((c) => (
            <button
              key={c.connection_id}
              onClick={() => setActiveChat(c.connection_id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeChat === c.connection_id ? 'bg-haldi-900/20 border border-haldi-500/30' : 'hover:bg-stone-800 border border-transparent'}`}
            >
              <div className="w-12 h-12 rounded-full bg-stone-800 overflow-hidden border border-stone-700">
                {c.partner.image_url ? <img src={c.partner.image_url} className="w-full h-full object-cover"/> : <User className="w-6 h-6 m-auto text-stone-500"/>}
              </div>
              <div className="text-left overflow-hidden">
                <div className="font-serif text-stone-200 truncate font-medium">{c.partner.full_name}</div>
                <div className="text-xs text-stone-500 truncate">{c.partner.profession}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col bg-stone-950 relative">
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-600 opacity-50">
             <Sparkles className="w-16 h-16 mb-4 text-stone-700" />
             <p className="font-serif text-xl">Select a conversation to begin</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-stone-800 bg-stone-900/80 backdrop-blur-md flex justify-between items-center z-10 shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-stone-800 overflow-hidden border border-stone-700">
                    {getActivePartner()?.image_url ? <img src={getActivePartner().image_url} className="w-full h-full object-cover"/> : <User className="w-5 h-5 m-auto text-stone-500"/>}
                 </div>
                 <div>
                    <h2 className="font-bold text-stone-200">{getActivePartner()?.full_name}</h2>
                    <span className="text-xs text-green-500 flex items-center gap-1">● Online</span>
                 </div>
               </div>
               <div className="flex gap-4 text-stone-400">
                  <Phone className="w-5 h-5 hover:text-haldi-500 cursor-pointer transition-colors" />
                  <Video className="w-5 h-5 hover:text-haldi-500 cursor-pointer transition-colors" />
                  <MoreVertical className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-950">
               {messages.length === 0 && (
                   <div className="text-center py-10">
                       <p className="text-stone-500 text-sm">You are connected! Start the conversation.</p>
                   </div>
               )}
               {messages.map((m) => {
                 const isMe = m.sender_id === currentUser?.id;
                 return (
                   <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${isMe ? 'bg-haldi-600 text-stone-950 rounded-br-none' : 'bg-stone-800 text-stone-200 rounded-bl-none border border-stone-700'}`}>
                        {m.content}
                      </div>
                   </div>
                 );
               })}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-stone-900 border-t border-stone-800 flex flex-col gap-3">
               
               {/* 1. The Input Field */}
               <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-2xl px-3 py-3 focus-within:border-haldi-500/50 transition-colors shadow-inner">
                  <input 
                    className="flex-1 bg-transparent px-2 text-stone-200 placeholder-stone-600 focus:outline-none h-full"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button 
                    onClick={sendMessage} 
                    className="w-10 h-10 bg-haldi-600 hover:bg-haldi-500 rounded-xl flex items-center justify-center text-stone-950 transition-colors shadow-lg shadow-haldi-900/20 flex-shrink-0"
                  >
                     <Send className="w-5 h-5" />
                  </button>
               </div>
               
               {/* 2. Sutradhar Whisper (Moved BELOW the input to prevent overlap) */}
               <div className="flex justify-center">
                  <button className="text-[10px] text-haldi-500/70 hover:text-haldi-500 flex items-center gap-1.5 transition-colors uppercase tracking-widest font-bold py-1 px-3 rounded-full hover:bg-haldi-900/10">
                     <Sparkles className="w-3 h-3" /> Ask Sutradhar for a hint
                  </button>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
