"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Edit3, Sparkles, UserCheck } from "lucide-react";

const STATUS_CARDS = [
  { label: "Profile", value: "Complete yours", icon: Edit3 },
  { label: "Support", value: "Core access stays open", icon: Clock },
  { label: "Status", value: "Full rollout happens in waves", icon: Sparkles },
];

export default function PreLaunchPage() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-haldi-900/20 via-stone-950 to-stone-950 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full space-y-8">
        <Link href="/" className="inline-block">
          <Image
            src="/logo3.png"
            alt="Pravara"
            width={160}
            height={54}
            className="mx-auto object-contain [mix-blend-mode:lighten]"
            priority
          />
        </Link>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/40 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <UserCheck className="w-3.5 h-3.5" />
            Access Confirmed
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-stone-100">
            Pravara Is Opening In Stages
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed max-w-sm mx-auto">
            Your account is active, but member access is still being opened in controlled batches while
            the platform is being hardened. Complete your profile now so you are ready when matching opens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STATUS_CARDS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-5">
              <Icon className="w-4 h-4 text-haldi-400 mx-auto mb-2" />
              <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
              <p className="text-sm text-stone-200 mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-4">
          <Link
            href="/dashboard/edit-profile"
            className="inline-flex items-center gap-2 bg-haldi-500 hover:bg-haldi-600 text-stone-950 font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-haldi-500/20"
          >
            <Edit3 className="w-4 h-4" />
            Complete Your Profile
          </Link>
          <p className="text-stone-600 text-xs flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Early complete profiles are prioritized for rollout access
          </p>
        </div>

        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 text-left space-y-3 mt-8">
          <h3 className="text-sm font-bold text-stone-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-haldi-500" />
            What happens next?
          </h3>
          <ul className="text-xs text-stone-400 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-haldi-500 mt-0.5">1.</span>
              Stability, trust, and profile quality checks are completed before broader access.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-haldi-500 mt-0.5">2.</span>
              Eligible members are invited into full matching access in controlled batches.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-haldi-500 mt-0.5">3.</span>
              Your completed profile is ready the moment your batch opens.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
