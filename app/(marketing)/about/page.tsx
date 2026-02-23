import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import MarketingNav from "@/components/navigation/MarketingNav";
import { Sparkles, ShieldCheck, Heart, Users, ScrollText, Eye, Zap } from "lucide-react";

export default async function AboutPage() {
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
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans selection:bg-haldi-500/30">
      <MarketingNav isLoggedIn={!!user} userAvatar={userAvatar} userName={userName} />

      {/* Hero */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-haldi-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/50 border border-stone-800 text-haldi-500 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Our Story</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-stone-50 to-stone-400 leading-[1.1] mb-6 max-w-3xl mx-auto">
            Built for Families Who Take Marriage Seriously
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Pravara was born from a simple frustration: existing matrimonial apps treat marriage like a dating swipe. We believe it deserves something more thoughtful — a platform that honours Vedic wisdom, cultural identity, and the gravity of joining two families.
          </p>
        </div>
      </section>

      {/* The Sutradhar Section */}
      <section id="sutradhar" className="py-24 bg-stone-900/30 border-y border-stone-800/50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <p className="text-haldi-500 text-xs font-bold uppercase tracking-widest">The AI Sutradhar</p>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-100">
                A Director Who Understands Your Story
              </h2>
              <p className="text-stone-400 leading-relaxed">
                In Sanskrit theatre, the <span className="text-stone-200 font-medium italic">Sutradhar</span> — literally "holder of threads" — is the stage director who sets the scene and guides the narrative. Our AI Sutradhar does the same: it holds the threads of your values, family background, Gothra, and Vedic compatibility, then weaves them into meaningful introductions.
              </p>
              <p className="text-stone-400 leading-relaxed">
                Instead of filters and checkboxes, you have a conversation. The Sutradhar listens, learns, and surfaces profiles that genuinely align — not just on age and income, but on the deeper things that make a marriage last.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 rounded-2xl bg-stone-950/60 border border-stone-800 flex items-start gap-4">
                <div className="w-10 h-10 bg-haldi-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-haldi-500" />
                </div>
                <div>
                  <h3 className="text-stone-200 font-semibold mb-1">Conversational Matching</h3>
                  <p className="text-stone-500 text-sm">No more filters. Describe what you're looking for in plain language and let Sutradhar interpret intent, not just keywords.</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-stone-950/60 border border-stone-800 flex items-start gap-4">
                <div className="w-10 h-10 bg-haldi-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ScrollText className="w-5 h-5 text-haldi-500" />
                </div>
                <div>
                  <h3 className="text-stone-200 font-semibold mb-1">Vedic Compatibility Engine</h3>
                  <p className="text-stone-500 text-sm">Bhrugu Kundali analysis — Guna Milan, Nadi, Bhakoot, Gana — runs automatically on every candidate so you never discover a mismatch at the last step.</p>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-stone-950/60 border border-stone-800 flex items-start gap-4">
                <div className="w-10 h-10 bg-haldi-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-haldi-500" />
                </div>
                <div>
                  <h3 className="text-stone-200 font-semibold mb-1">Gothra Safeguarding</h3>
                  <p className="text-stone-500 text-sm">Same-Gothra matches are blocked automatically at the algorithm level — a non-negotiable protection for communities that observe this tradition.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section id="values" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-haldi-500 text-xs font-bold uppercase tracking-widest mb-4">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-100 mb-4">
              What We Stand For
            </h2>
            <p className="text-stone-400">
              Every design decision, every feature, every policy traces back to four principles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-haldi-500/30 transition-colors group text-center">
              <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:bg-haldi-900/20 transition-colors">
                <Heart className="w-6 h-6 text-stone-400 group-hover:text-haldi-500 transition-colors" />
              </div>
              <h3 className="text-lg font-serif text-stone-200 mb-3">Intention Over Volume</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Quality introductions are worth more than thousands of swipes. We optimise for meaningful connections, not engagement metrics.</p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-haldi-500/30 transition-colors group text-center">
              <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:bg-haldi-900/20 transition-colors">
                <Users className="w-6 h-6 text-stone-400 group-hover:text-haldi-500 transition-colors" />
              </div>
              <h3 className="text-lg font-serif text-stone-200 mb-3">Family is the Unit</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Guardian Mode lets parents and trusted elders participate with appropriate access — because a marriage involves two families, not just two individuals.</p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-haldi-500/30 transition-colors group text-center">
              <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:bg-haldi-900/20 transition-colors">
                <Eye className="w-6 h-6 text-stone-400 group-hover:text-haldi-500 transition-colors" />
              </div>
              <h3 className="text-lg font-serif text-stone-200 mb-3">Privacy is Sacred</h3>
              <p className="text-stone-500 text-sm leading-relaxed">Ghost Mode, profile visibility controls, and zero data-selling are defaults — not premium add-ons. Your family's details are never a product.</p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 hover:border-haldi-500/30 transition-colors group text-center">
              <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:bg-haldi-900/20 transition-colors">
                <ShieldCheck className="w-6 h-6 text-stone-400 group-hover:text-haldi-500 transition-colors" />
              </div>
              <h3 className="text-lg font-serif text-stone-200 mb-3">Cultural Integrity</h3>
              <p className="text-stone-500 text-sm leading-relaxed">We don't flatten traditions for the sake of scalability. Gothra, sub-community, Nakshatra — these distinctions matter, and our platform honours them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Name */}
      <section className="py-24 bg-stone-900/20 border-y border-stone-800/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-haldi-500 text-xs font-bold uppercase tracking-widest">Why "Pravara"?</p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-100">
              An Ancient Word for Lineage
            </h2>
            <p className="text-stone-400 leading-relaxed text-lg">
              In the Vedic tradition, <span className="italic text-stone-300">Pravara</span> refers to the most excellent or distinguished sages in one's Gotra lineage — the ancestral line declared aloud during sacred rites to establish identity and belonging. It is the answer to the question: <span className="italic text-stone-300">"Who are your people?"</span>
            </p>
            <p className="text-stone-500 leading-relaxed">
              We chose this name because matrimony is fundamentally about the meeting of lineages. Pravara is not just a platform — it is a declaration of who you are and a search for who you are meant to join.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-haldi-500 text-xs font-bold uppercase tracking-widest">Get in Touch</p>
            <h2 className="text-3xl font-serif text-stone-100">We'd Love to Hear From You</h2>
            <p className="text-stone-400 leading-relaxed">
              Questions, partnership inquiries, or feedback — our team reads every message.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="mailto:hello@pravara.com"
                className="px-8 py-4 bg-haldi-600 hover:bg-haldi-500 text-stone-950 font-bold rounded-full transition-all hover:scale-105"
              >
                hello@pravara.com
              </a>
              <Link
                href="/faq"
                className="px-8 py-4 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-medium rounded-full transition-all"
              >
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
