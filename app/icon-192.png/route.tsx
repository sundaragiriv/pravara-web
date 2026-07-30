import { ImageResponse } from "next/og";

import { iconMark } from "@/components/brand/icon-mark";

// Fixed path so app/manifest.ts can reference it — the app/icon.tsx convention
// emits a content-hashed URL, which a manifest cannot point at reliably.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(iconMark(192), { width: 192, height: 192 });
}
