"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowRight, Loader2, Video, ArrowUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AvatarUpload from "@/components/AvatarUpload";

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const [messages, setMessages] = useState<{role: 'assistant' | 'user', content: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. DEFINITIVE STATE
  const [liveProfileData, setLiveProfileData] = useState<Record<string, string>>({
    full_name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    location: "",
    profession: "",
    education: "",
    diet: "",
    smoking: "",
    drinking: "",
    religion: "",
    gothra: "",
    pravara: "",
    spiritual_org: "",
    religious_level: "",
    sub_community: "",
    nakshatra: "",
    raasi: "",
    birth_time: "",
    bio: "",
    partner_preferences: "",
    video_bio_url: "",
    audio_bio_url: "",
    image_url: ""
  });

  useEffect(() => {
    const initSutradhar = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
          setExistingProfile(profile);
          
          // Load existing data safely
          setLiveProfileData(prev => {
             const newData = { ...prev };
             Object.keys(newData).forEach(key => {
                if (profile[key]) newData[key] = String(profile[key]);
             });
             return newData;
          });

          // --- FIX: SMART GREETING LOGIC ---
          const hasName = profile.full_name && profile.full_name !== "Traveler" && profile.full_name.trim() !== "";
          
          if (hasName) {
              // RETURNING USER
              setMessages([{ role: 'assistant', content: `Namaste, ${profile.full_name}. Welcome back. What would you like to update today?` }]);
          } else {
              // NEW USER (Corrected!)
              setMessages([{ role: 'assistant', content: "Namaste! I am Sutradhar. Let us begin your journey. May I know your full name?" }]);
          }

        } else {
          // No profile row at all
          setMessages([{ role: 'assistant', content: "Namaste! I am Sutradhar. Let us begin your journey. May I know your full name?" }]);
        }
        setHasInitialized(true);
      } else {
        router.push("/login");
      }
    };
    initSutradhar();
  }, [router]);

  // Smooth auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-focus input when loading finishes
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. UI Update
    const userMsg = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
        // 2. Payload
        const payload = {
            messages: [...messages, userMsg],
            currentProfile: { ...liveProfileData, id: existingProfile?.id }
        };

        // 3. API Call
        const res = await fetch("/api/biographer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("AI failed to respond");

        const data = await res.json();

        // 4. Handle Response
        if (data.reply) {
            setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
            if (data.updatedProfile) {
                setLiveProfileData(data.updatedProfile);
            }
        }

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages((prev) => [...prev, { 
            role: "assistant", 
            content: "I apologize, I briefly lost connection. Could you please repeat that?" 
        }]);
    } finally {
        setLoading(false);
    }
  };

  const handleVideoUpload = async () => {
      const videoLink = prompt("Paste your Video Bio URL (YouTube/Drive):");
      if (videoLink) {
          setLiveProfileData(prev => ({ ...prev, video_bio_url: videoLink }));
          alert("Video link added! Don't forget to click Save.");
      }
  };

  const saveProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert("Please log in to save your profile.");
        return;
    }

    try {
        const updates = {
            id: user.id,
            ...liveProfileData,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });

        if (error) {
            console.error("DB Error:", error);
            alert(`Save Failed: ${error.message || "Unknown database error"}`);
        } else {
            router.push("/dashboard");
        }
    } catch (err) {
        console.error("Save Error:", err);
        alert("Failed to save profile. Please try again.");
    }
  };

  if (!hasInitialized) return <div className="min-h-screen bg-stone-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-haldi-500 animate-spin" /></div>;

  return (
    <div className="flex h-[100dvh] w-full bg-stone-950 overflow-hidden font-sans text-stone-200 relative">
        
        {/* --- MINIMALIST BRAND HEADER --- */}
        <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
            {/* Brand Logo (Top Left) */}
            <div className="flex items-center gap-2 pointer-events-auto">
                <Link href="/" className="font-serif text-2xl font-bold bg-gradient-to-r from-haldi-500 to-haldi-700 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    P
                </Link>
                <span className="text-xs text-stone-600 font-bold tracking-[0.2em] uppercase hidden sm:block">Pravara</span>
            </div>

            {/* Exit / Dashboard Link (Top Right) */}
            <Link href="/dashboard" className="pointer-events-auto text-xs font-bold text-stone-500 hover:text-haldi-500 transition-colors flex items-center gap-2">
                <span>EXIT</span>
                <div className="w-6 h-6 rounded-full border border-stone-800 flex items-center justify-center bg-stone-900">
                    <X className="w-3 h-3" />
                </div>
            </Link>
        </div>
        
        {/* --- LEFT COLUMN: THE CHAT APP (70% Width) --- */}
        {/* Updated Width Classes: md:w-2/3 lg:w-3/4 */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col h-full border-r border-stone-800 relative z-10">
            
            {/* A. HEADER */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-stone-800 bg-stone-950/80 backdrop-blur shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-haldi-500/10 flex items-center justify-center border border-haldi-500/20">
                        <Sparkles className="w-4 h-4 text-haldi-500" />
                    </div>
                    <div>
                        <h1 className="text-stone-100 font-serif font-medium">Sutradhar</h1>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* B. MESSAGES */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                <div className="h-4" />
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-stone-800 text-stone-100 rounded-tr-sm' 
                            : 'bg-haldi-900/10 border border-haldi-500/10 text-stone-200 rounded-tl-sm shadow-[0_2px_10px_rgba(255,193,7,0.02)]'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-sm p-4 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* C. INPUT */}
            <div className="p-4 bg-stone-950 border-t border-stone-800 shrink-0">
                <div className="relative flex items-center max-w-2xl mx-auto w-full">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your answer..."
                        disabled={loading}
                        autoFocus
                        className="w-full bg-stone-900/50 border border-stone-800 text-stone-200 text-sm rounded-xl py-3.5 pl-5 pr-14 focus:border-haldi-500 focus:ring-1 focus:ring-haldi-500/20 focus:bg-stone-900 outline-none transition-all placeholder:text-stone-600"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-2 bg-haldi-600 hover:bg-haldi-500 text-stone-950 rounded-lg transition-all disabled:opacity-0 disabled:scale-90 shadow-lg shadow-haldi-900/20 active:scale-95"
                    >
                         {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4 stroke-[3px]" />}
                    </button>
                </div>
                <div className="text-center mt-2.5 opacity-0 md:opacity-100 transition-opacity">
                   <span className="text-[10px] text-stone-600 uppercase tracking-widest font-medium">Press Enter to send</span>
                </div>
                {/* Mobile Actions */}
                <div className="flex gap-2 mt-3 md:hidden">
                    <button onClick={handleVideoUpload} className="flex-1 bg-stone-800 py-2.5 rounded-xl flex justify-center gap-2 text-sm"><Video className="w-4 h-4" /> Video</button>
                    <button onClick={saveProfile} className="flex-1 bg-stone-100 text-stone-950 py-2.5 rounded-xl font-bold text-sm">Save</button>
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: INTELLIGENT PREVIEW (30%) --- */}
        <div className="hidden md:block md:w-1/3 lg:w-1/4 h-full bg-stone-950/50 backdrop-blur-sm border-l border-stone-800 p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-haldi-500 uppercase tracking-widest">Live Profile</h3>
                    <span className="text-[10px] text-stone-600 bg-stone-900 px-2 py-1 rounded-full border border-stone-800">
                        {Object.values(liveProfileData).filter(v => v && v !== '...').length} / 15 Fields
                    </span>
                </div>
                
                {/* 1. PHOTO CARD (With Real Upload) */}
                <div className="group relative bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-haldi-500/30">
                    <div className="h-64 bg-gradient-to-br from-stone-800 to-stone-950 flex flex-col items-center justify-center border-b border-stone-800 relative">
                         
                         {/* REAL UPLOAD COMPONENT */}
                         <div className="mb-3 shadow-inner group-hover:scale-105 transition-transform z-10">
                             <AvatarUpload 
                                currentUrl={liveProfileData.image_url}
                                onUploadComplete={(url) => {
                                    // Update local state immediately for preview
                                    setLiveProfileData(prev => ({ ...prev, image_url: url }));
                                    // The component itself handles saving to Supabase storage & DB
                                }}
                                size={128} // 32 * 4 = 128px (w-32 h-32)
                             />
                         </div>
                         
                         <p className="text-xs text-stone-500">Tap photo to upload</p>
                    </div>
                    
                    <div className="p-5 text-center">
                        <h2 className="text-xl font-serif text-stone-100">
                            {liveProfileData?.full_name || <span className="text-stone-600 italic">Your Name</span>}
                        </h2>
                        <p className="text-xs text-haldi-500 font-bold mt-1 uppercase tracking-wide">
                            {liveProfileData?.profession || "Profession"}
                        </p>
                    </div>
                </div>

                {/* 2. DYNAMIC DATA GRID (With Flash Animation) */}
                <div className="space-y-4">
                    {/* SECTION A: VEDIC ROOTS (Crash-Proof Version) */}
                    <div>
                        <h4 className="text-[10px] text-haldi-500 uppercase font-bold tracking-widest mb-2 border-b border-stone-800 pb-1">Vedic Roots</h4>
                        {[
                            { label: "Community", value: liveProfileData.sub_community },
                            { label: "Gothra", value: liveProfileData.gothra },
                            { label: "Pravara", value: liveProfileData.pravara },
                            { label: "Religion", value: liveProfileData.religious_level },
                            { label: "Spiritual", value: liveProfileData.spiritual_org }, // Arrays handled below
                            { label: "Partner Pref", value: liveProfileData.partner_preferences }, // The culprit!
                        ].map((item) => {
                            // --- HELPER: SAFE RENDER LOGIC ---
                            let displayValue = "-";

                            if (item.value) {
                                if (Array.isArray(item.value)) {
                                    // Case 1: It's an Array (e.g. Spiritual Orgs) -> Join with commas
                                    displayValue = item.value.join(", ");
                                } else if (typeof item.value === 'object') {
                                    // Case 2: It's an Object (The Error Cause) -> Extract 'qualities' or stringify
                                    // @ts-ignore
                                    displayValue = item.value.qualities || JSON.stringify(item.value); 
                                } else {
                                    // Case 3: It's just Text/Number -> Show as is
                                    displayValue = String(item.value);
                                }
                            }

                            // Don't render empty rows if you prefer cleaner UI
                            if (!displayValue || displayValue === "{}") return null;

                            return (
                                <div key={item.label} className="flex justify-between items-start py-1">
                                    <span className="text-xs text-stone-500">{item.label}</span>
                                    <motion.span 
                                        key={displayValue}
                                        initial={{ opacity: 0, y: -5, color: "#eab308" }} 
                                        animate={{ opacity: 1, y: 0, color: displayValue !== "-" ? "#d6d3d1" : "#57534e" }}
                                        transition={{ duration: 0.5 }}
                                        className="text-xs font-medium text-stone-300 text-right max-w-[60%] truncate"
                                    >
                                        {displayValue}
                                    </motion.span>
                                </div>
                            );
                        })}
                    </div>

                    {/* SECTION B: PERSONAL STATS (Crash-Proof Version) */}
                    <div>
                        <h4 className="text-[10px] text-stone-600 uppercase font-bold tracking-widest mb-2 border-b border-stone-800 pb-1">Personal</h4>
                        {[
                            { label: "Age / Gender", value: `${liveProfileData.age || '-'} / ${liveProfileData.gender || '-'}` },
                            { label: "Height", value: liveProfileData.height },
                            { label: "Location", value: liveProfileData.location },
                            { label: "Education", value: liveProfileData.education },
                            { label: "Profession", value: liveProfileData.profession },
                            { label: "Diet / Drink", value: liveProfileData.diet }, // May be object - handle below
                        ].map((item) => {
                            // --- SAFE RENDER LOGIC (Same as above) ---
                            let displayValue = "-";

                            if (item.value) {
                                if (Array.isArray(item.value)) {
                                    displayValue = item.value.join(", ");
                                } else if (typeof item.value === 'object') {
                                    // @ts-ignore
                                    displayValue = item.value.diet || JSON.stringify(item.value);
                                } else {
                                    displayValue = String(item.value);
                                }
                            }

                            // Add drinking emoji if present
                            if (item.label === "Diet / Drink" && liveProfileData.drinking === 'Yes') {
                                displayValue = displayValue + ' 🍷';
                            }

                            if (!displayValue || displayValue === "{}") return null;

                            return (
                                <div key={item.label} className="flex justify-between items-start py-1">
                                    <span className="text-xs text-stone-500">{item.label}</span>
                                    <motion.span 
                                        key={displayValue}
                                        initial={{ opacity: 0, y: -5 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-xs font-medium text-stone-300 text-right max-w-[60%] truncate"
                                    >
                                        {displayValue}
                                    </motion.span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. PARTNER PREFERENCES (Highlighted Section - Crash-Proof) */}
                <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-xl p-4">
                     <h4 className="text-[10px] text-haldi-600 uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> Partner Preferences
                     </h4>
                     <motion.p 
                        key={typeof liveProfileData.partner_preferences === 'string' ? liveProfileData.partner_preferences : JSON.stringify(liveProfileData.partner_preferences)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-stone-400 leading-relaxed italic"
                     >
                        {(() => {
                            const pref = liveProfileData.partner_preferences;
                            if (!pref) return "Sutradhar is listening for your preferences...";
                            
                            // Safe rendering: Handle objects, arrays, and strings
                            if (typeof pref === 'string') return pref;
                            if (Array.isArray(pref)) return pref.join(", ");
                            if (typeof pref === 'object') {
                                // @ts-ignore - Extract qualities or stringify
                                return pref.qualities || JSON.stringify(pref);
                            }
                            return String(pref);
                        })()}
                     </motion.p>
                </div>

                {/* 4. ACTIONS */}
                <div className="space-y-2 pt-2">
                    <button onClick={saveProfile} className="w-full bg-haldi-600 hover:bg-haldi-500 text-stone-950 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-haldi-900/20 active:scale-95">
                        Complete & Save Profile <ArrowRight className="w-4 h-4"/>
                    </button>
                </div>
            </div>
        </div>

    </div>
  );
}