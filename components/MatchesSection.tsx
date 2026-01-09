"use client";

import React, { useState } from 'react';
import { ArrowUpDown, SearchX, Filter } from 'lucide-react';
import MatchCard from './MatchCard';

// --- SKELETON LOADER (Kept exactly as yours) ---
const MatchCardSkeleton = () => (
  <div className="bg-stone-900/90 rounded-xl overflow-hidden border border-stone-800 h-[500px] animate-pulse">
    <div className="h-64 bg-stone-800/50" />
    <div className="p-5 space-y-4">
      <div className="flex justify-between">
        <div className="h-4 bg-stone-800 rounded w-1/3" />
        <div className="h-4 bg-stone-800 rounded w-1/4" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 bg-stone-800 rounded" />
        <div className="h-12 bg-stone-800 rounded" />
        <div className="h-12 bg-stone-800 rounded" />
        <div className="h-12 bg-stone-800 rounded" />
      </div>
      <div className="flex gap-3 mt-4">
        <div className="h-10 bg-stone-800 rounded flex-1" />
        <div className="h-10 w-10 bg-stone-800 rounded" />
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
interface MatchesSectionProps {
  matches: any[];
  isLoading?: boolean;
  onToggleMobileFilters?: () => void;
  onProfileClick?: (profile: any) => void;
  isCollaborator?: boolean;
  shortlist?: any[];
  onShortlist?: (id: string) => void;
  onResetFilters?: () => void; // Added this specifically for the "Clear Filters" button
}

export default function MatchesSection({ 
  matches, 
  isLoading = false, 
  onToggleMobileFilters,
  onProfileClick,
  isCollaborator,
  shortlist = [],
  onShortlist,
  onResetFilters
}: MatchesSectionProps) {
  const [sortBy, setSortBy] = useState('relevance');

  // --- EMPTY STATE ---
  if (!isLoading && matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mb-4 border border-stone-800">
          <SearchX size={32} className="text-stone-600" />
        </div>
        <h3 className="text-xl text-white font-bold mb-2">No Matches Found</h3>
        <p className="text-stone-400 max-w-md text-sm mb-6">
          We couldn't find anyone matching your specific filters. Try expanding your age range or location preferences.
        </p>
        {/* CRITICAL FIX: The Reset Button */}
        {onResetFilters && (
            <button 
                onClick={onResetFilters} 
                className="px-6 py-2 bg-[#F5A623] hover:bg-orange-600 text-black font-bold rounded-full transition shadow-lg shadow-orange-500/20"
            >
                Clear Filters
            </button>
        )}
      </div>
    );
  }

  return (
    <section className="flex-1 h-full flex flex-col">
      
      {/* --- SECTION HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-stone-100 mb-1 flex items-center gap-2">
            Matches 
            {!isLoading && (
              <span className="text-sm font-sans font-normal text-stone-500 bg-stone-900 px-2 py-0.5 rounded-full border border-stone-800">
                {matches.length}
              </span>
            )}
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {isCollaborator 
              ? 'Shortlist the best ones for your family member.' 
              : 'Curated by Sutradhar based on preferences.'}
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort */}
        <div className="flex items-center gap-3">
          {onToggleMobileFilters && (
            <button 
              onClick={onToggleMobileFilters}
              className="lg:hidden flex items-center gap-2 bg-stone-900 border border-stone-800 text-stone-300 px-3 py-2 rounded-lg text-sm hover:border-stone-700 transition-colors"
            >
              <Filter size={14} />
              Filters
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 text-stone-400 hover:text-white text-sm transition-colors">
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">Sort by: </span>
              <span className="text-haldi-500 font-medium capitalize">{sortBy}</span>
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-44 bg-stone-900 border border-stone-800 rounded-lg shadow-xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {['relevance', 'newest', 'compatibility', 'age: low to high', 'age: high to low'].map((opt) => (
                <button 
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors capitalize first:rounded-t-lg last:rounded-b-lg ${
                    sortBy === opt 
                      ? 'bg-stone-800 text-haldi-500' 
                      : 'text-stone-300 hover:bg-stone-800 hover:text-haldi-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- THE GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-10">
        
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}

        {!isLoading && matches.map((profile, idx) => {
          const isShortlisted = shortlist.some(item => item.profile_id === profile.id || item.profile?.id === profile.id);
          
          return (
            // CRITICAL FIX: Wrapper Div for Slide-Over Click
            <div 
                key={profile.id} 
                onClick={() => onProfileClick?.(profile)} 
                className="cursor-pointer h-full"
            >
                <MatchCard 
                  profile={profile} 
                  index={idx} // Kept your index prop
                  isCollaborator={isCollaborator} // Kept your collaborator prop
                  isShortlisted={isShortlisted}
                  onToggleShortlist={(e) => {
                    e.stopPropagation();
                    onShortlist?.(profile.id);
                  }}
                />
            </div>
          );
        })}

      </div>
    </section>
  );
}