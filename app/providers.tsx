"use client";

import { ShortlistProvider } from "@/contexts/ShortlistContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <ShortlistProvider>{children}</ShortlistProvider>;
}
