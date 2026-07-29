/**
 * Ceremonial watermark behind the hero — a geometric mandala at very low
 * opacity. Deliberately a static SVG rather than another animated layer: it
 * adds Vedic weight through form, and costs nothing to paint on mobile.
 */
const PETAL_COUNT = 16;
const INNER_PETAL_COUNT = 8;

export default function MandalaWatermark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none select-none ${className}`}
    >
      <g fill="none" stroke="currentColor" strokeWidth="0.7">
        {/* Concentric rings */}
        <circle cx="200" cy="200" r="52" />
        <circle cx="200" cy="200" r="86" />
        <circle cx="200" cy="200" r="132" strokeWidth="1" />
        <circle cx="200" cy="200" r="140" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="184" strokeWidth="0.5" />

        {/* Outer petal ring */}
        {Array.from({ length: PETAL_COUNT }, (_, i) => (
          <ellipse
            key={`outer-${i}`}
            cx="200"
            cy="140"
            rx="17"
            ry="46"
            transform={`rotate(${(360 / PETAL_COUNT) * i} 200 200)`}
          />
        ))}

        {/* Inner petal ring, offset so the two rings interleave */}
        {Array.from({ length: INNER_PETAL_COUNT }, (_, i) => (
          <ellipse
            key={`inner-${i}`}
            cx="200"
            cy="168"
            rx="11"
            ry="28"
            transform={`rotate(${(360 / INNER_PETAL_COUNT) * i + 22.5} 200 200)`}
          />
        ))}

        {/* Spokes out to the rim */}
        {Array.from({ length: PETAL_COUNT }, (_, i) => (
          <line
            key={`spoke-${i}`}
            x1="200"
            y1="16"
            x2="200"
            y2="60"
            transform={`rotate(${(360 / PETAL_COUNT) * i} 200 200)`}
          />
        ))}

        <circle cx="200" cy="200" r="14" />
      </g>
    </svg>
  );
}
