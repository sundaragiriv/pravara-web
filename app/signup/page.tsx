import { redirect } from "next/navigation";
import Image from "next/image";

import { createClient } from "@/utils/supabase/server";

import SignupForm from "./SignupForm";

export const dynamic = "force-dynamic";

// Account creation is available in both modes now: during pre-launch this is the
// second step of the founder funnel (lead form → account → onboarding → real
// profile). Cold visitors are still funneled to /register (the low-friction lead
// hook) first by the home/nav CTAs.
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; name?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/dashboard");
  }

  const { email, name } = await searchParams;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-stone-950 font-sans">
      {/* Brand panel — mirrors the login screen */}
      <div className="relative hidden lg:flex items-center justify-center h-screen overflow-hidden border-r border-stone-900 bg-stone-900">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-haldi-500/[0.06] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-kumkum-900/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <Image
            src="/logo3.png"
            alt="Pravara"
            fill
            className="object-contain [mix-blend-mode:lighten] p-16"
            priority
          />
        </div>
        <div className="absolute bottom-12 left-0 right-0 text-center px-8">
          <p className="font-serif text-2xl font-bold tracking-wide text-gold-shine">
            Tradition meets Intelligence
          </p>
        </div>
      </div>

      <SignupForm initialEmail={email ?? ""} initialName={name ?? ""} />
    </div>
  );
}
