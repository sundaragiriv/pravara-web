"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
// Upgrade 3: Context-aware useEffect for chat history injection
import { Sparkles, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/** A change Sutradhar has suggested. Nothing is saved until the member confirms. */
type Proposal = { field: string; value: string; label: string };

type Message = {
  role: 'user' | 'ai';
  content: string;
  /** Present when this reply is asking to change a profile field. */
  proposal?: Proposal;
  /** Set once the member has answered, so the card stops offering buttons. */
  outcome?: 'saved' | 'cancelled';
};

export default function SutradharWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Namaste. I am Sutradhar. How can I guide your search today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Sutradhar is a member-only guide. Show it ONLY inside the member area
  // (dashboard + profile views), never on public marketing/legal/auth/funnel
  // pages. /dashboard/chat has its own Sutradhar, so exclude it.
  const isMemberSurface =
    (pathname.startsWith("/dashboard") && pathname !== "/dashboard/chat") ||
    pathname.startsWith("/profile/");
  if (!isMemberSurface) {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Prior turns, so follow-ups resolve. The opening greeting is ours, not the
    // model's, so it is dropped rather than replayed as something it said.
    const history = messages
      .slice(1)
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));

    try {
      const response = await fetch('/api/sutradhar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          contextPath: pathname,
          history,
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.reply || "I am reflecting on that...",
        proposal: data.proposal,
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: "I could not reach the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirming is a separate request to a separate route, which re-checks the
   * field and value before writing. The assistant proposes; only this saves.
   */
  const handleConfirm = async (index: number, proposal: Proposal) => {
    setSaving(true);
    try {
      const response = await fetch('/api/sutradhar/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: proposal.field, value: proposal.value })
      });
      const data = await response.json();

      setMessages(prev => {
        const next = [...prev];
        next[index] = { ...next[index], outcome: response.ok ? 'saved' : 'cancelled' };
        return [...next, { role: 'ai' as const, content: data.reply || "Saved." }];
      });
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: "I could not save that. Please try again." }]);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (index: number) => {
    setMessages(prev => {
      const next = [...prev];
      next[index] = { ...next[index], outcome: 'cancelled' };
      return [...next, { role: 'ai' as const, content: "Left as it was." }];
    });
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
                <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-stone-800 text-stone-100 rounded-br-none'
                      : 'bg-haldi-900/20 border border-haldi-500/20 text-stone-200 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>

                  {/* The change is shown in full before anything is written, so
                      the member is agreeing to a specific value rather than to
                      the assistant's summary of one. */}
                  {m.proposal && (
                    <div className="mt-2 w-[80%] rounded-xl border border-haldi-500/30 bg-stone-900/70 p-3">
                      <p className="text-[11px] uppercase tracking-widest text-haldi-500 mb-1">
                        {m.proposal.label}
                      </p>
                      <p className="text-sm text-stone-100 leading-relaxed break-words">
                        {m.proposal.value}
                      </p>

                      {m.outcome ? (
                        <p className="mt-2 text-xs text-stone-500">
                          {m.outcome === 'saved' ? 'Saved.' : 'Not saved.'}
                        </p>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleConfirm(idx, m.proposal!)}
                            disabled={saving}
                            className="px-3 py-1.5 rounded-lg bg-haldi-600 hover:bg-haldi-500 text-stone-950 text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Save this
                          </button>
                          <button
                            onClick={() => handleCancel(idx)}
                            disabled={saving}
                            className="px-3 py-1.5 rounded-lg border border-stone-700 hover:border-stone-600 text-stone-300 text-xs transition-colors disabled:opacity-50"
                          >
                            Not now
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
        layout
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        transition={{ layout: { type: 'spring', stiffness: 380, damping: 28 } }}
        className={`h-14 bg-gradient-to-br from-haldi-500 to-haldi-700 shadow-lg shadow-haldi-900/50
                    flex items-center justify-center text-stone-950 border-2 border-stone-900 z-50
                    ${isOpen ? 'w-14 rounded-full' : 'rounded-full pl-4 pr-5 gap-2.5'}`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-serif font-bold text-sm whitespace-nowrap overflow-hidden"
            >
              Sutradhar
            </motion.span>
          </>
        )}
      </motion.button>
    </div>
  );
}
