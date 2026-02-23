import MarketingNav from "@/components/navigation/MarketingNav";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Terms of Service | Pravara",
  description: "The terms governing your use of the Pravara platform.",
};

const LAST_UPDATED = "February 2026";

export default async function TermsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      <MarketingNav isLoggedIn={!!user} />

      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <p className="text-stone-500 text-sm mb-2">Last updated: {LAST_UPDATED}</p>
          <h1 className="text-4xl font-serif text-stone-100 mb-8">Terms of Service</h1>
          <p className="text-stone-400 leading-relaxed mb-12">
            By creating a Pravara account, you agree to these terms. Please read them. They are written in plain English — not legalese.
          </p>

          <div className="space-y-12 text-stone-400">

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">1. Who can use Pravara</h2>
              <ul className="space-y-3 list-none">
                {[
                  "You must be 18 years of age or older.",
                  "You must be legally single — unmarried, or divorced, or widowed.",
                  "You must provide accurate information about yourself. False profiles are subject to immediate removal.",
                  "You must not create accounts on behalf of others without their explicit consent.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">2. Acceptable use</h2>
              <p className="text-sm leading-relaxed mb-3">You agree not to:</p>
              <ul className="space-y-3 list-none">
                {[
                  "Harass, threaten, or abuse other members.",
                  "Share another member's contact information outside the platform without their consent.",
                  "Use the platform for commercial solicitation or advertising.",
                  "Attempt to circumvent the Gothra or Pravara matching rules.",
                  "Upload photos of people other than yourself.",
                  "Use automated tools to scrape, crawl, or extract data from Pravara.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">3. Content you share</h2>
              <p className="text-sm leading-relaxed">
                You own your profile content. By uploading it, you grant Pravara a limited, non-exclusive licence to display it to other members for the purpose of matchmaking. We will not use your photos or personal content for advertising without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">4. Subscriptions and payments</h2>
              <ul className="space-y-3 list-none">
                {[
                  "Paid plans are billed monthly. You may cancel at any time.",
                  "Cancellation takes effect at the end of the current billing period. No partial refunds.",
                  "Gold plan: 7-day money-back guarantee from first payment.",
                  "Concierge plan: subject to the specific terms agreed at the time of enrolment.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">5. The AI Sutradhar</h2>
              <p className="text-sm leading-relaxed">
                Sutradhar is an AI assistant that helps you build your profile and discover matches. It does not make decisions on your behalf. All connection requests, messages, and profile updates require your active initiation. Sutradhar's suggestions are guides, not instructions. We do not guarantee that AI-generated recommendations will lead to a match.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">6. Account termination</h2>
              <p className="text-sm leading-relaxed">
                We reserve the right to suspend or permanently delete accounts that violate these terms, without prior notice in cases of severe or repeated violations. You may delete your account at any time from Settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">7. Limitation of liability</h2>
              <p className="text-sm leading-relaxed">
                Pravara is a platform that facilitates introductions. We are not responsible for the conduct of members after they connect, or for the accuracy of information members provide about themselves. We strongly encourage members to exercise their own judgement and conduct appropriate due diligence before meeting in person.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">8. Contact</h2>
              <p className="text-sm leading-relaxed">
                Questions about these terms? Email{" "}
                <a href="mailto:legal@pravara.com" className="text-haldi-500 hover:underline">legal@pravara.com</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
