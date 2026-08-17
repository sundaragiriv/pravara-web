import Image from "next/image";
import Link from "next/link";

import { CONTACT_EMAIL } from "@/lib/site";
import { createClient } from "@/utils/supabase/server";

/**
 * Reads auth itself rather than taking a prop.
 *
 * It sits in the marketing layout and on the go-live home page, so threading
 * `isLoggedIn` down would mean touching every page that renders it. As a server
 * component it can simply ask — and it needs to, because a signed-in member was
 * being offered "Register Free" in the footer of every public page.
 */
export default async function Footer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  return (
    <footer className="border-t border-stone-900 bg-stone-950 px-6 py-12 [&_a]:inline-flex [&_a]:min-h-[44px] [&_a]:items-center">
      <div className="container mx-auto grid gap-8 text-sm md:grid-cols-4">
        <div className="space-y-4">
          <Link href="/">
            <Image
              src="/logo-mark.png"
              alt="Pravara"
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
          <p className="leading-relaxed text-stone-500">
            Tradition, intelligence, and trust in one serious marriage journey.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-100">Company</h4>
          <ul className="space-y-2 text-stone-500">
            <li>
              <Link href="/about" prefetch={false} className="transition-colors hover:text-haldi-500">
                About Pravara
              </Link>
            </li>
            <li>
              <Link href="/about#values" prefetch={false} className="transition-colors hover:text-haldi-500">
                Our Values
              </Link>
            </li>
            <li>
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="transition-colors hover:text-haldi-500"
              >
                {isLoggedIn ? "My Dashboard" : "Register Free"}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-100">Legal</h4>
          <ul className="space-y-2 text-stone-500">
            <li>
              <Link href="/legal/privacy" prefetch={false} className="transition-colors hover:text-haldi-500">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms" prefetch={false} className="transition-colors hover:text-haldi-500">
                Terms of Service
              </Link>
            </li>
            {/* CPRA requires this exact link text, and requires it to be
                reachable from every page — hence the footer rather than a
                settings screen. */}
            <li>
              <Link href="/legal/do-not-sell" prefetch={false} className="transition-colors hover:text-haldi-500">
                Do Not Sell or Share My Personal Information
              </Link>
            </li>
            <li>
              <Link href="/legal/trust" prefetch={false} className="transition-colors hover:text-haldi-500">
                Trust & Safety
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-100">Connect</h4>
          <Link href="/support" prefetch={false} className="block text-stone-500 transition-colors hover:text-haldi-500">
            Support Center
          </Link>
          <Link href="/faq" className="block text-stone-500 transition-colors hover:text-haldi-500">
            FAQ
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="block text-stone-500 transition-colors hover:text-haldi-500"
          >
            {CONTACT_EMAIL}
          </a>
          <p className="text-stone-600">Built for families who value clarity, trust, and cultural fit.</p>
          <p className="mt-4 text-xs text-stone-700">(c) 2026 Pravara Inc.</p>
        </div>
      </div>
    </footer>
  );
}
