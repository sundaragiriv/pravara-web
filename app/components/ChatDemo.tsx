"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";

// Dialogue taken directly from PRD 
const DEMO_MESSAGES = [
  {
    role: "ai",
    text: "Namaste! I'm Pravara, your digital Sutradhar. I'm here to help you find a partner who shares your values. What matters most to you in a life partner?",
  },
  {
    role: "user",
    text: "Family values and good education are very important to me.",
  },
  {
    role: "ai",
    text: "That's wonderful. Family values create a strong foundation. Tell me, how important is it that your partner's family is also based in the US?",
  },
];

export default function ChatDemo() {
  const [step, setStep] = useState(0);

  // Auto-play the chat sequence
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < DEMO_MESSAGES.length ? prev + 1 : prev));
    }, 3500); // New message every 3.5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Glassmorphism Container  */}
      <div className="relative bg-stone-900/60 backdrop-blur-xl border border-stone-800 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        
        {/* Header - Sutradhar Mode */}
        <div className="px-4 py-3 border-b border-stone-800 bg-stone-900/80 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-haldi-500" />
          <span className="text-stone-200 font-medium text-sm tracking-wide">Pravara AI Sutradhar</span>
        </div>

        {/* Chat Area */}
        <div className="p-6 h-[400px] overflow-y-auto space-y-6 flex flex-col font-sans">
          {DEMO_MESSAGES.slice(0, step + 1).map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-5 py-4 text-sm md:text-base leading-relaxed shadow-lg ${
                  msg.role === "user"
                    ? "bg-stone-800 text-stone-100 rounded-2xl rounded-tr-sm border border-stone-700" // User Bubble
                    : "bg-gradient-to-br from-haldi-900/20 to-stone-900 text-stone-200 rounded-2xl rounded-tl-sm border border-haldi-500/20" // AI Bubble
                }`}
              >
                 {/* AI Label */}
                {msg.role === "ai" && (
                  <span className="block text-xs font-bold text-haldi-500 mb-1 uppercase tracking-wider">
                    Sutradhar
                  </span>
                )}
                <p>{msg.text}</p>
              </div>
            </motion.div>
          ))}
          
          {/* Typing Indicator (shows when waiting for next step) */}
          {step < DEMO_MESSAGES.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 text-stone-500 text-xs ml-2 pt-2"
            >
              <span className="animate-bounce">•</span>
              <span className="animate-bounce delay-75">•</span>
              <span className="animate-bounce delay-150">•</span>
            </motion.div>
          )}
        </div>

        {/* Fake Input Area */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/40">
          <div className="flex items-center gap-3 bg-stone-950/60 rounded-full px-5 py-3 border border-stone-800 focus-within:border-haldi-500/50 transition-colors">
            <input
              disabled
              type="text"
              placeholder="Reply to Pravara..."
              className="bg-transparent border-none outline-none text-sm text-stone-400 w-full placeholder:text-stone-600 cursor-not-allowed"
            />
            <button className="p-2 rounded-full bg-haldi-600/20 text-haldi-500 hover:bg-haldi-600/30 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
