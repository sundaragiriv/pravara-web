import type { MetadataRoute } from "next";

/**
 * Makes Pravara installable to the home screen.
 *
 * Worth more in India than anywhere else on the roadmap: it is an app-like
 * entry point with no store listing, no review, and no download over a metered
 * connection — for a large share of the target market the home screen is where
 * apps live regardless of how they got there.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pravara — Vedic Matrimony, by invitation",
    short_name: "Pravara",
    description:
      "A modern matrimony platform rooted in heritage, compatibility, and intentional matchmaking.",
    start_url: "/",
    // standalone, not fullscreen: people need the clock and battery while
    // they are talking to a family about a match.
    display: "standalone",
    orientation: "portrait",
    background_color: "#0C0A09",
    theme_color: "#0C0A09",
    categories: ["social", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
