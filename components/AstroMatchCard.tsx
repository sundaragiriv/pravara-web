import React from 'react';
import { Brain, Heart, Activity, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AstroData {
  totalScore: number; // e.g., 28 (out of 36)
  nadiScore: number;  // Health/Genetics (Max 8)
  bhakootScore: number; // Mental (Max 7)
  ganaScore: number; // Temperament (Max 6)
  yoniScore: number; // Intimacy (Max 4)
  isManglik: boolean;
  partnerIsManglik: boolean;
}

export default function AstroMatchCard({ data }: { data: AstroData }) {
  
  // --- LOGIC: VERDICT GENERATOR ---
  // Translates the number into plain English
  const getVerdict = (score: number) => {
    if (score >= 28) return { text: "Excellent Union", color: "text-green-400" };
    if (score >= 18) return { text: "Good Match", color: "text-[#F5A623]" };
    return { text: "Not Recommended", color: "text-red-400" };
  };

  const verdict = getVerdict(data.totalScore);
  const percentage = Math.round((data.totalScore / 36) * 100);

  // Helper for Progress Bars
  const ProgressBar = ({ current, max, color = "bg-[#F5A623]" }: { current: number, max: number, color?: string }) => (
    <div className="h-1.5 w-full bg-gray-800 rounded-full mt-2 overflow-hidden">
      <div 
        className={`h-full rounded-full ${color}`} 
        style={{ width: `${(current / max) * 100}%` }} 
      />
    </div>
  );

  return (
    <div className="bg-[#1E1E1E] border border-gray-800 rounded-xl p-6 shadow-xl max-w-md">
      
      {/* --- HEADER: TOTAL SCORE --- */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
        <div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Vedic Compatibility</h3>
          <h2 className={`text-2xl font-serif font-bold ${verdict.color}`}>{verdict.text}</h2>
        </div>
        
        {/* Circular Score Visual */}
        <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="#333" strokeWidth="6" fill="transparent" />
                <circle 
                    cx="40" cy="40" r="36" 
                    stroke={data.totalScore >= 18 ? "#F5A623" : "#EF4444"} 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 36}
                    strokeDashoffset={2 * Math.PI * 36 * (1 - percentage / 100)}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-white">{data.totalScore}</span>
                <span className="text-[10px] text-gray-500">/ 36</span>
            </div>
        </div>
      </div>

      {/* --- GRID: THE 4 PILLARS (Smart Grouping) --- */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        
        {/* 1. Mental Compatibility (Bhakoot + Gana) */}
        <div className="p-3 bg-[#121212] rounded-lg border border-gray-800/50">
            <div className="flex items-center gap-2 mb-1">
                <Brain size={16} className="text-blue-400" />
                <span className="text-gray-300 text-sm font-medium">Mind & Temper</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Score</span>
                <span>{(data.bhakootScore + data.ganaScore)} / 13</span>
            </div>
            <ProgressBar current={data.bhakootScore + data.ganaScore} max={13} color="bg-blue-500" />
        </div>

        {/* 2. Health & Genetics (Nadi) - Critical */}
        <div className="p-3 bg-[#121212] rounded-lg border border-gray-800/50">
            <div className="flex items-center gap-2 mb-1">
                <Activity size={16} className="text-green-400" />
                <span className="text-gray-300 text-sm font-medium">Health (Nadi)</span>
            </div>
             <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Score</span>
                <span>{data.nadiScore} / 8</span>
            </div>
            <ProgressBar current={data.nadiScore} max={8} color="bg-green-500" />
        </div>

        {/* 3. Love & Intimacy (Yoni) */}
        <div className="p-3 bg-[#121212] rounded-lg border border-gray-800/50">
             <div className="flex items-center gap-2 mb-1">
                <Heart size={16} className="text-pink-500" />
                <span className="text-gray-300 text-sm font-medium">Love & Intimacy</span>
            </div>
             <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Score</span>
                <span>{data.yoniScore} / 4</span>
            </div>
            <ProgressBar current={data.yoniScore} max={4} color="bg-pink-500" />
        </div>

        {/* 4. Destiny & Luck (Tara/Maitri) */}
        <div className="p-3 bg-[#121212] rounded-lg border border-gray-800/50">
             <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-[#F5A623]" />
                <span className="text-gray-300 text-sm font-medium">Destiny & Luck</span>
            </div>
             <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Score</span>
                <span>Good</span>
            </div>
            <ProgressBar current={3} max={4} color="bg-[#F5A623]" />
        </div>

      </div>

      {/* --- FOOTER: MANGLIK DOSHA CHECK --- */}
      <div className="bg-[#2A2A2A] rounded-lg p-4 flex items-center justify-between">
          <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Mangal Dosha Status</p>
              <div className="flex items-center gap-2">
                  {data.isManglik === data.partnerIsManglik ? (
                      <>
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-white text-sm font-medium">Compatible</span>
                      </>
                  ) : (
                      <>
                        <AlertTriangle size={16} className="text-[#F5A623]" />
                        <span className="text-white text-sm font-medium">Review Required</span>
                      </>
                  )}
              </div>
          </div>
          <button className="text-[10px] text-gray-400 underline hover:text-[#F5A623]">View Full Report</button>
      </div>

    </div>
  );
}
