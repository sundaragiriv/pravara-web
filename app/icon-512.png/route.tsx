import { ImageResponse } from "next/og";

import { iconMark } from "@/components/brand/icon-mark";

// Fixed path so app/manifest.ts can reference it — the app/icon.tsx convention
// emits a content-hashed URL, which a manifest cannot point at reliably.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(iconMark(512), { width: 512, height: 512 });
}
