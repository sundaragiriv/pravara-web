import { ImageResponse } from "next/og";

import { iconMark } from "@/components/brand/icon-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS fetches this on add-to-home-screen; it was pointing at a 2.1MB file.
export default function AppleIcon() {
  return new ImageResponse(iconMark(180), { ...size });
}
