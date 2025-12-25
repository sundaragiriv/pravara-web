"use client";

import { motion } from "framer-motion";
import { Star, Moon, Heart, Zap, Shield, Crown, Anchor, Activity } from "lucide-react";

interface KundaliProps {
  score: number; // Total out of 36
}

export default function KundaliCanvas({ score }: KundaliProps) {
  
  // Mock Logic: Distribute the total score across the 8 Kootas nicely
  // In a real app, this would come from the backend algorithm
  const kootas = [
    { name: "Varna", label: "Ego", max: 1, val: 1, icon: Crown },
    { name: "Vashya", label: "Attraction", max: 2, val: 2, icon: Heart },
    { name: "Tara", label: "Destiny", max: 3, val: 3, icon: Star },
    { name: "Yoni", label: "Intimacy", max: 4, val: score > 30 ? 4 : 3, icon: Zap },
    { name: "Graha Maitri", label: "Friendship", max: 5, val: 5, icon: Anchor },
    { name: "Gana", label: "Temperament", max: 6, val: score > 25 ? 6 : 4, icon: Moon },
    { name: "Bhakoot", label: "Love", max: 7, val: score > 28 ? 7 : 5, icon: Shield },
    { name: "Nadi", label: "Health", max: 8, val: score > 32 ? 8 : 6, icon: Activity },
  ];

  return (
    <div className="p-6 bg-stone-900 border border-stone-800 rounded-2xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-12 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      <div className="flex justify-between items-end mb-6">
        <div>
            <h3 className="text-haldi-500 font-bold text-xs uppercase tracking-widest mb-1">
               Vedic Alignment
            </h3>
            <h2 className="text-2xl font-serif text-stone-100 flex flex-col md:flex-row md:items-baseline gap-2">
               Bhrugu Patrika 
               <span className="text-stone-500 text-lg font-sans font-normal">(Kundali Match)</span>
            </h2>
        </div>
        <div className="text-right">
            <div className="text-3xl font-serif text-white">{score}<span className="text-stone-500 text-lg">/36</span></div>
            <div className="text-green-500 text-xs font-bold uppercase">Gunas Matched</div>
        </div>
      </div>

      {/* The Visual Bars */}
      <div className="space-y-4">
        {kootas.map((k, idx) => {
            const percentage = (k.val / k.max) * 100;
            return (
                <div key={k.name} className="relative">
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <div className="flex items-center gap-2 text-stone-300">
                            <k.icon className={`w-3.5 h-3.5 ${percentage === 100 ? 'text-haldi-500' : 'text-stone-500'}`} />
                            <span className="font-serif">{k.name}</span>
                            <span className="text-stone-500 text-xs">({k.label})</span>
                        </div>
                        <div className="text-stone-400 font-mono text-xs">
                            {k.val} / {k.max}
                        </div>
                    </div>
                    
                    {/* The Bar Track */}
                    <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800/50">
                        {/* The Fill Animation */}
                        <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                            className={`h-full rounded-full ${percentage === 100 ? 'bg-gradient-to-r from-haldi-600 to-haldi-400' : 'bg-stone-700'}`}
                        />
                    </div>
                </div>
            );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-stone-800 text-center">
        <p className="text-xs text-stone-500 italic">
            "A score above 18 is considered auspicious. This union is blessed by the stars."
        </p>
      </div>
    </div>
  );
}
