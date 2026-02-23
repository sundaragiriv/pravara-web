import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface DashboardSubNavProps {
  backHref?: string;
  backLabel?: string;
}

export default function DashboardSubNav({
  backHref = "/dashboard",
  backLabel = "Dashboard",
}: DashboardSubNavProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-stone-900 bg-stone-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" aria-label="Pravara — Home">
          <Image
            src="/logo3.png"
            alt="Pravara"
            width={110}
            height={38}
            className="object-contain [mix-blend-mode:lighten] hover:brightness-110 transition-all duration-300"
            priority
          />
        </Link>
        <Link
          href={backHref}
          className="flex items-center gap-2 text-stone-400 hover:text-haldi-500 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      </div>
    </nav>
  );
}
