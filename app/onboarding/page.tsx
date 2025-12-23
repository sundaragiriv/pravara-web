"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Simulation of the AI's logic (Sutradhar Persona)
// In the real backend, this comes from OpenAI [cite: 178-180]
const SCRIPT = [
  {
    id: 1,
    text: "Namaste! I am Pravara, your digital Sutradhar. I am here to understand your story and help you find a union that honors both your heart and your heritage.",
    wait: 1000,
  },
  {
    id: 2,
    text: "Before we begin, may I know your full name?",
    wait: 2000,
  },
  {
    id: 3,
    trigger: "name",
    text: "A pleasure to meet you, {name}. To ensure we find a compatible match, could you tell me which Gothra your family belongs to?",
    wait: 1000,
  },
  {
    id: 4,
    trigger: "gothra",
    text: "Understood. Preserving lineage is vital. Now, tell me about the partner you seek. What are the three qualities you value most?",
    wait: 1000,
  },
  {
    id: 5,
    trigger: "values",
    text: "Beautiful. Family and values form the strongest roots. I have enough to begin your search. I am now curating profiles that align with your chart and your heart.",
    wait: 1000,
    action: "complete"
  }
];

type Message = {
  role: "ai" | "user";
  text: string;
};

export default function Onboarding() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial Greeting
  useEffect(() => {
    addAiMessage(SCRIPT[0].text, SCRIPT[0].wait);
    setTimeout(() => {
      addAiMessage(SCRIPT[1].text, 1500);
      setStep(1);
    }, 2500);
  }, []);

  const addAiMessage = (text: string, delay: number) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "ai", text }]);
    }, delay);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // 1. Add User Message
    const userText = inputValue;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInputValue("");
    
    // 2. Process Logic (Mock AI Brain)
    const nextScript = SCRIPT.find(s => s.id === step + 2); // Simple linear logic
    
    if (nextScript) {
      // Store data based on current step
      if (step === 1) setUserData({ ...userData, name: userText });
      
      let responseText = nextScript.text;
      
      // Dynamic text replacement (e.g., "Hello {name}")
      if (nextScript.trigger === "name") {
        responseText = responseText.replace("{name}", userText);
      }

      setStep(prev => prev + 1);
      
      // 3. Trigger AI Reply
      addAiMessage(responseText, 1500);

      // 4. Handle Completion
      if (nextScript.action === "complete") {
        setTimeout(() => {
            router.push("/dashboard"); // We will build this next!
        }, 6000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans flex flex-col relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-stone-950 -z-10" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-haldi-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-stone-900 bg-stone-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-haldi-500" />
            </div>
            <div>
                <h1 className="font-serif text-lg text-stone-200 leading-none">Pravara Sutradhar</h1>
                <span className="text-xs text-haldi-500 font-medium uppercase tracking-wider">AI Onboarding Mode</span>
            </div>
        </div>
        <Link href="/" className="text-stone-500 hover:text-stone-300 transition-colors">
            <span className="sr-only">Exit</span>
            <span className="text-sm">Exit Interview</span>
        </Link>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-3xl mx-auto w-full">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-6 py-4 text-base md:text-lg leading-relaxed shadow-md ${
                  msg.role === "user"
                    ? "bg-stone-800 text-stone-100 rounded-2xl rounded-tr-sm border border-stone-700"
                    : "bg-gradient-to-br from-haldi-900/10 to-stone-900 text-stone-200 rounded-2xl rounded-tl-sm border border-haldi-500/20"
                }`}
              >
                {msg.role === "ai" && idx === messages.length - 1 && idx !== 0 && (
                   <span className="block text-xs font-bold text-haldi-600 mb-2 uppercase tracking-wider">Pravara asks</span>
                )}
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-stone-500 text-sm ml-4"
          >
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-haldi-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-haldi-500 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-haldi-500 rounded-full animate-bounce delay-150" />
            </div>
            <span>Sutradhar is thinking...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-stone-950 border-t border-stone-900">
        <form 
            onSubmit={handleSendMessage}
            className="max-w-3xl mx-auto relative flex items-center gap-4"
        >
            <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full bg-stone-900 border border-stone-800 text-stone-100 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-haldi-600 focus:ring-1 focus:ring-haldi-600 transition-all placeholder:text-stone-600 text-lg shadow-lg"
            />
            <button 
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 p-2.5 bg-haldi-600 hover:bg-haldi-500 text-stone-950 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
                <Send className="w-5 h-5" />
            </button>
        </form>
        <p className="text-center text-stone-600 text-xs mt-3">
            Press Enter to send • Pravara learns from your responses to find the perfect match.
        </p>
      </div>

    </div>
  );
}
