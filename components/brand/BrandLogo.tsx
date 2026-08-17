import Image from "next/image";

/**
 * The Pravara mark.
 *
 * One component because there were sixteen hand-tuned copies of the same
 * `<Image>`, each with its own width/height guess and its own
 * `mix-blend-mode: lighten` — a workaround for the source asset having no alpha
 * channel at all. `logo3.png` is PNG colour type 2: a solid rectangle with the
 * mark painted on a near-black matte. The blend mode hid that matte only while
 * whatever sat behind it was darker still, so the square reappeared over the
 * atmosphere's warm orbs, over the scrolled nav's backdrop-blur, and anywhere
 * light.
 *
 * `logo-mark.png` has real transparency (see scripts/make-transparent-logo.mjs)
 * and blends on any surface with no blend mode at all.
 *
 * Height is the sized dimension because every place this appears is
 * constrained vertically — a nav bar, a card header, a hero stack. Width
 * follows the mark's own 1.438 ratio, which is what stopped the nav logo
 * overflowing when it was being sized against a made-up 3:2.
 */

/** The trimmed asset's true aspect. Keep in step with the build script. */
const ASPECT = 1.438;

export default function BrandLogo({
  height = 48,
  className = "",
  priority = false,
  alt = "Pravara — Modern Heritage Matrimony",
}: {
  /** Rendered height in CSS pixels. Width follows the mark's own ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const width = Math.round(height * ASPECT);

  return (
    <Image
      src="/logo-mark.png"
      alt={alt}
      width={width * 2}
      height={height * 2}
      style={{ height, width: "auto" }}
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}
