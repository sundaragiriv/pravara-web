"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, UserCheck, Edit3, Clock } from "lucide-react";

const LAUNCH_DATE = new Date("2026-04-23T00:00:00");

function getTimeLeft() {
  const now = new Date();
  const diff = LAUNCH_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function PreLaunchPage() {
  const [userName, setUserName] = useState("");
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (data?.full_name) setUserName(data.full_name.split(" ")[0]);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const blocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-haldi-900/20 via-stone-950 to-stone-950 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full space-y-8">
        {/* Logo */}
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

        {/* Greeting */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/40 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <UserCheck className="w-3.5 h-3.5" />
            You&apos;re Registered
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-stone-100">
            Namaste{userName ? `, ${userName}` : ""}!
          </h1>
          <p className="text-stone-400 text-sm leading-relaxed max-w-sm mx-auto">
            Pravara launches on <span className="text-haldi-400 font-semibold">April 23, 2026</span>.
            Complete your profile now to get priority matching on launch day.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {blocks.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-haldi-400">
                  {String(value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[10px] text-stone-500 mt-1.5 uppercase tracking-wider font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
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
            Early profiles get priority matching
          </p>
        </div>

        {/* What to expect */}
        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-6 text-left space-y-3 mt-8">
          <h3 className="text-sm font-bold text-stone-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-haldi-500" />
            What happens on launch day?
          </h3>
          <ul className="text-xs text-stone-400 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-haldi-500 mt-0.5">1.</span>
              Your profile goes live and matches start appearing
            </li>
            <li className="flex items-start gap-2">
              <span className="text-haldi-500 mt-0.5">2.</span>
              Send interests, chat with matches, and explore Vedic compatibility
            </li>
            <li className="flex items-start gap-2">
              <span className="text-haldi-500 mt-0.5">3.</span>
              Invite family as Kutumba collaborators to help manage your profile
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
