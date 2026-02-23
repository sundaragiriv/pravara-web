"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, MessageCircle, MapPin, Briefcase,
  Star, ExternalLink, Clock, GraduationCap,
} from 'lucide-react';
import { useShortlist } from '@/contexts/ShortlistContext';

interface ProfileDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onConnect?: () => void;
  isPremium?: boolean;
}

// ── Corner ornament (same as BiodataCard) ─────────────────────────────────
function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className={className} aria-hidden="true">
      <path d="M2 11 L2 2 L11 2" stroke="#C9A24A" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="2" cy="2" r="1.3" fill="#C9A24A" opacity="0.5" />
    </svg>
  );
}

function gunaInfo(score: number) {
  if (score === 0) return { gunas: 0, label: 'Sagothra', textClass: 'text-red-400', barClass: 'from-red-600 to-red-400', badgeBorder: 'border-red-500' };
  const gunas = Math.round((score / 100) * 36);
  if (gunas >= 27) return { gunas, label: 'Uttama Match',   textClass: 'text-emerald-400', barClass: 'from-emerald-600 to-emerald-400', badgeBorder: 'border-gold' };
  if (gunas >= 18) return { gunas, label: 'Madhyama Match', textClass: 'text-haldi-300',    barClass: 'from-haldi-600 to-haldi-400',      badgeBorder: 'border-gold' };
  return             { gunas, label: 'Alpa Match',     textClass: 'text-stone-400',   barClass: 'from-stone-600 to-stone-500',      badgeBorder: 'border-gold/60' };
}

export default function ProfileDetailsPanel({
  isOpen,
  onClose,
  profile,
  onConnect,
  isPremium = false,
}: ProfileDetailsPanelProps) {
  const { isShortlisted, toggle } = useShortlist();
  const shortlisted = profile ? isShortlisted(profile.id) : false;

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!profile) return null;

  const connectionStatus = profile.connectionStatus || 'none';
  const isPending   = connectionStatus === 'sent' || connectionStatus === 'pending';
  const isConnected = connectionStatus === 'connected';

  const score = profile.matchPercentage ?? profile.score ?? 0;
  const { gunas, label: gunaLabel, textClass: gunaTextClass, barClass: gunaBarClass, badgeBorder } = gunaInfo(score);

  const displayName = profile.full_name || profile.name || 'Unknown';
  const gothra      = profile.gothra || profile.community;
  const vedicRow    = [gothra, profile.nakshatra, profile.raasi].filter(Boolean);

  const quickFields = [
    { label: 'Nakshatra', value: profile.nakshatra ? `${profile.nakshatra}${profile.nakshatra_padam ? ` · Pada ${profile.nakshatra_padam}` : ''}` : null },
    { label: 'Raasi',   value: profile.raasi },
    { label: 'Diet',    value: profile.diet },
    { label: 'Height',  value: profile.height },
    { label: 'Marital', value: profile.marital_status },
    { label: 'Faith',   value: profile.religious_level },
  ].filter(f => f.value);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* ── PANEL ──────────────────────────────────────────────────── */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="vedic-panel fixed top-0 right-0 h-full w-full md:w-[500px] z-[60] flex flex-col
                       overflow-hidden border-l border-gold/30
                       shadow-[-8px_0_60px_rgba(0,0,0,0.8)]"
          >
            {/* Corner ornaments */}
            <CornerOrnament className="absolute top-2 left-2 z-30 opacity-45 pointer-events-none" />
            <CornerOrnament className="absolute top-2 right-2 z-30 opacity-45 rotate-90 pointer-events-none" />
            <CornerOrnament className="absolute bottom-2 right-2 z-30 opacity-45 rotate-180 pointer-events-none" />
            <CornerOrnament className="absolute bottom-2 left-2 z-30 opacity-45 -rotate-90 pointer-events-none" />

            {/* OM watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none" aria-hidden="true">
              <span className="font-serif text-gold opacity-[0.055] text-[180px] leading-none">ॐ</span>
            </div>

            {/* ── TOP BAR ─────────────────────────────────────────────── */}
            <div className="relative z-20 flex items-center justify-between px-5 py-4 flex-shrink-0
                            border-b border-gold/20 bg-stone-950/60">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="p-2 -ml-2 rounded-full text-stone-400 hover:text-gold-bright transition"
              >
                <X size={20} />
              </button>

              <div className="flex gap-2">
                <Link
                  href={`/profile/${profile.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                             border border-gold/28 text-stone-400 hover:border-gold/60 hover:text-gold-bright transition"
                >
                  <ExternalLink size={13} /> Full Profile
                </Link>

                <motion.button
                  type="button"
                  onClick={() => profile && toggle(profile.id)}
                  whileTap={{ scale: 0.85 }}
                  title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                  className={`p-2.5 rounded-lg transition ${
                    shortlisted
                      ? 'border border-gold/70 bg-gold/12'
                      : 'border border-gold/25 hover:border-gold/50'
                  }`}
                >
                  <motion.div
                    animate={shortlisted ? { scale: [1, 1.35, 1], rotate: [0, 18, -18, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <Star size={17} className={shortlisted ? 'text-gold-bright fill-gold-bright' : 'text-gold/45'} />
                  </motion.div>
                </motion.button>
              </div>
            </div>

            {/* ── BODY ────────────────────────────────────────────────── */}
            <div className="relative z-20 flex-1 flex flex-col min-h-0 p-5 gap-4">

              {/* ── PHOTO + IDENTITY ──────────────────────────────────── */}
              <div className="flex gap-5 items-start flex-shrink-0">

                {/* Photo */}
                <div className="relative flex-shrink-0">
                  <div className="w-[120px] h-[150px] rounded-2xl overflow-hidden
                                  border border-gold/35 shadow-xl shadow-black/50">
                    <img
                      src={profile.image_url || profile.image || '/placeholder.jpg'}
                      alt={displayName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  {/* Score badge */}
                  <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full
                                   flex flex-col items-center justify-center
                                   bg-stone-950 border-2 ${badgeBorder} shadow-lg shadow-black/60`}>
                    <span className={`text-[13px] font-bold leading-none ${score === 0 ? 'text-red-400' : 'text-haldi-300'}`}>
                      {score === 0 ? '✗' : score}
                    </span>
                    <span className="text-[7px] leading-none mt-0.5 uppercase tracking-wide text-stone-400">
                      {score === 0 ? 'sagoth' : 'gunas'}
                    </span>
                  </div>
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0 space-y-2.5 pt-1">
                  <div>
                    <h2 className="font-serif text-xl leading-tight text-white">
                      {displayName}
                      {profile.age && (
                        <span className="font-sans font-normal text-base ml-2 text-stone-300">{profile.age}</span>
                      )}
                    </h2>

                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {gothra && (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded
                                         bg-haldi-500/10 border border-haldi-500/30 text-haldi-300">
                          {gothra}
                        </span>
                      )}
                      {profile.sub_community && (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded
                                         bg-stone-800 border border-stone-700 text-stone-400">
                          {profile.sub_community}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {profile.location && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <MapPin size={10} className="text-stone-400 flex-shrink-0" />
                        {profile.location}
                      </div>
                    )}
                    {profile.profession && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <Briefcase size={10} className="text-stone-400 flex-shrink-0" />
                        {profile.profession}{profile.employer ? ` · ${profile.employer}` : ''}
                      </div>
                    )}
                    {profile.education && (
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <GraduationCap size={10} className="text-stone-400 flex-shrink-0" />
                        {profile.education}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── VEDIC HERITAGE ROW ─────────────────────────────────── */}
              {vedicRow.length > 0 && (
                <div className="flex-shrink-0 flex items-center justify-center gap-2 py-2 rounded-lg
                                border border-gold/18 bg-gold/[0.03]">
                  {vedicRow.map((val, i) => (
                    <React.Fragment key={i}>
                      <span className="text-[11px] font-medium tracking-wide text-stone-300">{val}</span>
                      {i < vedicRow.length - 1 && (
                        <span className="text-stone-600" aria-hidden="true">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* ── QUICK DECISION FIELDS ──────────────────────────────── */}
              {quickFields.length > 0 && (
                <div className="flex-shrink-0 grid grid-cols-2 gap-x-5 gap-y-2.5 px-4 py-3 rounded-lg
                                border border-gold/14 bg-stone-900/40">
                  {quickFields.map(f => (
                    <div key={f.label} className="min-w-0">
                      <p className="text-[8.5px] uppercase tracking-[0.13em] mb-0.5 font-semibold text-stone-500">
                        {f.label}
                      </p>
                      <p className="text-xs font-medium truncate text-stone-200">{f.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── BHRUGU COMPATIBILITY ───────────────────────────────── */}
              <div className="flex-shrink-0 px-4 py-3 rounded-xl border border-gold/20 bg-gold/[0.03]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-haldi-500">
                    Bhrugu Compatibility
                  </span>
                  <span className={`text-xs font-bold ${gunaTextClass}`}>
                    {gunas}/36 · {gunaLabel}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-stone-800">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${gunaBarClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(gunas / 36) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                  />
                </div>
                {!isPremium && (
                  <p className="text-[10px] mt-1.5 text-stone-600">
                    Upgrade for detailed Mind · Nadi · Bhakoot breakdown →
                  </p>
                )}
              </div>

              {/* ── BIO ──────────────────────────────────────────────── */}
              {profile.bio && (
                <div className="flex-shrink-0">
                  <p className="text-[9px] uppercase tracking-[0.13em] font-semibold mb-1.5 text-stone-500">About</p>
                  <p className="text-sm leading-relaxed font-serif italic line-clamp-3 text-stone-300">
                    "{profile.bio}"
                  </p>
                </div>
              )}

              <div className="flex-1" />

              {/* ── ACTION BUTTON ─────────────────────────────────────── */}
              <div className="flex-shrink-0">
                {isConnected ? (
                  <Link href={`/dashboard/chat?id=${profile.id}`} className="block w-full">
                    <button type="button"
                      className="w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 text-sm
                                 bg-emerald-900/20 border border-emerald-500/40 text-emerald-400
                                 hover:bg-emerald-900/30 transition">
                      <MessageCircle size={17} /> Chat Now
                    </button>
                  </Link>
                ) : isPending ? (
                  <button type="button" disabled
                    className="w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 text-sm
                               border border-gold/35 text-gold/60 cursor-default">
                    <Clock size={17} /> Interest Sent · Pending
                  </button>
                ) : (
                  <button type="button" onClick={onConnect}
                    className="w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 text-sm
                               bg-gradient-to-r from-haldi-500 to-haldi-600 text-stone-950
                               shadow-lg shadow-haldi-500/20 hover:to-haldi-400 hover:shadow-haldi-500/40 transition">
                    <Heart size={17} className="fill-stone-950" /> Connect
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
