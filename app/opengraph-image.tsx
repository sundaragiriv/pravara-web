import { ImageResponse } from "next/og";

// Branded social-share card (WhatsApp/Facebook/X) for pravara.ai. 1200×630.
export const alt = "Pravara — Vedic matrimony, by invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background:
            "radial-gradient(circle at 50% 30%, #1c1410 0%, #0c0a09 60%)",
          color: "#faf7f2",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 14,
            color: "#d6a93b",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          By Invitation
        </div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: 18,
            color: "#e5b94e",
            marginTop: 8,
            display: "flex",
          }}
        >
          PRAVARA
        </div>
        <div style={{ width: 120, height: 3, background: "#d6a93b", opacity: 0.6, marginTop: 8 }} />
        <div
          style={{
            fontSize: 40,
            color: "#e7e5e4",
            marginTop: 36,
            display: "flex",
          }}
        >
          Vedic Matrimony, reimagined.
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#a8a29e",
            marginTop: 16,
            display: "flex",
          }}
        >
          The founding circle is open — 3 months premium, free.
        </div>
      </div>
    ),
    { ...size },
  );
}
