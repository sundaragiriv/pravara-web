import React from 'react';
import { X, SlidersHorizontal, Sparkles } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    minAge: number;
    maxAge: number;
    minHeight: string;
    maxHeight: string;
    diet: string[];
    visa: string;
    community: string;
    gothra: string;
    location: string;
    searchTerm: string;
  };
  setFilters: (filters: any) => void;
  updateFilter: (key: string, value: any) => void;
  toggleFilter: (key: string, value: string) => void;
  resetFilters: () => void;
  matchCount: number;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  filters, 
  updateFilter, 
  toggleFilter, 
  resetFilters,
  matchCount 
}: SidebarProps) {
  return (
    <>
      {/* --- MOBILE OVERLAY (Backdrop) --- */}
      {/* Only visible on mobile when isOpen is true */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* --- SIDEBAR CONTAINER --- */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-80 bg-stone-900 border-r border-stone-800 z-50 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-auto lg:z-auto lg:w-full
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full p-6">
          
          {/* HEADER: Title & Close Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-haldi-500">
              <SlidersHorizontal className="w-5 h-5" />
              <h2 className="font-bold text-stone-200">Refine Matches</h2>
            </div>
            
            {/* Close Button (Mobile Only) */}
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 text-stone-400 hover:text-white bg-stone-950 rounded-full border border-stone-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* SCROLLABLE FILTERS */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-stone-800">
            
            {/* 1. BASIC: Age Range */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Age Range</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="21" 
                  value={filters.minAge}
                  className="w-full bg-black/40 border border-stone-700 rounded px-3 py-2 text-sm text-white focus:border-haldi-500 outline-none transition-colors"
                  onChange={(e) => updateFilter('minAge', Number(e.target.value))}
                />
                <span className="text-stone-600">-</span>
                <input 
                  type="number" 
                  placeholder="35" 
                  value={filters.maxAge}
                  className="w-full bg-black/40 border border-stone-700 rounded px-3 py-2 text-sm text-white focus:border-haldi-500 outline-none transition-colors"
                  onChange={(e) => updateFilter('maxAge', Number(e.target.value))}
                />
              </div>
            </div>

            {/* 2. HEIGHT RANGE */}
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Height (cm)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="150" 
                  value={filters.minHeight}
                  className="w-full bg-black/40 border border-stone-700 rounded px-3 py-2 text-sm text-white focus:border-haldi-500 outline-none transition-colors"
                  onChange={(e) => updateFilter('minHeight', e.target.value)}
                />
                <span className="text-stone-600">-</span>
                <input 
                  type="number" 
                  placeholder="190" 
                  value={filters.maxHeight}
                  className="w-full bg-black/40 border border-stone-700 rounded px-3 py-2 text-sm text-white focus:border-haldi-500 outline-none transition-colors"
                  onChange={(e) => updateFilter('maxHeight', e.target.value)}
                />
              </div>
            </div>

            {/* 3. LIFESTYLE: Diet (The Dealbreaker) */}
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Diet</label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian'].map(diet => (
                  <button 
                    key={diet}
                    onClick={() => toggleFilter('diet', diet)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      filters.diet.includes(diet) 
                        ? 'bg-haldi-500 text-black border-haldi-500 font-bold' 
                        : 'bg-transparent text-stone-400 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    {diet === 'Vegetarian' ? 'Veg' : diet === 'Non-Vegetarian' ? 'Non-Veg' : diet}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. NRI STATUS: Visa (High Value) */}
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Visa Status</label>
              <select 
                value={filters.visa}
                className="w-full bg-black/40 border border-stone-700 rounded px-3 py-2 text-sm text-stone-300 focus:border-haldi-500 outline-none"
                onChange={(e) => updateFilter('visa', e.target.value)}
              >
                <option value="">Any Status</option>
                <option value="Citizen">Citizen</option>
                <option value="Green Card">Green Card / PR</option>
                <option value="H1B">H1B / Work Visa</option>
                <option value="Student">Student Visa</option>
                <option value="India">India Resident</option>
              </select>
            </div>

            {/* 5. COMMUNITY (TEXT INPUT) */}
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Community / Gothra</label>
              <input 
                type="text" 
                placeholder="e.g. Iyer, Kasyapa..." 
                value={filters.gothra}
                className="w-full bg-black/40 border border-stone-700 rounded px-3 py-2 text-sm text-white focus:border-haldi-500 outline-none transition-colors"
                onChange={(e) => updateFilter('gothra', e.target.value)}
              />
            </div>

            {/* 6. LOCATION PREFERENCE */}
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Location</label>
              <input 
                type="text" 
                placeholder="City, State, or Country" 
                value={filters.location}
                className="w-full bg-black/40 border border-stone-700 rounded px-3 py-2 text-sm text-white focus:border-haldi-500 outline-none transition-colors"
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>

            {/* RESET BUTTON */}
            <button 
              onClick={resetFilters}
              className="w-full text-xs text-stone-500 hover:text-haldi-400 py-2 border-t border-stone-800 mt-2 transition-colors font-medium"
            >
              Reset All Filters
            </button>

            {/* PREMIUM UPSELL CARD */}
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-[#F5A623]/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={64} />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-[#F5A623] font-serif font-bold text-lg mb-1">Unlock Bhrugu Engine</h3>
                <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                  See precise Vedic compatibility scores, Mangal Dosha checks, and connect instantly.
                </p>
                <button className="w-full py-2 bg-[#F5A623] hover:bg-orange-600 text-black font-bold rounded-lg text-xs transition-transform transform hover:scale-105 shadow-lg shadow-orange-500/20">
                  Upgrade to Premium
                </button>
              </div>
            </div>

          </div>

          {/* FOOTER: Apply Button (Mobile Only) */}
          <div className="mt-6 pt-6 border-t border-stone-800 lg:hidden">
            <button 
              onClick={onClose}
              className="w-full bg-haldi-500 text-black font-bold py-3 rounded-lg hover:bg-haldi-600 transition shadow-lg shadow-haldi-500/20"
            >
              Show {matchCount} Matches
            </button>
          </div>
          
        </div>
      </aside>
    </>
  );
}
