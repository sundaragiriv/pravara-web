import MarketingNav from "@/components/navigation/MarketingNav";
import { createClient } from "@/utils/supabase/server";
import { ShieldCheck, Eye, Users, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Trust & Safety | Pravara",
  description: "How Pravara keeps its community safe, verified, and trustworthy.",
};

export default async function TrustPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      <MarketingNav isLoggedIn={!!user} />

      {/* Hero */}
      <div className="pt-32 pb-16 text-center px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/20 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3 h-3" /> Varaahi Shield
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-stone-100 mb-6">
            Trust & Safety
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed">
            A matrimonial platform is only as good as the trust within it. Here is how we build and protect that trust.
          </p>
        </div>
      </div>

      {/* Trust Pillars */}
      <div className="container mx-auto max-w-5xl px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {[
            {
              icon: ShieldCheck,
              title: "Community Vouching",
              color: "text-green-400",
              bg: "bg-green-900/10 border-green-800/50",
              desc: "Members can be vouched for by people who know them personally — friends, siblings, colleagues, or neighbours. Each vouch adds to the Varaahi Trust score, giving other members confidence that a profile represents a real, known person.",
            },
            {
              icon: Users,
              title: "Guardian Mode",
              color: "text-haldi-400",
              bg: "bg-haldi-900/10 border-haldi-800/50",
              desc: "A trusted family member — parent, sibling, or guardian — can be invited to participate in the matchmaking process with view-only access. They can see matches and provide guidance without being able to send messages or act independently.",
            },
            {
              icon: Eye,
              title: "Ghost Mode",
              color: "text-stone-300",
              bg: "bg-stone-900/50 border-stone-800",
              desc: "Turn off your profile visibility with a single toggle in Settings. In Ghost Mode, you can browse and keep existing conversations active, but you won't appear in new match searches. No announcements, no traces.",
            },
            {
              icon: AlertTriangle,
              title: "Reporting & Moderation",
              color: "text-kumkum-400",
              bg: "bg-kumkum-900/10 border-kumkum-900/50",
              desc: "Profiles and messages can be reported for review. We investigate abuse reports, may restrict or remove accounts that violate platform rules, and continue tightening moderation as the platform matures.",
            },
          ].map((pillar) => (
            <div key={pillar.title} className={`p-6 rounded-2xl border ${pillar.bg}`}>
              <div className={`${pillar.color} mb-4`}>
                <pillar.icon className="w-6 h-6" />
              </div>
              <h3 className="text-stone-100 font-serif text-xl mb-3">{pillar.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>

        {/* Zero Tolerance */}
        <div className="bg-stone-900/50 border border-stone-800 rounded-3xl p-8 mb-16">
          <h2 className="text-2xl font-serif text-stone-100 mb-6">Zero tolerance</h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-6">
            The following are treated as severe violations and may result in immediate account restriction or removal:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Impersonation or fake identity",
              "Sharing explicit or inappropriate content",
              "Attempting to solicit money from members",
              "Harassment, threats, or abusive messaging",
              "Attempting to bypass Gothra matching rules",
              "Advertising or commercial solicitation",
            ].map((item) => (
              <div key={item} className="flex gap-3 items-start text-sm text-stone-400">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Report */}
        <div className="text-center">
          <h2 className="text-2xl font-serif text-stone-100 mb-4">Report a concern</h2>
          <p className="text-stone-400 mb-8 leading-relaxed max-w-xl mx-auto text-sm">
            If you encounter a profile or message that makes you uncomfortable, use the in-app report button or email us directly. We take every report seriously.
          </p>
          <a
            href="mailto:safety@pravara.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-stone-100 hover:bg-white text-stone-950 font-bold rounded-full transition-all hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" />
            safety@pravara.com
          </a>
        </div>
      </div>
    </div>
  );
}
