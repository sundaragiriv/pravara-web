"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowRight, Loader2, Video, ArrowUp, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import AvatarUpload from "@/components/AvatarUpload";
import NaradaAvatar from "@/components/NaradaAvatar";

// ── Priority fields used to build a contextual greeting ──────────────────────
const PRIORITY_FIELDS: { key: string; label: string }[] = [
  { key: "full_name",          label: "your name" },
  { key: "gothra",             label: "your Gothra" },
  { key: "nakshatra",          label: "your Nakshatra" },
  { key: "sub_community",      label: "your sub-community" },
  { key: "profession",         label: "your profession" },
  { key: "location",           label: "your location" },
  { key: "bio",                label: "your bio" },
  { key: "partner_preferences",label: "your partner preferences" },
];

function buildGreeting(name: string, profile: Record<string, any>): string {
  const missing = PRIORITY_FIELDS.find(({ key }) => {
    const v = profile[key];
    return !v || v === "" || v === "..." || v === "Traveler";
  });

  if (!missing) {
    return `Namaste, ${name}. Your profile is looking complete — what would you like to refine today?`;
  }
  if (missing.key === "full_name") {
    return "Namaste! I am Narada, your divine guide. May I know your full name to begin?";
  }
  return `Namaste, ${name}. Welcome back. Your profile is missing ${missing.label} — shall we complete it now?`;
}

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const [messages, setMessages] = useState<{ role: "assistant" | "user"; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [liveProfileData, setLiveProfileData] = useState<Record<string, string>>({
    full_name: "", age: "", gender: "", height: "", weight: "",
    location: "", profession: "", education: "", diet: "",
    smoking: "", drinking: "", religion: "", gothra: "", pravara: "",
    spiritual_org: "", religious_level: "", sub_community: "",
    nakshatra: "", raasi: "", birth_time: "", bio: "",
    partner_preferences: "", video_bio_url: "", audio_bio_url: "", image_url: ""
  });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

        if (profile) {
          setExistingProfile(profile);
          setLiveProfileData(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => { if (profile[k]) next[k] = String(profile[k]); });
            return next;
          });

          const name = profile.full_name && profile.full_name !== "Traveler" ? profile.full_name : "";
          const greeting = name
            ? buildGreeting(name, profile)
            : "Namaste! I am Narada, your divine guide. Let us begin your journey. May I know your full name?";

          setMessages([{ role: "assistant", content: greeting }]);
        } else {
          setMessages([{ role: "assistant", content: "Namaste! I am Narada, your divine guide. Let us begin your journey. May I know your full name?" }]);
        }
        setHasInitialized(true);
      } else {
        router.push("/login");
      }
    };
    init();
  }, [router]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input after AI responds
  useEffect(() => {
    if (!loading) setTimeout(() => inputRef.current?.focus(), 10);
  }, [loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // 14-second timeout guard against Vercel edge function limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    try {
      const res = await fetch("/api/biographer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentProfile: { ...liveProfileData, id: existingProfile?.id },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        if (data.updatedProfile) setLiveProfileData(data.updatedProfile);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === "AbortError";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: isTimeout
          ? "Narada is consulting the stars — this took longer than expected. Please send your message again."
          : "I briefly lost connection to the divine cloud. Could you please repeat that?",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async () => {
    const videoLink = prompt("Paste your Video Bio URL (YouTube / Drive):");
    if (videoLink) {
      setLiveProfileData(prev => ({ ...prev, video_bio_url: videoLink }));
      toast.success("Video link added! Click Save to confirm.");
    }
  };

  const saveProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please log in to save your profile."); return; }

    try {
      const { error } = await supabase.from("profiles").upsert(
        { id: user.id, ...liveProfileData, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
      if (error) {
        toast.error(`Save failed: ${error.message}`);
      } else {
        toast.success("Profile saved!");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  // Profile completeness for the right panel badge
  const filledCount = Object.values(liveProfileData).filter(v => v && v !== "...").length;
  const totalFields = Object.keys(liveProfileData).length;
  const completePct = Math.round((filledCount / totalFields) * 100);

  const showEmptyState = messages.length <= 1 && !loading;

  if (!hasInitialized) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full bg-stone-950 overflow-hidden font-sans text-stone-200">

      {/* ── LEFT COLUMN: CHAT (75%) ───────────────────────────────────────── */}
      <div className="w-full md:w-3/4 flex flex-col h-full border-r border-stone-800">

        {/* ── SINGLE HEADER BAR — logo left / title center / exit right ── */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800 bg-stone-950/95 backdrop-blur shrink-0">

          {/* Logo */}
          <Link href="/" aria-label="Pravara — Home" className="flex-shrink-0">
            <Image
              src="/logo3.png"
              alt="Pravara"
              width={96}
              height={32}
              className="object-contain [mix-blend-mode:lighten] hover:brightness-110 transition-all duration-300"
              priority
            />
          </Link>

          {/* AI identity — center */}
          <div className="flex items-center gap-3">
            <NaradaAvatar size="sm" />
            <div>
              <h1 className="text-stone-100 font-serif font-semibold text-sm leading-tight">Narada</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Divine Guide · Online</span>
              </div>
            </div>
          </div>

          {/* Exit */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-haldi-500 transition-colors"
          >
            <span className="hidden sm:inline">EXIT</span>
            <div className="w-7 h-7 rounded-full border border-stone-800 flex items-center justify-center bg-stone-900 hover:border-stone-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* ── MESSAGES ─────────────────────────────────────────────────── */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Empty state — Narada hero presence */}
          <AnimatePresence>
            {showEmptyState && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center pt-16 pb-8 gap-6"
              >
                <NaradaAvatar size="lg" />
                <div className="text-center space-y-2 max-w-xs">
                  <h2 className="text-xl font-serif text-stone-200 font-semibold">Narada</h2>
                  <p className="text-stone-500 text-xs leading-relaxed">
                    The divine sage who carries messages between worlds and unites souls across lifetimes.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-5">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 mr-2.5 mt-1">
                    <NaradaAvatar size="sm" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-stone-800 text-stone-100 rounded-tr-sm"
                      : "bg-haldi-900/10 border border-haldi-500/15 text-stone-200 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start w-full">
                <div className="flex-shrink-0 mr-2.5 mt-1">
                  <NaradaAvatar size="sm" />
                </div>
                <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-sm p-4 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* ── INPUT BAR ────────────────────────────────────────────────── */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 shrink-0">
          <div className="relative flex items-center max-w-2xl mx-auto w-full">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && handleSend()}
              placeholder="Type your answer..."
              disabled={loading}
              autoFocus
              className="w-full bg-stone-900/50 border border-stone-800 text-stone-200 text-sm rounded-xl py-3.5 pl-5 pr-14 focus:border-haldi-500 focus:ring-1 focus:ring-haldi-500/20 focus:bg-stone-900 outline-none transition-all placeholder:text-stone-600"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-haldi-600 hover:bg-haldi-500 text-stone-950 rounded-lg transition-all disabled:opacity-0 shadow-lg shadow-haldi-900/20 active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4 stroke-[3px]" />}
            </button>
          </div>
          <p className="text-center mt-2 text-[10px] text-stone-600 uppercase tracking-widest font-medium hidden md:block">
            Press Enter to send
          </p>
          {/* Mobile-only action row */}
          <div className="flex gap-2 mt-3 md:hidden">
            <button type="button" onClick={handleVideoUpload} className="flex-1 bg-stone-800 py-2.5 rounded-xl flex justify-center gap-2 text-sm">
              <Video className="w-4 h-4" /> Video
            </button>
            <button type="button" onClick={saveProfile} className="flex-1 bg-stone-100 text-stone-950 py-2.5 rounded-xl font-bold text-sm">
              Save
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: LIVE PROFILE PREVIEW (25%) ─────────────────────── */}
      <div className="hidden md:flex md:w-1/4 flex-col h-full bg-stone-950/50 backdrop-blur-sm border-l border-stone-800 overflow-hidden">

        {/* Right panel header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <h3 className="text-xs font-bold text-haldi-500 uppercase tracking-widest">Live Profile</h3>
          {/* Completion badge */}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-haldi-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completePct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-[10px] text-stone-500 font-bold tabular-nums">{completePct}%</span>
          </div>
        </div>

        {/* Compact photo + identity row */}
        <div className="px-5 py-4 flex items-center gap-4 border-b border-stone-800 shrink-0">
          <div className="flex-shrink-0">
            <AvatarUpload
              currentUrl={liveProfileData.image_url}
              onUploadComplete={url => setLiveProfileData(prev => ({ ...prev, image_url: url }))}
              size={64}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-serif font-semibold text-stone-100 truncate">
              {liveProfileData.full_name || <span className="text-stone-600 italic font-sans font-normal text-xs">Your Name</span>}
            </p>
            <p className="text-xs text-haldi-500 truncate mt-0.5">
              {liveProfileData.profession || <span className="text-stone-700">Profession</span>}
            </p>
            {liveProfileData.location && (
              <p className="text-[10px] text-stone-600 truncate mt-0.5">{liveProfileData.location}</p>
            )}
          </div>
        </div>

        {/* Scrollable data grids */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Vedic Roots */}
          <div>
            <h4 className="text-[10px] text-haldi-500 uppercase font-bold tracking-widest mb-2 pb-1 border-b border-stone-800">Vedic Roots</h4>
            {[
              { label: "Community", value: liveProfileData.sub_community },
              { label: "Gothra",    value: liveProfileData.gothra },
              { label: "Nakshatra", value: liveProfileData.nakshatra },
              { label: "Raasi",     value: liveProfileData.raasi },
              { label: "Pravara",   value: liveProfileData.pravara },
              { label: "Faith",     value: liveProfileData.religious_level },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className="flex justify-between items-center py-1">
                <span className="text-[10px] text-stone-500">{row.label}</span>
                <motion.span
                  key={row.value}
                  initial={{ opacity: 0, y: -4, color: "#eab308" }}
                  animate={{ opacity: 1, y: 0, color: "#d6d3d1" }}
                  transition={{ duration: 0.4 }}
                  className="text-[10px] font-medium text-stone-300 text-right max-w-[55%] truncate"
                >
                  {row.value}
                </motion.span>
              </div>
            ))}
          </div>

          {/* Personal */}
          <div>
            <h4 className="text-[10px] text-stone-600 uppercase font-bold tracking-widest mb-2 pb-1 border-b border-stone-800">Personal</h4>
            {[
              { label: "Age / Gender", value: `${liveProfileData.age || "—"} / ${liveProfileData.gender || "—"}` },
              { label: "Height",       value: liveProfileData.height },
              { label: "Education",    value: liveProfileData.education },
              { label: "Diet",         value: liveProfileData.diet },
            ].filter(r => r.value && r.value !== "— / —").map(row => (
              <div key={row.label} className="flex justify-between items-center py-1">
                <span className="text-[10px] text-stone-500">{row.label}</span>
                <motion.span
                  key={row.value}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-[10px] font-medium text-stone-300 text-right max-w-[55%] truncate"
                >
                  {row.value}
                </motion.span>
              </div>
            ))}
          </div>

          {/* Partner Prefs */}
          {liveProfileData.partner_preferences && (
            <div className="bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-xl p-3">
              <h4 className="text-[10px] text-haldi-600 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5" /> Partner Preferences
              </h4>
              <motion.p
                key={liveProfileData.partner_preferences}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-stone-400 leading-relaxed italic"
              >
                {liveProfileData.partner_preferences}
              </motion.p>
            </div>
          )}
        </div>

        {/* Save button — pinned to bottom */}
        <div className="px-5 py-4 border-t border-stone-800 shrink-0">
          {completePct >= 60 && (
            <div className="flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Ready to publish</span>
            </div>
          )}
          <button
            type="button"
            onClick={saveProfile}
            className="w-full bg-haldi-600 hover:bg-haldi-500 text-stone-950 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-haldi-900/20 active:scale-95"
          >
            Complete & Save Profile <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
