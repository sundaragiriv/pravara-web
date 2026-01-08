"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, MessageCircle, MapPin, GraduationCap, Briefcase, Ruler, Sun, ExternalLink } from 'lucide-react';
import AstroMatchCard from './AstroMatchCard';

interface ProfileDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any; // Replace with your strict MatchProfile type
}

export default function ProfileDetailsPanel({ isOpen, onClose, profile }: ProfileDetailsPanelProps) {
  
  // Prevent background scrolling when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!profile) return null;

  return (
    <>
      {/* --- BACKDROP OVERLAY --- */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* --- SLIDING PANEL --- */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[700px] bg-[#0F0F0F] z-[60] shadow-2xl border-l border-gray-800
          transform transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        
        {/* --- HEADER: STICKY ACTIONS --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0F0F0F]/90 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-white">
                <X size={24} />
             </button>
             <span className="text-gray-400 text-sm font-medium">Profile Details</span>
          </div>
          
          <div className="flex gap-3">
             {/* NEW: External Link Button */}
             <Link 
               href={`/profile/${profile.id}`}
               className="p-2 border border-gray-700 rounded-full text-gray-400 hover:text-white hover:border-gray-500 transition"
               title="Open Full Page"
             >
                <ExternalLink size={20} />
             </Link>

             <button className="p-2 border border-gray-700 rounded-full text-gray-400 hover:text-[#F5A623] hover:border-[#F5A623] transition">
                <Heart size={20} />
             </button>
             <button className="px-4 py-2 bg-[#F5A623] hover:bg-orange-600 text-black font-bold rounded-full text-sm flex items-center gap-2 transition">
                <MessageCircle size={18} />
                Connect
             </button>
          </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            
            {/* 1. HERO IMAGE GRID */}
            <div className="h-96 w-full relative group">
                <Image 
                  src={profile.image_url || profile.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800'} 
                  alt={profile.full_name || profile.name || 'Profile'} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 700px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-4xl font-serif text-white font-bold mb-2">{profile.full_name || profile.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm">
                        <span className="flex items-center gap-1"><MapPin size={14} className="text-[#F5A623]" /> {profile.location || 'Not specified'}</span>
                        <span className="flex items-center gap-1"><Ruler size={14} className="text-[#F5A623]" /> {profile.height || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Sun size={14} className="text-[#F5A623]" /> {profile.age || '28'} yrs</span>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT LAYOUT */}
            <div className="p-6 md:p-8 space-y-10">
                
                {/* BIO SECTION */}
                <section>
                    <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-3">About Me</h3>
                    <p className="text-gray-300 leading-relaxed text-lg font-light">
                        {profile.bio || "I am a software architect who loves classical music and hiking. Looking for someone who values tradition but has a modern outlook on life. I come from a close-knit family and value honesty above all."}
                    </p>
                </section>

                {/* THE ASTRO MATCH CARD (Embedded Here) */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[#F5A623] font-bold uppercase text-xs tracking-wider">Vedic Compatibility</h3>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300">Strict Match</span>
                    </div>
                    {/* Passing dummy compatible data for now */}
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
                </section>

                {/* DETAILS GRID */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Education */}
                    <div className="space-y-1">
                         <h4 className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <GraduationCap size={16} /> Education
                         </h4>
                         <p className="text-white">{profile.education || 'Masters in Computer Science'}</p>
                         <p className="text-sm text-gray-400">Georgia Tech</p>
                    </div>

                    {/* Profession */}
                    <div className="space-y-1">
                         <h4 className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <Briefcase size={16} /> Profession
                         </h4>
                         <p className="text-white">{profile.profession || 'Software Engineer'}</p>
                         <p className="text-sm text-gray-400">Senior Architect @ Google</p>
                    </div>

                    {/* Community */}
                    <div className="space-y-1">
                         <h4 className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <Sun size={16} /> Community
                         </h4>
                         <p className="text-white">{profile.community || profile.gothra || 'Not specified'}</p>
                         <p className="text-sm text-gray-400">Gothra: {profile.gothra || 'Kasyapa'}</p>
                    </div>
                </section>
                
                {/* FOOTER SPACE */}
                <div className="h-20" /> 

            </div>
        </div>
      </div>
    </>
  );
}
