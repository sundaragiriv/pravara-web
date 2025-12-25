"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SutradharWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Namaste. I am Sutradhar. How can I guide your search today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Hide on Login/Home pages - AFTER hooks
  if (pathname === '/login' || pathname === '/' || pathname === '/signup') return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: userMsg,
            context: `User is currently viewing: ${pathname}` 
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply || "I am reflecting on that..." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: "Apologies, I am having trouble connecting to the stars right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      
      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 md:w-96 h-[500px] bg-stone-950/90 backdrop-blur-xl border border-haldi-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-haldi-700 to-haldi-600 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-stone-950" />
                <span className="font-serif font-bold text-stone-950">Sutradhar</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-stone-900 hover:text-stone-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-stone-800">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-stone-800 text-stone-100 rounded-br-none' 
                      : 'bg-haldi-900/20 border border-haldi-500/20 text-stone-200 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                 <div className="flex justify-start">
                    <div className="bg-stone-900 p-3 rounded-xl rounded-bl-none flex gap-1">
                        <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-75" />
                        <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce delay-150" />
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-stone-800 bg-stone-900/50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask for advice..."
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-sm text-stone-200 focus:outline-none focus:border-haldi-500/50"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading}
                  className="p-2 bg-haldi-600 hover:bg-haldi-500 text-stone-950 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TRIGGER BUTTON */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-haldi-500 to-haldi-700 shadow-lg shadow-haldi-900/50 flex items-center justify-center text-stone-950 border-2 border-stone-900 z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
