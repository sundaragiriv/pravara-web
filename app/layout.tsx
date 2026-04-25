import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";

import SutradharWidget from "@/components/SutradharWidget";
import { getSiteUrl } from "@/lib/env";

import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Pravara | Modern Heritage Matrimony",
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
        <Providers>
          {children}
          <SutradharWidget />
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
