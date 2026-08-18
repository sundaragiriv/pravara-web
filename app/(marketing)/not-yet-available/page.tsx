import Link from "next/link";
import Image from "next/image";

import LaunchAtmosphere from "@/components/launch/LaunchAtmosphere";
import { CONTACT_EMAIL } from "@/lib/site";
import { servedCountryList } from "@/lib/geo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Not yet in your region",
  description: `Pravara currently serves ${servedCountryList()}.`,
  robots: { index: false, follow: false },
};

/**
 * Shown to visitors outside the launch markets.
 *
 * Written for who actually lands here: overwhelmingly diaspora families from
 * exactly the communities this is built for, in London, Sydney, Dubai,
 * Singapore. "Not yet" rather than "not you", and a way to be told when that
 * changes — a closed door with no handle would be the wrong note to end on with
 * precisely the people we most want later.
 */
export default function NotYetAvailablePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-50">
      <LaunchAtmosphere className="opacity-70" />

      <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          <Image
            src="/logo3.png"
            alt="Pravara"
            width={180}
            height={66}
            className="mx-auto w-[150px] object-contain [mix-blend-mode:lighten]"
            priority
          />

          <p className="mt-10 text-xs uppercase tracking-[0.32em] text-haldi-300">
            Not yet in your region
          </p>

          <h1 className="mt-5 text-balance font-serif text-4xl leading-[1.05] text-stone-50 md:text-5xl">
            We haven&apos;t opened where you are.
          </h1>

          <p className="mt-6 text-base leading-relaxed text-stone-300">
            Pravara is opening first in {servedCountryList()}. We would rather tell you that
            plainly than take a registration we cannot yet serve well.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-stone-400">
            If your family is looking from further afield, write to us and we will let you know the
            moment we reach you. We read every message.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Pravara in my region")}`}
            className="btn-sheen btn-festive launch-cta-glow mt-9 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-stone-950 transition-all hover:scale-[1.01] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-haldi-300 focus:ring-offset-2 focus:ring-offset-stone-950"
          >
            Tell us where you are
          </a>

          <p className="mt-10 text-xs leading-relaxed text-stone-600">
            Reached this by mistake?{" "}
            <Link href="/?geo=allow" className="text-stone-400 underline underline-offset-2 hover:text-haldi-300">
              Continue to the site
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
