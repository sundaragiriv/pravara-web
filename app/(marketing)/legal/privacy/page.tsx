import MarketingNav from "@/components/navigation/MarketingNav";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Privacy Policy | Pravara",
  description: "How Pravara collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "February 2026";

export default async function PrivacyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      <MarketingNav isLoggedIn={!!user} />

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
                  "To power your AI Sutradhar — the conversational guide that helps build and refine your profile.",
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
                  "We never sell, rent, or share your personal data with third parties for marketing.",
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
              <h2 className="text-xl font-serif text-stone-100 mb-4">4. Data storage and security</h2>
              <p className="text-sm leading-relaxed">
                All data is stored on Supabase infrastructure with row-level security policies. Passwords are hashed and never stored in plain text. Photos are stored in private buckets with access-controlled URLs. We use HTTPS for all data in transit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">5. Your rights</h2>
              <p className="text-sm leading-relaxed mb-3">
                You may request to access, correct, or delete your personal data at any time by contacting us at{" "}
                <a href="mailto:privacy@pravara.com" className="text-haldi-500 hover:underline">privacy@pravara.com</a>.
                Account deletion will remove all profile data within 30 days. Chat messages may be retained for safety review for up to 90 days after deletion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">6. Changes to this policy</h2>
              <p className="text-sm leading-relaxed">
                We will notify registered users of material changes to this policy via email or in-app notification at least 14 days before they take effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-serif text-stone-100 mb-4">7. Contact</h2>
              <p className="text-sm leading-relaxed">
                Questions about your privacy? Email{" "}
                <a href="mailto:privacy@pravara.com" className="text-haldi-500 hover:underline">privacy@pravara.com</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
