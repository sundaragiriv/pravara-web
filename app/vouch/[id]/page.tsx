import Image from "next/image";
import Link from "next/link";

import VouchForm from "./VouchForm";

export const dynamic = "force-dynamic";

export default async function VouchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  const { id } = await params;
  const { name } = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-stone-950 px-4 py-12">
      {/* Warm ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-haldi-500/[0.07] blur-[120px]" />

      <Link href="/" className="relative mb-8">
        <Image
          src="/logo3.png"
          alt="Pravara"
          width={130}
          height={44}
          className="object-contain [mix-blend-mode:lighten]"
          priority
        />
      </Link>

      <div className="relative">
        <VouchForm profileId={id} name={name ?? ""} />
      </div>

      <p className="relative mt-8 text-center text-xs uppercase tracking-[0.22em] text-stone-600">
        Pravara — Vedic matrimony, by invitation
      </p>
    </div>
  );
}
