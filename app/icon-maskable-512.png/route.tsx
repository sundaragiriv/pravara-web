import { ImageResponse } from "next/og";

import { iconMark } from "@/components/brand/icon-mark";

export const dynamic = "force-static";

// `masked` keeps the mark inside Android's safe zone — a full-bleed icon gets
// its rim cropped off by the launcher.
export function GET() {
  return new ImageResponse(iconMark(512, true), { width: 512, height: 512 });
}
