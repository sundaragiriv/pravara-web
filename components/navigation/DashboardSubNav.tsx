"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowLeft, Compass, Heart, MessageCircle, Star,
  LogOut, Settings, Crown, ChevronDown, User,
  SlidersHorizontal, LifeBuoy, Search,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import NotificationBell from "@/components/NotificationBell";

/* ─── Props ─────────────────────────────────────────────────── */
interface DashboardSubNavProps {
  backHref?: string;
  backLabel?: string;
  /** Show primary section links — Explore / Invitations / Chat / Shortlist */
  showDashboardNav?: boolean;
  /** Which section is currently active */
  activeSection?: "explore" | "requests" | "chat" | "shortlist";
  /** Pass-through for inline search (dashboard explorer only) */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Badge counts shown next to nav links */
  requestsBadge?: number;
  chatBadge?: number;
  shortlistBadge?: number;
}

/* ─── Nav links ──────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "/dashboard",           label: "Explore",     icon: Compass,       key: "explore"   },
  { href: "/dashboard/requests",  label: "Invitations", icon: Heart,         key: "requests"  },
  { href: "/dashboard/chat",      label: "Chat",        icon: MessageCircle, key: "chat"      },
  { href: "/dashboard/shortlist", label: "Shortlist",   icon: Star,          key: "shortlist" },
];

const TIER_COLOR: Record<string, string> = {
  Concierge: "text-purple-400",
  Gold:       "text-haldi-400",
  Basic:      "text-stone-500",
};

/* ═══════════════════════════════════════════════════════════════ */
export default function DashboardSubNav({
  backHref       = "/dashboard",
  backLabel      = "Dashboard",
  showDashboardNav = false,
  activeSection,
  searchValue    = "",
  onSearchChange,
  requestsBadge  = 0,
  chatBadge      = 0,
  shortlistBadge = 0,
}: DashboardSubNavProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const dropRef  = useRef<HTMLDivElement>(null);

  const [userName,       setUserName]       = useState<string>("");
  const [userAvatar,     setUserAvatar]     = useState<string | null>(null);
  const [membershipTier, setMembershipTier] = useState<string>("Basic");
  const [dropdownOpen,   setDropdownOpen]   = useState(false);

  /* ── Fetch user data once ─────────────────────────────────── */
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, membership_tier")
        .eq("id", user.id)
        .single();

      if (data && active) {
        setUserName((data.full_name || "").split(" ")[0] || "You");
        setUserAvatar(data.avatar_url ?? null);
        setMembershipTier(data.membership_tier || "Basic");
      }
    })();
    return () => { active = false; };
  }, []);

  /* ── Close dropdown on outside click ─────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  /* ── Derive active section from pathname when not supplied ── */
  const effectiveSection =
    activeSection ??
    (pathname === "/dashboard"                    ? "explore"
    : pathname.startsWith("/dashboard/requests")  ? "requests"
    : pathname.startsWith("/dashboard/chat")      ? "chat"
    : pathname.startsWith("/dashboard/shortlist") ? "shortlist"
    : undefined);

  const tierColor = TIER_COLOR[membershipTier] ?? TIER_COLOR.Basic;

  /* ── Badge helper ─────────────────────────────────────────── */
  const badgeFor = (key: string) => {
    if (key === "requests"  && requestsBadge  > 0) return requestsBadge;
    if (key === "chat"      && chatBadge      > 0) return chatBadge;
    if (key === "shortlist" && shortlistBadge > 0) return shortlistBadge;
    return 0;
  };

  /* ══════════════════════════════════════════════════ RENDER */
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-900 bg-stone-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

        {/* ── Logo ── */}
        <Link href="/dashboard" aria-label="Pravara — Dashboard" className="flex-shrink-0">
          <Image
            src="/logo3.png"
            alt="Pravara"
            width={110}
            height={38}
            className="object-contain [mix-blend-mode:lighten] hover:brightness-110 transition-all duration-300"
            priority
          />
        </Link>

        {/* ── Section nav (desktop) ── */}
        {showDashboardNav && (
          <div className="hidden md:flex bg-stone-900 rounded-full p-1 border border-stone-800 items-center flex-1 justify-center max-w-md">
            {NAV_LINKS.map(({ href, label, icon: Icon, key }) => {
              const isActive = effectiveSection === key;
              const badge    = badgeFor(key);
              return (
                <Link
                  key={key}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-stone-800 text-stone-200 shadow-sm"
                      : "text-stone-500 hover:text-stone-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {badge > 0 && (
                    <span className="ml-0.5 bg-haldi-600 text-stone-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Back link (detail / settings pages) ── */}
        {!showDashboardNav && (
          <Link
            href={backHref}
            className="flex items-center gap-2 text-stone-400 hover:text-haldi-500 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        )}

        {/* ── Right: search + bell + user chip ── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Inline search (dashboard only when onSearchChange provided) */}
          {onSearchChange && (
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search profiles…"
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
                className="bg-stone-900 border border-stone-800 rounded-full py-2 pl-10 pr-4 text-sm text-stone-300 w-64 focus:border-haldi-500/50 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Notification bell */}
          <NotificationBell />

          {/* ── User chip + dropdown ── */}
          <div ref={dropRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(o => !o)}
              aria-label="Open account menu"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-2 hover:bg-stone-900/60 rounded-full pl-1 pr-2.5 py-1 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-haldi-700 flex items-center justify-center text-stone-950 font-bold overflow-hidden border border-haldi-600 flex-shrink-0">
                {userAvatar
                  ? <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  : <span className="text-sm">{userName[0] || "?"}</span>
                }
              </div>

              {/* Namaste greeting + tier */}
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-sm text-stone-200">
                  <span className="text-stone-400">Namaste, </span>
                  <span className="text-haldi-400 font-semibold">{userName || "…"}</span>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${tierColor}`}>
                  {membershipTier} Member
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 transition-all hidden sm:block" />
            </button>

            {/* ── Dropdown ── */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-50">

                {/* Identity header */}
                <div className="px-4 py-3 border-b border-stone-800 bg-stone-950/40">
                  <p className="text-sm font-semibold text-stone-200 truncate">{userName}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${tierColor}`}>
                    {membershipTier} Member
                  </p>
                  {membershipTier === "Basic" && (
                    <Link
                      href="/membership"
                      onClick={() => setDropdownOpen(false)}
                      className="mt-2 block w-full text-center py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-haldi-600 to-haldi-500 text-stone-950 hover:from-haldi-500 hover:to-haldi-400 transition"
                    >
                      ✦ Upgrade to Gold
                    </Link>
                  )}
                </div>

                {/* Links */}
                <div className="py-1">
                  <DropItem href="/dashboard"              icon={Compass}           label="Dashboard"           onClose={() => setDropdownOpen(false)} />
                  <DropItem href="/dashboard/edit-profile" icon={User}              label="Edit Profile"        onClose={() => setDropdownOpen(false)} />
                  <DropItem href="/dashboard/edit-profile" icon={SlidersHorizontal} label="Partner Preferences" onClose={() => setDropdownOpen(false)} />
                  <DropItem href="/membership"             icon={Crown}             label="Membership"          onClose={() => setDropdownOpen(false)} />
                  <div className="h-px bg-stone-800 my-1" />
                  <DropItem href="/settings"               icon={Settings}          label="Account Settings"    onClose={() => setDropdownOpen(false)} />
                  <DropItem href="/support"                icon={LifeBuoy}          label="Support"             onClose={() => setDropdownOpen(false)} />
                </div>

                {/* Sign out */}
                <div className="border-t border-stone-800">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-stone-400 hover:text-red-400 hover:bg-stone-800/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      {showDashboardNav && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950/98 border-t border-stone-900 flex items-center">
          {NAV_LINKS.map(({ href, label, icon: Icon, key }) => {
            const isActive = effectiveSection === key;
            const badge    = badgeFor(key);
            return (
              <Link
                key={key}
                href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors relative ${
                  isActive ? "text-haldi-400" : "text-stone-600 hover:text-stone-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
                {badge > 0 && (
                  <span className="absolute top-1.5 right-1/4 bg-haldi-600 text-stone-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

/* ── Small helper ─────────────────────────────────────────────── */
function DropItem({
  href, icon: Icon, label, onClose,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-300 hover:text-white hover:bg-stone-800/60 transition-colors"
    >
      <Icon className="w-4 h-4 text-stone-500" />
      {label}
    </Link>
  );
}
