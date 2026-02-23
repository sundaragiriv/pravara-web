"use client";

import React, { useState } from 'react';
import { ArrowUpDown, SearchX, Filter, LayoutGrid, List } from 'lucide-react';
import BiodataCard from './BiodataCard';
import { useShortlist } from '@/contexts/ShortlistContext';
import type { MatchProfile } from '@/types';

// ── Skeleton loader (biodata palette) ─────────────────────────────────────
const BiodataCardSkeleton = () => (
  <div className="vedic-card rounded-2xl overflow-hidden border border-gold/15 animate-pulse h-[480px]">
    {/* Photo area */}
    <div className="h-[210px] bg-stone-800/60" />
    {/* Vedic row */}
    <div className="h-8 mx-4 my-2 rounded bg-gold/[0.08]" />
    {/* Data grid */}
    <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="h-2 w-14 rounded bg-gold/15 mb-1.5" />
          <div className="h-3 w-20 rounded bg-stone-700/60" />
        </div>
      ))}
    </div>
    {/* Actions */}
    <div className="px-4 pt-3 pb-4 flex gap-2 mt-auto">
      <div className="flex-1 h-10 rounded-xl bg-gold/[0.08]" />
      <div className="w-11 h-10 rounded-lg bg-gold/[0.08]" />
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
interface MatchesSectionProps {
  matches: MatchProfile[];
  isLoading?: boolean;
  onToggleMobileFilters?: () => void;
  onProfileClick?: (profile: MatchProfile) => void;
  onSendInterest?: (profileId: string) => Promise<void>;
  isCollaborator?: boolean;
  onResetFilters?: () => void;
}

export default function MatchesSection({
  matches,
  isLoading = false,
  onToggleMobileFilters,
  onProfileClick,
  onSendInterest,
  isCollaborator,
  onResetFilters,
}: MatchesSectionProps) {
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'scroll'>('grid');
  const { isShortlisted, toggle } = useShortlist();

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!isLoading && matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mb-4 border border-stone-800">
          <SearchX size={32} className="text-stone-600" />
        </div>
        <h3 className="text-xl text-white font-bold mb-2">No Matches Found</h3>
        <p className="text-stone-400 max-w-md text-sm mb-6">
          We couldn't find anyone matching your specific filters. Try expanding your age range or
          location preferences.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-6 py-2 bg-haldi-500 hover:bg-haldi-400 text-stone-950 font-bold rounded-full transition shadow-lg shadow-haldi-500/20"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="flex-1 h-full flex flex-col">

      {/* ── Section header ──────────────────────────────────────────── */}
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
              : 'Curated by Sutradhar based on your Vedic roots.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          {onToggleMobileFilters && (
            <button
              type="button"
              onClick={onToggleMobileFilters}
              className="lg:hidden flex items-center gap-2 bg-stone-900 border border-stone-800 text-stone-300 px-3 py-2 rounded-lg text-sm hover:border-stone-700 transition-colors"
            >
              <Filter size={14} />
              Filters
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center p-0.5 bg-stone-900 rounded-lg border border-stone-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`flex items-center justify-center w-8 h-7 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-stone-800 text-haldi-400'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('scroll')}
              title="Scroll view (one at a time)"
              className={`flex items-center justify-center w-8 h-7 rounded transition-all ${
                viewMode === 'scroll'
                  ? 'bg-stone-800 text-haldi-400'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <List size={13} />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-2 text-stone-400 hover:text-white text-sm transition-colors"
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">Sort: </span>
              <span className="text-haldi-400 font-medium capitalize">{sortBy}</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-44 bg-stone-900 border border-stone-800 rounded-lg shadow-xl shadow-black/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {['relevance', 'newest', 'compatibility', 'age: low to high', 'age: high to low'].map(
                (opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSortBy(opt)}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors capitalize first:rounded-t-lg last:rounded-b-lg ${
                      sortBy === opt
                        ? 'bg-stone-800 text-haldi-400'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-haldi-400'
                    }`}
                  >
                    {opt}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID VIEW ───────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-10">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <BiodataCardSkeleton key={i} />)}

          {!isLoading &&
            matches.map((profile, idx) => (
              <div
                key={profile.id}
                onClick={() => onProfileClick?.(profile)}
                className="cursor-pointer h-full"
              >
                <BiodataCard
                  profile={profile}
                  index={idx}
                  isCollaborator={isCollaborator}
                  isShortlisted={isShortlisted(profile.id)}
                  onSendInterest={onSendInterest}
                  onToggleShortlist={(e) => {
                    e.stopPropagation();
                    toggle(profile.id);
                  }}
                />
              </div>
            ))}
        </div>
      )}

      {/* ── SCROLL (TIKTOK) VIEW ────────────────────────────────────── */}
      {viewMode === 'scroll' && (
        <div
          className="overflow-y-auto snap-y snap-mandatory scroll-smooth pb-4 h-[calc(100svh_-_10rem)]"
        >
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="snap-start flex items-center justify-center px-4 py-3 h-[calc(100svh_-_10rem)]"
              >
                <div className="w-full max-w-sm h-full max-h-[680px]">
                  <BiodataCardSkeleton />
                </div>
              </div>
            ))}

          {!isLoading &&
            matches.map((profile, idx) => (
              <div
                key={profile.id}
                className="snap-start flex items-center justify-center px-4 py-3 cursor-pointer h-[calc(100svh_-_10rem)]"
                onClick={() => onProfileClick?.(profile)}
              >
                <div className="w-full max-w-sm h-full max-h-[680px]">
                  <BiodataCard
                    profile={profile}
                    index={idx}
                    isCollaborator={isCollaborator}
                    isShortlisted={isShortlisted(profile.id)}
                    onSendInterest={onSendInterest}
                    scrollMode
                    onToggleShortlist={(e) => {
                      e.stopPropagation();
                      toggle(profile.id);
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
