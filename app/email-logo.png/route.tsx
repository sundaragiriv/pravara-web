import { ImageResponse } from "next/og";

/**
 * Wordmark for transactional email, at a size email can actually carry.
 *
 * public/logo3.png is 2.1MB — unusable in an email, where many clients cap the
 * whole message and most people are on mobile data. Drawn instead, so it is a
 * few KB and crisp on retina at 2x the display size.
 *
 * Served from pravara.ai, which matters: images from a verified sending domain
 * are less likely to be blocked than a third-party CDN.
 */
export const dynamic = "force-static";

const GOLD = "#E8C56B";
const GOLD_DEEP = "#C9A24A";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // Transparent is unreliable in Outlook, which composites it on white.
          // The mail is dark, so match its ground exactly.
          background: "#0C0A09",
        }}
      >
        <div
          style={{
            fontSize: 62,
            letterSpacing: 18,
            color: GOLD,
            fontFamily: "Georgia, serif",
            display: "flex",
          }}
        >
          PRAVARA
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
          <div style={{ width: 70, height: 1, background: GOLD_DEEP, opacity: 0.7 }} />
          <div
            style={{
              width: 9,
              height: 9,
              background: GOLD,
              transform: "rotate(45deg)",
              margin: "0 14px",
            }}
          />
          <div style={{ width: 70, height: 1, background: GOLD_DEEP, opacity: 0.7 }} />
        </div>
        <div
          style={{
            fontSize: 17,
            letterSpacing: 7,
            color: "#A8A29E",
            fontFamily: "Georgia, serif",
            marginTop: 18,
            display: "flex",
          }}
        >
          VEDIC MATRIMONY, BY INVITATION
        </div>
      </div>
    ),
    { width: 1120, height: 300 },
  );
}
