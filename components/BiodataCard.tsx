"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, BadgeCheck, Star, MapPin, Briefcase, GraduationCap, Utensils } from 'lucide-react';
import ConnectionButton from '@/components/ConnectionButton';
import type { MatchProfile } from '@/types';

interface BiodataCardProps {
  profile: MatchProfile;
  index: number;
  isCollaborator?: boolean;
  isShortlisted?: boolean;
  onToggleShortlist?: (e: React.MouseEvent) => void;
  onSendInterest?: (profileId: string) => Promise<void>;
  /** Fills 100% of its container height for scroll-snap mode */
  scrollMode?: boolean;
}

// ── SVG corner ornament ────────────────────────────────────────────────────
function CornerOrnament({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className={className} aria-hidden="true">
      <path d="M2 13 L2 2 L13 2" stroke="#C9A24A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="2" cy="2" r="1.5" fill="#C9A24A" opacity="0.55" />
    </svg>
  );
}

// ── Vedic Guna label ───────────────────────────────────────────────────────
function gunaInfo(profile: BiodataCardProps['profile']) {
  const gr = profile.gunaResult;
  if (gr?.sagothra)    return { gunas: 0,          label: 'Sagothra', textClass: 'text-red-400',    badgeBorder: 'border-red-500'  };
  if (gr?.nadiDosha)   return { gunas: gr.total,   label: 'Nadi ⚠',  textClass: 'text-orange-400', badgeBorder: 'border-orange-500' };
  if (gr)              {
    const { total, label } = gr;
    if (total >= 27) return { gunas: total, label: 'Uttama',   textClass: 'text-emerald-400', badgeBorder: 'border-gold'    };
    if (total >= 18) return { gunas: total, label: 'Madhyama', textClass: 'text-haldi-300',   badgeBorder: 'border-gold'    };
    return                   { gunas: total, label: 'Alpa',     textClass: 'text-stone-400',   badgeBorder: 'border-gold/60' };
  }
  // Legacy fallback (no gunaResult yet)
  const score = profile.score;
  if (score === 0) return { gunas: 0, label: 'Sagothra', textClass: 'text-red-400', badgeBorder: 'border-red-500' };
  const gunas = Math.floor((score / 100) * 36);
  if (gunas >= 27) return { gunas, label: 'Uttama',   textClass: 'text-emerald-400', badgeBorder: 'border-gold'    };
  if (gunas >= 18) return { gunas, label: 'Madhyama', textClass: 'text-haldi-300',   badgeBorder: 'border-gold'    };
  return                   { gunas, label: 'Alpa',     textClass: 'text-stone-400',   badgeBorder: 'border-gold/60' };
}

export default function BiodataCard({
  profile,
  index,
  isCollaborator = false,
  isShortlisted = false,
  onToggleShortlist,
  onSendInterest,
  scrollMode = false,
}: BiodataCardProps) {
  const { gunas, label: gunaLabel, textClass: gunaTextClass, badgeBorder } = gunaInfo(profile);
  const gr = profile.gunaResult;

  const dataFields = [
    { label: 'Pravara Match', value: `${gunas}/36 — ${gunaLabel}`, textClass: gunaTextClass },
    { label: 'Profession',  value: profile.profession,  icon: <Briefcase size={9} /> },
    { label: 'Education',   value: profile.education,   icon: <GraduationCap size={9} /> },
    { label: 'Diet',        value: profile.diet,        icon: <Utensils size={9} /> },
    { label: 'Height',      value: profile.height
        ? `${profile.height}${profile.age ? `, ${profile.age} yrs` : ''}`
        : profile.age ? `${profile.age} yrs` : null },
    { label: 'Community',   value: profile.sub_community },
  ].filter(f => f.value);

  const vedicRow = [profile.gothra, profile.nakshatra, profile.raasi].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={scrollMode ? {} : { y: -4, transition: { duration: 0.18 } }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3), ease: 'easeOut' }}
      className={`vedic-card relative flex flex-col rounded-2xl overflow-hidden
                  border border-gold/40 hover:border-gold/65 transition-all duration-300 group
                  shadow-[0_6px_32px_rgba(0,0,0,0.45)]
                  ${scrollMode ? 'h-full' : 'h-full'}`}
    >
      {/* Corner ornaments */}
      <CornerOrnament className="absolute top-1.5 left-1.5 z-30 opacity-55 pointer-events-none" />
      <CornerOrnament className="absolute top-1.5 right-1.5 z-30 opacity-55 rotate-90 pointer-events-none" />
      <CornerOrnament className="absolute bottom-1.5 right-1.5 z-30 opacity-55 rotate-180 pointer-events-none" />
      <CornerOrnament className="absolute bottom-1.5 left-1.5 z-30 opacity-55 -rotate-90 pointer-events-none" />

      {/* OM watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none" aria-hidden="true">
        <span className="font-serif text-gold opacity-[0.065] text-[130px] leading-none">
          ॐ
        </span>
      </div>

      {/* ── PHOTO ─────────────────────────────────────────────────── */}
      <div className={`relative flex-shrink-0 overflow-hidden ${scrollMode ? 'h-[45%]' : 'aspect-[4/5] max-h-[320px]'}`}>
        {profile.image_url ? (
          <Image
            src={profile.image_url}
            alt={profile.full_name}
            fill
            className="object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-900">
            <User className="w-14 h-14 text-gold/15" />
          </div>
        )}

        {/* Gradient vignette — blends photo into card bg */}
        <div className="absolute inset-0 [background:linear-gradient(to_bottom,transparent_35%,#1c1917_100%)]
                        [box-shadow:inset_0_0_0_1px_rgba(201,162,74,0.18)]" />

        {/* Match score badge */}
        <div className={`absolute top-3 right-3 z-20 w-[52px] h-[52px] rounded-full flex flex-col
                         items-center justify-center bg-stone-900/95 border-2 ${badgeBorder}
                         shadow-[0_0_14px_rgba(0,0,0,0.6)]`}>
          <span className={`text-[15px] font-bold leading-none ${gunaTextClass}`}>
            {(gr?.sagothra || gunas === 0) ? '✗' : gunas}
          </span>
          <span className="text-[8px] leading-none mt-0.5 uppercase tracking-wide text-stone-400">
            {gr?.sagothra ? 'sagoth' : '/36'}
          </span>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-20">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-serif text-[1.18rem] leading-tight text-white drop-shadow-lg">
              {profile.full_name}
            </h3>
            {profile.age && (
              <span className="text-sm font-medium text-stone-300">{profile.age}</span>
            )}
            {profile.is_verified && (
              <BadgeCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 ml-auto" />
            )}
          </div>
          {profile.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={9} className="text-stone-400" />
              <span className="text-[10px] text-stone-400">{profile.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── VEDIC HERITAGE ROW ────────────────────────────────────── */}
      <div className="relative z-20 flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2
                      border-t border-gold/22 border-b border-gold/12 bg-gold/[0.03]">
        {vedicRow.length > 0 ? (
          vedicRow.map((val, i) => (
            <React.Fragment key={i}>
              <span className="text-[11px] font-medium tracking-wide text-stone-300">{val}</span>
              {i < vedicRow.length - 1 && (
                <span className="text-stone-600" aria-hidden="true">·</span>
              )}
            </React.Fragment>
          ))
        ) : (
          <span className="text-[10px] text-stone-600">Vedic details not yet filled</span>
        )}
      </div>

      {/* ── DOSHA FLAGS ───────────────────────────────────────────── */}
      {gr && (gr.nadiDosha || gr.bhakootDosha || gr.ganaDosha) && (
        <div className="relative z-20 flex-shrink-0 flex flex-wrap gap-1 px-4 py-1.5 border-b border-gold/10">
          {gr.nadiDosha    && <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded bg-orange-900/30 border border-orange-600/40 text-orange-300">⚠ Nadi Dosha</span>}
          {gr.bhakootDosha && <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded bg-red-900/25 border border-red-600/35 text-red-300">⚠ Bhakoot</span>}
          {gr.ganaDosha    && <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded bg-yellow-900/25 border border-yellow-600/35 text-yellow-300">⚠ Gana</span>}
        </div>
      )}

      {/* ── BIODATA GRID ──────────────────────────────────────────── */}
      <div className="relative z-20 flex-grow px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5 content-start">
        {(dataFields as Array<{ label: string; value: string; icon?: React.ReactNode; textClass?: string }>).map(
          ({ label, value, icon, textClass }) => (
            <div key={label} className="min-w-0">
              <p className="text-[8.5px] uppercase tracking-[0.13em] mb-0.5 font-semibold text-stone-500">
                {label}
              </p>
              <div className="flex items-center gap-1 min-w-0">
                {icon && <span className="flex-shrink-0 text-stone-500">{icon}</span>}
                <p className={`text-[11.5px] font-medium truncate leading-tight ${textClass || 'text-stone-200'}`}>
                  {value}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── ACTIONS ───────────────────────────────────────────────── */}
      <div className="relative z-20 flex gap-2 px-4 pb-4 pt-2 flex-shrink-0 border-t border-gold/10">
        {!isCollaborator && (
          <ConnectionButton
            profileId={profile.id}
            initialStatus={(profile.connectionStatus || 'none') as 'none' | 'sent' | 'received' | 'connected' | 'rejected'}
            onSendInterest={onSendInterest ?? (async () => {})}
          />
        )}

        <motion.button
          type="button"
          onClick={onToggleShortlist}
          whileTap={{ scale: 0.82 }}
          whileHover={{ scale: 1.06 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          className={`w-11 h-11 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors duration-200 ${
            isShortlisted
              ? 'border border-haldi-500/50 bg-haldi-500/10'
              : 'border border-stone-700 bg-transparent hover:border-stone-500'
          }`}
          title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
        >
          <motion.div
            animate={isShortlisted ? { scale: [1, 1.35, 1], rotate: [0, 18, -18, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Star
              size={17}
              className={isShortlisted ? 'text-haldi-400 fill-haldi-400' : 'text-stone-500'}
            />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}
