import React from 'react';
import { Brain, Heart, Activity, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AstroData {
  totalScore: number;    // out of 36
  nadiScore: number;     // Health/Genetics (Max 8)
  bhakootScore: number;  // Mental (Max 7)
  ganaScore: number;     // Temperament (Max 6)
  yoniScore: number;     // Intimacy (Max 4)
  destinyScore: number;  // Tara + Graha Maitri (Max 8)
  /** Manglik fields are optional — the footer only renders when BOTH are known,
      so we never assert a Mangal-dosha verdict from missing data. */
  isManglik?: boolean;
  partnerIsManglik?: boolean;
}

export default function AstroMatchCard({ data }: { data: AstroData }) {

  // --- LOGIC: VERDICT GENERATOR ---
  // Translates the number into plain English
  const getVerdict = (score: number) => {
    if (score >= 28) return { text: "Excellent Union", color: "text-emerald-400" };
    if (score >= 18) return { text: "Good Match", color: "text-haldi-400" };
    return { text: "Needs Review", color: "text-red-400" };
  };

  const verdict = getVerdict(data.totalScore);
  const percentage = Math.round((data.totalScore / 36) * 100);
  const manglikKnown = data.isManglik !== undefined && data.partnerIsManglik !== undefined;

  // Helper for Progress Bars
  const ProgressBar = ({ current, max, color = "bg-haldi-500" }: { current: number, max: number, color?: string }) => (
    <div className="h-1.5 w-full bg-stone-800 rounded-full mt-2 overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xl max-w-md">

      {/* --- HEADER: TOTAL SCORE --- */}
      <div className="flex items-center justify-between mb-8 border-b border-stone-800 pb-6">
        <div>
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">Vedic Compatibility</h3>
          <h2 className={`text-2xl font-serif font-bold ${verdict.color}`}>{verdict.text}</h2>
        </div>

        {/* Circular Score Visual */}
        <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="#44403c" strokeWidth="6" fill="transparent" />
                <circle
                    cx="40" cy="40" r="36"
                    stroke={data.totalScore >= 18 ? "#FBBF24" : "#EF4444"}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={2 * Math.PI * 36 * (1 - percentage / 100)}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-stone-50">{data.totalScore}</span>
                <span className="text-[10px] text-stone-500">/ 36</span>
            </div>
        </div>
      </div>

      {/* --- GRID: THE 4 PILLARS (Smart Grouping) --- */}
      <div className="grid grid-cols-2 gap-6 mb-8">

        {/* 1. Mental Compatibility (Bhakoot + Gana) */}
        <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800/60">
            <div className="flex items-center gap-2 mb-1">
                <Brain size={16} className="text-sky-400" />
                <span className="text-stone-300 text-sm font-medium">Mind & Temper</span>
            </div>
            <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Score</span>
                <span>{(data.bhakootScore + data.ganaScore)} / 13</span>
            </div>
            <ProgressBar current={data.bhakootScore + data.ganaScore} max={13} color="bg-sky-500" />
        </div>

        {/* 2. Health & Genetics (Nadi) - Critical */}
        <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800/60">
            <div className="flex items-center gap-2 mb-1">
                <Activity size={16} className="text-emerald-400" />
                <span className="text-stone-300 text-sm font-medium">Health (Nadi)</span>
            </div>
             <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Score</span>
                <span>{data.nadiScore} / 8</span>
            </div>
            <ProgressBar current={data.nadiScore} max={8} color="bg-emerald-500" />
        </div>

        {/* 3. Love & Intimacy (Yoni) */}
        <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800/60">
             <div className="flex items-center gap-2 mb-1">
                <Heart size={16} className="text-rose-400" />
                <span className="text-stone-300 text-sm font-medium">Love & Intimacy</span>
            </div>
             <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Score</span>
                <span>{data.yoniScore} / 4</span>
            </div>
            <ProgressBar current={data.yoniScore} max={4} color="bg-rose-500" />
        </div>

        {/* 4. Destiny & Luck (Tara + Graha Maitri) */}
        <div className="p-3 bg-stone-950/60 rounded-lg border border-stone-800/60">
             <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-haldi-400" />
                <span className="text-stone-300 text-sm font-medium">Destiny & Luck</span>
            </div>
             <div className="flex justify-between text-xs text-stone-500 mb-1">
                <span>Score</span>
                <span>{data.destinyScore} / 8</span>
            </div>
            <ProgressBar current={data.destinyScore} max={8} color="bg-haldi-500" />
        </div>

      </div>

      {/* --- FOOTER: MANGLIK DOSHA CHECK (only when both values are known) --- */}
      {manglikKnown && (
        <div className="bg-stone-800/40 rounded-lg p-4 flex items-center justify-between">
            <div>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">Mangal Dosha Status</p>
                <div className="flex items-center gap-2">
                    {data.isManglik === data.partnerIsManglik ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-stone-50 text-sm font-medium">Compatible</span>
                        </>
                    ) : (
                        <>
                          <AlertTriangle size={16} className="text-haldi-400" />
                          <span className="text-stone-50 text-sm font-medium">Review Required</span>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
