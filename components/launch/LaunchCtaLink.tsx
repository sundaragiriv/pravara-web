"use client";

import Link, { type LinkProps } from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

import { trackLaunchEvent } from "./launch-client";

type LaunchCtaLinkProps = LinkProps & {
  source: string;
  className?: string;
  children: ReactNode;
};

/** Beyond this distance (px) from the button, the glow is at rest. */
const PROXIMITY_RADIUS = 420;

export default function LaunchCtaLink({
  href,
  source,
  className,
  children,
  ...rest
}: LaunchCtaLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  // The CTA answers the pointer: its gold glow warms as you approach and
  // settles when you move away. Deliberately gated to devices with a real
  // pointer and no reduced-motion preference, so touch users pay nothing —
  // no listener is attached at all on phones.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const rect = el.getBoundingClientRect();
      const dx = pending.x - (rect.left + rect.width / 2);
      const dy = pending.y - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      // 0 at the edge of the radius → 1 on the button itself.
      const nearness = Math.max(0, 1 - distance / PROXIMITY_RADIUS);
      el.style.setProperty("--cta-nearness", nearness.toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      pending = { x: event.clientX, y: event.clientY };
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onLeave = () => el.style.setProperty("--cta-nearness", "0");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Link
      {...rest}
      ref={ref}
      href={href}
      className={`cta-proximity ${className ?? ""}`}
      onClick={() => {
        trackLaunchEvent({
          event: "launch_register_click",
          path: typeof window !== "undefined" ? window.location.pathname : "/",
          source,
        });
      }}
    >
      {children}
    </Link>
  );
}
