"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Conversation History - starts empty, populated in useEffect
  const [messages, setMessages] = useState<{role: 'ai' | 'user', content: string}[]>([]);

  // 1. FETCH CONTEXT ON LOAD - Check if user has existing profile
  useEffect(() => {
    const initSutradhar = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Try to fetch existing profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && profile.full_name) {
          // EVOLUTION MODE: User has existing profile
          setExistingProfile(profile);
          setMessages([{ 
            role: 'ai', 
            content: `Namaste, ${profile.full_name}. I see you are back. Would you like to update your location, profession, bio, or refine your partner preferences today?` 
          }]);
        } else {
          // GENESIS MODE: New user
          setMessages([{ 
            role: 'ai', 
            content: "Namaste. I am Sutradhar. I will craft your matrimonial profile. To begin, please tell me your full name, age, and where you are currently based." 
          }]);
        }
        setHasInitialized(true);
      } else {
        router.push("/login");
      }
    };

    initSutradhar();
  }, [router]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // 1. Add User Message
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // 2. Send to AI API with existing profile context
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg, 
          history: messages,
          existingProfile: existingProfile // Pass context for Evolution Mode
        })
      });

      const data = await response.json();

      if (data.profileComplete) {
        // Merge updates with existing data (preserves media)
        const finalData = existingProfile 
          ? { ...existingProfile, ...data.extractedData }
          : data.extractedData;
        
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
        await saveProfile(finalData);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "I apologize, I momentarily lost connection to the stars. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (profileData: any) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Fetch existing media to preserve it
        const { data: existing } = await supabase
          .from('profiles')
          .select('image_url, audio_bio_url')
          .eq('id', user.id)
          .single();

        const updates = {
            id: user.id,
            full_name: profileData.fullName,
            age: profileData.age,
            gender: profileData.gender,
            location: profileData.location,
            profession: profileData.profession,
            education: profileData.education,
            bio: profileData.bio,
            gothra: profileData.gothra,
            sub_community: profileData.community,
            partner_preferences: profileData.partnerPreferences,
            // Preserve existing media
            image_url: existing?.image_url || null,
            audio_bio_url: existing?.audio_bio_url || null
        };

        const { error } = await supabase
            .from('profiles')
            .upsert(updates, { onConflict: 'id' });

        if (error) {
            console.error("Supabase Error:", error);
            alert("Error saving profile. Please check console.");
        } else {
            router.push("/dashboard");
        }
    }
  };

  // Show loading state while fetching initial context
  if (!hasInitialized) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
          <p className="text-stone-400 text-sm">Summoning Sutradhar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-stone-900 flex items-center justify-between sticky top-0 bg-stone-950/90 backdrop-blur-md z-10">
         <div className="flex items-center gap-2 text-haldi-500">
            <Sparkles className="w-5 h-5" />
            <span className="font-serif font-bold text-lg">Sutradhar</span>
         </div>
         <div className="text-xs text-stone-500 uppercase tracking-widest">
           {existingProfile ? "Profile Update" : "Profile Creation"}
         </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl mx-auto w-full pb-32">
        {messages.map((m, idx) => (
            <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`max-w-[80%] p-4 rounded-2xl text-lg leading-relaxed shadow-lg ${
                    m.role === 'user' 
                    ? 'bg-stone-800 text-stone-100 rounded-br-none border border-stone-700' 
                    : 'bg-haldi-900/10 border border-haldi-500/20 text-stone-200 rounded-bl-none'
                }`}>
                    {m.content}
                </div>
            </motion.div>
        ))}
        {loading && (
            <div className="flex justify-start">
                <div className="bg-stone-900/50 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center text-stone-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Sutradhar is thinking...</span>
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent">
        <div className="max-w-2xl mx-auto relative">
            <input 
                type="text" 
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={existingProfile ? "e.g., Change my location to Mumbai" : "Type your answer..."}
                className="w-full bg-stone-900 border border-stone-800 rounded-full py-4 pl-6 pr-14 text-stone-100 text-lg focus:outline-none focus:border-haldi-500/50 shadow-2xl"
            />
            <button 
                onClick={handleSend}
                disabled={loading}
                className="absolute right-2 top-2 w-10 h-10 bg-haldi-600 hover:bg-haldi-500 rounded-full flex items-center justify-center text-stone-950 transition-colors disabled:opacity-50"
            >
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}
