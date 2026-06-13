import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tending the flame · Pravara",
  description: "Pravara is being lovingly prepared. We will return shortly.",
  robots: { index: false, follow: false },
};

// A culturally-rooted maintenance screen: a lit diya with the traditional
// lamp-lighting shloka. Server-rendered, CSS-only animation (robust — it must
// work even when other things don't).
export default function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-stone-950 px-6 text-center text-stone-50">
      <style>{`
        @keyframes diya-flame {
          0%,100% { transform: translateX(-50%) scaleY(1) scaleX(1) rotate(-1deg); opacity:.95; }
          25% { transform: translateX(-51%) scaleY(1.08) scaleX(.96) rotate(1.5deg); opacity:1; }
          50% { transform: translateX(-49%) scaleY(.94) scaleX(1.04) rotate(-1.5deg); opacity:.9; }
          75% { transform: translateX(-50.5%) scaleY(1.05) scaleX(.98) rotate(1deg); opacity:1; }
        }
        @keyframes diya-halo {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity:.55; }
          50% { transform: translate(-50%,-50%) scale(1.12); opacity:.8; }
        }
        @keyframes ember-rise {
          0% { transform: translateY(0) scale(.7); opacity:0; }
          20% { opacity:.9; }
          100% { transform: translateY(-120px) scale(.4); opacity:0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .diya-flame, .diya-halo, .ember { animation: none !important; }
        }
      `}</style>

      {/* warm ground glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 60%)" }}
      />

      <div className="relative">
        {/* halo behind flame */}
        <div
          aria-hidden
          className="diya-halo absolute left-1/2 top-1/2 h-32 w-32 rounded-full blur-2xl"
          style={{
            background: "radial-gradient(circle, rgba(255,196,87,0.85) 0%, rgba(251,146,60,0.25) 45%, transparent 70%)",
            animation: "diya-halo 3.2s ease-in-out infinite",
          }}
        />

        {/* embers */}
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            aria-hidden
            className="ember absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full"
            style={{
              background: "radial-gradient(circle,#fff3c4,#fbbf24)",
              boxShadow: "0 0 8px rgba(251,191,36,.7)",
              marginLeft: `${(i - 1.5) * 10}px`,
              animation: `ember-rise ${3 + i * 0.6}s ease-out ${i * 0.8}s infinite`,
            }}
          />
        ))}

        {/* flame */}
        <div
          aria-hidden
          className="diya-flame absolute left-1/2 top-0 h-16 w-9 -translate-x-1/2"
          style={{
            background: "linear-gradient(to top, #b45309 0%, #f59e0b 35%, #fcd34d 70%, #fffbeb 100%)",
            borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%",
            transformOrigin: "bottom center",
            animation: "diya-flame 1.6s ease-in-out infinite",
            boxShadow: "0 0 28px rgba(251,191,36,.6)",
          }}
        />

        {/* diya (clay lamp) */}
        <svg width="220" height="90" viewBox="0 0 220 90" className="relative mt-14" aria-hidden>
          <defs>
            <linearGradient id="clay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7c2d12" />
              <stop offset="0.5" stopColor="#9a3412" />
              <stop offset="1" stopColor="#5b2410" />
            </linearGradient>
            <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c2410c" />
              <stop offset="1" stopColor="#7c2d12" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="20" rx="70" ry="12" fill="url(#rim)" />
          <path d="M40 20 Q110 78 180 20 Q170 40 110 46 Q50 40 40 20 Z" fill="url(#clay)" />
          <ellipse cx="110" cy="20" rx="56" ry="8" fill="#2a1206" opacity="0.7" />
        </svg>
      </div>

      <p className="mt-12 font-serif text-2xl leading-relaxed text-haldi-200" lang="sa">
        शुभं करोति कल्याणम्
      </p>
      <p className="mt-2 text-sm italic tracking-wide text-stone-400">
        śubhaṁ karoti kalyāṇam — “May this light bring auspiciousness and well-being.”
      </p>

      <h1 className="mt-10 font-serif text-3xl text-stone-50 sm:text-4xl">We are tending the flame.</h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-stone-300">
        Pravara is being lovingly prepared for you. We&apos;ll return in a short while — brighter than
        before. Thank you for your patience.
      </p>

      <p className="mt-10 text-xs uppercase tracking-[0.28em] text-stone-600">
        Pravara — Vedic matrimony, by invitation
      </p>
    </div>
  );
}
