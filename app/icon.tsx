import { ImageResponse } from "next/og";

import { iconMark } from "@/components/brand/icon-mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Replaces the 2.1MB logo3.png that layout.tsx was declaring as the favicon.
export default function Icon() {
  return new ImageResponse(iconMark(64), { ...size });
}
