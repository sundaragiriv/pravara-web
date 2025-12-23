"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, LayoutDashboard, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Message = {
  role: "ai" | "user";
  text: string;
};

export default function Onboarding() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null); // NEW: Store existing data
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // 1. Initialize User & Check Memory
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initSession = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        // CHECK DATABASE: Do we already know this person?
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setExistingProfile(profile);

        // SMART GREETING LOGIC
        if (profile?.full_name) {
             // We know them!
             const firstName = profile.full_name.split(' ')[0];
             setMessages([{ 
                role: "ai", 
                text: `Namaste, ${firstName} ji. Welcome back. I recall your Gothra is ${profile.gothra || "not yet recorded"}. What else would you like to update?` 
             }]);
        } else {
             // New user
             setMessages([{ role: "ai", text: "Namaste! I am Pravara. May I know your full name?" }]);
        }

      } else {
        router.push("/signup");
      }
    };
    initSession();
  }, [router]);

  // 2. Robust Scroll-to-Bottom
  useEffect(() => {
    // Small timeout ensures DOM is rendered before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages, isTyping, isComplete]);

  const addAiMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: "ai", text }]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !userId) return;

    // 1. Add User Message to UI
    const newMsg = { role: "user" as const, text: inputValue };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // 2. Send to AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newMsg], // Send history so AI remembers context
          userId: userId, // Pass ID so AI can save to Supabase
          // PASS CONTEXT: Tell AI what we already know so it doesn't re-ask
          currentProfile: existingProfile
        }),
      });

      const data = await response.json();
      
      if (data.text) {
        addAiMessage(data.text);
      }
      
      // If backend signals completion, show the "Ready" card
      if (data.completed) {
        setIsComplete(true);
      }

    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    // H-SCREEN & FLEX-COL: Fixes the layout so footer never overlaps content
    <div className="h-screen bg-stone-950 text-stone-50 font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-stone-950 -z-10" />

      {/* --- Fixed Header --- */}
      <header className="flex-none p-4 md:p-6 flex items-center justify-between border-b border-stone-900 bg-stone-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center shadow-lg shadow-haldi-500/10">
                <Sparkles className="w-5 h-5 text-haldi-500" />
            </div>
            <div>
                <h1 className="font-serif text-lg text-stone-200 leading-none">Pravara Sutradhar</h1>
                <span className="text-xs text-haldi-600 font-medium uppercase tracking-wider">AI Interview</span>
            </div>
        </div>
        
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 border border-stone-800 hover:border-haldi-500/50 hover:bg-stone-800 transition-all text-sm text-stone-400 hover:text-stone-200"
        >
            <span className="hidden sm:inline">Dashboard</span>
            <LayoutDashboard className="w-4 h-4" />
        </Link>
      </header>

      {/* --- Scrollable Chat Area --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 w-full max-w-3xl mx-auto scroll-smooth">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-5 py-3.5 text-base md:text-lg leading-relaxed shadow-md ${
                  msg.role === "user"
                    ? "bg-stone-800 text-stone-100 rounded-2xl rounded-tr-sm"
                    : "bg-stone-900 border border-haldi-500/20 text-stone-200 rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.role === "ai" && idx > 0 && <span className="block text-[10px] font-bold text-haldi-600 mb-1 uppercase tracking-wider">Pravara</span>}
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
           <div className="flex items-center gap-2 text-stone-500 text-sm ml-4 animate-pulse">
             <span className="w-2 h-2 bg-haldi-500 rounded-full"/>
             <span>Thinking...</span>
           </div>
        )}
        
        {/* --- COMPLETION CARD (Replacing sudden redirect) --- */}
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="my-8 p-6 rounded-2xl bg-gradient-to-br from-haldi-900/20 to-stone-900 border border-haldi-500/30 text-center space-y-4 shadow-2xl"
          >
            <div className="w-12 h-12 bg-haldi-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-haldi-500/20">
              <CheckCircle2 className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-stone-100">Profile Completed</h3>
              <p className="text-stone-400 text-sm mt-1">I have curated matches based on your Gothra and preferences.</p>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl transition-transform hover:scale-105"
            >
              View My Matches
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* --- Fixed Footer Input --- */}
      <div className="flex-none p-4 md:p-6 bg-stone-950/90 backdrop-blur-md border-t border-stone-900 z-50">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative flex items-center gap-4">
            <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isComplete ? "Chat completed" : "Type your answer here..."}
                disabled={isTyping || isComplete}
                className="w-full bg-stone-900 border border-stone-800 text-stone-100 rounded-full py-4 pl-6 pr-14 focus:border-haldi-600 focus:ring-1 focus:ring-haldi-600 transition-all text-lg disabled:opacity-50"
            />
            <button 
                type="submit"
                disabled={!inputValue.trim() || isTyping || isComplete}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-haldi-600 hover:bg-haldi-500 text-stone-950 rounded-full flex items-center justify-center transition-all disabled:opacity-0 hover:scale-105"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
      </div>

    </div>
  );
}
