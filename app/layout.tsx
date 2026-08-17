import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import MetaPixel from "@/components/analytics/MetaPixel";
import SutradharWidget from "@/components/SutradharWidget";
import { getSiteUrl } from "@/lib/env";

import "./globals.css";
import { Providers } from "./providers";

// `display: swap` paints immediately in a fallback and swaps when the webfont
// arrives; `adjustFontFallback` (on by default, stated here because it is the
// point) synthesises a fallback with matching metrics so that swap does not
// move any text. Without it the page visibly reflowed from Times New Roman.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Pravara — Vedic Matrimony, by invitation",
    template: "%s · Pravara",
  },
  description: "A modern matrimony platform rooted in heritage, compatibility, and intentional matchmaking.",
  // Resolved against metadataBase; each page inherits its own path.
  alternates: { canonical: "/" },
  // No `icons` block: app/icon.tsx and app/apple-icon.tsx supply them. These
  // previously all pointed at /logo3.png — a 2.1MB raster being served as a
  // favicon, and fetched by iOS on add-to-home-screen.
  openGraph: {
    title: "Pravara — Vedic Matrimony, by invitation",
    description: "A modern matrimony platform rooted in heritage, compatibility, and intentional matchmaking.",
    // No `images` here: the file-based opengraph-image conventions supply the
    // right 1200x630 card per route. Hardcoding one would shadow them.
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // Browser extensions write attributes onto <html> before React hydrates
      // — Scribe's `data-scribe-recorder-ready` is one — and React reports the
      // difference as a hydration mismatch that reads like an application bug.
      // <body> was already suppressed for the same reason; <html> was not.
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-stone-950 text-stone-50 antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Pravara",
              url: getSiteUrl(),
              logo: `${getSiteUrl()}/logo3.png`,
              description:
                "Vedic matrimony, by invitation — modern, trust-first matchmaking rooted in heritage.",
            }),
          }}
        />
        <Providers>
          <MetaPixel />
          {children}
          <SutradharWidget />
          <Toaster position="top-center" richColors closeButton />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
