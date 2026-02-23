import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import SutradharWidget from "@/components/SutradharWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pravara.com"),
  title: "Pravara | Modern Heritage Matrimony",
  description: "AI-Powered Vedic Matrimony for the Brahmin Community. Join 500 founding members.",
  icons: {
    icon: "/logo3.png",
    apple: "/logo3.png",
    shortcut: "/logo3.png",
  },
  openGraph: {
    title: "Pravara — Modern Heritage Matrimony",
    description: "AI-Powered Vedic Matrimony for the Brahmin Community",
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
        {children}
        <SutradharWidget />
        {/* Sonner Toaster for global toast notifications */}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}