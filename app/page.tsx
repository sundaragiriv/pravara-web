import LaunchHome from "@/components/launch/LaunchHome";
import MarketingHome from "@/components/marketing/MarketingHome";
import { PRE_LAUNCH_ENABLED } from "@/lib/env";
import { getFounderProgress } from "@/lib/launch";
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

  // Thresholded, not raw — a small real number is worse than none. See
  // FOUNDER_COUNT_DISPLAY_THRESHOLD in lib/launch.ts.
  const founderProgress = await getFounderProgress();
  return <MarketingHome founderProgress={founderProgress} isLoggedIn={!!user} />;
}
