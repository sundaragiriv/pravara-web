"use client";

import { motion } from "framer-motion";

interface NaradaAvatarProps {
  size?: "sm" | "lg";
  /** Show the Om glyph + rings (full presence). False = icon-only mode for header */
  full?: boolean;
}

/**
 * Narada — the divine sage and original matchmaker of Hindu mythology.
 * Depicted with his veena, carrying messages between worlds and facilitating sacred unions.
 *
 * Small (sm): 40px icon for chat header / nav
 * Large (lg): 160px hero presence for the empty-chat welcome state
 */
export default function NaradaAvatar({ size = "sm", full = false }: NaradaAvatarProps) {
  if (size === "sm") {
    return (
      <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0">
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-haldi-500/30"
          animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Inner glow circle */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-haldi-500/20 to-amber-900/30 border border-haldi-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.15)]">
          {/* OM glyph */}
          <span
            className="text-haldi-400 font-serif leading-none select-none"
            style={{ fontSize: "18px", lineHeight: 1, fontFamily: "serif" }}
          >
            ॐ
          </span>
        </div>
      </div>
    );
  }

  // ── LARGE hero avatar ─────────────────────────────────────────────────────
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: 160, height: 160 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Ring 3 — outermost, slow pulse */}
      <motion.div
        className="absolute rounded-full border border-haldi-500/15"
        style={{ width: 160, height: 160 }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.05, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      {/* Ring 2 — rotating dashed halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 128,
          height: 128,
          border: "1.5px dashed rgba(234,179,8,0.25)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      {/* Ring 1 — steady glow ring */}
      <motion.div
        className="absolute rounded-full border border-haldi-500/40"
        style={{ width: 100, height: 100 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core circle */}
      <div
        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-haldi-900/60 via-stone-900/80 to-stone-950"
        style={{
          width: 88,
          height: 88,
          boxShadow: "0 0 32px rgba(234,179,8,0.18), 0 0 8px rgba(234,179,8,0.1) inset",
          border: "1px solid rgba(234,179,8,0.35)",
        }}
      >
        {/* OM glyph — the divine word */}
        <motion.span
          className="text-haldi-400 font-serif select-none"
          style={{ fontSize: "44px", lineHeight: 1, fontFamily: "serif" }}
          animate={{ opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ॐ
        </motion.span>

        {/* Subtle light ray */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, rgba(234,179,8,0.12) 0%, transparent 70%)",
          }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Veena dots — 3 small orbiting particles suggesting the divine instrument */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-haldi-500/60"
          style={{ width: 6, height: 6 }}
          animate={{
            rotate: [deg, deg + 360],
            x: [
              Math.cos((deg * Math.PI) / 180) * 56,
              Math.cos(((deg + 360) * Math.PI) / 180) * 56,
            ],
            y: [
              Math.sin((deg * Math.PI) / 180) * 56,
              Math.sin(((deg + 360) * Math.PI) / 180) * 56,
            ],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  );
}
