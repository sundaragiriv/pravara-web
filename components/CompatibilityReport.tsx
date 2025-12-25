"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, MessageCircle, X, ScrollText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReportProps {
  isOpen: boolean;
  onClose: () => void;
  matchName: string;
  matchId: string; // In a real app, we'd use this to fetch specific data
}

export default function CompatibilityReport({ isOpen, onClose, matchName }: ReportProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  // MOCK: In a real scenario, this would call your /api/assistant endpoint
  const generateReport = async () => {
    setLoading(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      setReport({
        alignment: "Both of you value 'Tradition' highly according to your bios. Your shared Vegetarian diet and Gothra compatibility suggests a seamless household integration.",
        friction: "You are based in different cities (Mumbai vs Bangalore). This will require a conversation about relocation early on.",
        icebreaker: `"I noticed we both value family traditions. How was your experience celebrating the last Diwali away from home?"`
      });
      setLoading(false);
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[60]"
          />

          {/* Sliding Sheet */}
          <motion.div
            initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:w-[500px] h-[85vh] bg-stone-900 border-t md:border-l border-stone-800 rounded-t-3xl md:rounded-tl-3xl shadow-2xl z-[70] flex flex-col"
          >
            
            {/* Header */}
            <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900 rounded-t-3xl">
              <div>
                <div className="text-haldi-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Sutradhar Insight
                </div>
                <h2 className="text-2xl font-serif text-stone-100 mt-1">Compatibility Report</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full text-stone-400"><X className="w-6 h-6" /></button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              
              {!report && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center">
                        <ScrollText className="w-10 h-10 text-stone-500" />
                    </div>
                    <div>
                        <h3 className="text-stone-200 font-serif text-xl">Analyze {matchName}?</h3>
                        <p className="text-stone-500 text-sm max-w-xs mx-auto mt-2">
                            Ask Sutradhar to read the stars and profiles to generate a detailed compatibility breakdown.
                        </p>
                    </div>
                    <button 
                        onClick={generateReport}
                        className="px-8 py-3 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-xl shadow-lg shadow-haldi-900/20 transition-all hover:scale-105"
                    >
                        Generate Report
                    </button>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-haldi-500 animate-spin" />
                    <p className="text-stone-400 animate-pulse">Consulting the archives...</p>
                </div>
              )}

              {report && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Section 1: Strengths */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-500 font-bold text-sm uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" /> The Alignment
                        </div>
                        <p className="text-stone-300 leading-relaxed text-lg font-serif border-l-2 border-green-500/30 pl-4">
                            "{report.alignment}"
                        </p>
                    </div>

                    {/* Section 2: Challenges */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4" /> Potential Friction
                        </div>
                        <p className="text-stone-300 leading-relaxed text-lg font-serif border-l-2 border-orange-500/30 pl-4">
                            "{report.friction}"
                        </p>
                    </div>

                    {/* Section 3: Icebreaker */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-haldi-900/20 to-stone-900 border border-haldi-500/20">
                        <div className="flex items-center gap-2 text-haldi-500 font-bold text-sm uppercase tracking-wider mb-3">
                            <MessageCircle className="w-4 h-4" /> Narada's Suggestion
                        </div>
                        <p className="text-stone-100 italic text-lg text-center">
                            {report.icebreaker}
                        </p>
                        <button className="w-full mt-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold uppercase rounded-lg transition-colors">
                            Copy to Clipboard
                        </button>
                    </div>

                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
