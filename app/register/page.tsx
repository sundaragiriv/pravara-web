import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import LaunchAtmosphere from "@/components/launch/LaunchAtmosphere";
import LaunchPageView from "@/components/launch/LaunchPageView";
import { FOUNDING_MEMBER_TARGET, getLaunchRegistrationCount } from "@/lib/launch";
import { createClient } from "@/utils/supabase/server";

import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join the Founder Circle | Pravara",
  description:
    "Pravara is Vedic matrimony, by invitation. Join the first 1,000 founders and get 3 months of premium free when matching opens.",
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const foundingCount = await getLaunchRegistrationCount();

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 text-stone-50">
      <LaunchPageView path="/register" event="launch_register_view" />
      <LaunchAtmosphere className="opacity-80" />

      <main className="relative px-6 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.28em] text-stone-400 transition-colors hover:text-haldi-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to invitation
            </Link>

            <Image
              src="/logo3.png"
              alt="Pravara"
              width={180}
              height={66}
              className="object-contain [mix-blend-mode:lighten]"
              priority
            />

            <div className="text-xs uppercase tracking-[0.28em] text-haldi-300">Founder Circle</div>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.32em] text-haldi-300">Vedic matrimony, by invitation</p>
            <h1 className="mt-5 text-balance font-serif text-5xl leading-[0.96] text-stone-50 md:text-6xl">
              Join the Founder Circle.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-stone-300">
              We&apos;re opening with a first circle of 1,000 founders. Register once now — when matching
              opens in about three months, founders get <span className="font-semibold text-haldi-200">3 months of
              premium, free</span>.
            </p>
          </div>

          <div className="mt-10">
            <RegisterForm foundingCount={foundingCount} foundingTarget={FOUNDING_MEMBER_TARGET} />
          </div>
        </div>
      </main>
    </div>
  );
}
