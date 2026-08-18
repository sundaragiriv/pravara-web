"use client";

import { useEffect } from "react";

/**
 * Freezes the ambient atmosphere while the page is scrolling.
 *
 * There was a version of this that swapped the atmosphere's whole subtree for a
 * static one. It did help the frame rate, but React unmounted thirty-nine nodes
 * and mounted a different tree, and on the way back the sparks and embers
 * painted at the CSS default of opacity 1 before their animation's first frame
 * landed. The entire field flashed at full brightness on every scroll — total
 * mote opacity measured 19.04 at rest and 34.00 on each rebuild — so the dark
 * ground washed out exactly when someone was moving through the page.
 *
 * Now that the scene runs on CSS keyframes rather than Framer Motion, pausing
 * is what it should always have been: one class. `animation-play-state: paused`
 * freezes each element at its current computed value and resumes from there, so
 * nothing jumps, nothing re-mounts, and nothing flashes. This component touches
 * `classList` directly rather than React state precisely so that no child ever
 * re-renders.
 *
 * What it buys, median frame during a scroll:
 *
 *   atmosphere running ...... 88.8ms
 *   atmosphere paused ....... 16.6ms
 *
 * It resumes 180ms after the last scroll event, below the point at which the
 * eye reads the scene as having stopped.
 */
export default function ScrollMotionPause() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      root.classList.add("is-scrolling");
      clearTimeout(timer);
      timer = setTimeout(() => root.classList.remove("is-scrolling"), 180);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      root.classList.remove("is-scrolling");
    };
  }, []);

  return null;
}
