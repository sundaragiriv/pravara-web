"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

interface MarketingNavProps {
  isLoggedIn: boolean;
  userAvatar?: string | null;
  userName?: string | null;
  launchMode?: boolean;
  foundingCount?: number;
}

export default function MarketingNav({
  isLoggedIn,
  userAvatar,
  userName,
  launchMode = false,
  foundingCount,
}: MarketingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "P";

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-stone-950/95 backdrop-blur-md border-b border-stone-900/80 shadow-lg shadow-black/30"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center group"
          aria-label="Pravara - Modern Heritage Matrimony"
        >
          <Image
            src="/logo3.png"
            alt="Pravara - Modern Heritage Matrimony"
            width={160}
            height={54}
            className="object-contain [mix-blend-mode:lighten] group-hover:brightness-110 transition-all duration-300"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((value) => !value)}
                aria-label="Open account menu"
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-stone-900/60 border border-stone-800 hover:border-stone-700 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-haldi-900/30 border border-haldi-500/30 flex items-center justify-center flex-shrink-0">
                  {userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userAvatar} alt={userName || "You"} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-haldi-400 text-xs font-bold font-serif">{initials}</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen ? (
                <div className="absolute right-0 top-full mt-2 w-44 bg-stone-950 border border-stone-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-stone-300 hover:bg-stone-900 hover:text-haldi-400 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <div className="border-t border-stone-900" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone-400 hover:bg-stone-900 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                {launchMode ? (
                  <>
                    <span className="rounded-full border border-haldi-500/20 bg-haldi-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-haldi-400">
                      Founding cohort
                    </span>
                    {typeof foundingCount === "number" && (
                      <span className="text-stone-400">
                        {foundingCount} of 500 early members joined
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/membership"
                      className="text-stone-400 hover:text-haldi-400 transition-colors duration-200"
                    >
                      Membership
                    </Link>
                    <Link
                      href="/login"
                      className="text-stone-400 hover:text-haldi-400 transition-colors duration-200"
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
              <Link
                href={launchMode ? "/register" : "/signup"}
                className="bg-haldi-600 hover:bg-haldi-500 text-stone-950 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-105"
              >
                {launchMode ? "Register Free" : "Join Free"}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
