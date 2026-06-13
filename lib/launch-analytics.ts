import "server-only";

import { createAdminClient } from "@/lib/supabase-admin";

export type LaunchEventName =
  | "launch_home_view"
  | "launch_register_view"
  | "launch_register_click"
  | "launch_registration_completed";

export async function recordLaunchEvent(input: {
  event: LaunchEventName;
  path: string;
  source?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("launch_analytics_events").insert({
      event_name: input.event,
      path: input.path,
      source: input.source || null,
      session_id: input.sessionId || null,
      metadata: input.metadata || {},
    });

    if (error) {
      console.error("Launch analytics insert error:", error);
    }
  } catch (error) {
    console.error("Launch analytics unavailable:", error);
  }
}
