"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, MapPin, Briefcase, Star, ExternalLink, Clock } from 'lucide-react';
import AstroMatchCard from '@/components/AstroMatchCard';

interface ProfileDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  isShortlisted?: boolean;
  onShortlist?: () => void;
  onConnect?: () => void;
  isPremium?: boolean;
}

export default function ProfileDetailsPanel({ 
  isOpen, 
  onClose, 
  profile, 
  isShortlisted = false, 
  onShortlist, 
  onConnect, 
  isPremium = false 
}: ProfileDetailsPanelProps) {
  
  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!profile) return null;

  // Determine Connection Status for Buttons
  const connectionStatus = profile.connectionStatus || 'none';
  const isPending = connectionStatus === 'sent' || connectionStatus === 'pending';
  const isConnected = connectionStatus === 'connected';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP FADE */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* SLIDING PANEL */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-[#0F0F0F] z-[60] shadow-2xl border-l border-gray-800 flex flex-col"
          >
        
        {/* --- 1. COMPACT HEADER (New Design) --- */}
        <div className="p-6 border-b border-gray-800 bg-[#141414] flex flex-col gap-6">
            
            {/* Top Row: Close Button */}
            <div className="flex justify-between items-start">
                 <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition">
                    <X size={24} />
                 </button>
                 
                 <div className="flex gap-2">
                    {/* Full Page Link */}
                    <Link href={`/profile/${profile.id}`} className="p-2.5 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 transition">
                        <ExternalLink size={20} />
                    </Link>
                    
                    {/* Shortlist Star */}
                    <motion.button 
                        onClick={onShortlist}
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className={`p-2.5 border rounded-lg transition ${
                            isShortlisted 
                            ? 'bg-[#F5A623]/10 border-[#F5A623] text-[#F5A623]' 
                            : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        <motion.div
                            animate={isShortlisted ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            <Star size={20} className={isShortlisted ? "fill-[#F5A623]" : ""} />
                        </motion.div>
                    </motion.button>
                 </div>
            </div>

            {/* Profile Info Row */}
            <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    <img 
                        src={profile.image || profile.image_url} 
                        alt={profile.name || profile.full_name} 
                        className="w-full h-full object-cover rounded-xl border border-gray-700 shadow-lg"
                    />
                    {/* Score Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-black px-2 py-1 rounded-md border border-gray-800 shadow-sm flex items-center gap-1">
                        <Heart size={10} className="text-pink-500 fill-pink-500" />
                        <span className="text-white text-xs font-bold">{profile.matchPercentage || profile.score || 0}%</span>
                    </div>
                </div>

                {/* Text Details */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-serif text-white font-bold leading-tight truncate">
                        {profile.name || profile.full_name}
                    </h2>
                    <div className="text-gray-400 text-sm mt-1 mb-3">
                         {profile.age} yrs • {profile.height} • {profile.community || profile.gothra}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {profile.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {profile.profession}</span>
                    </div>
                </div>
            </div>

            {/* Main Action Button (Full Width) */}
            <div className="mt-2">
                 {isConnected ? (
                    <Link href={`/dashboard/chat?id=${profile.id}`} className="block w-full">
                        <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition">
                           <MessageCircle size={18} /> Chat Now
                        </button>
                    </Link>
                 ) : isPending ? (
                    <button disabled className="w-full py-3 border border-[#F5A623] text-[#F5A623] font-bold rounded-xl flex items-center justify-center gap-2 cursor-default">
                       <Clock size={18} /> Interest Sent (Pending)
                    </button>
                 ) : (
                    <button 
                       onClick={onConnect}
                       className="w-full py-3 bg-[#F5A623] hover:bg-orange-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20"
                    >
                       <Heart size={18} className="fill-black" /> Connect
                    </button>
                 )}
            </div>
        </div>

        {/* --- 2. SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
            
            {/* VEDIC MATCH (Priority) */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#F5A623] text-xs font-bold uppercase tracking-widest">Bhrugu Compatibility</h3>
                    <span className="px-2 py-0.5 bg-green-900/30 border border-green-500/30 rounded text-[10px] text-green-400 uppercase font-bold">Strict Match</span>
                </div>
                {/* Premium Lock Logic handled inside or via opacity */}
                <div className={!isPremium ? "opacity-70" : ""}>
                    <AstroMatchCard 
                        data={{
                            totalScore: profile.gunas || 28,
                            nadiScore: 8,
                            bhakootScore: 7,
                            ganaScore: 3,
                            yoniScore: 3,
                            isManglik: false,
                            partnerIsManglik: false
                        }} 
                    />
                </div>
                {!isPremium && (
                    <div className="mt-3 text-center">
                        <p className="text-gray-500 text-xs">Upgrade to unlock detailed analysis.</p>
                    </div>
                )}
            </section>

            {/* BIO */}
            <section>
                <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">About</h3>
                <p className="text-gray-300 leading-relaxed font-serif text-sm">
                    "{profile.bio || "No bio available."}"
                </p>
            </section>

            {/* KEY DETAILS */}
            <section className="grid grid-cols-2 gap-4">
                <div className="bg-[#141414] p-3 rounded-lg border border-gray-800">
                     <p className="text-xs text-gray-500 uppercase">Education</p>
                     <p className="text-gray-200 text-sm font-medium truncate">{profile.education || "N/A"}</p>
                </div>
                <div className="bg-[#141414] p-3 rounded-lg border border-gray-800">
                     <p className="text-xs text-gray-500 uppercase">Gothra</p>
                     <p className="text-gray-200 text-sm font-medium truncate">{profile.gothra || "N/A"}</p>
                </div>
            </section>
            
            {/* Footer Padding */}
            <div className="h-10"></div>
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
