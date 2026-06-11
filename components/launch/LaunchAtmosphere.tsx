"use client";

import { motion, useReducedMotion } from "framer-motion";

const ORBS = [
  { id: 1, size: 480, left: "4%", top: "8%", color: "rgba(251,191,36,0.14)", duration: 12 },
  { id: 2, size: 340, left: "74%", top: "10%", color: "rgba(245,158,11,0.12)", duration: 10 },
  { id: 3, size: 380, left: "60%", top: "62%", color: "rgba(180,83,9,0.14)", duration: 14 },
  { id: 4, size: 320, left: "12%", top: "64%", color: "rgba(251,191,36,0.10)", duration: 11 },
];

const SPARKS = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  left: `${6 + ((index * 23) % 88)}%`,
  top: `${10 + ((index * 31) % 78)}%`,
  size: 2 + (index % 2) * 2,
  duration: 5.2 + (index % 4) * 0.8,
  delay: (index % 6) * 0.4,
}));

type LaunchAtmosphereProps = {
  className?: string;
};

export default function LaunchAtmosphere({ className = "" }: LaunchAtmosphereProps) {
  const reduce = useReducedMotion();

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Base wash + subtle paper texture — always static */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_24%),linear-gradient(180deg,#090807_0%,#0d0a09_46%,#070605_100%)]" />
      <div className="absolute inset-0 launch-poster-texture opacity-50" />

      {/* One soft thread of gold near the top */}
      <div className="absolute inset-x-0 top-[20%] h-px bg-gradient-to-r from-transparent via-haldi-500/15 to-transparent" />

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
                opacity: [0.3, 0.6, 0.3],
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

          {SPARKS.map((spark) => (
            <motion.span
              key={spark.id}
              className="absolute rounded-full bg-haldi-300/70"
              style={{
                left: spark.left,
                top: spark.top,
                width: spark.size,
                height: spark.size,
                boxShadow: "0 0 14px rgba(251,191,36,0.35)",
              }}
              animate={{
                opacity: [0, 0.75, 0],
                y: [0, -22, -44],
                scale: [0.6, 1, 0.7],
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
