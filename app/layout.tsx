import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SutradharWidget from "@/components/SutradharWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Pravara | Tradition meets Intelligence",
  description: "AI-Powered Matrimony for the Brahmin Community",
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
      </body>
    </html>
  );
}