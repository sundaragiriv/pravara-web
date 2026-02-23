import Link from "next/link";
import Image from "next/image";

// Minimal header for Login / Signup pages — logo only, no distractions
export default function AuthNav() {
  return (
    <nav className="w-full border-b border-stone-900 bg-stone-950">
      <div className="container mx-auto px-6 h-16 flex items-center justify-center">
        <Link href="/" aria-label="Pravara — Back to home">
          <Image
            src="/logo3.png"
            alt="Pravara — Modern Heritage Matrimony"
            width={130}
            height={44}
            className="object-contain [mix-blend-mode:lighten] hover:brightness-110 transition-all duration-300"
            priority
          />
        </Link>
      </div>
    </nav>
  );
}
