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

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Pravara — Vedic Matrimony, by invitation",
    template: "%s · Pravara",
  },
  description: "A modern matrimony platform rooted in heritage, compatibility, and intentional matchmaking.",
  icons: {
    icon: "/logo3.png",
    apple: "/logo3.png",
    shortcut: "/logo3.png",
  },
  openGraph: {
    title: "Pravara - Modern Heritage Matrimony",
    description: "A modern matrimony platform rooted in heritage, compatibility, and intentional matchmaking.",
    images: [{ url: "/logo3.png", width: 480, height: 200 }],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
