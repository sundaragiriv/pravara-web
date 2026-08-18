import ScrollMotionPause from "@/components/launch/ScrollMotionPause";

const ORBS = [
  { id: 1, size: 480, left: "4%", top: "8%", color: "rgba(251,191,36,0.16)", duration: 12 },
  { id: 2, size: 340, left: "74%", top: "10%", color: "rgba(245,158,11,0.14)", duration: 10 },
  { id: 3, size: 380, left: "60%", top: "62%", color: "rgba(180,83,9,0.16)", duration: 14 },
  { id: 4, size: 320, left: "12%", top: "64%", color: "rgba(251,191,36,0.12)", duration: 11 },
];

/*
 * The orbs kept their `blur-[90px]`.
 *
 * They were briefly redrawn as radial gradients, on the theory that animating
 * opacity behind a 90px Gaussian was forcing a re-blur every frame. Headless
 * measurement agreed loudly — 370ms per frame with the blur, 88ms without.
 * Headless Chromium composites on SwiftShader, in software. On the actual GPU
 * the blur costs nothing at all: 16.7ms with the whole atmosphere running and
 * 16.7ms with it removed entirely.
 *
 * So the gradient bought nothing real, and a pixel diff against the live build
 * put it 4.19/255 away from the blur on average with 3.78% of pixels off by
 * more than 8 — small, but a change to how the scene looks in exchange for
 * nothing. Reverted.
 */

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
 * seconds versus 11 totalling ~3.7s with motion off.
 *
 * The split is done in CSS, not JS state. It used to render the reduced set,
 * then flip a `wide` flag in an effect and add the rest — which meant the
 * desktop hero visibly popped from 2 orbs and 9 motes to 4 and 26 a beat after
 * load. Everything is rendered now and the extras carry `hidden sm:block`, so
 * the server and the client agree, nothing appears late, and a phone still
 * never paints them.
 */
const MOBILE_ORBS = 2;
const MOBILE_SPARKS = 9;
const MOBILE_EMBERS = 3;

/** Extras beyond the mobile budget are painted only from the sm breakpoint. */
const wideOnly = (index: number, mobileCount: number) =>
  index >= mobileCount ? "hidden sm:block" : "";

/**
 * The ambient scene behind the launch pages.
 *
 * This was a client component driving thirty-nine Framer Motion loops, with a
 * scroll-pause bolted on to keep them from costing frames. The pause worked by
 * swapping this whole subtree for a static one.
 * Swapping a subtree is not pausing it: React unmounted thirty-nine nodes and
 * mounted a different tree, and on the way back the sparks and embers painted
 * at the CSS default of opacity 1 before Framer's first frame landed. Sampling
 * the DOM every 40ms through one wheel scroll caught the whole field flashing
 * at full brightness six times — total mote opacity sitting at 19.04 while
 * still, then 34.00 on each rebuild. The dark ground visibly washed out as you
 * scrolled.
 *
 * The motion is identical, expressed as CSS keyframes (see globals.css) whose
 * values mirror the old Framer arrays, including the positions interpolated at
 * stops where only one property changed. Moving to CSS is what makes a real
 * pause possible: `animation-play-state: paused` freezes each element where it
 * stands and resumes from there, so the scene can stop during a scroll without
 * anything unmounting. See ScrollMotionPause.
 *
 * Measured on the GPU, scrolling the hero went from a 34.3ms median frame with
 * 56% of frames past 32ms, to 18.0ms and 9%.
 *
 * With no state and no effects left this is a server component, which also
 * takes Framer Motion out of the landing page's JavaScript.
 */
export default function LaunchAtmosphere({ className = "" }: LaunchAtmosphereProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <ScrollMotionPause />

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

      {ORBS.map((orb, index) => (
        <div
          key={orb.id}
          className={`launch-orb absolute rounded-full blur-[90px] ${wideOnly(index, MOBILE_ORBS)}`}
          style={
            {
              width: orb.size,
              height: orb.size,
              left: orb.left,
              top: orb.top,
              background: orb.color,
              "--dur": `${orb.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Slow gold shimmer sweeping diagonally across the whole scene */}
      <div
        className="launch-shimmer absolute -inset-x-1/4 inset-y-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 28%, rgba(251,191,36,0.04) 50%, transparent 72%)",
        }}
      />

      {EMBERS.map((ember) => (
        <span
          key={`ember-${ember.id}`}
          className={`launch-ember absolute rounded-full ${wideOnly(ember.id, MOBILE_EMBERS)}`}
          style={
            {
              left: ember.left,
              top: ember.top,
              width: ember.size,
              height: ember.size,
              background:
                "radial-gradient(circle, rgba(255,236,179,0.95) 0%, rgba(251,191,36,0.85) 45%, rgba(245,158,11,0) 72%)",
              boxShadow: "0 0 18px 4px rgba(251,191,36,0.35)",
              "--drift": `${ember.drift}px`,
              "--dur": `${ember.duration}s`,
              "--delay": `${ember.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {SPARKS.map((spark) => (
        <span
          key={spark.id}
          className={`launch-spark absolute rounded-full ${spark.warm ? "bg-amber-300/80" : "bg-haldi-200/80"} ${wideOnly(spark.id, MOBILE_SPARKS)}`}
          style={
            {
              left: spark.left,
              top: spark.top,
              width: spark.size,
              height: spark.size,
              boxShadow: spark.warm
                ? "0 0 12px rgba(245,158,11,0.5)"
                : "0 0 12px rgba(251,191,36,0.45)",
              "--rise": `${spark.rise}px`,
              "--dur": `${spark.duration}s`,
              "--delay": `${spark.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
