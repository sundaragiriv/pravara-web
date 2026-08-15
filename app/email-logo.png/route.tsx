import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/**
 * Email header: the real Pravara mark over the same warm glow the site hero
 * uses, so the email and pravara.ai are visibly the same brand.
 *
 * An earlier version drew a plain "PRAVARA" wordmark instead. Side by side with
 * the site it was obviously a different mark — no mandala, no red orb, and a
 * tagline ("Vedic matrimony, by invitation") that contradicted the one actually
 * in the logo ("Modern Heritage Matrimony").
 *
 * public/logo3.png is 1536x1024 and 2.1MB, which no email can carry. Rendering
 * it through ImageResponse resamples it to header size and a few tens of KB,
 * with no image library and no second asset to keep in sync — the source of
 * truth stays the same file the site uses.
 *
 * The glow is baked into the image because email clients do not render CSS
 * gradients reliably; as pixels it looks the same everywhere.
 */
export const dynamic = "force-static";

// Displayed at 600px (the full card width) so the logo's own dark matte meets
// the card edges instead of floating as a visible rectangle — the site hides
// that matte with mix-blend-mode, which no email client supports. 2x for retina.
const WIDTH = 900;
const HEIGHT = 260;

/**
 * The logo's own matte, sampled from the top-left pixel of logo3.png. Matching
 * it exactly is what removes the seam — the mark is darker than the site
 * background (#0C0A09), so anything else framed it in a visible rectangle.
 */
const MATTE = "#040609";

export function GET() {
  const logo = readFileSync(join(process.cwd(), "public", "logo3.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: MATTE,
        }}
      >
        <img
          src={logoSrc}
          height={HEIGHT}
          alt=""
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
