import Link from "next/link";

import MarketingNav from "@/components/navigation/MarketingNav";
import DoNotSellControl from "@/components/DoNotSellControl";
import { PRE_LAUNCH_ENABLED } from "@/lib/env";
import { CONTACT_EMAIL } from "@/lib/site";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Do Not Sell or Share My Personal Information",
  description:
    "Opt out of the sale or sharing of your personal information, and of cross-context behavioural advertising.",
};

/**
 * The CPRA opt-out.
 *
 * Built before any advertising tracker is switched on, not after. California
 * requires this link to exist the moment a business shares personal information
 * for cross-context behavioural advertising — which is exactly what a Meta Pixel
 * does — so shipping the Pixel first would put us out of compliance on day one.
 *
 * The honest position today is that there is nothing to opt out of. The control
 * still works and still records the choice, so anyone who sets it now is already
 * covered if that ever changes.
 */
export default async function DoNotSellPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      <MarketingNav isLoggedIn={!!user} launchMode={PRE_LAUNCH_ENABLED} />

      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-serif text-stone-100 mb-6">
            Do Not Sell or Share My Personal Information
          </h1>

          <p className="text-stone-400 leading-relaxed mb-4">
            Under the California Consumer Privacy Act, as amended by the CPRA, you may direct us not
            to sell or share your personal information, including for cross-context behavioural
            advertising.
          </p>

          <div className="rounded-2xl border border-haldi-500/20 bg-haldi-900/10 p-5 mb-10">
            <p className="text-sm leading-relaxed text-stone-300">
              <strong className="text-haldi-300">As things stand, there is nothing to opt out
              of.</strong>{" "}
              Pravara does not sell personal information and does not share it for cross-context
              behavioural advertising. We run no advertising trackers on this site.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              We have built this control anyway, so that it is here before it is needed rather than
              after. Set it now and your choice is recorded and honoured if that ever changes.
            </p>
          </div>

          <DoNotSellControl />

          <div className="mt-12 space-y-6 text-stone-400">
            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-3">What this covers</h2>
              <p className="text-sm leading-relaxed">
                Your choice is stored in this browser and applies to it. If you use Pravara on
                another device or browser, set it there too. Signed-in members can also email us and
                we will record it against the account itself, which follows you everywhere.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-3">Sensitive information</h2>
              <p className="text-sm leading-relaxed">
                Gothra, community and Vedic data reveal religious affiliation and are treated as
                sensitive personal information under California law. We use them only to calculate
                compatibility and to enforce exogamy rules — the purpose you gave them to us for —
                and never to infer characteristics about you or to target advertising.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-3">Authorised agents</h2>
              <p className="text-sm leading-relaxed">
                An authorised agent may submit this request for you with your written permission.
                Email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-haldi-500 hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                with &ldquo;Do Not Sell&rdquo; in the subject line.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-3">Your other rights</h2>
              <p className="text-sm leading-relaxed">
                Access, deletion, correction, limiting the use of sensitive information, and
                non-discrimination are all set out in the{" "}
                <Link href="/legal/privacy" className="text-haldi-500 hover:underline">
                  Privacy Policy
                </Link>
                . Exercising any of them will never cost you anything or get you worse service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
