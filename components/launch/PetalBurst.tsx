"use client";

import { motion, useReducedMotion } from "framer-motion";

// Marigold + gold palette — warm, auspicious, festive.
const COLORS = ["#f59e0b", "#fbbf24", "#fb923c", "#fcd34d", "#fff3c4"];

// Deterministic radial burst with a gentle upward bias, so it reads like a
// celebratory pop of petals and gold rather than a uniform ring.
const PETALS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2 + (i % 3) * 0.26;
  const distance = 120 + (i % 5) * 46;
  return {
    id: i,
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance - 70, // upward bias
    size: 7 + (i % 4) * 2,
    color: COLORS[i % COLORS.length],
    spin: i % 2 === 0 ? 200 : -200,
    duration: 1.1 + (i % 4) * 0.25,
    delay: (i % 6) * 0.04,
    petal: i % 2 === 0, // alternate petal vs round gold speck
  };
});

/**
 * One-shot celebratory burst of marigold petals + gold flecks. Mounts when a
 * founder reserves their seat. Purely decorative; respects reduced-motion.
 */
export default function PetalBurst() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-10 z-10 h-0 w-0 -translate-x-1/2 overflow-visible"
    >
      {PETALS.map((p) => (
        <motion.span
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.petal ? "50% 0 50% 0" : "9999px",
            boxShadow: `0 0 8px ${p.color}99`,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{
            x: p.dx,
            y: [0, p.dy, p.dy + 40],
            opacity: [0, 1, 1, 0],
            scale: [0.4, 1, 0.9],
            rotate: p.spin,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
            times: [0, 0.25, 0.7, 1],
          }}
        />
      ))}
    </div>
  );
}
