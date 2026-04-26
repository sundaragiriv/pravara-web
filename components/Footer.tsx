import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-stone-900 bg-stone-950 px-6 py-12">
      <div className="container mx-auto grid gap-8 text-sm md:grid-cols-4">
        <div className="space-y-4">
          <Link href="/">
            <Image
              src="/logo3.png"
              alt="Pravara"
              width={120}
              height={40}
              className="object-contain [mix-blend-mode:lighten]"
            />
          </Link>
          <p className="leading-relaxed text-stone-500">
            Tradition meets intelligence. A modern matchmaking platform for families who value heritage,
            safety, and clear intent.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-100">Company</h4>
          <ul className="space-y-2 text-stone-500">
            <li>
              <Link href="/about" className="transition-colors hover:text-haldi-500">
                About Pravara
              </Link>
            </li>
            <li>
              <Link href="/about#values" className="transition-colors hover:text-haldi-500">
                Our Values
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-haldi-500">
                Register Free
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-100">Legal</h4>
          <ul className="space-y-2 text-stone-500">
            <li>
              <Link href="/legal/privacy" className="transition-colors hover:text-haldi-500">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="transition-colors hover:text-haldi-500">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/legal/trust" className="transition-colors hover:text-haldi-500">
                Trust & Safety
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-100">Connect</h4>
          <Link href="/support" className="block text-stone-500 transition-colors hover:text-haldi-500">
            Support Center
          </Link>
          <Link href="/faq" className="block text-stone-500 transition-colors hover:text-haldi-500">
            FAQ
          </Link>
          <a
            href="mailto:support@pravara.com"
            className="block text-stone-500 transition-colors hover:text-haldi-500"
          >
            support@pravara.com
          </a>
          <p className="text-stone-600">Built for families who value clarity, trust, and cultural fit.</p>
          <p className="mt-4 text-xs text-stone-700">(c) 2026 Pravara Inc.</p>
        </div>
      </div>
    </footer>
  );
}
