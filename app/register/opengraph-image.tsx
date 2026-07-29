import { ImageResponse } from "next/og";

// Share card for /register. Without this file the route falls back to the
// root openGraph.images entry, which renders as a stretched 480x200 logo.
export const alt = "Join the Founder Circle — Pravara";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function RegisterOpengraphImage() {
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
          background: "radial-gradient(circle at 50% 30%, #1c1410 0%, #0c0a09 60%)",
          color: "#faf7f2",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 12,
            color: "#d6a93b",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Pravara
        </div>

        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            color: "#faf7f2",
            marginTop: 28,
            display: "flex",
            textAlign: "center",
          }}
        >
          Join the Founder Circle
        </div>

        <div style={{ width: 120, height: 3, background: "#d6a93b", opacity: 0.6, marginTop: 34 }} />

        <div
          style={{
            fontSize: 34,
            color: "#d6d3d1",
            marginTop: 34,
            display: "flex",
          }}
        >
          1,000 seats. Vedic matrimony, by invitation.
        </div>
      </div>
    ),
    { ...size },
  );
}
