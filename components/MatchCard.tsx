"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, 
  User, 
  BadgeCheck, 
  Star, 
  MapPin, 
  Info, 
  Briefcase,
  MessageCircle,
  Clock
} from 'lucide-react';
import ConnectionButton from '@/components/ConnectionButton';
import { getMatchColor, shouldFillHeart } from '@/utils/matchEngine';

// Define the shape of Match Profile Data
interface MatchProfile {
  id: string;
  full_name: string;
  age: number | null;
  height: string | null;
  location: string | null;
  image_url: string | null;
  score: number; // Match percentage (0-100)
  gothra: string | null;
  sub_community: string | null;
  profession: string | null;
  spiritual_org?: string | null;
  religious_level?: string | null;
  is_verified?: boolean;
  connectionStatus?: 'none' | 'sent' | 'received' | 'connected';
  isShortlisted?: boolean;
}

interface MatchCardProps {
  profile: MatchProfile;
  index: number;
  isCollaborator?: boolean;
  onProfileClick?: (profile: MatchProfile) => void;
  isShortlisted?: boolean;
  onToggleShortlist?: (e: React.MouseEvent) => void;
}

export default function MatchCard({ profile, index, isCollaborator = false, onProfileClick, isShortlisted = false, onToggleShortlist }: MatchCardProps) {
  // Calculate Vedic Gunas (derived from match score)
  const vedic_gunas = Math.floor((profile.score / 100) * 36);
  const gunaQuality = vedic_gunas >= 27 ? 'Excellent Match' : vedic_gunas >= 18 ? 'Good Match' : 'Fair Match';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-stone-900/90 rounded-xl overflow-hidden shadow-lg border border-stone-800 hover:border-stone-700 transition-all duration-300 group flex flex-col h-full"
    >
      {/* --- TOP SECTION: IMAGE & BADGES --- */}
      <div 
        className="relative h-64 w-full overflow-hidden bg-stone-900"
      >
        {profile.image_url ? (
          <Image 
            src={profile.image_url} 
            alt={profile.full_name} 
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-20 h-20 text-stone-700" />
          </div>
        )}
        
        {/* Match Percentage Badge */}
        <div 
          className={`absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border shadow-sm transition-all hover:scale-105 cursor-help ${
            profile.score === 0 ? 'border-red-500/30' :
            profile.score >= 85 ? 'border-green-500/30' :
            profile.score >= 70 ? 'border-haldi-500/30' :
            'border-rose-500/30'
          }`}
          title={
            profile.score === 0 ? "Same Gothra - Not Compatible" :
            profile.score >= 85 ? "Excellent Match - High Compatibility" :
            profile.score >= 70 ? "Very Good Match" :
            "Good Match"
          }
        >
          <Heart 
            size={12} 
            className={`${
              profile.score === 0 ? 'text-red-500' :
              shouldFillHeart(profile.score) ? 'text-pink-500 fill-pink-500' : 'text-pink-500'
            }`} 
          />
          <span className={`text-xs font-bold tracking-wide ${getMatchColor(profile.score)}`}>
            {profile.score}%
          </span>
        </div>

        {/* Sagothra Warning Badge */}
        {profile.score === 0 && (
          <div className="absolute top-14 right-3 bg-red-900/90 border border-red-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg animate-pulse">
            <span>⚠️ Same Gothra</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 w-full h-28 bg-gradient-to-t from-stone-900/95 via-stone-900/80 to-transparent"></div>
        
        {/* Name & Location */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white text-xl font-bold font-serif tracking-wide">{profile.full_name}</h3>
            {profile.is_verified && <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-gray-300 text-xs">
            <MapPin size={12} className="text-haldi-500" />
            <span>{profile.location || 'Location N/A'}</span>
          </div>
        </div>
      </div>

      {/* --- MIDDLE SECTION: DATA GRID --- */}
      <div className="p-4 space-y-4 flex-grow">
        
        {/* Gothra Badge */}
        {profile.gothra && (
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 bg-haldi-900/20 border border-haldi-500/20 text-haldi-500 text-[10px] uppercase tracking-widest font-bold rounded">
              {profile.gothra}
            </span>
          </div>
        )}

        {/* Row 1: Age/Height & Community */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold mb-0.5">Age / Ht</p>
            <p className="text-sm text-stone-200 font-medium">
              {profile.age || '—'} yrs{profile.height ? `, ${profile.height}` : ''}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold mb-0.5">Community</p>
            <p className="text-sm text-stone-200 font-medium truncate">{profile.sub_community || '—'}</p>
          </div>
        </div>

        {/* Row 2: Vedic Gunas & Profession */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Vedic Gunas</p>
              <Info size={10} className="text-stone-600 cursor-help" />
            </div>
            <span className="text-haldi-500 font-bold text-sm">{vedic_gunas}/36</span>
          </div>
          <div>
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold mb-0.5">Profession</p>
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Briefcase size={12} className="text-stone-500 flex-shrink-0" />
              <p className="text-sm text-stone-200 font-medium truncate">{profile.profession || '—'}</p>
            </div>
          </div>
        </div>

        {/* Additional Vedic Heritage - Only show if there's actual content */}
        {((profile.spiritual_org?.trim?.() || profile.religious_level?.trim?.()) && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-800">
            {profile.spiritual_org?.trim?.() && (
              <span className="px-2 py-0.5 bg-haldi-900/10 text-haldi-600 text-[10px] rounded border border-haldi-500/20">
                {profile.spiritual_org}
              </span>
            )}
            {profile.religious_level?.trim?.() && (
              <span className="px-2 py-0.5 bg-stone-800 text-stone-500 text-[10px] rounded border border-stone-700">
                {profile.religious_level}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* --- BOTTOM SECTION: ACTIONS --- */}
      <div className="p-4 pt-0 flex gap-2 mt-auto">
        {/* Main Action Button */}
        {!isCollaborator && (
          <ConnectionButton 
            profileId={profile.id} 
            initialStatus={(profile.connectionStatus || 'none') as 'none' | 'sent' | 'received' | 'connected' | 'rejected'}
            onSendInterest={async () => console.log('Interest sent to', profile.id)}
          />
        )}

        {/* Shortlist / Star Button */}
        <motion.button 
          onClick={onToggleShortlist}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`w-11 h-11 flex-shrink-0 rounded-lg border flex items-center justify-center transition-all duration-300 ${
            isShortlisted 
              ? 'bg-stone-800 border-haldi-500 text-haldi-500' 
              : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white hover:border-stone-500'
          }`}
          title={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
        >
          <motion.div
            animate={isShortlisted ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Star size={20} className={isShortlisted ? "fill-haldi-500" : ""} />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}
