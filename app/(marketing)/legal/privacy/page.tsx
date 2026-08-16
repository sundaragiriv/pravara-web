import MarketingNav from "@/components/navigation/MarketingNav";
import { createClient } from "@/utils/supabase/server";
import { PRE_LAUNCH_ENABLED } from "@/lib/env";
import { CONTACT_EMAIL } from "@/lib/site";

// Reads auth state, so it is never really static. Declaring that up front keeps
// the build from attempting a prerender that needs Supabase env vars present.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy",
  description: "How Pravara collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "August 2026";

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      <MarketingNav isLoggedIn={!!user} launchMode={PRE_LAUNCH_ENABLED} />

      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <p className="text-stone-500 text-sm mb-2">Last updated: {LAST_UPDATED}</p>
          <h1 className="text-4xl font-serif text-stone-100 mb-8">Privacy Policy</h1>
          <p className="text-stone-400 leading-relaxed mb-12">
            Your trust is the foundation of Pravara. This policy explains what data we collect, why we collect it, and how we protect it. We will never sell your personal data.
          </p>

          <div className="space-y-12 text-stone-400">

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">1. What we collect</h2>
              <ul className="space-y-3 list-none">
                {[
                  "Account information: email address and password (hashed).",
                  "Profile data you voluntarily provide: name, age, Gothra, location, profession, bio, photos, and partner preferences.",
                  "Vedic data: Nakshatra, Raasi, birth time, and birth place — used exclusively for Bhrugu Match calculations.",
                  "Sensitive information: Gothra, community, and Vedic data reveal religious affiliation, and are treated as sensitive personal information under California law.",
                  "Usage data: pages visited, features used, and session duration — collected in aggregate to improve the platform.",
                  "Communications: messages sent through the in-app chat system.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">2. How we use your data</h2>
              <ul className="space-y-3 list-none">
                {[
                  "To match you with compatible profiles using our Bhrugu compatibility engine.",
                  "To power your AI Sutradhar and Narada biographer. This sends the profile details you provide — including Gothra, community, and partner preferences — to OpenAI, which processes them to generate responses and does not use them to train its models.",
                  "To send Narada alerts: notifications about new interests, matches, and messages.",
                  "To enforce Gothra and Pravara exogamy rules automatically.",
                  "To improve platform features and detect abuse.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">3. What we never do</h2>
              <ul className="space-y-3 list-none">
                {[
                  "We never sell your personal data, and we do not share it for cross-context behavioural advertising.",
                  "We never expose your contact details (phone, email) to other users.",
                  "We never make your profile publicly searchable outside the Pravara platform.",
                  "We never use your Vedic data (Nakshatra, Raasi) for purposes other than compatibility calculations.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">4. Who else processes your data</h2>
              <p className="text-sm leading-relaxed mb-3">
                We use a small number of service providers to run Pravara. Each acts on our
                instructions only, and none is permitted to use your data for its own purposes.
              </p>
              <ul className="space-y-3 list-none">
                {[
                  "Supabase — database, authentication, and photo storage. Holds all profile data. United States.",
                  "Vercel — website hosting, plus aggregate traffic and performance measurement. United States.",
                  "OpenAI — powers Sutradhar and the Narada biographer. Receives the profile details you provide during those conversations. Does not train on your data.",
                  "Resend — sends transactional email. Receives your name and email address only.",
                  "Sentry — error monitoring. Configured not to attach IP addresses or email addresses to reports.",
                  "Upstash — rate limiting, to prevent abuse of our forms.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed mt-4">
                We do not currently run advertising trackers on Pravara. If that changes, we will
                update this policy and provide an opt-out before enabling them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">5. How long we keep it</h2>
              <ul className="space-y-3 list-none">
                {[
                  "Profile and account data: for as long as your account is open, then deleted within 30 days of a deletion request.",
                  "Chat messages: retained up to 90 days after account deletion, for safety and abuse review.",
                  "Pre-launch registrations: until launch, or until you ask us to remove you.",
                  "Aggregate usage statistics: retained indefinitely in a form that cannot identify you.",
                  "Records we are legally required to keep: for the period the law requires, and no longer.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">6. Data storage and security</h2>
              <p className="text-sm leading-relaxed">
                All data is stored on Supabase infrastructure with row-level security policies. Passwords are hashed and never stored in plain text. Photos are stored in private buckets with access-controlled URLs. We use HTTPS for all data in transit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">7. Your rights</h2>
              <p className="text-sm leading-relaxed mb-3">
                You may request to access, correct, or delete your personal data at any time by contacting us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-haldi-500 hover:underline">{CONTACT_EMAIL}</a>.
                Account deletion will remove all profile data within 30 days. Chat messages may be retained for safety review for up to 90 days after deletion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">
                8. California privacy rights (CCPA/CPRA)
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                If you are a California resident, the California Consumer Privacy Act as amended by
                the CPRA gives you the rights below. Exercising them will never cost you anything or
                get you worse service.
              </p>
              <ul className="space-y-3 list-none mb-4">
                {[
                  "Know — what personal information we have collected about you, where it came from, why we collected it, and who we disclosed it to.",
                  "Delete — ask us to erase the personal information we hold about you.",
                  "Correct — ask us to fix personal information that is inaccurate.",
                  "Opt out of sale or sharing — we do not sell or share personal information, so there is nothing to opt out of today. If that ever changes we will add a “Do Not Sell or Share My Personal Information” link before it does.",
                  "Limit the use of sensitive personal information — we use Gothra, community, and Vedic data only to calculate compatibility and enforce exogamy rules, which is the purpose you gave it to us for. We do not use it to infer characteristics about you.",
                  "Non-discrimination — we will not deny service, change prices, or reduce quality because you exercised any of these rights.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="text-base font-semibold text-stone-200 mb-2">
                Categories we have collected in the last 12 months
              </h3>
              <ul className="space-y-3 list-none mb-4">
                {[
                  "Identifiers — name, email address, phone number, account identifier.",
                  "Personal records — age, date of birth, profession, education, photographs.",
                  "Protected classification characteristics — age, sex, and marital status.",
                  "Internet activity — pages visited and features used, in aggregate.",
                  "Sensitive personal information — Gothra, community, and Vedic data, which reveal religious affiliation.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span className="text-haldi-500 mt-1 flex-shrink-0">—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed mb-4">
                All of it comes directly from you, apart from aggregate usage data generated as you
                use the site. We collect it to operate the service described in this policy. We have
                not sold or shared any of it.
              </p>

              <h3 className="text-base font-semibold text-stone-200 mb-2">How to exercise your rights</h3>
              <p className="text-sm leading-relaxed">
                Email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-haldi-500 hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                with the word “Privacy” in the subject line, or write to us from the address on your
                account. We will confirm within 10 business days and respond within 45 days, taking
                a further 45 days only where the request is complex — and we will tell you if that
                happens. To protect you, we verify requests against the account they concern before
                acting. An authorised agent may act for you with written permission from you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">9. Changes to this policy</h2>
              <p className="text-sm leading-relaxed">
                We will notify registered users of material changes to this policy via email or in-app notification at least 14 days before they take effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">10. Contact</h2>
              <p className="text-sm leading-relaxed">
                Questions about your privacy? Email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-haldi-500 hover:underline">{CONTACT_EMAIL}</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
