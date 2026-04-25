import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-900 py-12 px-6">
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
          <p className="text-stone-500 leading-relaxed">
            Tradition meets intelligence. A modern matchmaking platform for families who value heritage,
            safety, and clear intent.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Company</h4>
          <ul className="space-y-2 text-stone-500">
            <li>
              <Link href="/about" className="hover:text-haldi-500 transition-colors">
                About Pravara
              </Link>
            </li>
            <li>
              <Link href="/about#values" className="hover:text-haldi-500 transition-colors">
                Our Values
              </Link>
            </li>
            <li>
              <Link href="/membership" className="hover:text-haldi-500 transition-colors">
                Membership
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Legal</h4>
          <ul className="space-y-2 text-stone-500">
            <li>
              <Link href="/legal/privacy" className="hover:text-haldi-500 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" className="hover:text-haldi-500 transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/legal/trust" className="hover:text-haldi-500 transition-colors">
                Trust & Safety
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Connect</h4>
          <Link href="/support" className="block text-stone-500 hover:text-haldi-500 transition-colors">
            Support Center
          </Link>
          <Link href="/faq" className="block text-stone-500 hover:text-haldi-500 transition-colors">
            FAQ
          </Link>
          <a
            href="mailto:support@pravara.com"
            className="block text-stone-500 hover:text-haldi-500 transition-colors"
          >
            support@pravara.com
          </a>
          <p className="text-stone-600">Built for families who value clarity, trust, and cultural fit.</p>
          <p className="text-stone-700 text-xs mt-4">© 2026 Pravara Inc.</p>
        </div>
      </div>
    </footer>
  );
}
