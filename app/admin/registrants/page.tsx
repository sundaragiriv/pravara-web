import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";

import { isAllowlistedAdminEmail } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";

import RegistrantsTable, { type Registrant } from "./RegistrantsTable";

export const dynamic = "force-dynamic";

export default async function RegistrantsPage() {
  // Admin gate (same pattern as /admin/funnel)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!isAllowlistedAdminEmail(user.email) && me?.is_admin !== true) redirect("/dashboard");

  // Service-role read — launch_registrations is not client-readable.
  const admin = createAdminClient();
  const { data } = await admin
    .from("launch_registrations")
    .select(
      "id, full_name, email, phone, gender, age, profession, location, status, source, reminders_sent, created_at",
    )
    .order("created_at", { ascending: false });

  const registrants = (data ?? []) as Registrant[];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50">
      <header className="border-b border-stone-900 bg-stone-950/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-100">
            <ArrowLeft size={15} /> Admin
          </Link>
          <span className="font-serif text-lg tracking-wide text-haldi-400">Registrants</span>
          <Link href="/admin/funnel" className="text-sm text-stone-400 hover:text-haldi-400">
            Funnel →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <p className="flex items-center gap-2 text-sm text-stone-400">
          <Users size={15} className="text-haldi-400" />
          Everyone who reserved a founding seat. <span className="text-stone-500">registered</span> = lead only;{" "}
          <span className="text-stone-500">invited</span> = created an account.
        </p>

        <RegistrantsTable registrants={registrants} />
      </main>
    </div>
  );
}
