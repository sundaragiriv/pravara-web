import type { ReactElement } from "react";

/**
 * The Pravara mark, drawn as layout rather than resampled from logo3.png —
 * that file is a 2.1MB raster and was serving as both favicon and
 * apple-touch-icon, which iOS fetches on add-to-home-screen.
 *
 * Shared by app/icon.tsx, app/apple-icon.tsx and the manifest icon routes so
 * every size is struck from the same die.
 */
const GOLD = "#E8C56B";
const GOLD_DEEP = "#C9A24A";
const GROUND = "#0C0A09";

/**
 * @param size   pixel dimensions
 * @param masked Android crops maskable icons to a circle or squircle, so the
 *               mark has to sit inside the safe zone or it loses its rim.
 */
export function iconMark(size: number, masked = false): ReactElement {
  const inner = Math.round(size * (masked ? 0.6 : 0.84));
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: GROUND,
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: `${Math.max(2, Math.round(size * 0.035))}px solid ${GOLD_DEEP}`,
          color: GOLD,
          fontSize: Math.round(inner * 0.6),
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          lineHeight: 1,
          // A serif P sits high in its em box; nudge it back to optical centre.
          paddingBottom: Math.round(inner * 0.07),
        }}
      >
        P
      </div>
    </div>
  );
}
