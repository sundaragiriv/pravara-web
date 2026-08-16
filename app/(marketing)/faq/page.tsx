import { createClient } from "@/utils/supabase/server";
import MarketingNav from "@/components/navigation/MarketingNav";
import { PRE_LAUNCH_ENABLED } from "@/lib/env";
// Lives in lib/ because Sutradhar answers from the same text. Editing an answer
// there updates this page and the assistant's grounding together.
import { FAQ_SECTIONS } from "@/lib/faq";

// Reads auth state, so it is never really static. Declaring that up front keeps
// the build from attempting a prerender that needs Supabase env vars present.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQ",
  description: "Understand the mythology and meaning behind Pravara's AI systems — Sutradhar, Narada, Bhrugu Match, Varaahi Shield — and Vedic concepts like Gothra, Nakshatra, and Raasi.",
};


export default async function FaqPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userAvatar: string | null = null;
  let userName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, image_url")
      .eq("id", user.id)
      .single();
    userAvatar = profile?.image_url || null;
    userName = profile?.full_name || user.email?.split("@")[0] || null;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      <MarketingNav isLoggedIn={!!user} userAvatar={userAvatar} userName={userName} launchMode={PRE_LAUNCH_ENABLED} />

      {/* Hero */}
      <div className="pt-32 pb-16 text-center px-6">
        <div className="container mx-auto max-w-2xl">
          <p className="text-haldi-500 text-sm font-bold uppercase tracking-widest mb-4">FAQ</p>
          <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-stone-50 to-stone-400 leading-tight mb-6">
            Every name has a meaning.
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed">
            Pravara draws on deep Vedic wisdom for its AI systems and compatibility logic. Here is what each name means and why it matters.
          </p>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="container mx-auto max-w-3xl px-6 pb-24 space-y-16">
        {FAQ_SECTIONS.map((section) => (
          <div key={section.section}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-haldi-500 mb-8 pb-3 border-b border-stone-800">
              {section.section}
            </h2>
            <div className="space-y-6">
              {section.items.map((item) => (
                <div key={item.q} className="group">
                  <h3 className="text-lg font-serif text-stone-100 mb-2 group-hover:text-haldi-400 transition-colors">
                    {item.q}
                  </h3>
                  <p className="text-stone-400 leading-relaxed text-sm">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
