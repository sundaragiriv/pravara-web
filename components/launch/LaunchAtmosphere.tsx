"use client";

import { motion, useReducedMotion } from "framer-motion";

const ORBS = [
  { id: 1, size: 480, left: "4%", top: "8%", color: "rgba(251,191,36,0.16)", duration: 12 },
  { id: 2, size: 340, left: "74%", top: "10%", color: "rgba(245,158,11,0.14)", duration: 10 },
  { id: 3, size: 380, left: "60%", top: "62%", color: "rgba(180,83,9,0.16)", duration: 14 },
  { id: 4, size: 320, left: "12%", top: "64%", color: "rgba(251,191,36,0.12)", duration: 11 },
];

// Gold dust — more of them, larger, with size + brightness variance so the
// field reads warm and alive instead of a few faint pinpricks.
const SPARKS = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  left: `${5 + ((index * 19) % 90)}%`,
  top: `${8 + ((index * 37) % 82)}%`,
  size: 2 + (index % 4), // 2–5px
  rise: 26 + (index % 5) * 10,
  duration: 4.6 + (index % 5) * 0.7,
  delay: (index % 7) * 0.5,
  warm: index % 3 === 0, // every third is a warmer amber
}));

// Festive embers — larger, softly glowing motes that drift up slowly, like
// floating diya light. Few in number so they feel special, not busy.
const EMBERS = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  left: `${10 + ((index * 41) % 80)}%`,
  top: `${30 + ((index * 53) % 60)}%`,
  size: 5 + (index % 3) * 2, // 5–9px
  drift: index % 2 === 0 ? 14 : -14,
  duration: 9 + (index % 4) * 2,
  delay: (index % 5) * 0.9,
}));

type LaunchAtmosphereProps = {
  className?: string;
};

export default function LaunchAtmosphere({ className = "" }: LaunchAtmosphereProps) {
  const reduce = useReducedMotion();

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Base wash + subtle paper texture — always static */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_24%),linear-gradient(180deg,#090807_0%,#0d0a09_46%,#070605_100%)]" />
      <div className="absolute inset-0 launch-poster-texture opacity-50" />

      {/* One soft thread of gold near the top */}
      <div className="absolute inset-x-0 top-[20%] h-px bg-gradient-to-r from-transparent via-haldi-500/20 to-transparent" />

      {reduce ? (
        ORBS.map((orb) => (
          <div
            key={orb.id}
            className="absolute rounded-full blur-[90px]"
            style={{
              width: orb.size,
              height: orb.size,
              left: orb.left,
              top: orb.top,
              background: orb.color,
              opacity: 0.5,
            }}
          />
        ))
      ) : (
        <>
          {ORBS.map((orb) => (
            <motion.div
              key={orb.id}
              className="absolute rounded-full blur-[90px]"
              style={{
                width: orb.size,
                height: orb.size,
                left: orb.left,
                top: orb.top,
                background: orb.color,
              }}
              animate={{
                opacity: [0.32, 0.62, 0.32],
                scale: [0.96, 1.06, 0.96],
                x: [0, 12, -8, 0],
                y: [0, -10, 8, 0],
              }}
              transition={{
                duration: orb.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Slow gold shimmer sweeping diagonally across the whole scene */}
          <motion.div
            className="absolute -inset-x-1/4 inset-y-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 28%, rgba(251,191,36,0.04) 50%, transparent 72%)",
            }}
            animate={{ x: ["-18%", "18%", "-18%"] }}
            transition={{ duration: 13, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          {EMBERS.map((ember) => (
            <motion.span
              key={`ember-${ember.id}`}
              className="absolute rounded-full"
              style={{
                left: ember.left,
                top: ember.top,
                width: ember.size,
                height: ember.size,
                background:
                  "radial-gradient(circle, rgba(255,236,179,0.95) 0%, rgba(251,191,36,0.85) 45%, rgba(245,158,11,0) 72%)",
                boxShadow: "0 0 18px 4px rgba(251,191,36,0.35)",
              }}
              animate={{
                opacity: [0, 0.85, 0.7, 0],
                y: [0, -60, -120],
                x: [0, ember.drift, 0],
                scale: [0.7, 1.05, 0.85],
              }}
              transition={{
                duration: ember.duration,
                delay: ember.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          ))}

          {SPARKS.map((spark) => (
            <motion.span
              key={spark.id}
              className={`absolute rounded-full ${spark.warm ? "bg-amber-300/80" : "bg-haldi-200/80"}`}
              style={{
                left: spark.left,
                top: spark.top,
                width: spark.size,
                height: spark.size,
                boxShadow: spark.warm
                  ? "0 0 12px rgba(245,158,11,0.5)"
                  : "0 0 12px rgba(251,191,36,0.45)",
              }}
              animate={{
                opacity: [0, 0.9, 0],
                y: [0, -spark.rise * 0.5, -spark.rise],
                scale: [0.55, 1, 0.7],
              }}
              transition={{
                duration: spark.duration,
                delay: spark.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
