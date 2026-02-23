import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Compass, Heart, MessageCircle, Star } from "lucide-react";

interface DashboardSubNavProps {
  backHref?: string;
  backLabel?: string;
  /** Show primary section links (used on core dashboard pages like Requests, Chat, Shortlist) */
  showDashboardNav?: boolean;
  /** Which section is currently active — used to highlight the active tab */
  activeSection?: "explore" | "requests" | "chat" | "shortlist";
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Explore",     icon: Compass,        key: "explore"   },
  { href: "/dashboard/requests",  label: "Invitations", icon: Heart,          key: "requests"  },
  { href: "/dashboard/chat",      label: "Chat",        icon: MessageCircle,  key: "chat"      },
  { href: "/dashboard/shortlist", label: "Shortlist",   icon: Star,           key: "shortlist" },
];

export default function DashboardSubNav({
  backHref = "/dashboard",
  backLabel = "Sutradhar",
  showDashboardNav = false,
  activeSection,
}: DashboardSubNavProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-900 bg-stone-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" aria-label="Pravara — Home" className="flex-shrink-0">
          <Image
            src="/logo3.png"
            alt="Pravara"
            width={110}
            height={38}
            className="object-contain [mix-blend-mode:lighten] hover:brightness-110 transition-all duration-300"
            priority
          />
        </Link>

        {/* Section nav (primary dashboard pages) */}
        {showDashboardNav && (
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ href, label, icon: Icon, key }) => {
              const isActive = activeSection === key;
              return (
                <Link
                  key={key}
                  href={href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-stone-800 text-white"
                      : "text-stone-500 hover:text-stone-200 hover:bg-stone-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Back link (detail pages) OR spacer */}
        {!showDashboardNav ? (
          <Link
            href={backHref}
            className="flex items-center gap-2 text-stone-400 hover:text-haldi-500 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        ) : (
          /* Mobile back link when showDashboardNav is true */
          <Link
            href="/dashboard"
            className="flex md:hidden items-center gap-1.5 text-stone-400 hover:text-haldi-500 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Sutradhar
          </Link>
        )}

      </div>
    </nav>
  );
}
