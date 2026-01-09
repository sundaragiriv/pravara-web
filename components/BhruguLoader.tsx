"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function BhruguLoader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-20">
      <div className="relative w-24 h-24">
        {/* Outer Ring: The Zodiac (Slow Spin) */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[3px] border-dashed border-stone-800 rounded-full"
        />
        
        {/* Inner Ring: The Nakshatras (Fast Spin Reverse) */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 border-2 border-haldi-500/20 rounded-full border-t-haldi-500"
        />

        {/* Center: The Scroll Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">📜</span> 
        </div>
      </div>
      
      <div className="text-center space-y-1">
          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-haldi-500 font-serif text-sm tracking-[0.2em] uppercase font-bold"
          >
            Consulting Bhrugu...
          </motion.p>
          <p className="text-stone-600 text-xs">Analyzing Gunas & Nadi Dosha</p>
      </div>
    </div>
  );
}
