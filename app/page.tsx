import LaunchHome from "@/components/launch/LaunchHome";
import MarketingHome from "@/components/marketing/MarketingHome";
import { PRE_LAUNCH_ENABLED } from "@/lib/env";
import { getLaunchRegistrationCount } from "@/lib/launch";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Single switch: PRE_LAUNCH_ENABLED drives the whole public face of the site.
  //   on  → minimal founding-circle microsite (pre-launch)
  //   off → richer marketing landing page (go-live)
  if (PRE_LAUNCH_ENABLED) {
    return <LaunchHome isLoggedIn={!!user} />;
  }

  const foundingCount = (await getLaunchRegistrationCount()) ?? 0;
  return <MarketingHome foundingCount={foundingCount} isLoggedIn={!!user} />;
}
