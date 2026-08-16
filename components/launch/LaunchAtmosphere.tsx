"use client";

import { useEffect, useState } from "react";
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

/**
 * Small screens get a pared-back field. Measured at 4x CPU throttle on a 390px
 * viewport, the full atmosphere produced 52 long tasks totalling ~6.6s over six
 * seconds versus 11 totalling ~3.7s with motion off — roughly 2.8s of extra
 * main-thread blocking, which is felt as scroll jank and delayed taps.
 *
 * Rendering the reduced set first also keeps SSR and hydration identical; the
 * full field is added after mount, and only on a wide viewport.
 */
const MOBILE_ORBS = 2;
const MOBILE_SPARKS = 9;
const MOBILE_EMBERS = 3;

export default function LaunchAtmosphere({ className = "" }: LaunchAtmosphereProps) {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);

  /**
   * Ambient motion stops while the page is scrolling.
   *
   * The scene animates about forty elements continuously, six of them behind
   * 64–90px blurs. That is affordable when the page is still and the compositor
   * has nothing else to do; during a scroll it competes directly with the thing
   * the reader is actually asking for. Measured on the live site at a 29.6ms
   * median frame with 28% of frames past 32ms.
   *
   * Pausing rather than reducing keeps the scene exactly as designed when
   * anyone is looking at it, and hands the whole frame budget to the scroll
   * while they are moving. It resumes 160ms after the last scroll event, which
   * is below the threshold at which the eye reads it as having stopped.
   */
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const orbs = wide ? ORBS : ORBS.slice(0, MOBILE_ORBS);
  const sparks = wide ? SPARKS : SPARKS.slice(0, MOBILE_SPARKS);
  const embers = wide ? EMBERS : EMBERS.slice(0, MOBILE_EMBERS);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Base wash + subtle paper texture — always static */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_24%),linear-gradient(180deg,#090807_0%,#0d0a09_46%,#070605_100%)]" />
      <div className="absolute inset-0 launch-poster-texture opacity-50" />

      {/* A band of warmth high in the frame.

          This was a 1px rule running edge to edge, and it was the only hard
          edge in a scene made entirely of blurred light — so it read as a seam
          rather than as atmosphere. Worse, the cards above it are translucent
          with a backdrop blur, so the line carried straight through them and
          looked like a crack across the card.

          Same intent, expressed as light: an ellipse that is soft at every
          edge and falls off well before the sides, so there is nothing for the
          eye to read as a divider. */}
      <div
        className="absolute left-1/2 top-[19%] h-40 w-[min(1100px,86%)] -translate-x-1/2 -translate-y-1/2 blur-[64px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(251,191,36,0.13) 0%, rgba(245,158,11,0.06) 42%, transparent 70%)",
        }}
      />

      {reduce || scrolling ? (
        orbs.map((orb) => (
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
          {orbs.map((orb) => (
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
              // `scale` used to be in here, and it was the whole problem. Scaling
              // a 480px element behind a 90px blur forces the blur to be
              // recomputed every frame — measured at a 40.6ms median frame
              // during scroll, with 94% of frames below 30fps. Translation and
              // opacity are compositor-only, so the same drift costs almost
              // nothing. The movement is widened slightly to keep the life the
              // scale gave it.
              animate={{
                opacity: [0.32, 0.62, 0.32],
                x: [0, 18, -12, 0],
                y: [0, -16, 12, 0],
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

          {embers.map((ember) => (
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
              }}
              transition={{
                duration: ember.duration,
                delay: ember.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            />
          ))}

          {sparks.map((spark) => (
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
              // Same reasoning as the orbs, at smaller scale: these carry a
              // box-shadow glow, and scaling one repaints the shadow each frame.
              animate={{
                opacity: [0, 0.9, 0],
                y: [0, -spark.rise * 0.5, -spark.rise],
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
