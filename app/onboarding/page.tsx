"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Loader2, ArrowUp, X, CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import AvatarUpload from "@/components/AvatarUpload";
import NaradaAvatar from "@/components/NaradaAvatar";
import {
  LANGUAGES, COMMUNITIES, GOTHRAS,
  getCommunitiesForLanguage, getSubCommunitiesForCommunity,
} from "@/utils/community-data";
import type { Community, SubCommunity } from "@/utils/community-data";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type MsgRole = "assistant" | "user" | "checkpoint";

interface ChatMsg {
  role: MsgRole;
  content: string;
  chips?: string[];
  canSkip?: boolean;
}

interface PD {
  full_name: string;
  age: string;
  gender: string;
  height: string;
  location: string;
  profession: string;
  education: string;
  diet: string;
  bio: string;
  image_url: string;
  gothra: string;
  gothra_id: string;
  nakshatra: string;
  nakshatra_id: string;
  raasi: string;
  sub_community: string;
  sub_community_id: string;
  language_id: string;
  community_id: string;
  marital_status: string;
  partner_preferences: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE DATA
// ─────────────────────────────────────────────────────────────────────────────

const NAKSHATRA_LIST = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha',
  'Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const DIET_OPTIONS      = ['Vegetarian','Eggetarian','Non-Vegetarian','Vegan'];
const EDUCATION_OPTIONS = ["Bachelor's","Master's / MBA","PhD","CA / CFA / CPA","MBBS / MD","Diploma","Other"];
const MARITAL_OPTIONS   = ['Never Married','Divorced','Widowed','Awaiting Divorce'];
const AGE_OPTIONS       = ['22','24','26','28','30','32','34','36','38','40','42','44'];

// ─────────────────────────────────────────────────────────────────────────────
// STEP FLOW
// ─────────────────────────────────────────────────────────────────────────────

type StepType = 'structured' | 'freetext' | 'checkpoint';

interface Step {
  id: string;
  type: StepType;
  question: (pd: PD) => string;
  chips?: (pd: PD) => string[];
  canSkip?: boolean;
  field?: keyof PD;
  onSelect?: (val: string, pd: PD) => Partial<PD>;
  shouldSkip?: (pd: PD) => boolean;
}

const STEPS: Step[] = [
  {
    id: 'name', type: 'freetext',
    question: () => "Namaste! I am Narada — your divine matchmaker.\n\nI'll guide you to your most compatible match using Vedic wisdom. Just answer a few questions — skip anything you're not sure about.\n\nMay I know your full name to begin?",
    field: 'full_name',
  },
  {
    id: 'language', type: 'structured',
    question: pd => `Wonderful, ${pd.full_name.split(' ')[0]}. What language does your family speak at home?`,
    chips: () => LANGUAGES.filter(l => l.id !== 6).map(l => l.name),
    onSelect: (val) => {
      const lang = LANGUAGES.find(l => l.name === val);
      return { language_id: String(lang?.id ?? '') };
    },
  },
  {
    id: 'community', type: 'structured',
    question: () => 'Which Brahmin community are you from?',
    chips: pd => {
      const langId = Number(pd.language_id);
      return (langId ? getCommunitiesForLanguage(langId) : COMMUNITIES).map((c: Community) => c.name);
    },
    canSkip: true,
    onSelect: (val, pd) => {
      const langId = Number(pd.language_id);
      const list = langId ? getCommunitiesForLanguage(langId) : COMMUNITIES;
      const comm = list.find((c: Community) => c.name === val);
      return { community_id: String(comm?.id ?? ''), sub_community: val };
    },
  },
  {
    id: 'subcommunity', type: 'structured',
    question: () => 'Sub-community? (Optional)',
    chips: pd => {
      const commId = Number(pd.community_id);
      return commId ? getSubCommunitiesForCommunity(commId).map((s: SubCommunity) => s.name) : [];
    },
    canSkip: true,
    shouldSkip: pd => {
      const commId = Number(pd.community_id);
      return !commId || getSubCommunitiesForCommunity(commId).length === 0;
    },
    onSelect: (val, pd) => {
      const commId = Number(pd.community_id);
      const list   = commId ? getSubCommunitiesForCommunity(commId) : [];
      const sub    = list.find((s: SubCommunity) => s.name === val);
      return { sub_community_id: String(sub?.id ?? ''), sub_community: val };
    },
  },
  {
    id: 'checkpoint1', type: 'checkpoint',
    question: pd => {
      const c = pd.sub_community ||
        COMMUNITIES.find(c => String(c.id) === pd.community_id)?.name ||
        'your community';
      return `✦ I've found profiles in the ${c} community. Let me refine further with two more key Vedic details.`;
    },
  },
  {
    id: 'nakshatra', type: 'structured',
    question: () => 'What is your Nakshatra (birth star)?\nThis drives 6 of the 8 Vedic compatibility factors.',
    chips: () => NAKSHATRA_LIST,
    canSkip: true,
    onSelect: (val) => {
      const idx = NAKSHATRA_LIST.indexOf(val);
      return { nakshatra: val, nakshatra_id: String(idx + 1) };
    },
  },
  {
    id: 'gothra', type: 'structured',
    question: () => 'Your Gothra? (Vedic lineage — used for the Sagothra check)',
    chips: () => GOTHRAS.map(g => g.name),
    canSkip: true,
    onSelect: (val) => {
      const g = GOTHRAS.find(gt => gt.name === val);
      return { gothra: val, gothra_id: String(g?.id ?? '') };
    },
  },
  {
    id: 'checkpoint2', type: 'checkpoint',
    question: pd => {
      const extra = pd.nakshatra
        ? `Nakshatra check activated — Gothra conflicts and Nadi Dosha candidates filtered from your list.`
        : `Community alignment confirmed. Your match pool is taking shape.`;
      return `✦ ${extra}\n\nA few lifestyle details to sharpen your compatibility score.`;
    },
  },
  {
    id: 'diet', type: 'structured',
    question: () => 'Diet preference?',
    chips: () => DIET_OPTIONS,
    canSkip: true,
    onSelect: (val) => ({ diet: val }),
  },
  {
    id: 'marital', type: 'structured',
    question: () => 'Marital status?',
    chips: () => MARITAL_OPTIONS,
    canSkip: true,
    onSelect: (val) => ({ marital_status: val }),
  },
  {
    id: 'education', type: 'structured',
    question: () => 'Highest qualification?',
    chips: () => EDUCATION_OPTIONS,
    canSkip: true,
    onSelect: (val) => ({ education: val }),
  },
  {
    id: 'age', type: 'structured',
    question: () => 'Your age?',
    chips: () => AGE_OPTIONS,
    canSkip: true,
    onSelect: (val) => ({ age: val }),
  },
  {
    id: 'checkpoint3', type: 'checkpoint',
    question: pd => {
      const name = pd.full_name.split(' ')[0];
      return `✦ Excellent, ${name}! Your profile is ready.\n\nYou can add profession, bio, and partner preferences from your profile settings. Your matches await — let's go!`;
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY: PD = {
  full_name:'', age:'', gender:'', height:'', location:'',
  profession:'', education:'', diet:'', bio:'', image_url:'',
  gothra:'', gothra_id:'', nakshatra:'', nakshatra_id:'', raasi:'',
  sub_community:'', sub_community_id:'', language_id:'',
  community_id:'', marital_status:'', partner_preferences:'',
};

const TRACKED_KEYS: (keyof PD)[] = [
  'full_name','nakshatra','gothra','sub_community','diet','education','age'
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const [pd,  setPd]     = useState<PD>(EMPTY);
  const [msgs, setMsgs]  = useState<ChatMsg[]>([]);
  const [step, setStep]  = useState(0);
  const [input, setInput]= useState('');
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [hasInit, setHasInit] = useState(false);
  const [search,  setSearch]  = useState('');
  const [userId,  setUserId]  = useState<string | null>(null);

  const endRef   = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // current step object
  const cur = STEPS[step] ?? STEPS[STEPS.length - 1];

  const addMsg = useCallback((m: ChatMsg) => setMsgs(p => [...p, m]), []);
  const update = useCallback((patch: Partial<PD>) => setPd(p => ({ ...p, ...patch })), []);

  // Advance to next un-skipped step
  const advance = useCallback((current: PD, fromStep: number) => {
    let next = fromStep + 1;
    while (next < STEPS.length && STEPS[next].shouldSkip?.(current)) next++;
    if (next >= STEPS.length) {
      // All done — save
      setStep(next);
      saveProfile(current);
      return;
    }
    setStep(next);
    const s = STEPS[next];
    const m: ChatMsg = {
      role: s.type === 'checkpoint' ? 'checkpoint' : 'assistant',
      content: s.question(current),
      chips: s.type === 'structured' ? s.chips?.(current) : undefined,
      canSkip: s.canSkip,
    };
    setMsgs(p => [...p, m]);
    if (s.type === 'checkpoint') {
      setTimeout(() => advance(current, next), 1600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      let initial = EMPTY;
      if (profile) {
        const patch: Partial<PD> = {};
        (Object.keys(EMPTY) as (keyof PD)[]).forEach(k => {
          if (profile[k]) patch[k] = String(profile[k]);
        });
        initial = { ...EMPTY, ...patch };
        setPd(initial);
      }

      const hasName = initial.full_name && initial.full_name !== 'Traveler';
      const startIdx = hasName ? 1 : 0;
      setStep(startIdx);
      const s = STEPS[startIdx];
      addMsg({
        role: 'assistant',
        content: s.question(initial),
        chips: s.type === 'structured' ? s.chips?.(initial) : undefined,
        canSkip: s.canSkip,
      });
      setHasInit(true);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  useEffect(() => { if (!loading) setTimeout(() => inputRef.current?.focus(), 50); }, [loading, step]);

  // ── Chip select ───────────────────────────────────────────────────────────
  const handleChip = (val: string) => {
    addMsg({ role: 'user', content: val });
    const patch = cur.onSelect ? cur.onSelect(val, pd) : {};
    if (cur.field && !(patch as any)[cur.field]) (patch as any)[cur.field] = val;
    const next = { ...pd, ...patch };
    update(patch);
    setSearch('');
    advance(next, step);
  };

  const handleSkip = () => {
    addMsg({ role: 'user', content: 'Skip' });
    advance(pd, step);
  };

  // ── Text send ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    addMsg({ role: 'user', content: text });
    setInput('');

    if (cur.type === 'freetext') {
      const patch: Partial<PD> = {};
      if (cur.field) (patch as any)[cur.field] = text;
      const next = { ...pd, ...patch };
      update(patch);
      advance(next, step);
      return;
    }

    // AI fallback for unstructured
    setLoading(true);
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 14000);
    try {
      const res  = await fetch('/api/biographer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...msgs, { role: 'user', content: text }], currentProfile: { ...pd, id: userId } }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      const data = await res.json();
      if (data.reply) {
        addMsg({ role: 'assistant', content: data.reply });
        if (data.updatedProfile) update(data.updatedProfile);
      }
    } catch (e: any) {
      clearTimeout(tid);
      addMsg({ role: 'assistant', content: e?.name === 'AbortError'
        ? 'Narada is consulting the stars — please send again.'
        : 'I briefly lost connection. Please repeat that.' });
    } finally { setLoading(false); }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const saveProfile = async (data?: PD) => {
    const d = data ?? pd;
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    try {
      const payload: Record<string, any> = { id: userId, updated_at: new Date().toISOString() };
      (Object.keys(d) as (keyof PD)[]).forEach(k => { if (d[k]) payload[k] = d[k]; });
      ['language_id','community_id','sub_community_id','nakshatra_id','gothra_id'].forEach(k => {
        if (payload[k]) payload[k] = Number(payload[k]) || null;
      });
      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      toast.success('Profile saved! Your matches are ready.');
      router.push('/dashboard');
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`);
    } finally { setSaving(false); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const completePct = Math.round(TRACKED_KEYS.filter(k => !!pd[k]).length / TRACKED_KEYS.length * 100);
  const rawChips    = cur.type === 'structured' ? (cur.chips?.(pd) ?? []) : [];
  const filtered    = search.length >= 1 ? rawChips.filter(c => c.toLowerCase().includes(search.toLowerCase())) : rawChips;
  const showSearch  = rawChips.length > 9;

  // ─────────────────────────────────────────────────────────────────────────
  if (!hasInit) return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-haldi-500 animate-spin" />
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-full bg-stone-950 overflow-hidden font-sans text-stone-200">

      {/* ── CHAT COLUMN ─────────────────────────────────────────────────── */}
      <div className="w-full md:w-3/4 flex flex-col h-full border-r border-stone-800">

        {/* Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800 bg-stone-950/95 backdrop-blur shrink-0">
          <Link href="/" aria-label="Pravara">
            <Image src="/logo3.png" alt="Pravara" width={96} height={32}
              className="object-contain [mix-blend-mode:lighten] hover:brightness-110 transition-all" priority />
          </Link>
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
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-haldi-500 transition-colors">
            <span className="hidden sm:inline">EXIT</span>
            <div className="w-7 h-7 rounded-full border border-stone-800 flex items-center justify-center bg-stone-900 hover:border-stone-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-4 max-w-2xl mx-auto">
            {msgs.map((msg, i) => (
              <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-2.5 mt-1"><NaradaAvatar size="sm" /></div>
                )}
                {msg.role === 'checkpoint' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="mx-auto max-w-sm px-5 py-3 rounded-2xl bg-gold/[0.08] border border-gold/25 text-center">
                    <p className="text-sm text-haldi-300 leading-relaxed font-serif italic whitespace-pre-wrap">{msg.content}</p>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-stone-800 text-stone-100 rounded-tr-sm'
                        : 'bg-haldi-900/10 border border-haldi-500/15 text-stone-200 rounded-tl-sm'
                    }`}>
                    {msg.content}
                  </motion.div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start w-full">
                <div className="flex-shrink-0 mr-2.5 mt-1"><NaradaAvatar size="sm" /></div>
                <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-sm p-4 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={endRef} className="h-2" />
          </div>
        </div>

        {/* Input / Chip area */}
        <div className="shrink-0 border-t border-stone-800 bg-stone-950">

          {/* Chips for structured steps */}
          {cur.type === 'structured' && !loading && (
            <div className="px-4 pt-3 pb-2">
              {showSearch && (
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={`Search ${cur.id === 'nakshatra' ? 'Nakshatra' : cur.id === 'gothra' ? 'Gothra' : 'option'}…`}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-4 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-haldi-500 transition-colors"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {filtered.slice(0, 40).map(chip => (
                  <button key={chip} type="button" onClick={() => handleChip(chip)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-stone-700 bg-stone-900 text-stone-300
                               hover:border-haldi-500/60 hover:text-haldi-300 hover:bg-stone-800 transition-colors">
                    {chip}
                  </button>
                ))}
                {cur.canSkip && (
                  <button type="button" onClick={handleSkip}
                    className="px-3 py-1.5 text-xs rounded-lg border border-stone-800 text-stone-600 hover:text-stone-400 hover:border-stone-600 transition-colors">
                    Skip →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Text input */}
          {cur.type === 'freetext' && !loading && (
            <div className="p-4">
              <div className="relative flex items-center max-w-2xl mx-auto w-full">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
                  placeholder="Type your answer…"
                  disabled={loading}
                  autoFocus
                  className="w-full bg-stone-900/50 border border-stone-800 text-stone-200 text-sm rounded-xl py-3.5 pl-5 pr-20
                             focus:border-haldi-500 focus:ring-1 focus:ring-haldi-500/20 focus:bg-stone-900 outline-none transition-all
                             placeholder:text-stone-600"
                />
                <div className="absolute right-2 flex gap-1 items-center">
                  {cur.canSkip && (
                    <button type="button" onClick={handleSkip}
                      className="px-2 py-1.5 text-xs text-stone-600 hover:text-stone-400 transition-colors">
                      Skip
                    </button>
                  )}
                  <button type="button" onClick={handleSend} disabled={!input.trim()}
                    aria-label="Send message"
                    className="p-2 bg-haldi-600 hover:bg-haldi-500 text-stone-950 rounded-lg transition-all disabled:opacity-0 shadow-lg active:scale-95">
                    <ArrowUp className="w-4 h-4 stroke-[3px]" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: LIVE PROFILE ────────────────────────────────────── */}
      <div className="hidden md:flex md:w-1/4 flex-col h-full bg-stone-950/50 border-l border-stone-800 overflow-hidden">
        <div className="h-16 px-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <h3 className="text-xs font-bold text-haldi-500 uppercase tracking-widest">Live Profile</h3>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 bg-stone-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-haldi-500 rounded-full"
                animate={{ width: `${completePct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
            </div>
            <span className="text-[10px] text-stone-500 font-bold tabular-nums">{completePct}%</span>
          </div>
        </div>

        <div className="px-5 py-4 flex items-center gap-4 border-b border-stone-800 shrink-0">
          <AvatarUpload
            currentUrl={pd.image_url}
            onUploadComplete={url => update({ image_url: url })}
            size={64}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-serif font-semibold text-stone-100 truncate">
              {pd.full_name || <span className="text-stone-600 italic font-sans font-normal text-xs">Your Name</span>}
            </p>
            <p className="text-xs text-haldi-500 truncate mt-0.5">
              {pd.profession || <span className="text-stone-700">Profession</span>}
            </p>
            {pd.age && <p className="text-[10px] text-stone-600 mt-0.5">{pd.age} yrs</p>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div>
            <h4 className="text-[10px] text-haldi-500 uppercase font-bold tracking-widest mb-2 pb-1 border-b border-stone-800">Vedic Roots</h4>
            {([
              { label: 'Language',  value: LANGUAGES.find(l => String(l.id) === pd.language_id)?.name },
              { label: 'Community', value: pd.sub_community },
              { label: 'Gothra',    value: pd.gothra },
              { label: 'Nakshatra', value: pd.nakshatra },
            ] as { label: string; value?: string }[]).filter(r => r.value).map(row => (
              <div key={row.label} className="flex justify-between items-center py-1">
                <span className="text-[10px] text-stone-500">{row.label}</span>
                <motion.span key={row.value}
                  initial={{ opacity: 0, y: -4, color: '#eab308' }} animate={{ opacity: 1, y: 0, color: '#d6d3d1' }} transition={{ duration: 0.4 }}
                  className="text-[10px] font-medium text-stone-300 text-right max-w-[55%] truncate">
                  {row.value}
                </motion.span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-[10px] text-stone-600 uppercase font-bold tracking-widest mb-2 pb-1 border-b border-stone-800">Personal</h4>
            {([
              { label: 'Age',       value: pd.age ? `${pd.age} yrs` : '' },
              { label: 'Education', value: pd.education },
              { label: 'Diet',      value: pd.diet },
              { label: 'Marital',   value: pd.marital_status },
            ] as { label: string; value?: string }[]).filter(r => r.value).map(row => (
              <div key={row.label} className="flex justify-between items-center py-1">
                <span className="text-[10px] text-stone-500">{row.label}</span>
                <span className="text-[10px] font-medium text-stone-300 text-right max-w-[55%] truncate">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-stone-800 shrink-0">
          {completePct >= 60 && (
            <div className="flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Ready to publish</span>
            </div>
          )}
          <button type="button" onClick={() => saveProfile()} disabled={saving}
            className="w-full bg-haldi-600 hover:bg-haldi-500 text-stone-950 py-3 rounded-xl font-bold text-sm
                       flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-70">
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><ArrowRight className="w-4 h-4" /> Save &amp; View Matches</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
