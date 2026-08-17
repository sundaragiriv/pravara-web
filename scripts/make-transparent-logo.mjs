/**
 * Builds public/logo-mark.png — the Pravara mark with a real alpha channel.
 *
 *   npm run logo:build
 *
 * public/logo3.png is PNG colour type 2: RGB with no alpha at all. It is a
 * solid rectangle with the mark painted on a near-black matte (#040609). Every
 * place it appears, the site tries to hide that matte with
 * `mix-blend-mode: lighten`, which only works while the surface behind it is
 * darker than the matte. Over the atmosphere's warm orbs, over the scrolled
 * nav's `backdrop-blur` (which opens its own stacking context and can drop the
 * blend entirely), or on any lighter panel, the rectangle reappears.
 *
 * The fix is the asset. The matte is near-black and the mark is bright, so
 * luminance IS the alpha channel — this reads it out and unpremultiplies the
 * colour, which is exactly the inverse of how the mark was composited onto
 * black in the first place.
 *
 * Uses sharp, which ships with Next rather than being a dependency of ours.
 * Run it only when the source art changes; the output is committed.
 */

import { statSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "public/logo3.png";
const OUTPUT = "public/logo-mark.png";

/**
 * Below this luminance a pixel is matte and becomes fully transparent; above
 * it, alpha ramps to opaque. Set just above the sampled matte (#040609 ≈ 6/255)
 * so the matte clears completely without eating the mark's darkest gold.
 */
const FLOOR = 14;
/** Luminance at which a pixel is fully opaque. */
const CEILING = 150;

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const out = Buffer.alloc(width * height * 4);

let cleared = 0;
for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  // Max channel, NOT luma.
  //
  // Rec. 709 weights red at 0.21, so the mark's red orb — rgb(211,1,3) —
  // scored a luma of 46 and came out at alpha 60, almost see-through. The
  // question being asked here is "how far is this pixel from black", and for
  // that the brightest channel is the honest answer: the same orb scores 211
  // and stays fully opaque, while the matte at rgb(4,6,9) scores 9 and clears.
  const value = Math.max(r, g, b);

  let alpha = (value - FLOOR) / (CEILING - FLOOR);
  alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;

  if (alpha === 0) {
    cleared += 1;
    out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
    continue;
  }

  // Unpremultiply. The mark was composited onto near-black, so the stored
  // colour is roughly (true colour x alpha); dividing recovers the original
  // and stops semi-transparent edges reading as muddy.
  out[o] = Math.min(255, Math.round(r / alpha));
  out[o + 1] = Math.min(255, Math.round(g / alpha));
  out[o + 2] = Math.min(255, Math.round(b / alpha));
  out[o + 3] = Math.round(alpha * 255);
}

/**
 * Trimmed to the mark's own bounds. The source carries a lot of empty matte,
 * which as transparent pixels would still occupy layout — the reason the nav
 * logo had to be sized against a 3:2 box that the visible mark never filled.
 */
/**
 * 900px wide is generous: the largest on-screen use is the 270px hero mark,
 * so this still has headroom at 3x. The source is 1536px of mostly matte and
 * 2.1MB, which no page should carry for a logo.
 */
await sharp(out, { raw: { width, height, channels: 4 } })
  .trim({ threshold: 1 })
  .resize({ width: 900, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(OUTPUT);

const meta = await sharp(OUTPUT).metadata();
const before = statSync(SOURCE).size;
const after = statSync(OUTPUT).size;

console.log(`${SOURCE}  ${width}x${height}  ${(before / 1024 / 1024).toFixed(1)} MB  no alpha`);
console.log(`${OUTPUT}  ${meta.width}x${meta.height}  ${(after / 1024).toFixed(0)} KB  alpha: ${meta.hasAlpha}`);
console.log(`${((cleared / (width * height)) * 100).toFixed(1)}% of pixels were matte and are now fully transparent`);
console.log(`aspect ratio ${(meta.width / meta.height).toFixed(3)} — size components against this, not 3:2`);

