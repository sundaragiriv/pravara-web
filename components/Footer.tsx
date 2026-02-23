import Image from "next/image";
import Link from "next/link";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-900 py-12 px-6">
      <div className="container mx-auto grid md:grid-cols-4 gap-8 text-sm">

        {/* Brand Column */}
        <div className="col-span-1 space-y-4">
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
            Tradition meets Intelligence. The modern matchmaker for families who value heritage.
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Company</h4>
          <ul className="space-y-2 text-stone-500">
            <li><Link href="/about#sutradhar" className="hover:text-haldi-500 transition-colors">About Sutradhar</Link></li>
            <li><Link href="/about#values" className="hover:text-haldi-500 transition-colors">Our Values</Link></li>
            <li><Link href="/about#contact" className="hover:text-haldi-500 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Legal</h4>
          <ul className="space-y-2 text-stone-500">
            <li><Link href="/legal/privacy" className="hover:text-haldi-500 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/legal/terms" className="hover:text-haldi-500 transition-colors">Terms of Service</Link></li>
            <li><Link href="/legal/trust" className="hover:text-haldi-500 transition-colors">Trust & Safety</Link></li>
          </ul>
        </div>

        {/* Connect Column */}
        <div className="space-y-3">
          <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs">Connect</h4>
          <Link href="/faq" className="block text-stone-500 hover:text-haldi-500 transition-colors">FAQ</Link>
          {/* Social icons — hrefs are placeholders until accounts are created */}
          <div className="flex items-center gap-4 pt-1">
            <a href="#" aria-label="Facebook" className="text-stone-600 hover:text-[#1877F2] transition-colors">
              <FacebookIcon />
            </a>
            <a href="#" aria-label="Instagram" className="text-stone-600 hover:text-[#E1306C] transition-colors">
              <InstagramIcon />
            </a>
            <a href="#" aria-label="YouTube" className="text-stone-600 hover:text-[#FF0000] transition-colors">
              <YoutubeIcon />
            </a>
          </div>
          <p className="text-stone-600">Made with ❤️ for the Community.</p>
          <p className="text-stone-700 text-xs mt-4">© 2026 Pravara Inc.</p>
        </div>

      </div>
    </footer>
  );
}
